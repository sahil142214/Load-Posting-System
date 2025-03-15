const Bid = require('../models/Bid');
const Load = require('../models/Load');
const Trucker = require('../models/TruckerEligibility');

// Create a bid
exports.createBid = async (req, res) => {
  try {
    const { loadId, amount, comment } = req.body;

    // Check if load exists and is available
    const load = await Load.findById(loadId);
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    if (load.status !== 'posted') {
      return res.status(400).json({ message: 'This load is not available for bidding' });
    }

    // Check if trucker already has a pending bid on this load
    const existingBid = await Bid.findOne({
      loadId,
      truckerId: req.user.id,
      status: 'pending'
    });

    if (existingBid) {
      return res.status(400).json({ message: 'You already have a pending bid on this load' });
    }

    // Create bid
    const newBid = new Bid({
      loadId,
      truckerId: req.user.id,
      amount,
      comment
    });

    const bid = await newBid.save();
    res.json(bid);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get bids for a load
exports.getBidsForLoad = async (req, res) => {
  try {
    const load = await Load.findById(req.params.loadId);

    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    // Only the shipper who created the load can see the bids
    if (load.shipperId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const bids = await Bid.find({ loadId: req.params.loadId })
      .populate('truckerId', 'name company phone')
      .sort({ amount: 1 }); // Sort by lowest bid first

    res.json(bids);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get bids by trucker
exports.getBidsByTrucker = async (req, res) => {
  try {
    const bids = await Bid.find({ truckerId: req.user.id })
      .populate({
        path: 'loadId',
        select: 'pickupLocation deliveryLocation pickupDate deliveryDate status basePrice cargoType'
      })
      .sort({ createdAt: -1 });

    // Find the latest accepted bid
    const assignedLoad = bids.filter(bid => bid.status === 'accepted');
    res.json({ bids , assignedLoad });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept a bid
exports.acceptBid = async (req, res) => {
    try {
      const bid = await Bid.findById(req.params.id);
  
      if (!bid) {
        return res.status(404).json({ message: 'Bid not found' });
      }
  
      // Get the load
      const load = await Load.findById(bid.loadId);
  
      if (!load) {
        return res.status(404).json({ message: 'Load not found' });
      }
  
      // Check if user is the shipper who created the load
      if (load.shipperId.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
  
      // Check if load is still available
      if (load.status !== 'posted') {
        return res.status(400).json({ message: 'This load is no longer available' });
      }

      // Update bid status
      bid.status = 'accepted';
      await bid.save();
  
      // Update load
      load.status = 'assigned';
      load.assignedTruckerId = bid.truckerId;
      load.finalPrice = bid.amount;
      
      // Add initial status update to tracking history
      load.statusUpdates = [{
        status: 'assigned',
        updatedBy: req.user.id,
        notes: 'Load assigned to trucker',
        timestamp: new Date()
      }];
      
      await load.save();
  
      // Reject all other bids for this load
      await Bid.updateMany(
        { loadId: load._id, _id: { $ne: bid._id } },
        { status: 'rejected' }
      );
  
      res.json({ bid, load });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  };