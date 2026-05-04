import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Printer, WifiOff } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNetwork } from "../hooks/useNetwork";
import { useSound } from "../hooks/useSound";
import { formatPrice } from "../utils/formatPrice";
import { generateOrderId } from "../utils/generateOrderId";
import { createOrder } from "../api/orders";

const STEPS = [
  { id: "received",  label: "Received",  icon: "📋" },
  { id: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { id: "baking",    label: "Baking",    icon: "🔥" },
  { id: "ready",     label: "Ready!",    icon: "✅" },
];

function QueueProgress({ step }) {
  const idx = STEPS.findIndex((s) => s.id === step);
  return (
    <div className="mb-6">
      {/* Step dots with connecting lines */}
      <div className="relative flex items-start justify-between mb-4">
        {/* Background track line */}
        <div className="absolute top-4 left-4 right-4 h-0.5" style={{ background: "var(--parchment3)" }} />
        {/* Animated fill line */}
        <motion.div
          className="absolute top-4 left-4 h-0.5 origin-left"
          style={{ background: "linear-gradient(90deg, var(--amber), var(--amber-light))", right: 16 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: idx / (STEPS.length - 1) }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-2 relative z-10">
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: i <= idx ? "var(--espresso)" : "var(--parchment2)",
                border: i === idx ? "2px solid var(--amber)" : i < idx ? "2px solid var(--espresso)" : "2px solid var(--parchment3)",
                fontSize: 14,
              }}
              initial={false}
              animate={i === idx
                ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0px rgba(200,145,58,0)", "0 0 16px rgba(200,145,58,0.5)", "0 0 8px rgba(200,145,58,0.25)"] }
                : i < idx
                  ? { scale: 1, boxShadow: "none" }
                  : { scale: 1 }
              }
              transition={{ repeat: i === idx ? Infinity : 0, duration: 1.6 }}
            >
              {i < idx ? (
                <motion.svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                  initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}>
                  <path d="M2.5 7l3 3 6-6" stroke="var(--amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              ) : (
                <motion.span
                  initial={i === idx ? { scale: 0 } : { scale: 1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}>
                  {s.icon}
                </motion.span>
              )}
            </motion.div>
            <motion.span
              className="text-center leading-tight"
              style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10 }}
              animate={{ color: i <= idx ? "var(--ink)" : "var(--ink-muted)", fontWeight: i === idx ? 600 : 300 }}>
              {s.label}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--parchment2)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, var(--amber), var(--amber-light))" }}
          initial={{ width: "0%" }}
          animate={{ width: (((idx + 1) / STEPS.length) * 100) + "%" }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  );
}

