/**
 * Order Service for Motico Solutions CRM
 *
 * CRUD operations for orders using localStorage.
 *
 * @module lib/data/orderService
 */

import {
  Order,
  OrderInput,
  OrderFilter,
  OrderStatus,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PaymentStatus,
  PaginatedResult,
  PaginationParams,
  CURRENCY,
  generateId,
  getCurrentTimestamp,
} from './types';
import { mockOrders } from './mockOrders';

const STORAGE_KEY = 'motico_orders';
const isClient = typeof window !== 'undefined';

// ═══════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

function initializeStorage(): void {
  if (!isClient) return;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders));
  }
}

function getFromStorage(): Order[] {
  if (!isClient) return mockOrders;
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : mockOrders;
}

function saveToStorage(orders: Order[]): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const orders = getFromStorage();
  const count = orders.filter(o => o.orderNumber.includes(`ORD-${year}`)).length + 1;
  return `ORD-${year}-${count.toString().padStart(3, '0')}`;
}

// ═══════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════

export function getAllOrders(): Order[] {
  return getFromStorage().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(id: string): Order | null {
  return getFromStorage().find(order => order.id === id) || null;
}

export function getOrderByNumber(orderNumber: string): Order | null {
  return getFromStorage().find(order => order.orderNumber === orderNumber) || null;
}

export function getOrdersByCustomer(customerId: string): Order[] {
  return getAllOrders().filter(order => order.customerId === customerId);
}

export function getOrdersByStatus(status: OrderStatus): Order[] {
  return getAllOrders().filter(order => order.status === status);
}

export function getPendingOrders(): Order[] {
  return getOrdersByStatus(ORDER_STATUS.PENDING);
}

export function getRecentOrders(limit: number = 10): Order[] {
  return getAllOrders().slice(0, limit);
}

export function searchOrders(query: string): Order[] {
  const searchLower = query.toLowerCase();
  return getAllOrders().filter(
    order =>
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.customerEmail.toLowerCase().includes(searchLower)
  );
}

export function getOrdersPaginated(
  params: PaginationParams,
  filter?: OrderFilter
): PaginatedResult<Order> {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  let orders = getFromStorage();

  // Apply filters
  if (filter) {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      orders = orders.filter(
        o =>
          o.orderNumber.toLowerCase().includes(searchLower) ||
          o.customerName.toLowerCase().includes(searchLower) ||
          o.customerEmail.toLowerCase().includes(searchLower)
      );
    }
    if (filter.status) {
      orders = orders.filter(o => o.status === filter.status);
    }
    if (filter.paymentStatus) {
      orders = orders.filter(o => o.paymentStatus === filter.paymentStatus);
    }
    if (filter.customerId) {
      orders = orders.filter(o => o.customerId === filter.customerId);
    }
    if (filter.dateFrom) {
      orders = orders.filter(o => new Date(o.createdAt) >= new Date(filter.dateFrom!));
    }
    if (filter.dateTo) {
      orders = orders.filter(o => new Date(o.createdAt) <= new Date(filter.dateTo!));
    }
  }

  // Sort
  orders = orders.sort((a, b) => {
    const aVal = a[sortBy as keyof Order];
    const bVal = b[sortBy as keyof Order];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const total = orders.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = orders.slice(start, start + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

export function createOrder(input: OrderInput): Order {
  const orders = getFromStorage();
  const now = getCurrentTimestamp();

  const itemCount = input.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = input.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal + (input.shippingCost || 0) - (input.discount || 0);

  const newOrder: Order = {
    id: generateId(),
    orderNumber: generateOrderNumber(),
    customerId: input.customerId,
    customerName: input.shippingAddress.name,
    customerEmail: '', // Would come from customer lookup
    customerPhone: input.shippingAddress.phone,
    items: input.items.map(item => ({ ...item, id: generateId() })),
    itemCount,
    subtotal,
    shippingCost: input.shippingCost || 0,
    tax: 0,
    discount: input.discount || 0,
    total,
    currency: CURRENCY.USD,
    status: ORDER_STATUS.PENDING,
    paymentStatus: PAYMENT_STATUS.PENDING,
    paymentMethod: null,
    shippingAddress: input.shippingAddress,
    customerNote: input.customerNote || null,
    internalNote: input.internalNote || null,
    createdAt: now,
    updatedAt: now,
    shippedAt: null,
    deliveredAt: null,
    paidAt: null,
  };

  orders.push(newOrder);
  saveToStorage(orders);

  return newOrder;
}

export function updateOrder(id: string, updates: Partial<Order>): Order {
  const orders = getFromStorage();
  const index = orders.findIndex(o => o.id === id);

  if (index === -1) {
    throw new Error(`Order with ID ${id} not found`);
  }

  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: getCurrentTimestamp(),
  };

  saveToStorage(orders);
  return orders[index];
}

export function updateOrderStatus(id: string, status: OrderStatus): Order {
  const updates: Partial<Order> = { status };

  if (status === ORDER_STATUS.SHIPPED) {
    updates.shippedAt = getCurrentTimestamp();
  }
  if (status === ORDER_STATUS.DELIVERED) {
    updates.deliveredAt = getCurrentTimestamp();
  }

  return updateOrder(id, updates);
}

export function updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Order {
  const updates: Partial<Order> = { paymentStatus };

  if (paymentStatus === PAYMENT_STATUS.PAID) {
    updates.paidAt = getCurrentTimestamp();
  }

  return updateOrder(id, updates);
}

export function deleteOrder(id: string): boolean {
  const orders = getFromStorage();
  const index = orders.findIndex(o => o.id === id);

  if (index === -1) {
    throw new Error(`Order with ID ${id} not found`);
  }

  orders.splice(index, 1);
  saveToStorage(orders);
  return true;
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════

export function getOrderStats() {
  const orders = getFromStorage();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
  const totalRevenue = orders
    .filter(o => o.paymentStatus === PAYMENT_STATUS.PAID)
    .reduce((sum, o) => sum + o.total, 0);

  return {
    total: orders.length,
    pending: orders.filter(o => o.status === ORDER_STATUS.PENDING).length,
    confirmed: orders.filter(o => o.status === ORDER_STATUS.CONFIRMED).length,
    processing: orders.filter(o => o.status === ORDER_STATUS.PROCESSING).length,
    shipped: orders.filter(o => o.status === ORDER_STATUS.SHIPPED).length,
    delivered: orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length,
    cancelled: orders.filter(o => o.status === ORDER_STATUS.CANCELLED).length,
    refunded: orders.filter(o => o.status === ORDER_STATUS.REFUNDED).length,
    todayCount: todayOrders.length,
    todayRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
    totalRevenue,
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
  };
}

export function getCount(): number {
  return getFromStorage().length;
}

export function getPendingCount(): number {
  return getPendingOrders().length;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════

export const orderService = {
  getAll: getAllOrders,
  getById: getOrderById,
  getByNumber: getOrderByNumber,
  getByCustomer: getOrdersByCustomer,
  getByStatus: getOrdersByStatus,
  getPending: getPendingOrders,
  getRecent: getRecentOrders,
  search: searchOrders,
  getPaginated: getOrdersPaginated,
  create: createOrder,
  update: updateOrder,
  updateStatus: updateOrderStatus,
  updatePaymentStatus,
  delete: deleteOrder,
  getStats: getOrderStats,
  getCount,
  getPendingCount,
};
