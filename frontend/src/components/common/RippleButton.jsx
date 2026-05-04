import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../../hooks/useSound';

/**
 * RippleButton
 * ─────────────────────────────────────────────────────────────
 * A drop-in replacement for <button> that adds two micro-interactions:
 *
 *   1. Ripple effect — a white circle expands from the exact tap/click
 *      point using a dynamically injected <span> and a CSS keyframe
 *      animation (@keyframes crmb-ripple defined in index.css).
 *
 *   2. Click sound — plays a short synthesized tick via useSound().
 *
 *   3. Spring scale — Framer Motion whileTap scales to 0.95 and
 *      springs back to 1 on release.
 *
 * The ripple element is created imperatively (not via React state)
 * to avoid re-renders and keep the animation as fast as possible.
 * It's removed from the DOM after 520ms (animation duration).
 *
 * @param {ReactNode} children  - Button content
 * @param {Function}  onClick   - Click handler
 * @param {string}    className - Tailwind classes
 * @param {Object}    style     - Inline styles
 * @param {boolean}   disabled  - Disables click and sound
 *
 * Usage:
 *   <RippleButton onClick={handleCheckout} className="w-full py-4 rounded-xl" style={...}>
 *     Proceed to Checkout
 *   </RippleButton>
 */
export default function RippleButton({ children, onClick, className = '', style = {}, disabled = false, ...rest }) {
  const ref = useRef(null);
  const { playClick } = useSound();

  const handleClick = (e) => {
    if (disabled) return;

    // Play the synthesized click sound
    playClick();

    // Spawn a ripple element at the exact click coordinates
    const btn = ref.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left; // click X relative to button
      const y = e.clientY - rect.top;  // click Y relative to button

      const ripple = document.createElement('span');
      // Size the ripple to cover the entire button regardless of click position
      const size = Math.max(rect.width, rect.height) * 2;

      ripple.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;
        left:${x - size / 2}px;top:${y - size / 2}px;
        border-radius:50%;pointer-events:none;
        background:rgba(255,255,255,0.18);
        transform:scale(0);animation:crmb-ripple 0.5s ease-out forwards;
      `;

      btn.appendChild(ripple);
      // Clean up after animation completes
      setTimeout(() => ripple.remove(), 520);
    }

    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      // overflow:hidden clips the ripple to the button's border-radius
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
