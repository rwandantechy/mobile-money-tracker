const express = require('express');
const router = express.Router();
const Earning = require('../models/Earning');

// Get all earnings
router.get('/', async (req, res) => {
  try {
    const earnings = await Earning.find().sort({ date: -1 });
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new earning
router.post('/', async (req, res) => {
  const earning = new Earning({
    user: req.user._id,
    date: req.body.date,
    mtn: req.body.mtn,
    airtel: req.body.airtel,
    bonus: req.body.bonus,
    expenses: req.body.expenses
  });

  try {
    const newEarning = await earning.save();
    res.status(201).json(newEarning);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get summary (weekly/monthly)
router.get('/summary', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'weekly') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const earnings = await Earning.find({
      date: { $gte: startDate }
    });

    const summary = {
      totalMtn: earnings.reduce((sum, e) => sum + e.mtn, 0),
      totalAirtel: earnings.reduce((sum, e) => sum + e.airtel, 0),
      totalBonus: earnings.reduce((sum, e) => sum + e.bonus, 0),
      totalExpenses: earnings.reduce((sum, e) => sum + e.expenses, 0),
      totalNet: earnings.reduce((sum, e) => sum + e.net, 0),
      period
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete earning
router.delete('/:id', async (req, res) => {
  try {
    await Earning.findByIdAndDelete(req.params.id);
    res.json({ message: 'Earning deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update earning
router.patch('/:id', async (req, res) => {
  try {
    const earning = await Earning.findById(req.params.id);
    if (!earning) {
      return res.status(404).json({ message: 'Earning not found' });
    }

    Object.keys(req.body).forEach(key => {
      earning[key] = req.body[key];
    });

    const updatedEarning = await earning.save();
    res.json(updatedEarning);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 