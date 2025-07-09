const express = require('express');
const router = express.Router();
const earningsController = require('../controllers/earningsController');

// Get all earnings
router.get('/', earningsController.getAllEarnings);

// Create new earning
router.post('/', earningsController.createEarning);

// Get summary (weekly/monthly)
router.get('/summary', earningsController.getSummary);

// Get a single earning by ID
router.get('/:id', earningsController.getEarningById);

// Delete earning
router.delete('/:id', earningsController.deleteEarning);

// Update earning
router.patch('/:id', earningsController.updateEarning);

module.exports = router; 