const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

function generateToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, firstName, lastName, phone } = req.body;
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) return res.status(400).json({ message: 'Email or phone already registered' });

  try {
    const user = new User({ email, password, firstName, lastName, phone });
    const otp = user.generateOTP();
    await user.save();
    await transporter.sendMail({
      from: `"Money Tracker" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Verify your Money Tracker account',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9fafb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px 24px;">
          <h2 style="color: #004f71; margin-bottom: 16px;">Money Tracker Pro</h2>
          <p style="font-size: 1.1rem; color: #222; margin-bottom: 24px;">Thank you for registering with <b>Money Tracker Pro</b>!</p>
          <p style="font-size: 1rem; color: #222; margin-bottom: 16px;">Your One-Time Password (OTP) is:</p>
          <div style="font-size: 2.2rem; font-weight: bold; letter-spacing: 0.3em; color: #004f71; background: #fff; border-radius: 8px; border: 1px solid #ffcb05; padding: 16px 0; text-align: center; margin-bottom: 24px;">${otp}</div>
          <p style="font-size: 1rem; color: #444; margin-bottom: 8px;">This code will expire in <b>5 minutes</b>.</p>
          <p style="font-size: 0.95rem; color: #888;">If you did not request this, you can safely ignore this email.</p>
          <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #eee;">
          <div style="font-size: 0.9rem; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Money Tracker Pro</div>
        </div>
      `
    });
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
};

exports.verifyOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      return res.status(400).json({ message: 'Invalid or already verified' });
    }
    if (!user.verifyOTP(otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.isVerified = true;
    await user.clearOTP();
    await user.save();
    const token = generateToken(user);
    
    // Set token as HTTP-only cookie for web routes
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(200).json({
      token, // Also return token in response body for frontend localStorage
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Error during OTP verification' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isVerified) {
      return res.status(400).json({ message: 'Invalid credentials or unverified account' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    await user.updateLastLogin();
    const token = generateToken(user);
    
    // Set token as HTTP-only cookie for web routes
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(200).json({
      token, // Also return token in response body for frontend localStorage
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }
    const otp = user.generateOTP();
    await user.save();
    await transporter.sendMail({
      from: `"Money Tracker" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Reset Password OTP',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`
    });
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error during password reset request' });
  }
};

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.verifyOTP(otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.password = newPassword;
    await user.clearOTP();
    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error during password reset' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName },
      { new: true }
    );
    res.status(200).json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

exports.logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Profile deletion error:', error);
    res.status(500).json({ message: 'Error deleting profile' });
  }
}; 