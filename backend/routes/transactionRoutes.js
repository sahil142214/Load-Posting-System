const express = require('express');
const router = express.Router();
const {
  createPayment,
  getUserTransactions,
  getLoadTransactions,
  getTransactionById
} = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// @route   POST api/transactions/payment/:loadId
// @desc    Create a payment transaction
// @access  Private (shippers only)
router.post('/payment/:loadId', auth, createPayment);

// @route   GET api/transactions
// @desc    Get all transactions for current user
// @access  Private
router.get('/', auth, getUserTransactions);

// @route   GET api/transactions/load/:loadId
// @desc    Get transactions for a specific load
// @access  Private
router.get('/load/:loadId', auth, getLoadTransactions);

// @route   GET api/transactions/:id
// @desc    Get transaction details
// @access  Private
router.get('/:id', auth, getTransactionById);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Transactions route is working' });
});

module.exports = router;
