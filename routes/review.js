const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Rental = require('../models/Rental');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/create', auth, async (req, res) => {
  try {
    const { rentalId, rating, comment } = req.body;
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    if (rental.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to review this rental' });
    }
    const review = new Review({
      userId: req.user.id,
      rentalId,
      rating,
      comment,
    });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/rental/:rentalId', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ rentalId: req.params.rentalId }).populate('userId', 'username');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find().populate('userId', 'username').populate('rentalId');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;