const Load = require('../models/Load');
const Bid = require('../models/Bid');

// Create a load
exports.createLoad = async (req, res) => {
  try {
    const {
      pickupLocation,
      deliveryLocation,
      pickupDate,
      deliveryDate,
      cargoType,
      weight,
      basePrice
    } = req.body;

    // Only shippers can create loads
    if (req.user.role !== 'shipper') {
      return res.status(403).json({ message: 'Only shippers can create loads' });
    }

    // Create load
    const newLoad = new Load({
      shipperId: req.user.id,
      pickupLocation,
      deliveryLocation,
      pickupDate,
      deliveryDate,
      cargoType,
      weight,
      basePrice
    });

    const load = await newLoad.save();
    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all loads
exports.getLoads = async (req, res) => {
  try {
    console.log("GET LOAD")
    let query = {};

    // If user is a shipper, only show their loads
    if (req.user.role === 'shipper') {
      query.shipperId = req.user.id;
    }

    // For truckers, only show posted loads
    if (req.user.role === 'trucker') {
      query.status = 'posted';
    }

    const loads = await Load.find(query)
      .populate('shipperId', 'name company')
      .populate('assignedTruckerId', 'name company')
      .sort({ createdAt: -1 });

    res.json(loads);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get load by ID
exports.getLoadById = async (req, res) => {
  try {
    const load = await Load.findById(req.params.id)
      .populate('shipperId', 'name company phone')
      .populate('assignedTruckerId', 'name company phone');

    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update load
exports.updateLoad = async (req, res) => {
  try {
    const load = await Load.findById(req.params.id);

    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    // Check if user is the shipper who created the load
    if (load.shipperId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Can only update if not yet assigned
    if (load.status !== 'posted') {
      return res.status(400).json({ message: 'Cannot update load after it has been assigned' });
    }

    const updatedLoad = await Load.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedLoad);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete load
exports.deleteLoad = async (req, res) => {
  try {
    const load = await Load.findById(req.params.id);

    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    // Check if user is the shipper who created the load
    if (load.shipperId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Can only delete if not yet assigned
    if (load.status !== 'posted') {
      return res.status(400).json({ message: 'Cannot delete load after it has been assigned' });
    }

    await Load.findByIdAndDelete(req.params.id);
    // Also delete associated bids
    await Bid.deleteMany({ loadId: req.params.id });

    res.json({ message: 'Load removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
