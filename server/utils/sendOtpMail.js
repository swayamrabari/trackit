const nodemailer = require('nodemailer');
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
      from: "Trackit- OTP Verification ",
      to: toEmail,
      subject: '🔐 Your One-Time Password (OTP)',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #4CAF50; text-align: center;">🔐 Secure Login</h2>
          <p>Dear User,</p>
          <p>Your One-Time Password (OTP) for login verification is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; color: #4CAF50; letter-spacing: 2px;">${otp}</span>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
          <p style="margin-top: 30px;">Thank you,<br><strong>Trackit</strong></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #777; text-align: center;">
            If you did not request this OTP, please ignore this email or contact support.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully');
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Could not send OTP email');
  }
};

module.exports = sendOtpMail;
