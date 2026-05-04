import { motion } from 'framer-motion';

/**
 * SkeletonCard
 * ─────────────────────────────────────────────────────────────
 * A shimmer placeholder that matches the exact layout of a ProductCard.
 * Shown in a 6-card grid while the menu "loads" (900ms simulated delay).
 *
 * The shimmer effect is a white gradient that sweeps left-to-right
 * using Framer Motion's backgroundPosition animation. Each skeleton
 * element (image, tag, title, description, price, button) mirrors
 * the real card's dimensions and border-radius.
 *
 * @param {number} index - Used to stagger the fade-in entrance
 *
 * Usage:
 *   {loading && Array.from({ length: 6 }).map((_, i) => (
 *     <SkeletonCard key={i} index={i} />
 *   ))}
 */

/**
 * Shimmer — the animated sweep overlay.
 * Positioned absolute inside each skeleton block so it clips
 * to the parent's border-radius.
 */
function Shimmer() {
  return (
    <motion.div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
      }}
      // Animate the gradient position from left to right, looping
      animate={{ backgroundPosition: ['-200% 0', '200% 0'] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
    />
  );
}

export default function SkeletonCard({ index = 0 }) {
  return (
    <motion.div
      className="flex flex-col"
      style={{ borderRadius: 20 }}
      // Stagger entrance so cards don't all appear at once
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.06 }}
    >
      {/* Image area skeleton */}
      <div className="relative overflow-hidden flex-shrink-0"
        style={{ height: 172, borderRadius: '16px 16px 0 0', background: 'var(--parchment2)' }}>
        <Shimmer />
      </div>

      {/* Card body skeleton — mirrors ProductCard's p-3.5 layout */}
      <div className="p-3.5 flex flex-col gap-2.5"
        style={{ background: 'var(--card)', border: '1px solid var(--parchment3)', borderTop: 'none', borderRadius: '0 0 16px 16px' }}>

        {/* Category tag line */}
        <div className="relative overflow-hidden rounded-full h-2.5 w-14" style={{ background: 'var(--parchment2)' }}>
          <Shimmer />
        </div>

        {/* Product name */}
        <div className="relative overflow-hidden rounded-lg h-4 w-4/5" style={{ background: 'var(--parchment2)' }}>
          <Shimmer />
        </div>

        {/* Description line 1 */}
        <div className="relative overflow-hidden rounded-lg h-3 w-full" style={{ background: 'var(--parchment2)' }}>
          <Shimmer />
        </div>

        {/* Description line 2 (shorter) */}
        <div className="relative overflow-hidden rounded-lg h-3 w-3/4" style={{ background: 'var(--parchment2)' }}>
          <Shimmer />
        </div>

        {/* Price + Add button row */}
        <div className="flex items-center justify-between mt-1">
          <div className="relative overflow-hidden rounded-lg h-4 w-16" style={{ background: 'var(--parchment2)' }}>
            <Shimmer />
          </div>
          <div className="relative overflow-hidden rounded-full h-7 w-16" style={{ background: 'var(--parchment2)' }}>
            <Shimmer />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
