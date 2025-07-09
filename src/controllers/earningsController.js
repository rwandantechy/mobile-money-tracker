const Earning = require('../models/Earning');

// Get all earnings, sorted by date (desc), with discrepancy info
exports.getAllEarnings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      startDate = '', 
      endDate = '',
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    // Date range filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    // Search functionality (future enhancement for notes/comments)
    if (search) {
      query.$or = [
        { discrepancyNote: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get total count for pagination
    const total = await Earning.countDocuments(query);
    
    // Get paginated results
    const earnings = await Earning.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      earnings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new earning log (per day)
exports.createEarning = async (req, res) => {
  const earning = new Earning({
    date: req.body.date,
    openingCapital: req.body.openingCapital,
    earnings: req.body.earnings,
    expenses: req.body.expenses,
    mtnFloat: req.body.mtnFloat,
    cashInHand: req.body.cashInHand,
    agent: req.body.agent, // for future multi-agent
    account: req.body.account, // for future multi-account
    dailyGoal: req.body.dailyGoal // for future goals
  });

  try {
    const newEarning = await earning.save();
    res.status(201).json(newEarning);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get summary for a period (monthly/weekly)
exports.getSummary = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'weekly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const earnings = await Earning.find({
      date: { $gte: startDate }
    });

    const summary = {
      totalOpening: earnings.reduce((sum, e) => sum + (e.openingCapital || 0), 0),
      totalEarnings: earnings.reduce((sum, e) => sum + (e.earnings || 0), 0),
      totalExpenses: earnings.reduce((sum, e) => sum + (e.expenses || 0), 0),
      totalFloat: earnings.reduce((sum, e) => sum + (e.mtnFloat || 0), 0),
      totalCash: earnings.reduce((sum, e) => sum + (e.cashInHand || 0), 0),
      totalExpected: earnings.reduce((sum, e) => sum + (e.expectedTotalCapital || 0), 0),
      totalNetProfit: earnings.reduce((sum, e) => sum + (e.netProfit || 0), 0),
      discrepancies: earnings.filter(e => e.discrepancy).length,
      period
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an earning log by ID
exports.deleteEarning = async (req, res) => {
  try {
    await Earning.findByIdAndDelete(req.params.id);
    res.json({ message: 'Earning deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an earning log by ID (per day)
exports.updateEarning = async (req, res) => {
  try {
    const earning = await Earning.findById(req.params.id);
    if (!earning) {
      return res.status(404).json({ message: 'Earning not found' });
    }

    // Only update allowed fields
    [
      'date', 'openingCapital', 'earnings', 'expenses', 'mtnFloat', 'cashInHand',
      'agent', 'account', 'dailyGoal'
    ].forEach(key => {
      if (req.body[key] !== undefined) earning[key] = req.body[key];
    });

    const updatedEarning = await earning.save();
    res.json(updatedEarning);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 

// Get a single earning log by ID
exports.getEarningById = async (req, res) => {
  try {
    const earning = await Earning.findById(req.params.id);
    if (!earning) {
      return res.status(404).json({ message: 'Earning not found' });
    }
    res.json(earning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 