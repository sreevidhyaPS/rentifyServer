const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    validate: [
      {
        validator: function (value) {
          // Reject passwords that look like bcrypt hashes
          return !/^\$2[ayb]\$[0-9]{2}\$[./0-9A-Za-z]{53}$/.test(value);
        },
        message: 'Password cannot be in bcrypt hash format',
      },
      {
        validator: function (value) {
          // Ensure password is at least 8 characters long
          return value.length >= 8;
        },
        message: 'Password must be at least 8 characters long',
      },
    ],
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  address: { type: String },
  phone: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      // Double-check the password format before hashing
      if (/^\$2[ayb]\$[0-9]{2}\$[./0-9A-Za-z]{53}$/.test(this.password)) {
        throw new Error('Password cannot be in bcrypt hash format');
      }
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);