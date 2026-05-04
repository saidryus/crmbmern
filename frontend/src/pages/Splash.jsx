import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NowPlaying from '../components/common/NowPlaying';
import { useSound } from '../hooks/useSound';
import { useLongPress } from '../hooks/useLongPress';

const notes = [
  { x: '10%', y: '22%', delay: 0,   dur: 6.5, size: 20, opacity: 0.11 },
  { x: '83%', y: '14%', delay: 1.4, dur: 7.2, size: 15, opacity: 0.08 },
  { x: '74%', y: '64%', delay: 0.7, dur: 8,   size: 22, opacity: 0.09 },
  { x: '17%', y: '71%', delay: 2.1, dur: 6.8, size: 13, opacity: 0.07 },
  { x: '50%', y: '9%',  delay: 3.1, dur: 7.6, size: 17, opacity: 0.06 },
  { x: '35%', y: '80%', delay: 1.8, dur: 9,   size: 11, opacity: 0.06 },
];

// Circumference of r=48 circle = 2 * PI * 48 ≈ 301.6
const CIRC = 301.6;

export default function Splash() {
  const navigate = useNavigate();
  const { playNav } = useSound();
  const [returning, setReturning] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  const longPressProps = useLongPress({
    duration: 3000,
    onProgress: useCallback((p) => setHoldProgress(p), []),
    onComplete: useCallback(() => {
      setUnlocked(true);
      setTimeout(() => navigate('/admin-login'), 900);
    }, [navigate]),
    onCancel: useCallback(() => setHoldProgress(0), []),
  });

  useEffect(() => {
    try {
      const history = localStorage.getItem('crmb_order_history');
      if (history && JSON.parse(history).length > 0) setReturning(true);
    } catch { /* ignore */ }
  }, []);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
      style={{ background: 'linear-gradient(170deg, #0e0804 0%, #1e1008 35%, #2a1810 65%, #1a0e06 100%)' }}
      onClick={() => { if (!unlocked) { playNav(); navigate('/menu'); } }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Warm glow pools */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 580, height: 580, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,145,58,0.13) 0%, transparent 68%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '12%', right: '12%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,121,106,0.07) 0%, transparent 70%)',
        }} />
      </div>

      {/* Floating music notes */}
      {notes.map((n, i) => (
        <motion.div key={i} className="absolute select-none pointer-events-none"
          style={{ left: n.x, top: n.y, fontSize: n.size, color: `rgba(200,145,58,${n.opacity})`, fontFamily: 'Cormorant Garamond, serif' }}
          animate={{ y: [0, -20, 0], opacity: [n.opacity, n.opacity * 2, n.opacity] }}
          transition={{ repeat: Infinity, duration: n.dur, delay: n.delay, ease: 'easeInOut' }}>
          ♪
        </motion.div>
      ))}

      {/* Top rule */}
      <motion.div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(200,145,58,0.28), transparent)' }}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 1.4 }} />

      {/* Top label */}
      <motion.div className="absolute top-8 flex items-center gap-3"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}>
        <div className="h-px w-8" style={{ background: 'rgba(200,145,58,0.25)' }} />
        <p className="text-xs tracking-[0.45em] uppercase font-light"
          style={{ color: 'rgba(200,145,58,0.5)', fontFamily: 'DM Sans, sans-serif' }}>
          Self-Service Kiosk
        </p>
        <div className="h-px w-8" style={{ background: 'rgba(200,145,58,0.25)' }} />
      </motion.div>

      {/* Returning customer greeting */}
      {returning && (
        <motion.div className="absolute top-20 flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: 'rgba(200,145,58,0.1)', border: '1px solid rgba(200,145,58,0.2)' }}
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          <span style={{ fontSize: 12, color: 'rgba(200,145,58,0.7)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
            Welcome back ♩
          </span>
        </motion.div>
      )}

      {/* Main logo */}
      <motion.div className="text-center z-10 px-8"
        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}>
        <motion.p className="font-serif italic mb-3 tracking-wide"
          style={{ color: 'rgba(200,145,58,0.45)', fontSize: 15, fontWeight: 300 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          Artisan Bakery & Café
        </motion.p>

        {/* Long-press target — CRMB wordmark */}
        <div className="relative inline-block" {...longPressProps}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'default', userSelect: 'none' }}>

          <motion.h1
            className="font-serif font-bold leading-none"
            style={{
              fontSize: 'clamp(88px, 20vw, 148px)',
              color: '#c8913a',
              letterSpacing: '0.12em',
            }}
            animate={{
              textShadow: holdProgress > 0
                ? '0 0 120px rgba(200,145,58,0.5)'
                : '0 0 100px rgba(200,145,58,0.18)',
            }}
            transition={{ duration: 0.2 }}
          >
            CRMB
          </motion.h1>

          {/* Circular progress ring */}
          <AnimatePresence>
            {holdProgress > 0 && (
              <motion.svg
                className="absolute pointer-events-none"
                viewBox="0 0 100 100"
                style={{ top: '-12px', left: '-12px', width: 'calc(100% + 24px)', height: 'calc(100% + 24px)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(200,145,58,0.12)" strokeWidth="1.5" />
                <motion.circle
                  cx="50" cy="50" r="48" fill="none"
                  stroke="#c8913a" strokeWidth="2.5" strokeLinecap="round"
                  style={{ rotate: -90, transformOrigin: '50% 50%' }}
                  strokeDasharray={CIRC}
                  animate={{ strokeDashoffset: CIRC * (1 - holdProgress) }}
                  transition={{ duration: 0.05, ease: 'linear' }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>

        {/* Ornamental rule */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="h-px flex-1 max-w-20" style={{ background: 'rgba(200,145,58,0.18)' }} />
          <div className="flex gap-2 items-center">
            <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(200,145,58,0.35)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(200,145,58,0.55)' }} />
            <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(200,145,58,0.35)' }} />
          </div>
          <div className="h-px flex-1 max-w-20" style={{ background: 'rgba(200,145,58,0.18)' }} />
        </div>
      </motion.div>

      {/* Tap to begin */}
      <motion.div className="z-10 mt-12"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.82, duration: 0.6 }}>
        <motion.div className="flex items-center gap-3.5 px-9 py-4 rounded-full"
          style={{ border: '1px solid rgba(200,145,58,0.32)', background: 'rgba(200,145,58,0.055)' }}
          animate={{ boxShadow: ['0 0 0px rgba(200,145,58,0)', '0 0 30px rgba(200,145,58,0.16)', '0 0 0px rgba(200,145,58,0)'] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}>
          <span className="text-sm tracking-[0.3em] uppercase font-light"
            style={{ color: '#c8913a', fontFamily: 'DM Sans, sans-serif' }}>
            Tap to Begin
          </span>
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="#c8913a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Staff access unlocked toast */}
      <AnimatePresence>
        {unlocked && (
          <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="flex items-center gap-2.5 px-6 py-3.5 rounded-full"
              style={{ background: 'rgba(200,145,58,0.15)', border: '1px solid rgba(200,145,58,0.45)', backdropFilter: 'blur(12px)' }}
              initial={{ scale: 0.8, y: 12 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="6" width="10" height="7" rx="1.5" fill="none" stroke="#c8913a" strokeWidth="1.4"/>
                <path d="M4.5 6V4a2.5 2.5 0 015 0v2" stroke="#c8913a" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="text-xs tracking-[0.25em] uppercase font-medium"
                style={{ color: '#c8913a', fontFamily: 'DM Sans, sans-serif' }}>
                Staff access unlocked
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <motion.div className="absolute bottom-0 left-0 right-0"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
        <div className="flex justify-center mb-4">
          <NowPlaying dark={true} />
        </div>
        <div className="h-px mx-10 mb-4"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(200,145,58,0.12), transparent)' }} />
        <div className="flex items-center justify-between px-10 pb-7">
          <p className="text-xs tracking-[0.3em] uppercase font-light"
            style={{ color: 'rgba(200,145,58,0.22)', fontFamily: 'DM Sans, sans-serif' }}>
            Est. 2024
          </p>
          <div className="flex gap-2 items-center">
            {[0, 1, 2, 3].map((i) => (
              <motion.div key={i} className="rounded-full"
                style={{ width: i === 1 || i === 2 ? 16 : 5, height: 5, background: i === 1 || i === 2 ? 'rgba(200,145,58,0.4)' : 'rgba(200,145,58,0.18)' }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.25 }} />
            ))}
          </div>
          <p className="text-xs tracking-[0.3em] uppercase font-light"
            style={{ color: 'rgba(200,145,58,0.22)', fontFamily: 'DM Sans, sans-serif' }}>
            Manila, PH
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
