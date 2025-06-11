const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/user-rentals', auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ userId: req.user.id }).populate('userId', 'username');
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', adminAuth, async (req, res) => {
  try {
    const rentals = await Rental.find().populate('userId', 'username');
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;