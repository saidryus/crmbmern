/**
 * generateOrderId
 * ─────────────────────────────────────────────────────────────
 * Generates a unique, human-readable order ID for the receipt.
 * Format: CRMB-<BASE36_TIMESTAMP>-<4_CHAR_RANDOM>
 *
 * Example output: "CRMB-LX4K2A-F3R9"
 *
 * - The timestamp component (base-36) makes IDs roughly sortable
 *   and ensures uniqueness across sessions.
 * - The random suffix reduces collision probability further.
 * - All characters are uppercase for clean receipt display.
 *
 * @returns {string} Order ID string
 */
export const generateOrderId = () => {
  const prefix    = 'CRMB';
  const timestamp = Date.now().toString(36).toUpperCase();          // e.g. "LX4K2A"
  const random    = Math.random().toString(36).substring(2, 6).toUpperCase(); // e.g. "F3R9"
  return `${prefix}-${timestamp}-${random}`;
};
