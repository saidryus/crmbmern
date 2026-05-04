import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ToastContext
 * ─────────────────────────────────────────────────────────────
 * Provides a global notification system for the kiosk app.
 * A "toast" is a small pop-up message that appears briefly and
 * disappears automatically — used here to confirm add-to-cart actions.
 *
 * WHY a context?
 *   Any component deep in the tree (e.g. a product card inside the menu
 *   grid) needs to trigger a toast without passing callbacks down through
 *   every parent. Context solves this — any component can call addToast()
 *   directly without prop drilling.
 *
 * HOW it works:
 *   1. ToastProvider holds an array of active toasts in state
 *   2. addToast() appends a new toast with a unique id
 *   3. A setTimeout auto-removes it after `duration` ms (default 2800ms)
 *   4. The ToastStack component renders all active toasts as animated pills
 *   5. AnimatePresence handles the enter/exit animations
 *
 * Max 3 toasts at once — older ones are sliced off to prevent stacking.
 *
 * ─────────────────────────────────────────────────────────────
 * HOOK: useToast()
 * ─────────────────────────────────────────────────────────────
 * WHY it exists:
 *   Gives any component access to addToast() without needing to
 *   import the context object directly. The hook also provides a
 *   clear error message if you forget to wrap your app in ToastProvider.
 *
 * WHAT it returns:
 *   { addToast } — call this to show a notification
 *
 * addToast() accepts:
 *   {
 *     title:    string   — main message (e.g. "Chocolate Croissant added")
 *     subtitle: string   — secondary line (e.g. "₱120.00")
 *     image:    string   — product image URL (shown as thumbnail)
 *     duration: number   — how long to show in ms (default: 2800)
 *   }
 *
 * WHERE it's used:
 *   - Menu.jsx        → when user taps "Add" on a product card
 *   - ProductDetails  → when user taps "Add to Order"
 *
 * EXAMPLE:
 *   const { addToast } = useToast();
 *   addToast({ title: 'Croissant added', subtitle: '₱120.00', image: product.image });
 */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  // toasts — array of active notification objects, each with a unique id
  const [toasts, setToasts] = useState([]);

  /**
   * addToast — adds a new toast to the stack.
   *
   * useCallback is used here so the function reference stays stable
   * across re-renders. This matters because components that receive
   * addToast as a dependency (e.g. in useEffect) won't re-run
   * unnecessarily when the parent re-renders.
   *
   * The slice(-2) keeps only the last 2 existing toasts before adding
   * the new one, capping the visible stack at 3 total.
   */
  const addToast = useCallback((toast) => {
    // Generate a unique id using timestamp + random to avoid key collisions
    // even if two toasts are added in the same millisecond
    const id = Date.now() + Math.random();

    setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);

    // Auto-remove after duration (default 2800ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration ?? 2800);
  }, []); // empty deps — this function never needs to change

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/*
        ToastStack is rendered inside the Provider so it has access
        to the toasts state. It renders outside the normal page flow
        using fixed positioning so it floats above all content.
      */}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  );
}

/**
 * useToast
 * ─────────────────────────────────────────────────────────────
 * Custom hook to consume the ToastContext.
 *
 * WHY a custom hook instead of useContext(ToastContext) directly?
 *   1. Cleaner import — components just write `useToast()` instead of
 *      `useContext(ToastContext)` which requires importing the context object too
 *   2. Built-in error guard — throws a descriptive error if you accidentally
 *      use it outside of ToastProvider, making bugs easier to find
 *   3. Consistent pattern — matches how all other contexts in this app work
 *
 * RULE: This hook must be called inside a component that is a descendant
 * of <ToastProvider>. In this app, ToastProvider wraps the entire app
 * in App.jsx, so it's always available.
 */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};

/* ── Toast Stack UI ───────────────────────────────────────────
 * This is a pure presentational component — it just renders
 * whatever toasts are in the array. It lives here (co-located
 * with the context) because it's tightly coupled to the toast
 * data shape and doesn't need to exist anywhere else.
 * ─────────────────────────────────────────────────────────────
 */
function ToastStack({ toasts }) {
  return (
    /*
     * Fixed position, centered horizontally, above the sticky checkout bar.
     * pointer-events: none on the container so it doesn't block taps on
     * the page behind it. Individual toasts re-enable pointer events so
     * they can be interacted with if needed in the future.
     */
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none"
      style={{ width: 'min(360px, 90vw)' }}
    >
      {/*
        AnimatePresence tracks which toasts are entering and leaving.
        When a toast is removed from the array, AnimatePresence lets it
        play its exit animation before unmounting from the DOM.
      */}
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl pointer-events-auto"
            style={{
              background: 'var(--espresso)',
              border: '1px solid rgba(200,145,58,0.2)',
              boxShadow: '0 8px 32px rgba(30,20,10,0.35)',
            }}
            // Enter: slide up from below and scale in
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            // Exit: fade out and scale down slightly
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            {/* Optional product thumbnail — shown when image is provided */}
            {t.image && (
              <img
                src={t.image}
                alt={t.name}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                style={{ border: '1px solid rgba(200,145,58,0.2)' }}
              />
            )}

            {/* Title + subtitle text block */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate"
                style={{ color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}>
                {t.title}
              </p>
              {t.subtitle && (
                <p className="text-xs font-light truncate mt-0.5"
                  style={{ color: 'rgba(245,239,230,0.55)', fontFamily: 'DM Sans, sans-serif' }}>
                  {t.subtitle}
                </p>
              )}
            </div>

            {/* Green checkmark icon — confirms the action was successful */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(122,144,128,0.25)' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l2.5 2.5 5.5-5" stroke="var(--sage)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
