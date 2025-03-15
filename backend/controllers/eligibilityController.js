const TruckerEligibility = require('../models/TruckerEligibility');
const User = require('../models/User');

// Submit eligibility data (for truckers)
exports.submitEligibility = async (req, res) => {
  try {
    // Only truckers can submit eligibility
    if (req.user.role !== 'trucker') {
      return res.status(403).json({ message: 'Only truckers can submit eligibility information' });
    }

    const {
      licenseIssueDate,
      truckAge,
      accidentHistory,
      theftComplaints,
      documents
    } = req.body;

    // Check if eligibility already exists
    let eligibility = await TruckerEligibility.findOne({ truckerId: req.user.id });

    if (eligibility) {
      // Update existing eligibility
      eligibility.licenseIssueDate = licenseIssueDate;
      eligibility.truckAge = truckAge;
      eligibility.accidentHistory = accidentHistory;
      eligibility.theftComplaints = theftComplaints;
      eligibility.documents = documents;
      eligibility.status = 'pending'; // Reset to pending when updated
      eligibility.updatedAt = Date.now();

      await eligibility.save();
    } else {
      // Create new eligibility
      eligibility = new TruckerEligibility({
        truckerId: req.user.id,
        licenseIssueDate,
        truckAge,
        accidentHistory,
        theftComplaints,
        documents
      });

      await eligibility.save();
    }

    res.json(eligibility);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get trucker's eligibility status
exports.getEligibility = async (req, res) => {
  try {
    const eligibility = await TruckerEligibility.findOne({ truckerId: req.user.id });

    if (!eligibility) {
      return res.status(404).json({ message: 'Eligibility information not found' });
    }

    res.json(eligibility);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// For admin: get all eligibility requests
exports.getAllEligibilities = async (req, res) => {
  try {
    // In a real app, check if user is admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }

    // For demo purposes, allow any user to see all eligibilities
    const eligibilities = await TruckerEligibility.find()
      .populate('truckerId', 'name email company phone')
      .sort({ createdAt: -1 });

    const filteredEligibilities = eligibilities.filter(eligibility => eligibility.status !== 'approved');
    res.json(filteredEligibilities);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// For admin: approve or reject eligibility
exports.updateEligibilityStatus = async (req, res) => {
  try {
    // In a real app, check if user is admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }

    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    // console.log(req.params.id);
    const eligibility = await TruckerEligibility.findOne({truckerId: req.params.id});

    if (!eligibility) {
      return res.status(404).json({ message: 'Eligibility not found' });
    }

    eligibility.status = status;
    eligibility.adminNotes = adminNotes || '';
    eligibility.updatedAt = Date.now();

    await eligibility.save();

    res.json(eligibility);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
