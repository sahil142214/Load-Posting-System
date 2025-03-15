const express = require('express');
const router = express.Router();
const { createLoad, getLoads, getLoadById, updateLoad, deleteLoad } = require('../controllers/loadController');
const auth = require('../middleware/auth');

// @route   POST api/loads
// @desc    Create a load
// @access  Private
router.post('/', auth, createLoad);

// @route   GET api/loads
// @desc    Get all loads
// @access  Private
router.get('/', auth, getLoads);

// @route   GET api/loads/:id
// @desc    Get load by ID
// @access  Private
router.get('/:id', auth, getLoadById);

// @route   PUT api/loads/:id
// @desc    Update load
// @access  Private
router.put('/:id', auth, updateLoad);

// @route   DELETE api/loads/:id
// @desc    Delete load
// @access  Private
router.delete('/:id', auth, deleteLoad);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Loads route is working' });
});

module.exports = router;
