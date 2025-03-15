const Load = require('../models/Load');
const Transaction = require('../models/Transaction');


// Update load status (for truckers)
exports.updateLoadStatus = async (req, res) => {
  try {
    const { status, location, notes } = req.body;
    
    // Validate status
    const validStatusUpdates = ['picked_up', 'in_transit', 'delivered'];
    if (!validStatusUpdates.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be picked_up, in_transit, or delivered' });
    }
    
    // Find the load
    const load = await Load.findById(req.params.id);
    
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }
    
    // Only the assigned trucker can update status
    if (!load.assignedTruckerId || load.assignedTruckerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Validate status transition
    const currentStatus = load.status;
    
    // Ensure logical status progression
    if (
      (status === 'picked_up' && currentStatus !== 'assigned') ||
      (status === 'in_transit' && currentStatus !== 'picked_up') ||
      (status === 'delivered' && currentStatus !== 'in_transit')
    ) {
      return res.status(400).json({ 
        message: `Cannot update status from ${currentStatus} to ${status}. Invalid status transition.` 
      });
    }
    
    // Update the load status
    load.status = status;
    
    // Add to status history
    load.statusUpdates.push({
      status,
      updatedBy: req.user.id,
      location: location || '',
      notes: notes || '',
      timestamp: new Date()
    });
    
    // If status is 'delivered', notify the shipper (in a real app)
    if (status === 'delivered') {
      // Here you would implement notification logic
      console.log(`Load ${load._id} has been delivered. Notifying shipper ${load.shipperId}`);
    }
    
    await load.save();
    
    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Complete delivery (for shippers - confirms the delivery is complete)
exports.completeDelivery = async (req, res) => {
    try {
      const load = await Load.findById(req.params.id);
      
      if (!load) {
        return res.status(404).json({ message: 'Load not found' });
      }
      
      // Only the shipper can complete the delivery
      if (load.shipperId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Can only complete if status is 'delivered'
      if (load.status !== 'delivered') {
        return res.status(400).json({ message: 'Load must be delivered before it can be completed' });
      }
      
      // Update the load status
      load.status = 'completed';
      
      // Add to status history
      load.statusUpdates.push({
        status: 'completed',
        updatedBy: req.user.id,
        notes: 'Delivery confirmed by shipper',
        timestamp: new Date()
      });
      
      await load.save();
      
      // Check if payment already exists
      const existingTransaction = await Transaction.findOne({
        loadId: load._id,
        type: 'payment'
      });
      
      if (!existingTransaction) {
        res.json({
          load,
          message: 'Delivery completed successfully. Please process payment for this load.',
          paymentRequired: true
        });
      } else {
        res.json({
          load,
          message: 'Delivery completed successfully.',
          transaction: existingTransaction
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Get tracking history for a load
exports.getLoadTracking = async (req, res) => {
  try {
    const load = await Load.findById(req.params.id)
      .populate('statusUpdates.updatedBy', 'name role')
      .populate('shipperId', 'name company phone')
      .populate('assignedTruckerId', 'name company phone');
    
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }
    
    // Check if user is authorized (shipper or assigned trucker)
    if (
      load.shipperId._id.toString() !== req.user.id && 
      (!load.assignedTruckerId || load.assignedTruckerId._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Return the load with tracking information
    res.json({
      _id: load._id,
      status: load.status,
      pickupLocation: load.pickupLocation,
      deliveryLocation: load.deliveryLocation,
      pickupDate: load.pickupDate,
      deliveryDate: load.deliveryDate,
      shipper: {
        _id: load.shipperId._id,
        name: load.shipperId.name,
        company: load.shipperId.company,
        phone: load.shipperId.phone
      },
      trucker: load.assignedTruckerId ? {
        _id: load.assignedTruckerId._id,
        name: load.assignedTruckerId.name,
        company: load.assignedTruckerId.company,
        phone: load.assignedTruckerId.phone
      } : null,
      tracking: load.statusUpdates
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
