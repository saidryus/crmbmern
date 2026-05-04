/**
 * formatPrice
 * ─────────────────────────────────────────────────────────────
 * Formats a numeric amount as Philippine Peso currency.
 * Uses the browser's Intl API for locale-aware number formatting.
 *
 * @param {number} amount - Price in PHP (e.g. 120)
 * @returns {string}      - Formatted string (e.g. "₱120.00")
 *
 * Usage:
 *   formatPrice(120)    → "₱120.00"
 *   formatPrice(1250.5) → "₱1,250.50"
 */
export const formatPrice = (amount) =>
  `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
