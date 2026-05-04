import { useState, useEffect } from 'react';

/**
 * useNetwork
 * ─────────────────────────────────────────────────────────────
 * Returns a live boolean indicating whether the browser is online.
 * Initialises from navigator.onLine and updates in real-time via
 * the window 'online' / 'offline' events.
 *
 * Used by:
 *   - OfflineBadge  → shows a floating "Offline Mode" pill
 *   - Checkout page → warns the user before confirming an order
 *
 * @returns {boolean} true = connected, false = no network
 *
 * Usage:
 *   const online = useNetwork();
 *   if (!online) showWarning();
 */
export function useNetwork() {
  // Seed state from the browser's current connectivity status
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);

    window.addEventListener('online',  on);
    window.addEventListener('offline', off);

    // Remove listeners when the component using this hook unmounts
    return () => {
      window.removeEventListener('online',  on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return online;
}
