import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FlyContext
 * ─────────────────────────────────────────────────────────────
 * Provides the "fly to cart" micro-interaction — when a user adds
 * an item, a thumbnail of the product image launches from the card
 * and flies toward the cart button, shrinking and fading as it arrives.
 *
 * WHY a context?
 *   The fly animation needs two things from two different parts of the tree:
 *   1. The ORIGIN position — from the product card (deep in Menu.jsx)
 *   2. The TARGET position — the cart button (in the header)
 *   These components have no direct relationship. Context lets them
 *   share a cartRef and a flyToCart function without prop drilling.
 *
 * WHY useRef for cartRef?
 *   We need the cart button's DOM position (getBoundingClientRect) at
 *   the moment of the animation. A ref gives us direct access to the
 *   DOM node without causing re-renders. CartButton attaches to this
 *   ref via a callback ref pattern.
 *
 * WHY useCallback for flyToCart?
 *   flyToCart is passed via context to every product card. Without
 *   useCallback, a new function would be created on every render,
 *   causing unnecessary re-renders in all consumers.
 *
 * HOW the animation works:
 *   1. CartButton registers its DOM node via cartRef
 *   2. ProductCard / Menu calls flyToCart(imgSrc, originRect)
 *   3. FlyProvider calculates the vector from origin → cart button
 *   4. A fixed-position <motion.img> animates along that vector
 *   5. The image is removed from state after 700ms
 *
 * The animation layer is rendered in a fixed portal (z-index 9999)
 * so it floats above all other UI including modals and headers.
 *
 * ─────────────────────────────────────────────────────────────
 * HOOK: useFly()
 * ─────────────────────────────────────────────────────────────
 * WHY it exists:
 *   Gives product cards and the cart button access to the shared
 *   flyToCart function and cartRef without importing the context directly.
 *
 * WHAT it returns:
 *   flyToCart(imgSrc, originRect) — triggers the fly animation
 *     imgSrc:     string   — URL of the product image to animate
 *     originRect: DOMRect  — getBoundingClientRect() of the source element
 *   cartRef — React ref to attach to the cart button DOM node
 *
 * WHERE it's used:
 *   - Menu.jsx        → calls flyToCart when "Add" is tapped on a card
 *   - ProductDetails  → calls flyToCart when "Add to Order" is tapped
 *   - CartButton.jsx  → attaches cartRef to its DOM node
 *
 * EXAMPLE (in a product card):
 *   const { flyToCart } = useFly();
 *   const imgRef = useRef(null);
 *   flyToCart(product.image, imgRef.current.getBoundingClientRect());
 *
 * EXAMPLE (in CartButton):
 *   const { cartRef } = useFly();
 *   <button ref={cartRef}>Cart</button>
 */

const FlyCtx = createContext(null);

export function FlyProvider({ children }) {
  // Array of active fly animations — each has a unique id, src, from, and to coords
  const [flies, setFlies] = useState([]);

  // Ref that CartButton attaches to its DOM node so we can read its position
  const cartRef = useRef(null);

  /**
   * flyToCart — triggers a fly animation.
   * @param {string} imgSrc      - Product image URL
   * @param {DOMRect} originRect - getBoundingClientRect() of the source element
   */
  const flyToCart = useCallback((imgSrc, originRect) => {
    if (!cartRef.current) return; // cart button not mounted yet

    const cartRect = cartRef.current.getBoundingClientRect();

    const id = Date.now() + Math.random(); // unique key for AnimatePresence

    const fly = {
      id,
      imgSrc,
      // Center of the source image
      from: { x: originRect.left + originRect.width  / 2, y: originRect.top  + originRect.height / 2 },
      // Center of the cart button
      to:   { x: cartRect.left  + cartRect.width  / 2, y: cartRect.top  + cartRect.height / 2 },
    };

    setFlies((prev) => [...prev, fly]);

    // Remove from state after animation completes (700ms)
    setTimeout(() => setFlies((prev) => prev.filter((f) => f.id !== id)), 700);
  }, []);

  return (
    <FlyCtx.Provider value={{ flyToCart, cartRef }}>
      {children}

      {/* Fixed portal layer — sits above everything else */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
        <AnimatePresence>
          {flies.map((fly) => (
            <motion.img
              key={fly.id}
              src={fly.imgSrc}
              alt=""
              style={{
                position: 'fixed',
                width: 44,
                height: 44,
                borderRadius: 10,
                objectFit: 'cover',
                // Start at the center of the source element
                left: fly.from.x - 22,
                top:  fly.from.y - 22,
                border: '2px solid var(--amber)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}
              // Animate: translate to cart position, shrink, fade out
              initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              animate={{
                x: fly.to.x - fly.from.x, // delta X to cart center
                y: fly.to.y - fly.from.y, // delta Y to cart center
                scale: 0.3,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            />
          ))}
        </AnimatePresence>
      </div>
    </FlyCtx.Provider>
  );
}

/**
 * useFly
 * ─────────────────────────────────────────────────────────────
 * Custom hook to consume the FlyContext.
 *
 * WHY a custom hook?
 *   Same pattern as useCart, useToast, useAudio — cleaner imports
 *   and a descriptive error if used outside FlyProvider.
 *
 * NOTE on the cartRef pattern:
 *   CartButton uses a "callback ref" — a function that sets both
 *   its own local ref AND cartRef.current at the same time:
 *
 *   const setRef = (node) => {
 *     btnRef.current  = node;   // local ref for animations
 *     cartRef.current = node;   // shared ref for fly target position
 *   };
 *   <button ref={setRef}>...</button>
 *
 *   This is necessary because React only allows one ref per element,
 *   but we need two different parts of the code to reference the same node.
 *
 * RULE: Must be used inside a component that is a descendant of
 * <FlyProvider>. FlyProvider wraps the whole app in App.jsx.
 */
export const useFly = () => {
  const ctx = useContext(FlyCtx);
  if (!ctx) throw new Error('useFly must be inside FlyProvider');
  return ctx;
};
