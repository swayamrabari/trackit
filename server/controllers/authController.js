const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const PendingUser = require('../models/PendingUser');
const User = require('../models/User');
const sendOtpMail = require('../utils/sendOtpMail');
const generateToken = require('../utils/generateToken');

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists' });
    }

    await PendingUser.deleteOne({ email });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, salt);
    const otpExpires = Date.now() + 10 * 60 * 1000;

    await PendingUser.create({
      name,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpires,
    });

    await sendOtpMail(email, otp);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(400).json({ message: 'No pending registration found' });
    }
    if (pendingUser.otpExpires < Date.now()) {
      await PendingUser.deleteOne({ email });
      return res.status(400).json({ message: 'OTP expired' });
    }
    const isMatch = await bcrypt.compare(otp, pendingUser.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      provider: 'local',
      categories: { income: [], expense: [], investment: [], savings: [] },
    });

    await PendingUser.deleteOne({ email });
    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(400).json({ message: 'No pending registration found' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    const otpExpires = Date.now() + 10 * 60 * 1000;
    pendingUser.otp = hashedOtp;
    pendingUser.otpExpires = otpExpires;
    await pendingUser.save();
    await sendOtpMail(email, otp);

    res.status(200).json({ message: 'New OTP resent to email' });
  } catch (error) {
    console.error('Error in resendOtp:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// login exising user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
    });

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
