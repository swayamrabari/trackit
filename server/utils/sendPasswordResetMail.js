const logger = require('./logger');
require('dotenv').config();

const sendPasswordResetMail = async (toEmail, otp, type = 'forgot-password') => {
  try {
    // Use Resend in production (more reliable for cloud hosting)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    
    const subject = type === 'forgot-password' 
      ? 'Password Reset OTP'
      : 'Password Change OTP';
    
    const text = type === 'forgot-password'
      ? `Your password reset OTP code is ${otp}. It is valid for 10 minutes.`
      : `Your password change OTP code is ${otp}. It is valid for 10 minutes.`;

    if (isProduction && process.env.RESEND_API_KEY) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: toEmail,
        subject,
        text,
      });

      if (error) {
        throw new Error(error.message || 'Resend API error');
      }

      logger.info('Password reset OTP email sent successfully via Resend', { toEmail, type });
      return;
    }

    // Fallback to Gmail/nodemailer for development
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject,
      text,
    };
    
    await transporter.sendMail(mailOptions);
    logger.info('Password reset OTP email sent successfully via Gmail', { toEmail, type });
  } catch (error) {
    logger.error('Error sending password reset OTP email', { 
      error: error.message, 
      toEmail, 
      type,
      service: (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') ? 'Resend' : 'Gmail'
    });
    throw new Error('Could not send OTP email');
  }
};

module.exports = sendPasswordResetMail;

