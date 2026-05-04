import { useEffect, useRef, useCallback } from 'react';

/**
 * useIdleTimeout
 * ─────────────────────────────────────────────────────────────
 * Fires `onIdle` after `timeout` milliseconds of no user activity.
 * Used to automatically reset the kiosk back to the Splash screen
 * when a customer walks away without completing their order.
 *
 * The timer resets on any of these events:
 *   mousemove, mousedown, touchstart, keydown, scroll, click
 *
 * @param {Function} onIdle   - Callback fired when idle threshold is reached
 * @param {number}   timeout  - Idle duration in ms (default: 120,000 = 2 min)
 *
 * Usage:
 *   useIdleTimeout(() => navigate('/'), 2 * 60 * 1000);
 */
export function useIdleTimeout(onIdle, timeout = 120_000) {
  // Store the timer ID so we can clear it on reset
  const timer = useRef(null);

  // Keep a ref to onIdle so we don't need it in the dependency array
  // (avoids re-registering event listeners on every render)
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  // reset() clears the existing timer and starts a fresh one
  const reset = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onIdleRef.current(), timeout);
  }, [timeout]);

  useEffect(() => {
    // Listen to all interaction events — passive: true means we won't
    // block scrolling performance
    const events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    // Kick off the timer immediately on mount
    reset();

    // Cleanup: remove listeners and clear timer when component unmounts
    return () => {
      clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [reset]);
}
