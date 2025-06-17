const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  mtn: {
    type: Number,
    required: true,
    default: 0
  },
  airtel: {
    type: Number,
    required: true,
    default: 0
  },
  bonus: {
    type: Number,
    required: true,
    default: 0
  },
  expenses: {
    type: Number,
    required: true,
    default: 0
  },
  net: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Calculate net profit before saving
earningSchema.pre('save', function(next) {
  this.net = (this.mtn + this.airtel + this.bonus) - this.expenses;
  next();
});

module.exports = mongoose.model('Earning', earningSchema); 