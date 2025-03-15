const TruckerEligibility = require('../models/TruckerEligibility');

module.exports = async function(req, res, next) {
  // Skip check if not a trucker
  if (req.user.role !== 'trucker') {
    return next();
  }

  try {
    // Find trucker's eligibility
    const eligibility = await TruckerEligibility.findOne({ truckerId: req.user.id });

    // If no eligibility record or not approved, deny access
    if (!eligibility || eligibility.status !== 'approved') {
      return res.status(200).json({ 
        message: 'Eligibility check failed. Your account must be approved before you can bid on loads.',
        status: eligibility ? eligibility.status : 'not_submitted'
      });
    }

    // If approved, continue
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
