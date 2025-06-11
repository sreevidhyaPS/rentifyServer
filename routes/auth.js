const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email); // Safe debug

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Prevent hash-like passwords
    if (password.match(/^\$2[ayb]\$[0-9]{2}\$[./0-9A-Za-z]{53}$/)) {
      console.log('Invalid password format for email:', email);
      return res.status(400).json({ message: 'Invalid password format' });
    }

    const user = await User.findOne({ email });
    console.log('MongoDB query for email:', email, 'User found:', user ? 'Yes' : 'No'); // Safe debug
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Found user:', { email: user.email, username: user.username, role: user.role }); // Safe debug

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Login successful for email:', email);
    res.json({ token, user: { email: user.email, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Login error:', error.message); // Safe error log
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, address, phone } = req.body;
    console.log('Register attempt for email:', email); // Safe debug

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    console.log('MongoDB query for email:', email, 'User found:', existingUser ? 'Yes' : 'No'); // Safe debug
    if (existingUser) {
      console.log('User already exists for email:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, email, password, role, address, phone });
    await user.save();
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Registration successful for email:', email);
    res.status(201).json({ token, user: { email: user.email, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Register error:', error.message); // Safe error log
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;