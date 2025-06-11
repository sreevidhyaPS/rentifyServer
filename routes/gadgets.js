const express = require('express');
const router = express.Router();
const Gadget = require('../models/Gadget');
const { adminAuth, auth } = require('../middleware/auth');

router.get('/all', async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search ? { category: new RegExp(search, 'i') } : {};
    const gadgets = await Gadget.find(query);
    res.json(gadgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/sample', async (req, res) => {
  try {
    const gadgets = await Gadget.find().limit(4); // Sample of 4 gadgets
    res.json(gadgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const gadget = await Gadget.findById(req.params.id);
    if (!gadget) {
      return res.status(404).json({ message: 'Gadget not found' });
    }
    res.json(gadget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/add', adminAuth, async (req, res) => {
  try {
    const { name, image, price, description, category } = req.body;
    const gadget = new Gadget({ name, image, price, description, category });
    await gadget.save();
    res.status(200).json(gadget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/update/:id', adminAuth, async (req, res) => {
  try {
    const { name, image, price, description, category } = req.body;
    const gadget = await Gadget.findByIdAndUpdate(
      req.params.id,
      { name, image, price, description, category },
      { new: true }
    );
    if (!gadget) {
      return res.status(404).json({ message: 'Gadget not found' });
    }
    res.status(200).json(gadget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/delete/:id', adminAuth, async (req, res) => {
  try {
    const gadget = await Gadget.findByIdAndDelete(req.params.id);
    if (!gadget) {
      return res.status(404).json({ message: 'Gadget not found' });
    }
    res.status(200).json({ message: 'Gadget deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;