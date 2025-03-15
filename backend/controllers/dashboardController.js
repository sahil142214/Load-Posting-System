const Load = require('../models/Load');
const Transaction = require('../models/Transaction');

// Get dashboard summary for current user
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    let summary = {
      loads: { total: 0, active: 0, completed: 0 },
      transactions: { 
        total: 0, 
        pending: 0, 
        completed: 0, 
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0
      },
      recentLoads: [],
      recentTransactions: []
    };
    
    // Get load stats based on role
    let loadQuery = {};
    if (role === 'shipper') {
      loadQuery.shipperId = userId;
    } else if (role === 'trucker') {
      loadQuery.assignedTruckerId = userId;
    }
    
    // Get basic load counts
    const allLoads = await Load.find(loadQuery);
    summary.loads.total = allLoads.length;
    
    summary.loads.active = allLoads.filter(load => 
      ['assigned', 'picked_up', 'in_transit', 'delivered'].includes(load.status)
    ).length;
    
    summary.loads.completed = allLoads.filter(load => 
      load.status === 'completed'
    ).length;
    
    // Get recent loads
    summary.recentLoads = await Load.find(loadQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('shipperId', 'name')
      .populate('assignedTruckerId', 'name');
    
    // Get transaction stats based on role
    let transactionQuery = {};
    if (role === 'shipper') {
      transactionQuery.shipperId = userId;
    } else if (role === 'trucker') {
      transactionQuery.truckerId = userId;
    }
    
    const allTransactions = await Transaction.find(transactionQuery);
    summary.transactions.total = allTransactions.length;
    
    // Calculate transaction amounts
    allTransactions.forEach(transaction => {
      if (transaction.status === 'pending') {
        summary.transactions.pending++;
        summary.transactions.pendingAmount += transaction.amount;
      } else if (transaction.status === 'completed') {
        summary.transactions.completed++;
        summary.transactions.completedAmount += transaction.amount;
      }
    });
    
    summary.transactions.totalAmount = summary.transactions.completedAmount;
    
    // Get recent transactions
    summary.recentTransactions = await Transaction.find(transactionQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('loadId', 'pickupLocation deliveryLocation');
    
    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
