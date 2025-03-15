const Transaction = require('../models/Transaction');
const Load = require('../models/Load');

// Create a payment transaction (for shippers)
exports.createPayment = async (req, res) => {
  try {
    const{loadId} = req.params;
    const {notes} = req.body;
    
    // Find the load
    const load = await Load.findById(loadId)
      .populate('shipperId', 'name')
      .populate('assignedTruckerId', 'name');
    
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }
    
    // Check if user is the shipper
    if (load.shipperId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if load is delivered
    if (load.status !== 'delivered' && load.status !== 'completed') {
      return res.status(400).json({ message: 'Payment can only be made for delivered loads' });
    }
    
    // Check if payment already exists
    const existingTransaction = await Transaction.findOne({
      loadId: load._id,
      type: 'payment',
      status: { $in: ['pending', 'completed'] }
    });
    
    if (existingTransaction) {
      return res.status(400).json({ 
        message: 'A payment for this load already exists',
        transaction: existingTransaction
      });
    }
    
    // Create transaction
    const transaction = new Transaction({
      loadId: load._id,
      shipperId: load.shipperId._id,
      truckerId: load.assignedTruckerId._id,
      amount: load.finalPrice || load.basePrice,
      type: 'payment',
      notes: notes || `Payment for load from ${load.pickupLocation} to ${load.deliveryLocation}`
    });
    
    await transaction.save();
    
    // For demo purposes, we'll automatically complete the payment
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    await transaction.save();
    
    // If the payment is completed and the load is delivered but not completed,
    // update the load status to completed
    if (transaction.status === 'completed' && load.status === 'delivered') {
      load.status = 'completed';
      load.statusUpdates.push({
        status: 'completed',
        updatedBy: req.user.id,
        notes: 'Payment completed, delivery confirmed',
        timestamp: new Date()
      });
      await load.save();
    }
    
    res.json({
      message: 'Payment processed successfully',
      transaction,
      load
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all transactions for current user
exports.getUserTransactions = async (req, res) => {
  try {
    let query = {};
    
    // Filter based on user role
    if (req.user.role === 'shipper') {
      query.shipperId = req.user.id;
    } else if (req.user.role === 'trucker') {
      query.truckerId = req.user.id;
    }
    
    const transactions = await Transaction.find(query)
      .populate('loadId', 'pickupLocation deliveryLocation status')
      .populate('shipperId', 'name company')
      .populate('truckerId', 'name company')
      .sort({ createdAt: -1 });
      
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transactions for a specific load
exports.getLoadTransactions = async (req, res) => {
  try {
    const { loadId } = req.params;
    
    // Find the load
    const load = await Load.findById(loadId);
    
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }
    
    // Verify the user is either the shipper or trucker for this load
    if (
      load.shipperId.toString() !== req.user.id && 
      (!load.assignedTruckerId || load.assignedTruckerId.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const transactions = await Transaction.find({ loadId })
      .populate('shipperId', 'name company')
      .populate('truckerId', 'name company')
      .sort({ createdAt: -1 });
      
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transaction details
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('loadId', 'pickupLocation deliveryLocation status pickupDate deliveryDate cargoType weight')
      .populate('shipperId', 'name company phone')
      .populate('truckerId', 'name company phone');
      
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Verify the user is either the shipper or trucker for this transaction
    if (
      transaction.shipperId._id.toString() !== req.user.id && 
      transaction.truckerId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
