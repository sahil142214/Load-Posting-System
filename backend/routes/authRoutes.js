const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getCurrentUser);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working' });
});

router.post('/create-admin', async (req, res) => {
    try {
      console.log('Creating admin user with data:', req.body);
      
      const { name, email, password } = req.body;
      
      // Validate input
      if (!name || !email || !password) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'Please provide name, email and password' });
      }
      
      // Check if user exists
      console.log('Checking if user already exists');
      let user = await User.findOne({ email });
      
      if (user) {
        console.log('User already exists');
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create admin user
      console.log('Creating new admin user');
      user = new User({
        name,
        email,
        password,
        role: 'admin'
      });
      
      // Hash password
      console.log('Hashing password');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      
      console.log('Saving user to database');
      await user.save();
      
      console.log('Admin user created successfully');
      res.json({ message: 'Admin user created successfully', user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      console.error('Admin creation error:', err);
      res.status(500).json({ 
        message: 'Server error', 
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? undefined : err.stack
      });
    }
  });
  

module.exports = router;
