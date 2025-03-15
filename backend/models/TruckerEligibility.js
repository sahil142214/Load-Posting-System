const mongoose = require('mongoose');

const TruckerEligibilitySchema = new mongoose.Schema({
  truckerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true
  },
  licenseIssueDate: {
    type: Date,
    required: true
  },
  truckAge: {
    type: Number,
    required: true
  },
  accidentHistory: {
    type: Boolean,
    default: false
  },
  theftComplaints: {
    type: Boolean,
    default: false
  },
  documents: {
    driverLicense: String,      // URL to uploaded document
    truckRegistration: String,  // URL to uploaded document
    insurance: String           // URL to uploaded document
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('truckerEligibility', TruckerEligibilitySchema);
