const mongoose = require('mongoose');

const LoadSchema = new mongoose.Schema({
  shipperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  status: {
    type: String,
    enum: ['posted', 'assigned', 'picked_up', 'in_transit', 'delivered', 'completed'],
    default: 'posted'
  },
  pickupLocation: {
    type: String,
    required: true
  },
  deliveryLocation: {
    type: String,
    required: true
  },
  pickupDate: {
    type: Date,
    required: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  cargoType: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  assignedTruckerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  finalPrice: {
    type: Number
  },
  // Add status tracking history
  statusUpdates: [{
    status: {
      type: String,
      enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'completed']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    location: String,
    notes: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('load', LoadSchema);
