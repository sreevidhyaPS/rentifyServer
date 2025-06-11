const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gadgets: [{
    gadgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gadget', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    rentalDays: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);