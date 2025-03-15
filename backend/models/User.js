const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['shipper', 'trucker', 'admin'], // Add 'admin' to allowed roles
    required: true 
  },
  company: { 
    type: String ,
    required: false
  },
  phone: { 
    type: String ,
    required: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('user', UserSchema);
