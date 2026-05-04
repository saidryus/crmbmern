import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute
 * Guards admin pages by checking the isAdmin flag in localStorage,
 * which is set by api/auth.js on a successful login.
 *
 * If logged in  → renders children
 * If not        → redirects to /admin-login
 */
export default function ProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  return isAdmin ? children : <Navigate to="/admin-login" replace />;
}
