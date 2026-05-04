const express = require('express');
const Admin = require('../models/Admin');

const router = express.Router();

// ── POST /api/auth/login ─────────────────────────────────────
// Body: { username, password }
// Returns: { success: true, username } on valid credentials
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await admin.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ success: true, username: admin.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
