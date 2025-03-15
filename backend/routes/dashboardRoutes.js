const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// @route   GET api/dashboard
// @desc    Get dashboard summary
// @access  Private
router.get('/', auth, getDashboardSummary);

module.exports = router;
