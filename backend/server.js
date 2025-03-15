const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();  // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using MONGO_URI from environment variables
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Define Routes
// Add this to your existing routes
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/track', require('./routes/trackRoutes'));
app.use('/api/eligibility', require('./routes/eligibilityRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/loads', require('./routes/loadRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));

// Home route
app.get('/', (req, res) => res.json({ message: 'Welcome to Load Posting API' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;  // Use PORT from environment variables
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
