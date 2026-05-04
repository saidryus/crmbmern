import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { login } from '../../api/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [shaking,  setShaking]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // POST /api/auth/login — stores JWT in localStorage on success
      await login(username.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid credentials. Try again.');
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #0e0804 0%, #1e1008 50%, #0e0804 100%)' }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 40%, rgba(200,145,58,0.08) 0%, transparent 60%)',
      }} />

      <motion.div
        className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Lock icon */}
        <motion.div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(200,145,58,0.12)', border: '1px solid rgba(200,145,58,0.25)' }}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 16 }}
        >
          <Lock size={22} style={{ color: '#c8913a' }} />
        </motion.div>

        {/* Heading */}
        <motion.div className="text-center mb-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <h1 className="font-serif font-bold text-2xl mb-1" style={{ color: '#c8913a', letterSpacing: '0.1em' }}>
            CRMB
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase font-light"
            style={{ color: 'rgba(200,145,58,0.45)', fontFamily: 'DM Sans, sans-serif' }}>
            Staff Access
          </p>
        </motion.div>

        {/* Form card */}
        <motion.form
          onSubmit={handleSubmit}
          animate={shaking ? {
            x: [-10, 10, -8, 8, -4, 4, 0],
            transition: { duration: 0.5 },
          } : {}}
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(200,145,58,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Username */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-2 tracking-widest uppercase"
              style={{ color: 'rgba(200,145,58,0.6)', fontFamily: 'DM Sans, sans-serif' }}>
              Username
            </label>
            <motion.input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(200,145,58,0.2)',
                color: 'rgba(245,239,230,0.9)',
                fontFamily: 'DM Sans, sans-serif',
              }}
              whileFocus={{
                borderColor: 'rgba(200,145,58,0.6)',
                boxShadow: '0 0 0 2px rgba(200,145,58,0.15)',
              }}
              transition={{ duration: 0.15 }}
              placeholder="Enter username"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-xs font-medium mb-2 tracking-widest uppercase"
              style={{ color: 'rgba(200,145,58,0.6)', fontFamily: 'DM Sans, sans-serif' }}>
              Password
            </label>
            <div className="relative">
              <motion.input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(200,145,58,0.2)',
                  color: 'rgba(245,239,230,0.9)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                whileFocus={{
                  borderColor: 'rgba(200,145,58,0.6)',
                  boxShadow: '0 0 0 2px rgba(200,145,58,0.15)',
                }}
                transition={{ duration: 0.15 }}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(200,145,58,0.4)' }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                className="text-xs mb-4 text-center"
                style={{ color: '#c4796a', fontFamily: 'DM Sans, sans-serif' }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{
              background: loading ? 'rgba(200,145,58,0.4)' : '#c8913a',
              color: '#1e140a',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
            }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <motion.div
                className="w-4 h-4 rounded-full border-2 border-transparent"
                style={{ borderTopColor: '#1e140a' }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
              />
            ) : (
              <>
                <LogIn size={15} />
                Sign In
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Back link */}
        <motion.button
          onClick={() => navigate('/')}
          className="w-full mt-4 py-2 text-xs text-center"
          style={{ color: 'rgba(200,145,58,0.3)', fontFamily: 'DM Sans, sans-serif' }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ← Back to kiosk
        </motion.button>
      </motion.div>
    </div>
  );
}
