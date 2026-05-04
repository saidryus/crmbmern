import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useFly } from '../context/FlyContext';
import { formatPrice } from '../utils/formatPrice';
import CartButton from '../components/cart/CartButton';
import RippleButton from '../components/common/RippleButton';
import { useSound } from '../hooks/useSound';

export default function ProductDetails() {
  const { id } = useParams();
  const { products } = useProducts();
  const navigate = useNavigate();
  const { addItem, cart } = useCart();
  const { addToast } = useToast();
  const { flyToCart } = useFly();
  const { playAddToCart, playQtyUp, playQtyDown, playNav } = useSound();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [qtyDir, setQtyDir] = useState(1); // 1 = up, -1 = down
  const imgRef = useRef(null);

  const product = products.find((p) => p._id === id);
  const inCart = cart.find((i) => i._id === product?._id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--parchment)' }}>
        <div className="text-center">
          <p className="font-serif italic text-xl mb-4" style={{ color: 'var(--ink-muted)' }}>
            Product not found
          </p>
          <button onClick={() => navigate('/menu')}
            className="px-6 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'var(--espresso)', color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    playAddToCart();
    addToast({ title: `${product.name} added`, subtitle: formatPrice(product.price * qty), image: product.image });
    // Fly from hero image
    if (imgRef.current) flyToCart(product.image, imgRef.current.getBoundingClientRect());
    setTimeout(() => { setAdded(false); setQty(1); }, 1500);
  };

  // "You might also like" — same category, exclude self
  const related = products
    .filter((p) => p._id !== product._id && p.category === product.category)
    .slice(0, 3);

  return (
    <motion.div
      className="min-h-screen"
      style={{ background: 'var(--parchment)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 px-5 py-3.5 flex items-center justify-between"
        style={{
          background: 'rgba(245,239,230,0.94)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--parchment3)',
        }}
      >
        <motion.button
          onClick={() => { playNav(); navigate(-1); }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--parchment2)', color: 'var(--ink)', border: '1px solid var(--parchment3)', fontFamily: 'DM Sans, sans-serif' }}
          whileTap={{ scale: 0.93 }}
        >
          <ArrowLeft size={14} />
          Back
        </motion.button>
        <CartButton />
      </header>

      <div className="max-w-xl mx-auto px-5 pb-36">
        {/* Hero image */}
        <motion.div
          className="rounded-2xl overflow-hidden mt-4 mb-5 relative"
          style={{ height: 290, border: '1px solid var(--parchment3)' }}
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.07, duration: 0.4 }}
        >
          <img src={product.image} alt={product.name} ref={imgRef} className="w-full h-full object-cover" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(30,20,10,0.55) 0%, transparent 50%)' }} />

          {product.bestSeller && (
            <motion.div
              className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'var(--amber)' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Star size={10} fill="var(--espresso)" stroke="none" />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.06em' }}>
                FAVOURITE
              </span>
            </motion.div>
          )}

          <div className="absolute bottom-4 left-4">
            <span className="text-xs px-2.5 py-1 rounded-full font-light"
              style={{
                background: 'rgba(30,20,10,0.5)',
                color: 'rgba(245,239,230,0.9)',
                backdropFilter: 'blur(6px)',
                fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '0.08em',
                fontSize: 10,
              }}>
              {product.category.toUpperCase()}
            </span>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.14 }}
        >
          {/* Name + price */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="font-serif font-semibold text-2xl leading-tight" style={{ color: 'var(--ink)' }}>
              {product.name}
            </h1>
            <span className="font-serif font-semibold text-xl flex-shrink-0 mt-0.5" style={{ color: 'var(--ink)' }}>
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-6 font-light"
            style={{ color: 'var(--ink-soft)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.75 }}>
            {product.description}
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ background: 'var(--parchment3)' }} />
            <div className="w-1 h-1 rounded-full" style={{ background: 'var(--parchment3)' }} />
            <div className="h-px flex-1" style={{ background: 'var(--parchment3)' }} />
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-medium" style={{ color: 'var(--ink)', fontFamily: 'DM Sans, sans-serif' }}>
              Quantity
            </span>
            <div className="flex items-center gap-3">
              <motion.button
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: 'var(--parchment2)',
                  border: '1px solid var(--parchment3)',
                  opacity: qty <= 1 ? 0.4 : 1,
                }}
                onClick={() => { playQtyDown(); setQtyDir(-1); setQty((q) => Math.max(1, q - 1)); }}
                whileTap={{ scale: 0.82 }}
                disabled={qty <= 1}
              >
                <Minus size={13} style={{ color: 'var(--ink)' }} />
              </motion.button>

              <div className="w-8 h-8 relative overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait" custom={qtyDir}>
                  <motion.span
                    key={qty}
                    custom={qtyDir}
                    className="absolute font-serif font-semibold text-lg"
                    style={{ color: 'var(--ink)' }}
                    variants={{
                      enter: (d) => ({ y: d > 0 ? -16 : 16, opacity: 0 }),
                      center: { y: 0, opacity: 1 },
                      exit:  (d) => ({ y: d > 0 ? 16 : -16, opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                  >
                    {qty}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.button
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--espresso)' }}
                onClick={() => { playQtyUp(); setQtyDir(1); setQty((q) => q + 1); }}
                whileTap={{ scale: 0.82 }}
              >
                <Plus size={13} style={{ color: 'var(--cream)' }} />
              </motion.button>
            </div>
          </div>

          {/* In-cart notice */}
          <AnimatePresenceWrapper>
            {inCart && (
              <motion.div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-4 text-sm"
                style={{
                  background: 'var(--sage-pale)',
                  border: '1px solid rgba(122,144,128,0.25)',
                  color: 'var(--sage)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <ShoppingBag size={13} />
                <span className="font-medium">{inCart.quantity} already in your order</span>
              </motion.div>
            )}
          </AnimatePresenceWrapper>
        </motion.div>
      </div>

      {/* You might also like */}
      {related.length > 0 && (
        <motion.div
          className="max-w-xl mx-auto px-5 mt-8 pb-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1" style={{ background: 'var(--parchment3)' }} />
            <p className="text-xs tracking-[0.2em] uppercase font-medium"
              style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              You might also like
            </p>
            <div className="h-px flex-1" style={{ background: 'var(--parchment3)' }} />
          </div>
          <div className="flex flex-col gap-2.5">
            {related.map((p, i) => (
              <motion.button key={p._id}
                className="flex items-center gap-3 p-3 rounded-xl text-left w-full"
                style={{ background: 'var(--card)', border: '1px solid var(--parchment3)', boxShadow: '0 1px 6px rgba(30,20,10,0.05)' }}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/product/${p._id}`)}>
                <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  style={{ border: '1px solid var(--parchment3)' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-semibold text-sm leading-snug" style={{ color: 'var(--ink)' }}>{p.name}</p>
                  <p className="text-xs font-light mt-0.5 truncate" style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                    {p.description}
                  </p>
                </div>
                <span className="font-serif font-semibold text-sm flex-shrink-0" style={{ color: 'var(--ink)' }}>
                  {formatPrice(p.price)}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sticky CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 py-4"
        style={{
          background: 'rgba(245,239,230,0.97)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--parchment3)',
        }}
      >
        <div className="max-w-xl mx-auto">
          <RippleButton
            onClick={handleAdd}
            className="w-full py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2.5 transition-colors"
            style={
              added
                ? { background: 'var(--sage)', color: '#fff', fontFamily: 'DM Sans, sans-serif' }
                : { background: 'var(--espresso)', color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }
            }
          >
            {added ? (
              <>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2.5 7.5l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Added to Order
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                Add {qty > 1 ? `${qty} × ` : ''}to Order
                <span className="ml-auto font-serif font-semibold">{formatPrice(product.price * qty)}</span>
              </>
            )}
          </RippleButton>
        </div>
      </div>
    </motion.div>
  );
}

// tiny local wrapper so we don't need to import AnimatePresence separately
function AnimatePresenceWrapper({ children }) {
  return <AnimatePresence>{children}</AnimatePresence>;
}
