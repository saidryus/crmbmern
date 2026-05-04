require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
// In production, FRONTEND_URL should be set to your Vercel URL.
// Multiple origins are supported (local dev + production).
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render shell)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Connect to MongoDB then start server ─────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`CRMB backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
