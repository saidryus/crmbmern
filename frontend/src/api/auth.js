import { apiFetch } from './client';

/**
 * Login with username + password.
 * On success the backend returns { success: true, username }.
 * We store a simple flag in localStorage so ProtectedRoute
 * and the auth header can check it.
 */
export const login = async (username, password) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem('isAdmin', 'true');
  localStorage.setItem('crmb_admin_username', data.username);
  return data;
};

/** Remove the admin flag from localStorage (logout) */
export const logout = () => {
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('crmb_admin_username');
};
