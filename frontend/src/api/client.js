/**
 * client.js
 * ─────────────────────────────────────────────────────────────
 * Thin wrapper around fetch that:
 *  - Prepends the backend base URL automatically
 *  - Attaches the X-Admin-Logged-In header when the admin is logged in
 *  - Throws a plain Error with the server's message on non-2xx responses
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiFetch(path, options = {}) {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const headers = {
    'Content-Type': 'application/json',
    ...(isAdmin ? { 'X-Admin-Logged-In': 'true' } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}