function LoadingScreen({ queueStep, countdown }) {
  const s = STEPS.find((s) => s.id === queueStep);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-8"
      style={{ background: "var(--parchment)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={queueStep}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--parchment2)", border: "1px solid var(--parchment3)", fontSize: 32 }}
              initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 15 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              {s ? s.icon : "📋"}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={queueStep + "label"}
              className="font-serif italic text-xl mb-1"
              style={{ color: "var(--ink)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {s ? s.label : "Processing"}
            </motion.p>
          </AnimatePresence>
          {countdown > 0 && (
            <motion.p
              className="text-sm font-light"
              style={{ color: "var(--ink-muted)", fontFamily: "DM Sans, sans-serif" }}
              key={countdown}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Ready in ~{countdown} min
            </motion.p>
          )}
        </div>
        <QueueProgress step={queueStep} />
      </div>
    </div>
  );
}

function SuccessScreen({ orderId, orderTotal, cartSnapshot, onOrderMore, onDone }) {
  const { playNav, playClick } = useSound();
  return (
    <div className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "var(--parchment)" }}>
      <div className="w-full max-w-sm">
        <motion.div
          id="print-receipt"
          className="rounded-3xl overflow-hidden mb-5"
          style={{ background: "var(--card)", border: "1px solid var(--parchment3)", boxShadow: "0 8px 48px rgba(30,20,10,0.1)" }}
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        >
          <div className="h-1" style={{ background: "linear-gradient(90deg, var(--amber), var(--amber-light), var(--amber))" }} />
          <div className="px-7 pt-7 pb-6">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "var(--sage-pale)", border: "1px solid rgba(122,144,128,0.2)" }}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 14 }}
            >
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M5 13l5.5 5.5L21 7" stroke="var(--sage)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>

            <motion.div className="text-center mb-5"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <h2 className="font-serif font-semibold text-2xl mb-1" style={{ color: "var(--ink)" }}>Order Confirmed</h2>
              <p className="text-sm font-light" style={{ color: "var(--ink-muted)", fontFamily: "DM Sans, sans-serif" }}>
                Your order is being prepared with care
              </p>
            </motion.div>

            <div className="border-t border-dashed mb-4" style={{ borderColor: "var(--parchment3)" }} />

            {cartSnapshot && cartSnapshot.length > 0 && (
              <motion.div className="space-y-2 mb-4"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.5 } } }}>
                {cartSnapshot.map((item) => (
                  <motion.div key={item.id}
                    className="flex justify-between items-center"
                    variants={{
                      hidden: { opacity: 0, x: -12, height: 0 },
                      visible: { opacity: 1, x: 0, height: 'auto' },
                    }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}>
                    <span className="text-xs font-light" style={{ color: "var(--ink-soft)", fontFamily: "DM Sans, sans-serif" }}>
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-xs font-medium" style={{ color: "var(--ink)", fontFamily: "DM Sans, sans-serif" }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <div className="border-t border-dashed mb-4" style={{ borderColor: "var(--parchment3)" }} />

            <motion.div className="space-y-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              <div className="flex justify-between items-center">
                <span className="text-xs tracking-[0.18em] uppercase font-medium"
                  style={{ color: "var(--ink-muted)", fontFamily: "DM Sans, sans-serif" }}>Order ID</span>
                <span className="font-mono-custom text-sm font-medium" style={{ color: "var(--ink)" }}>{orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs tracking-[0.18em] uppercase font-medium"
                  style={{ color: "var(--ink-muted)", fontFamily: "DM Sans, sans-serif" }}>Total Paid</span>
                <span className="font-serif font-semibold text-xl" style={{ color: "var(--ink)" }}>{formatPrice(orderTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs tracking-[0.18em] uppercase font-medium"
                  style={{ color: "var(--ink-muted)", fontFamily: "DM Sans, sans-serif" }}>Status</span>
                <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: "var(--sage-pale)", color: "var(--sage)", fontFamily: "DM Sans, sans-serif" }}>
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ background: "var(--sage)" }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  Ready for pickup
                </span>
              </div>
            </motion.div>

            <div className="border-t border-dashed mt-5 mb-4" style={{ borderColor: "var(--parchment3)" }} />
            <p className="text-center text-xs font-light italic"
              style={{ color: "var(--ink-muted)", fontFamily: "Cormorant Garamond, Georgia, serif" }}>
              Thank you for choosing CRMB
            </p>
          </div>
        </motion.div>

        <motion.div className="flex gap-3 mb-3"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
          <motion.button
            onClick={() => { playNav(); onOrderMore(); }}
            className="flex-1 py-4 rounded-xl text-sm font-medium"
            style={{ background: "var(--espresso)", color: "var(--cream)", fontFamily: "DM Sans, sans-serif" }}
            whileTap={{ scale: 0.97 }}>
            Order More
          </motion.button>
          <motion.button onClick={() => { playNav(); onDone(); }}
            className="flex-1 py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: "var(--parchment2)", color: "var(--ink)", border: "1px solid var(--parchment3)", fontFamily: "DM Sans, sans-serif" }}
            whileTap={{ scale: 0.97 }}>
            <RotateCcw size={13} />
            New Order
          </motion.button>
        </motion.div>

        <motion.button
          onClick={() => { playClick(); window.print(); }}
          className="w-full py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2"
          style={{ background: "transparent", color: "var(--ink-muted)", border: "1px solid var(--parchment3)", fontFamily: "DM Sans, sans-serif" }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
          <Printer size={13} />
          Print Receipt
        </motion.button>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const online = useNetwork();
  const { playSuccess, playNav, playClick } = useSound();
  const [status, setStatus] = useState("summary");
  const [orderId, setOrderId] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [cartSnapshot, setCartSnapshot] = useState([]);
  const [queueStep, setQueueStep] = useState("received");
  const [countdown, setCountdown] = useState(0);

  const handleConfirm = async () => {
    const snapshot = cart.map((i) => ({ ...i }));
    setCartSnapshot(snapshot);
    setOrderTotal(total);
    setStatus("loading");

    // Animate through the queue steps for UX
    const steps = ["received", "preparing", "baking", "ready"];
    const delays = [600, 1200, 1200, 800];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, delays[i]));
      setQueueStep(steps[i]);
      setCountdown(Math.max(0, steps.length - 2 - i));
    }
    await new Promise((r) => setTimeout(r, 600));

    const newId = generateOrderId();
    setOrderId(newId);

    // Save order to MongoDB via the REST API
    try {
      await createOrder({
        orderId: newId,
        items: snapshot.map((item) => ({
          productId: item._id,   // MongoDB _id from ProductsContext
          name:      item.name,
          price:     item.price,
          quantity:  item.quantity,
          image:     item.image,
        })),
        total,
      });
    } catch (err) {
      // Non-fatal — the customer still gets their receipt even if the
      // network call fails (e.g. offline). The order is simply not
      // persisted to the DB in that case.
      console.warn("Order save failed:", err.message);
    }

    playSuccess();
    setStatus("success");
    clearCart();
  };

  if (status === "loading") {
    return <LoadingScreen queueStep={queueStep} countdown={countdown} />;
  }

  if (status === "success") {
    return (
      <SuccessScreen
        orderId={orderId}
        orderTotal={orderTotal}
        cartSnapshot={cartSnapshot}
        onOrderMore={() => navigate("/menu")}
        onDone={() => navigate("/")}
      />
    );
  }

  return (
    <motion.div
      className="min-h-screen pb-36"
      style={{ background: "var(--parchment)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header
        className="sticky top-0 z-40 px-5 py-3.5 flex items-center gap-3"
        style={{ background: "rgba(245,239,230,0.94)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--parchment3)" }}
      >
        <motion.button
          onClick={() => { playNav(); navigate("/cart"); }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium"
          style={{ background: "var(--parchment2)", color: "var(--ink)", border: "1px solid var(--parchment3)", fontFamily: "DM Sans, sans-serif" }}
          whileTap={{ scale: 0.93 }}
        >
          <ArrowLeft size={14} />
          Cart
        </motion.button>
        <h1 className="font-serif font-semibold text-lg italic" style={{ color: "var(--ink)" }}>Checkout</h1>
        {!online && (
          <motion.div
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
            style={{ background: "var(--rose-pale)", color: "var(--rose)", border: "1px solid rgba(196,121,106,0.25)", fontFamily: "DM Sans, sans-serif" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <WifiOff size={11} />
            Offline
          </motion.div>
        )}
      </header>

      <div className="max-w-xl mx-auto px-5 pt-5">
        <p className="text-xs tracking-[0.2em] uppercase font-medium mb-4"
          style={{ color: "var(--ink-muted)", fontFamily: "DM Sans, sans-serif" }}>
          Order Summary
        </p>

        <div className="rounded-2xl overflow-hidden mb-4"
          style={{ background: "var(--card)", border: "1px solid var(--parchment3)", boxShadow: "0 1px 2px rgba(30,20,10,0.04), 0 3px 10px rgba(30,20,10,0.05)" }}>
          {cart.map((item, i) => (
            <motion.div
              key={item.id}
              className="flex items-center gap-3.5 px-4 py-3.5"
              style={{ borderBottom: i < cart.length - 1 ? "1px solid var(--parchment2)" : "none" }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <img src={item.image} alt={item.name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                style={{ border: "1px solid var(--parchment3)" }} />
              <div className="flex-1 min-w-0">
                <p className="font-serif font-semibold text-sm truncate" style={{ color: "var(--ink)" }}>{item.name}</p>
                <p className="text-xs font-light mt-0.5" style={{ color: "var(--ink-muted)", fontFamily: "DM Sans, sans-serif" }}>
                  {formatPrice(item.price)} x {item.quantity}
                </p>
              </div>
              <p className="font-serif font-semibold text-sm flex-shrink-0" style={{ color: "var(--ink)" }}>
                {formatPrice(item.price * item.quantity)}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl p-5"
          style={{ background: "var(--card)", border: "1px solid var(--parchment3)", boxShadow: "0 1px 2px rgba(30,20,10,0.04), 0 3px 10px rgba(30,20,10,0.05)" }}>
          <div className="space-y-2.5 mb-4">
            <div className="flex justify-between text-sm font-light"
              style={{ color: "var(--ink-soft)", fontFamily: "DM Sans, sans-serif" }}>
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm font-light"
              style={{ color: "var(--ink-soft)", fontFamily: "DM Sans, sans-serif" }}>
              <span>Service charge</span>
              <span className="italic text-xs" style={{ color: "var(--ink-muted)" }}>Included</span>
            </div>
          </div>
          <div className="border-t border-dashed mb-4" style={{ borderColor: "var(--parchment3)" }} />
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium" style={{ color: "var(--ink)", fontFamily: "DM Sans, sans-serif" }}>Total</span>
            <span className="font-serif font-semibold text-2xl" style={{ color: "var(--ink)" }}>{formatPrice(total)}</span>
          </div>
        </div>

        {!online && (
          <motion.div
            className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
            style={{ background: "var(--rose-pale)", border: "1px solid rgba(196,121,106,0.25)", color: "var(--rose)", fontFamily: "DM Sans, sans-serif" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <WifiOff size={14} />
            <span className="font-medium">You are offline. Order will be queued when connection is restored.</span>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 py-4"
        style={{ background: "rgba(245,239,230,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid var(--parchment3)" }}>
        <div className="max-w-xl mx-auto">
          <MorphButton onConfirm={handleConfirm} total={total} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Morphing confirm button ──────────────────────────────── */
function MorphButton({ onConfirm, total }) {
  const [pressed, setPressed] = useState(false);

  const handleClick = async () => {
    setPressed(true);
    // Brief morph pause before handing off to parent
    await new Promise((r) => setTimeout(r, 320));
    onConfirm();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={pressed}
      className="w-full rounded-xl text-sm font-medium flex items-center justify-center gap-2.5 overflow-hidden relative"
      style={{
        background: "var(--espresso)",
        color: "var(--cream)",
        fontFamily: "DM Sans, sans-serif",
        height: 56,
      }}
      whileTap={{ scale: 0.97 }}
      animate={pressed ? { width: 56, borderRadius: 28 } : { width: "100%", borderRadius: 12 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      <AnimatePresence mode="wait">
        {pressed ? (
          <motion.div
            key="spinner"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="w-5 h-5 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "var(--amber)" }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="label"
            className="flex items-center justify-center gap-2.5 w-full px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <span>Confirm Order</span>
            <span className="ml-auto font-serif font-semibold text-base">{formatPrice(total)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
