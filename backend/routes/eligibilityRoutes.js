const express = require('express');
const router = express.Router();
const {
  submitEligibility,
  getEligibility,
  getAllEligibilities,
  updateEligibilityStatus
} = require('../controllers/eligibilityController');
const auth = require('../middleware/auth');

// @route   POST api/eligibility
// @desc    Submit eligibility data
// @access  Private (truckers only)
router.post('/', auth, submitEligibility);

// @route   GET api/eligibility
// @desc    Get trucker's eligibility status
// @access  Private (truckers only)
router.get('/', auth, getEligibility);

// @route   GET api/eligibility/all
// @desc    Get all eligibility requests (admin)
// @access  Private (admin only)
router.get('/all', auth, getAllEligibilities);

// @route   PUT api/eligibility/:id
// @desc    Update eligibility status (admin)
// @access  Private (admin only)
router.put('/:id', auth, updateEligibilityStatus);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Eligibility route is working' });
});

module.exports = router;
