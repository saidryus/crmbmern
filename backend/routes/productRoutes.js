const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ── GET /api/products ────────────────────────────────────────
// Public — returns all products (available and hidden).
// The frontend filters by available === true for the customer menu.
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: 1 });
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/products/:id ────────────────────────────────────
// Public — single product by MongoDB _id.
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/products ───────────────────────────────────────
// Protected (admin only) — create a new product.
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, price, category, image, available, bestSeller, tags } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      available: available ?? true,
      bestSeller: bestSeller ?? false,
      tags: tags ?? [],
    });

    res.status(201).json(product);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT /api/products/:id ────────────────────────────────────
// Protected (admin only) — update an existing product.
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE /api/products/:id ─────────────────────────────────
// Protected (admin only) — remove a product.
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
