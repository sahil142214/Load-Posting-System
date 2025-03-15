const express = require('express');
const router = express.Router();
const { createBid, getBidsForLoad, getBidsByTrucker, acceptBid } = require('../controllers/bidController');
const auth = require('../middleware/auth');
const checkEligibility = require('../middleware/checkEligibility');






// @route   POST api/bids
// @desc    Create a bid
// @access  Private
router.post('/', [auth, checkEligibility], createBid);

// @route   GET api/bids/load/:loadId
// @desc    Get bids for a load
// @access  Private
router.get('/load/:loadId', auth, getBidsForLoad);

// @route   GET api/bids/trucker
// @desc    Get bids by trucker
// @access  Private
router.get('/trucker', auth, getBidsByTrucker);

// @route   PUT api/bids/:id/accept
// @desc    Accept a bid
// @access  Private
router.put('/:id/accept', auth, acceptBid);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Bids route is working' });
});

module.exports = router;
