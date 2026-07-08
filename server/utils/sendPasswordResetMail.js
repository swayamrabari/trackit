const logger = require('./logger');
require('dotenv').config();

const DEFAULT_BREVO_API_BASE_URL = 'https://api.brevo.com';

function getEnvString(name, fallback = '') {
  return String(process.env[name] ?? fallback).trim();
}

function sanitizeCredential(rawValue) {
  let value = String(rawValue || '').trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  if (value.toLowerCase().startsWith('bearer ')) {
    value = value.slice(7).trim();
  }
  return value.replace(/[\r\n\t]/g, '');
}

function normalizeEmailAddress(value) {
  return String(value || '').trim().toLowerCase();
}

function isLikelyEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getBrevoConfig() {
  const apiBaseUrl = getEnvString('BREVO_API_BASE_URL', DEFAULT_BREVO_API_BASE_URL).replace(/\/+$/, '');
  const apiKey = sanitizeCredential(getEnvString('BREVO_API_KEY'));
  const emailApiUrl = `${apiBaseUrl}/v3/smtp/email`;
  return { apiKey, emailApiUrl };
}

function getFromField() {
  const fromEmail = normalizeEmailAddress(process.env.BREVO_FROM_EMAIL);
  const fromName = getEnvString('BREVO_FROM_NAME', 'TrackIt');

  if (!fromEmail) {
    throw new Error('BREVO_FROM_EMAIL is required. Add a verified sender email in your environment variables.');
  }

  return { email: fromEmail, name: fromName.slice(0, 100) };
}

async function postToBrevoEmailApi({ apiConfig, payload, requestTimeoutMs = 10000 }) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(apiConfig.emailApiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiConfig.apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const rawBody = await response.text();

    if (!response.ok) {
      throw new Error(rawBody || 'Brevo API request failed');
    }

    return { messageId: JSON.parse(rawBody)?.messageId || 'unknown' };
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Request timeout after ${requestTimeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function sendThroughBrevoApi({ contextLabel, payload }) {
  const apiConfig = getBrevoConfig();
  const attempts = 2;
  const backoffMs = 350;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await postToBrevoEmailApi({ apiConfig, payload });
      logger.info(`Brevo API accepted ${contextLabel}`, { messageId: result.messageId, attempt });
      return result;
    } catch (error) {
      logger.error(`Brevo API ${contextLabel} attempt ${attempt}/${attempts} failed`, {
        message: error.message,
      });

      if (attempt >= attempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt));
    }
  }
}

function buildOtpEmailHtml({ toName, code, type }) {
  const safeName = escapeHtml(toName || 'there');
  const safeCode = escapeHtml(String(code || '').replace(/\s+/g, ''));
  const title = type === 'forgot-password' ? 'Password Reset' : 'Password Change';

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #fafafa; border-radius: 8px;">
      <h2 style="color: #333; margin: 0 0 16px;">${title} OTP</h2>
      <p style="color: #555; font-size: 15px;">Hey <strong>${safeName}</strong>,</p>
      <p style="color: #555; font-size: 15px;">Use the code below to ${type === 'forgot-password' ? 'reset your password' : 'change your password'}:</p>
      <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 16px 0; letter-spacing: 4px; font-size: 28px; font-weight: 700; color: #333; font-family: monospace; text-align: center;">
        ${safeCode}
      </div>
      <p style="color: #888; font-size: 12px;">This code expires in <strong>10 minutes</strong>.</p>
    </div>
  `;
}

const sendPasswordResetMail = async (toEmail, otp, type = 'forgot-password') => {
  try {
    const apiConfig = getBrevoConfig();
    if (!apiConfig.apiKey) {
      throw new Error('BREVO_API_KEY is required but not set');
    }

    const recipient = normalizeEmailAddress(toEmail);
    if (!isLikelyEmail(recipient)) {
      throw new Error(`Invalid recipient email: ${toEmail}`);
    }

    const code = escapeHtml(String(otp || '').replace(/\s+/g, ''));
    const toName = toEmail.split('@')[0];
    const subject = type === 'forgot-password' ? 'Password Reset OTP' : 'Password Change OTP';

    await sendThroughBrevoApi({
      contextLabel: 'Password reset email',
      payload: {
        sender: getFromField(),
        to: [{ email: recipient }],
        subject,
        htmlContent: buildOtpEmailHtml({ toName, code, type }),
        textContent: `Your ${type === 'forgot-password' ? 'password reset' : 'password change'} OTP code is ${code}. It is valid for 10 minutes.`,
      },
    });

    logger.info('Password reset OTP email sent successfully via Brevo', { toEmail, type });
  } catch (error) {
    logger.error('Brevo email error', { message: error.message, code: error.code, toEmail, type });
    throw new Error(`Brevo error: ${error.message}`);
  }
};

module.exports = sendPasswordResetMail;