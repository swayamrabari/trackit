const nodemailer = require('nodemailer');
const logger = require('./logger');
require('dotenv').config();

const sendOtpMail = async (toEmail, otp) => {
  try {
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
    logger.info('OTP email sent successfully', { toEmail });
  } catch (error) {
    logger.error('Error sending OTP email', { error: error.message, toEmail });
    throw new Error('Could not send OTP email');
  }
};

module.exports = sendOtpMail;
