const logger = require('./logger');
require('dotenv').config();

const sendOtpMail = async (toEmail, otp) => {
  try {
    // Use Resend in production (more reliable for cloud hosting)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    
    if (isProduction && process.env.RESEND_API_KEY) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: toEmail,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
      });

      if (error) {
        throw new Error(error.message || 'Resend API error');
      }

      logger.info('OTP email sent successfully via Resend', { toEmail });
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
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    logger.info('OTP email sent successfully via Gmail', { toEmail });
  } catch (error) {
    logger.error('Error sending OTP email', { 
      error: error.message, 
      toEmail,
      service: (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') ? 'Resend' : 'Gmail'
    });
    throw new Error('Could not send OTP email');
  }
};

module.exports = sendOtpMail;
