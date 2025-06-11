// index.js
require('dotenv').config(); // Load .env at the very top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const gadgetRoutes = require('./routes/gadgets');
const paymentRoutes = require('./routes/payment');
const rentalRoutes = require('./routes/rental');
const reviewRoutes = require('./routes/review');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug route to verify environment variables
app.get('/test-env', (req, res) => {
  res.json({
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gadgets', gadgetRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/rental', rentalRoutes);
app.use('/api/review', reviewRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));