/**
 * protect
 * ─────────────────────────────────────────────────────────────
 * Simple middleware that guards admin-only routes.
 * Checks for the header: X-Admin-Logged-In: true
 * This is set by the frontend after a successful login.
 *
 * On success  → calls next()
 * On failure  → responds 401 Unauthorized
 */
const protect = (req, res, next) => {
  if (req.headers['x-admin-logged-in'] === 'true') {
    return next();
  }
  return res.status(401).json({ message: 'Not authorized' });
};

module.exports = { protect };
