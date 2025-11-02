const nodemailer = require('nodemailer');
require('dotenv').config();

const sendPasswordResetMail = async (toEmail, otp, type = 'forgot-password') => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const subject = type === 'forgot-password' 
      ? 'Password Reset OTP'
      : 'Password Change OTP';
    
    const text = type === 'forgot-password'
      ? `Your password reset OTP code is ${otp}. It is valid for 10 minutes.`
      : `Your password change OTP code is ${otp}. It is valid for 10 minutes.`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject,
      text,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Password reset OTP email sent successfully');
  } catch (error) {
    console.error('Error sending password reset OTP email:', error);
    throw new Error('Could not send OTP email');
  }
};

module.exports = sendPasswordResetMail;

