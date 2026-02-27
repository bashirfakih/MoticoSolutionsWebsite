/**
 * Order API Client
 *
 * Client-side service for order API operations.
 *
 * @module lib/api/orderApi
 */

import { Order, OrderInput, PaginatedResult, PaginationParams, OrderStatus, PaymentStatus } from '@/lib/data/types';

const API_BASE = '/api/orders';

export interface OrderFilter {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Fetch all orders (or with filters/pagination)
 */
export async function getOrders(
  params?: PaginationParams,
  filter?: OrderFilter
): Promise<PaginatedResult<Order>> {
  const searchParams = new URLSearchParams();

  if (params) {
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  }

  if (filter) {
    if (filter.search) searchParams.set('search', filter.search);
    if (filter.status) searchParams.set('status', filter.status);
    if (filter.paymentStatus) searchParams.set('paymentStatus', filter.paymentStatus);
    if (filter.customerId) searchParams.set('customerId', filter.customerId);
    if (filter.fromDate) searchParams.set('fromDate', filter.fromDate);
    if (filter.toDate) searchParams.set('toDate', filter.toDate);
  }

  const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE;
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch orders');
  }

  return res.json();
}

/**
 * Fetch pending orders
 */
export async function getPendingOrders(): Promise<Order[]> {
  const result = await getOrders(undefined, { status: 'pending' });
  return result.data;
}

/**
 * Fetch orders by customer
 */
export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  const result = await getOrders(undefined, { customerId });
  return result.data;
}

/**
 * Fetch a single order by ID
 */
export async function getOrderById(id: string): Promise<Order | null> {
  const res = await fetch(`${API_BASE}/${id}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch order');
  }

  return res.json();
}

/**
 * Create a new order
 */
export async function createOrder(input: OrderInput): Promise<Order> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create order');
  }

  return res.json();
}

/**
 * Update an existing order
 */
export async function updateOrder(id: string, input: Partial<Order>): Promise<Order> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update order');
  }

  return res.json();
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return updateOrder(id, { status });
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
  return updateOrder(id, { paymentStatus });
}

/**
 * Mark order as shipped
 */
export async function markAsShipped(id: string): Promise<Order> {
  return updateOrder(id, { status: 'shipped' });
}

/**
 * Mark order as delivered
 */
export async function markAsDelivered(id: string): Promise<Order> {
  return updateOrder(id, { status: 'delivered' });
}

/**
 * Cancel order
 */
export async function cancelOrder(id: string): Promise<Order> {
  return updateOrder(id, { status: 'cancelled' });
}

/**
 * Delete an order
 */
export async function deleteOrder(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete order');
  }

  return true;
}

/**
 * Order API service object (for compatibility with existing code)
 */
export const orderApiService = {
  getAll: async () => (await getOrders()).data,
  getPending: getPendingOrders,
  getByCustomer: getOrdersByCustomer,
  getPaginated: getOrders,
  getById: getOrderById,
  create: createOrder,
  update: updateOrder,
  updateStatus: updateOrderStatus,
  updatePaymentStatus,
  markAsShipped,
  markAsDelivered,
  cancel: cancelOrder,
  delete: deleteOrder,
};
