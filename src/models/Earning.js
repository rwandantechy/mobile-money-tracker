const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  openingCapital: {
    type: Number,
    required: true,
    default: 0
  },
  earnings: {
    type: Number,
    required: true,
    default: 0
  },
  expenses: {
    type: Number,
    required: true,
    default: 0
  },
  mtnFloat: {
    type: Number,
    required: true,
    default: 0
  },
  cashInHand: {
    type: Number,
    required: true,
    default: 0
  },
  expectedTotalCapital: {
    type: Number,
    required: true,
    default: 0
  },
  netProfit: {
    type: Number,
    required: true,
    default: 0
  },
  discrepancy: {
    type: Boolean,
    default: false
  },
  discrepancyNote: {
    type: String,
    default: ''
  },
  // Future-proofing fields
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  account: {
    type: String,
    required: false
  },
  dailyGoal: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

// Calculate netProfit, expectedTotalCapital, and flag discrepancies before saving
earningSchema.pre('save', function(next) {
  this.expectedTotalCapital = this.openingCapital + this.earnings - this.expenses;
  this.netProfit = this.earnings - this.expenses;
  const sum = this.mtnFloat + this.cashInHand;
  if (this.expectedTotalCapital !== sum) {
    this.discrepancy = true;
    this.discrepancyNote = `Expected total (${this.expectedTotalCapital}) does not match actual (Float + Cash = ${sum})`;
  } else {
    this.discrepancy = false;
    this.discrepancyNote = '';
  }
  next();
});

module.exports = mongoose.model('Earning', earningSchema); 