const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { auth } = require('../middleware/auth');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/initiate-payment', auth, async (req, res) => {
  try {
    const { gadgets } = req.body;
    if (!gadgets || !Array.isArray(gadgets)) {
      return res.status(400).json({ message: 'Invalid gadgets data' });
    }

    const total = gadgets.reduce((sum, item) => sum + item.total, 0);
    const rental = new Rental({
      userId: req.user.id,
      gadgets,
      total,
    });
    await rental.save();

    const options = {
      amount: total * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${rental._id}`,
    };

    const order = await razorpay.orders.create(options);
    const payment = new Payment({
      rentalId: rental._id,
      razorpayOrderId: order.id,
      amount: options.amount,
      currency: options.currency,
    });
    await payment.save();

    res.json({
      orderId: order.id,
      amount: options.amount,
      currency: options.currency,
      dbOrderId: payment._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, dbOrderId } = req.body;
    const payment = await Payment.findById(dbOrderId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature === razorpaySignature) {
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = 'completed';
      await payment.save();

      const rental = await Rental.findById(payment.rentalId);
      rental.status = 'completed';
      await rental.save();

      res.json({ order: rental });
    } else {
      payment.status = 'failed';
      await payment.save();
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;