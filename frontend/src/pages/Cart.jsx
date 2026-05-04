import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, Coffee } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import RippleButton from '../components/common/RippleButton';
import { useSound } from '../hooks/useSound';

function QtyDisplay({ value }) {
  return (
    <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span key={value} className="absolute font-serif font-semibold text-sm"
          style={{ color: 'var(--ink)' }}
          initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}>
          {value}
        </motion.span>
      </AnimatePresence>
      <motion.div key={'ring-' + value} className="absolute inset-0 rounded-full"
        style={{ border: '1.5px solid var(--amber)' }}
        initial={{ opacity: 0.7, scale: 0.7 }} animate={{ opacity: 0, scale: 1.5 }}
        transition={{ duration: 0.4 }} />
    </div>
  );
}

export default function Cart() {
  const { cart, removeItem, updateQuantity, total, itemCount } = useCart();
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState(null);
  const { playRemove, playQtyUp, playQtyDown } = useSound();

  const handleRemove = (id) => {
    playRemove();
    setRemovingId(id);
    setTimeout(() => { removeItem(id); setRemovingId(null); }, 280);
  };

  return (
    <motion.div className="min-h-screen pb-40" style={{ background: 'var(--parchment)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

      <header className="sticky top-0 z-40 px-5 py-3.5 flex items-center gap-3"
        style={{ background: 'rgba(245,239,230,0.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--parchment3)' }}>
        <motion.button onClick={() => navigate('/menu')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--parchment2)', color: 'var(--ink)', border: '1px solid var(--parchment3)', fontFamily: 'DM Sans, sans-serif' }}
          whileTap={{ scale: 0.93 }}>
          <ArrowLeft size={14} /> Menu
        </motion.button>
        <div className="flex-1">
          <h1 className="font-serif font-semibold text-lg italic" style={{ color: 'var(--ink)' }}>Your Order</h1>
          {itemCount > 0 && (
            <motion.p key={itemCount} className="text-xs font-light"
              style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </motion.p>
          )}
        </div>
      </header>

      <div className="max-w-xl mx-auto px-5 pt-5">
        {cart.length === 0 ? (
          <motion.div className="text-center py-28" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
              style={{ background: 'var(--espresso2)', border: '1px solid rgba(200,145,58,0.15)' }}
              animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 40%, rgba(200,145,58,0.12), transparent 60%)' }} />
              <Coffee size={36} style={{ color: 'var(--amber)' }} />
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="absolute rounded-full"
                  style={{ width: 2, height: 8, background: 'rgba(200,145,58,0.4)', top: 8, left: `${30 + i * 14}%` }}
                  animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.4, ease: 'easeOut' }} />
              ))}
            </motion.div>
            <p className="font-serif italic text-2xl mb-2" style={{ color: 'var(--ink)' }}>Your table is empty</p>
            <p className="text-sm font-light mb-8" style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              Add something from the menu to get started
            </p>
            <RippleButton onClick={() => navigate('/menu')}
              className="px-8 py-3.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--espresso)', color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}>
              Browse Menu
            </RippleButton>
          </motion.div>
        ) : (
          <>
            <div className="space-y-2.5 mb-5">
              <AnimatePresence>
                {cart.map((item, i) => (
                  <motion.div key={item._id}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl"
                    style={{ background: 'var(--card)', border: '1px solid var(--parchment3)', boxShadow: '0 1px 2px rgba(30,20,10,0.04), 0 3px 10px rgba(30,20,10,0.05)', originX: 0 }}
                    initial={{ opacity: 0, x: -16 }}
                    animate={removingId === item._id ? { opacity: 0, x: 40, scale: 0.92 } : { opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 40, scale: 0.92 }}
                    transition={{ duration: 0.26, ease: [0.32, 0, 0.18, 1], delay: removingId === item._id ? 0 : i * 0.04 }}
                    layout>
                    <img src={item.image} alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      style={{ border: '1px solid var(--parchment3)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold text-sm leading-snug truncate" style={{ color: 'var(--ink)' }}>{item.name}</p>
                      <p className="text-xs font-light mt-0.5" style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>{item.category}</p>
                      <motion.p key={item.price * item.quantity} className="font-serif font-semibold text-sm mt-1" style={{ color: 'var(--ink)' }}
                        initial={{ opacity: 0.5, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
                        {formatPrice(item.price * item.quantity)}
                      </motion.p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <motion.button className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--parchment2)', border: '1px solid var(--parchment3)' }}
                          onClick={() => { playQtyDown(); updateQuantity(item._id, item.quantity - 1); }} whileTap={{ scale: 0.8 }}>
                          <Minus size={10} style={{ color: 'var(--ink)' }} />
                        </motion.button>
                        <QtyDisplay value={item.quantity} />
                        <motion.button className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--espresso)' }}
                          onClick={() => { playQtyUp(); updateQuantity(item._id, item.quantity + 1); }} whileTap={{ scale: 0.8 }}>
                          <Plus size={10} style={{ color: 'var(--cream)' }} />
                        </motion.button>
                      </div>
                      <motion.button onClick={() => handleRemove(item._id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--rose-pale)', border: '1px solid rgba(196,121,106,0.2)' }}
                        whileTap={{ scale: 0.8 }} whileHover={{ background: 'rgba(196,121,106,0.2)' }}>
                        <Trash2 size={11} style={{ color: 'var(--rose)' }} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div className="rounded-2xl p-5"
              style={{ background: 'var(--card)', border: '1px solid var(--parchment3)', boxShadow: '0 1px 2px rgba(30,20,10,0.04), 0 3px 10px rgba(30,20,10,0.05)' }}
              layout>
              <p className="text-xs tracking-[0.2em] uppercase font-medium mb-4"
                style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>Summary</p>
              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between text-sm font-light" style={{ color: 'var(--ink-soft)', fontFamily: 'DM Sans, sans-serif' }}>
                  <span>Subtotal</span><span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm font-light" style={{ color: 'var(--ink-soft)', fontFamily: 'DM Sans, sans-serif' }}>
                  <span>Service charge</span>
                  <span className="italic text-xs" style={{ color: 'var(--ink-muted)' }}>Included</span>
                </div>
              </div>
              <div className="border-t border-dashed mb-4" style={{ borderColor: 'var(--parchment3)' }} />
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium" style={{ color: 'var(--ink)', fontFamily: 'DM Sans, sans-serif' }}>Total</span>
                <motion.span key={total} className="font-serif font-semibold text-2xl" style={{ color: 'var(--ink)' }}
                  initial={{ opacity: 0.5, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
                  {formatPrice(total)}
                </motion.span>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-5 py-4"
          style={{ background: 'rgba(245,239,230,0.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid var(--parchment3)' }}>
          <div className="max-w-xl mx-auto">
            <RippleButton onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-xl text-sm font-medium flex items-center justify-between px-5"
              style={{ background: 'var(--espresso)', color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}>
              <span>Proceed to Checkout</span>
              <span className="font-serif font-semibold text-base">{formatPrice(total)}</span>
            </RippleButton>
          </div>
        </div>
      )}
    </motion.div>
  );
}