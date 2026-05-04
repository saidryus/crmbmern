import { apiFetch } from './client';

/** Fetch all products from the database */
export const getProducts = () => apiFetch('/products');

/** Fetch a single product by its MongoDB _id */
export const getProduct = (id) => apiFetch(`/products/${id}`);

/** Create a new product (admin only — token required) */
export const createProduct = (data) =>
  apiFetch('/products', { method: 'POST', body: JSON.stringify(data) });

/** Update an existing product by _id (admin only) */
export const updateProduct = (id, data) =>
  apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });

/** Delete a product by _id (admin only) */
export const deleteProduct = (id) =>
  apiFetch(`/products/${id}`, { method: 'DELETE' });
