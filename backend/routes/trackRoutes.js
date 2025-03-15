const express = require('express');
const router = express.Router();
const { 
  updateLoadStatus, 
  completeDelivery, 
  getLoadTracking 
} = require('../controllers/trackController');
const auth = require('../middleware/auth');

// @route   PUT api/track/:id
// @desc    Update load status (trucker)
// @access  Private
router.put('/:id', auth, updateLoadStatus);

// @route   PUT api/track/:id/complete
// @desc    Complete delivery (shipper)
// @access  Private
router.put('/:id/complete', auth, completeDelivery);

// @route   GET api/track/:id
// @desc    Get load tracking history
// @access  Private
router.get('/:id', auth, getLoadTracking);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Tracking route is working' });
});

module.exports = router;
