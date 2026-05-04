import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useFly } from '../../context/FlyContext';
import { useSound } from '../../hooks/useSound';

/**
 * CartButton
 * ─────────────────────────────────────────────────────────────
 * The persistent "Order" button shown in every page header.
 * Displays the current item count as an animated badge and
 * plays a bump animation whenever a new item is added.
 *
 * Responsibilities:
 *   1. Navigate to /cart on click (with nav sound)
 *   2. Register its DOM node with FlyContext so the fly-to-cart
 *      animation knows where to aim
 *   3. Bump (spring scale) when itemCount increases
 *   4. Wobble the bag icon on each add
 *   5. Show/hide the item count badge with a spring pop
 *
 * The dual-ref pattern (btnRef + cartRef) is needed because
 * React's ref callback and FlyContext's cartRef both need to
 * point to the same DOM node.
 */
export default function CartButton() {
  const { itemCount } = useCart();
  const { cartRef }   = useFly();    // FlyContext needs this node to aim the fly animation
  const { playNav }   = useSound();
  const navigate      = useNavigate();
  const controls      = useAnimation(); // imperative animation controls for the bump
  const prevCount     = useRef(itemCount);
  const btnRef        = useRef(null);

  /**
   * setRef — callback ref that syncs both btnRef and cartRef
   * to the same underlying DOM button element.
   */
  const setRef = (node) => {
    btnRef.current  = node;
    cartRef.current = node; // FlyContext reads this to get the cart button's position
  };

  /**
   * Watch itemCount — when it increases, trigger the bump animation
   * and bag icon wobble. prevCount tracks the previous value so we
   * only animate on increases (not on item removal).
   */
  useEffect(() => {
    if (itemCount > prevCount.current) {
      controls.start({
        scale: [1, 1.2, 0.92, 1.06, 1], // overshoot spring feel
        transition: { duration: 0.42, ease: 'easeOut' },
      });
    }
    prevCount.current = itemCount;
  }, [itemCount, controls]);

  return (
    <motion.button
      ref={setRef}
      onClick={() => { playNav(); navigate('/cart'); }}
      className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-shrink-0"
      style={{ background: 'var(--espresso)', color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}
      animate={controls}  // driven by the bump animation above
      whileTap={{ scale: 0.9 }}
    >
      {/* Bag icon — wobbles on each add via key-based re-animation */}
      <motion.div
        key={itemCount}
        animate={itemCount > prevCount.current ? { rotate: [0, -14, 10, -5, 0] } : {}}
        transition={{ duration: 0.38 }}
      >
        <ShoppingBag size={14} />
      </motion.div>

      <span className="hidden sm:inline font-medium">Order</span>

      {/* Item count badge — springs in/out with AnimatePresence */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key={itemCount} // re-mounts on every count change to replay the pop
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center font-bold"
            style={{ background: 'var(--amber)', color: 'var(--espresso)', fontSize: 10, fontFamily: 'DM Sans, sans-serif' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.35, 1], opacity: 1 }} // overshoot pop
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 16 }}
          >
            {itemCount > 9 ? '9+' : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
