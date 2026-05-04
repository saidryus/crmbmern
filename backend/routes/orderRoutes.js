const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ── POST /api/orders ─────────────────────────────────────────
// Public — called by Checkout.jsx when the customer confirms.
// Body: { orderId, items: [{ name, price, quantity, image }], total }
router.post('/', async (req, res) => {
  try {
    const { orderId, items, total } = req.body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'orderId and items are required' });
    }

    const order = await Order.create({ orderId, items, total });
    res.status(201).json(order);
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate orderId — extremely unlikely but handle gracefully
      return res.status(409).json({ message: 'Duplicate order ID, please retry' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/orders ──────────────────────────────────────────
// Protected (admin only) — returns all orders, newest first.
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/orders/:id ──────────────────────────────────────
// Protected (admin only) — single order by MongoDB _id.
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/orders/:id/status ─────────────────────────────
// Protected (admin only) — update order status.
// Body: { status: 'received' | 'preparing' | 'baking' | 'ready' | 'completed' }
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
