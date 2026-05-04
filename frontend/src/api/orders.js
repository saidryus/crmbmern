import { apiFetch } from './client';

/**
 * Place a new order (public — no token needed).
 * @param {{ orderId: string, items: array, total: number }} orderData
 */
export const createOrder = (orderData) =>
  apiFetch('/orders', { method: 'POST', body: JSON.stringify(orderData) });

/** Fetch all orders — admin only */
export const getOrders = () => apiFetch('/orders');

/** Fetch a single order by MongoDB _id — admin only */
export const getOrder = (id) => apiFetch(`/orders/${id}`);

/** Update an order's status — admin only */
export const updateOrderStatus = (id, status) =>
  apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
