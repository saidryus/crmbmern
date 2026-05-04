import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AudioProvider } from './context/AudioContext';
import { FlyProvider } from './context/FlyContext';
import { ProductsProvider } from './context/ProductsContext';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import OfflineBadge from './components/common/OfflineBadge';
import Splash from './pages/Splash';
import Menu from './pages/Menu';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Slide direction based on route depth
const routeOrder = ['/', '/menu', '/product', '/cart', '/checkout'];
const getDepth = (path) => {
  const idx = routeOrder.findIndex((r) => path === r || path.startsWith(r + '/'));
  return idx === -1 ? 0 : idx;
};

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const prevPath = useRef(location.pathname);
  const dir = getDepth(location.pathname) - getDepth(prevPath.current);

  useEffect(() => { prevPath.current = location.pathname; });

  useIdleTimeout(
    () => {
      const p = location.pathname;
      if (p !== '/' && !p.startsWith('/admin')) navigate('/');
    },
    2 * 60 * 1000
  );

  return (
    <AnimatePresence mode="wait" custom={dir}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper dir={dir}><Splash /></PageWrapper>} />
        <Route path="/menu" element={<PageWrapper dir={dir}><Menu /></PageWrapper>} />
        <Route path="/product/:id" element={<PageWrapper dir={dir}><ProductDetails /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper dir={dir}><Cart /></PageWrapper>} />
        <Route path="/checkout" element={<PageWrapper dir={dir}><Checkout /></PageWrapper>} />
        {/* Admin routes — outside PageWrapper, no idle timeout interference */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

import { motion } from 'framer-motion';
function PageWrapper({ children, dir }) {
  return (
    <motion.div
      custom={dir}
      variants={{
        enter: (d) => ({ x: d > 0 ? '60%' : d < 0 ? '-60%' : 0, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit:  (d) => ({ x: d > 0 ? '-30%' : d < 0 ? '30%' : 0, opacity: 0 }),
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <ProductsProvider>
      <CartProvider>
        <AudioProvider>
          <FlyProvider>
            <ToastProvider>
              <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
                <OfflineBadge />
                <AppRoutes />
              </div>
            </ToastProvider>
          </FlyProvider>
        </AudioProvider>
      </CartProvider>
    </ProductsProvider>
  );
}
