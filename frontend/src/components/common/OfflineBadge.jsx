import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useNetwork } from '../../hooks/useNetwork';

/**
 * OfflineBadge
 * ─────────────────────────────────────────────────────────────
 * A floating pill that appears at the top of the screen whenever
 * the device loses its internet connection.
 *
 * Mounted once at the App root level so it's always visible
 * regardless of which page the user is on.
 *
 * Behavior:
 *   - Slides down from above and scales in when offline
 *   - Slides back up and fades out when connection is restored
 *   - Uses AnimatePresence so the exit animation plays before unmount
 *
 * The badge is purely informational — the app continues to work
 * from the PWA cache when offline (menu, cart, checkout all function).
 * Only the jazz radio stream and product images from Unsplash require
 * an active connection.
 */
export default function OfflineBadge() {
  const online = useNetwork();

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(196,121,106,0.95)', // dusty rose — matches var(--rose)
            color: '#fff',
            fontFamily: 'DM Sans, sans-serif',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(196,121,106,0.4)',
          }}
          initial={{ opacity: 0, y: -12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,   scale: 1   }}
          exit={{    opacity: 0, y: -12, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          <WifiOff size={12} />
          Offline Mode — Menu available from cache
        </motion.div>
      )}
    </AnimatePresence>
  );
}
