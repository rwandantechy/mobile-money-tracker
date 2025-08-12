// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Please enter a valid email address',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: '',
  },
  otpExpiresAt: {
    type: Date,
  },
  profilePicture: {
    type: String,
    default: function() {
      // Generate avatar URL using DiceBear API with initials
      const initials = `${this.firstName?.charAt(0) || 'U'}${this.lastName?.charAt(0) || 'S'}`;
      return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=004F71&textColor=ffffff&size=200`;
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  // Update avatar when name changes
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.profilePicture = this.generateAvatar();
  }

  // Hash password if modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare candidate password with hashed password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate a 6-digit OTP, set expiry, and return it
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  return otp;
};

// Verify OTP and expiry, clear OTP if valid
userSchema.methods.verifyOTP = function (otp) {
  if (
    this.otp === otp &&
    this.otpExpiresAt &&
    this.otpExpiresAt > new Date()
  ) {
    this.otp = '';
    this.otpExpiresAt = null;
    return true;
  }
  return false;
};

// Clear OTP and expiry, and save the user
userSchema.methods.clearOTP = function () {
  this.otp = '';
  this.otpExpiresAt = null;
  return this.save();
};

// Update lastLogin to now and save the user
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Generate avatar URL based on user initials
userSchema.methods.generateAvatar = function () {
  const initials = `${this.firstName?.charAt(0) || 'U'}${this.lastName?.charAt(0) || 'S'}`;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=004F71&textColor=ffffff&size=200`;
};



// Virtual for fullName
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
