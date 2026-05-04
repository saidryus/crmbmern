import { useRef, useCallback } from 'react';

/**
 * useLongPress
 * ─────────────────────────────────────────────────────────────
 * Returns event handler props to spread onto any DOM element.
 * Detects a sustained press (mouse or touch) and fires callbacks
 * at each stage of the interaction.
 *
 * Used on the CRMB wordmark in Splash.jsx to trigger the hidden
 * admin login flow — hold for 3 seconds to unlock staff access.
 *
 * @param {Object}   options
 * @param {Function} options.onComplete  - Fires when the full duration is held
 * @param {Function} options.onCancel    - Fires if the user releases early
 * @param {Function} options.onProgress  - Fires every ~50ms with a 0–1 progress value
 * @param {number}   options.duration    - Hold duration in ms (default: 3000)
 *
 * @returns {Object} Spread these props onto the target element:
 *   { onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd, onTouchCancel }
 *
 * Usage:
 *   const longPressProps = useLongPress({ onComplete: () => navigate('/admin-login') });
 *   <div {...longPressProps}>Hold me</div>
 */
export function useLongPress({ onComplete, onCancel, onProgress, duration = 3000 }) {
  // setTimeout ID for the completion trigger
  const timer = useRef(null);

  // setInterval ID for the progress ticker
  const interval = useRef(null);

  // Timestamp when the press started (used to calculate progress)
  const startTime = useRef(null);

  // Guards against firing cancel/complete after the press has already ended
  const active = useRef(false);

  /**
   * start — called on mousedown / touchstart
   * Stops the parent onClick from firing (so a tap doesn't navigate away),
   * then starts the progress interval and the completion timer.
   */
  const start = useCallback((e) => {
    e.stopPropagation(); // prevent the Splash screen's onClick from triggering
    active.current = true;
    startTime.current = Date.now();

    // Tick every 50ms and report progress as a 0–1 fraction
    interval.current = setInterval(() => {
      if (!active.current) return;
      const elapsed = Date.now() - startTime.current;
      onProgress?.(Math.min(elapsed / duration, 1));
    }, 50);

    // Fire onComplete after the full duration
    timer.current = setTimeout(() => {
      if (!active.current) return;
      clearInterval(interval.current);
      onProgress?.(1); // ensure the ring visually completes
      onComplete?.();
    }, duration);
  }, [onComplete, onCancel, onProgress, duration]);

  /**
   * cancel — called on mouseup / mouseleave / touchend / touchcancel
   * Clears both timers and resets progress to 0.
   */
  const cancel = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    clearTimeout(timer.current);
    clearInterval(interval.current);
    onProgress?.(0); // reset the circular progress ring
    onCancel?.();
  }, [onCancel, onProgress]);

  return {
    onMouseDown:   start,
    onMouseUp:     cancel,
    onMouseLeave:  cancel,                                    // cancel if cursor drifts off
    onTouchStart:  (e) => { e.preventDefault(); start(e); }, // preventDefault stops scroll
    onTouchEnd:    cancel,
    onTouchCancel: cancel,
  };
}
