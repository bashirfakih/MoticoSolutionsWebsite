/**
 * Order Service Unit Tests
 *
 * Tests for CRUD operations and utility functions.
 *
 * @module __tests__/lib/data/orderService.test
 */

import { orderService } from '@/lib/data/orderService';
import { ORDER_STATUS, PAYMENT_STATUS } from '@/lib/data/types';

// Mock localStorage
const localStorageMock: Record<string, string> = {};
const mockLocalStorage = {
  getItem: jest.fn((key: string) => localStorageMock[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    localStorageMock[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageMock[key];
  }),
  clear: jest.fn(() => {
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('orderService', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all orders sorted by createdAt descending', () => {
      const orders = orderService.getAll();
      expect(orders).toBeDefined();
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);

      // Check sorting (newest first)
      for (let i = 1; i < orders.length; i++) {
        expect(new Date(orders[i].createdAt).getTime())
          .toBeLessThanOrEqual(new Date(orders[i - 1].createdAt).getTime());
      }
    });
  });

  describe('getById', () => {
    it('should return order when found', () => {
      const orders = orderService.getAll();
      const firstOrder = orders[0];
      const result = orderService.getById(firstOrder.id);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(firstOrder.id);
      expect(result?.orderNumber).toBe(firstOrder.orderNumber);
    });

    it('should return null when not found', () => {
      const result = orderService.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getByNumber', () => {
    it('should return order when found', () => {
      const orders = orderService.getAll();
      const firstOrder = orders[0];
      const result = orderService.getByNumber(firstOrder.orderNumber);
      expect(result).not.toBeNull();
      expect(result?.orderNumber).toBe(firstOrder.orderNumber);
    });

    it('should return null when not found', () => {
      const result = orderService.getByNumber('ORD-NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('getByCustomer', () => {
    it('should return orders for a specific customer', () => {
      const orders = orderService.getAll();
      const customerId = orders[0].customerId;
      const customerOrders = orderService.getByCustomer(customerId);

      expect(Array.isArray(customerOrders)).toBe(true);
      customerOrders.forEach(order => {
        expect(order.customerId).toBe(customerId);
      });
    });
  });

  describe('getByStatus', () => {
    it('should return orders with specific status', () => {
      const pendingOrders = orderService.getByStatus(ORDER_STATUS.PENDING);
      expect(Array.isArray(pendingOrders)).toBe(true);
      pendingOrders.forEach(order => {
        expect(order.status).toBe(ORDER_STATUS.PENDING);
      });
    });
  });

  describe('getPending', () => {
    it('should return only pending orders', () => {
      const pendingOrders = orderService.getPending();
      pendingOrders.forEach(order => {
        expect(order.status).toBe(ORDER_STATUS.PENDING);
      });
    });
  });

  describe('getRecent', () => {
    it('should return limited number of recent orders', () => {
      const recentOrders = orderService.getRecent(3);
      expect(recentOrders.length).toBeLessThanOrEqual(3);
    });
  });

  describe('search', () => {
    it('should find orders by order number', () => {
      const orders = orderService.getAll();
      const orderNumber = orders[0].orderNumber;
      const results = orderService.search(orderNumber);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(o => o.orderNumber === orderNumber)).toBe(true);
    });

    it('should find orders by customer name', () => {
      const orders = orderService.getAll();
      const customerName = orders[0].customerName.split(' ')[0]; // First name
      const results = orderService.search(customerName);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = orderService.search('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new order', () => {
      const newOrder = orderService.create({
        customerId: 'cust-123',
        items: [
          {
            productId: 'prod-1',
            productName: 'Test Product',
            sku: 'TEST-001',
            quantity: 2,
            unitPrice: 100,
            totalPrice: 200,
          },
        ],
        shippingAddress: {
          name: 'Test Customer',
          company: null,
          address: '123 Test St',
          city: 'Test City',
          region: 'Test Region',
          postalCode: '12345',
          country: 'Lebanon',
          phone: null,
        },
      });

      expect(newOrder).toBeDefined();
      expect(newOrder.id).toBeDefined();
      expect(newOrder.orderNumber).toMatch(/^ORD-\d{4}-\d{3}$/);
      expect(newOrder.customerName).toBe('Test Customer');
      expect(newOrder.status).toBe(ORDER_STATUS.PENDING);
      expect(newOrder.paymentStatus).toBe(PAYMENT_STATUS.PENDING);
      expect(newOrder.createdAt).toBeDefined();

      // Verify it was saved
      const retrieved = orderService.getById(newOrder.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.customerName).toBe('Test Customer');
    });
  });

  describe('update', () => {
    it('should update an existing order', () => {
      const orders = orderService.getAll();
      const orderToUpdate = orders[0];

      const updated = orderService.update(orderToUpdate.id, {
        internalNotes: 'Updated notes',
      });

      expect(updated.internalNotes).toBe('Updated notes');
      expect(updated.id).toBe(orderToUpdate.id);
      expect(updated.updatedAt).not.toBe(orderToUpdate.updatedAt);
    });

    it('should throw error for non-existent order', () => {
      expect(() => {
        orderService.update('non-existent-id', { internalNotes: 'Test' });
      }).toThrow(/not found/);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', () => {
      const orders = orderService.getAll();
      const pendingOrder = orders.find(o => o.status === ORDER_STATUS.PENDING);

      if (pendingOrder) {
        const updated = orderService.updateStatus(pendingOrder.id, ORDER_STATUS.CONFIRMED);
        expect(updated.status).toBe(ORDER_STATUS.CONFIRMED);
      }
    });

    it('should set shippedAt when status is shipped', () => {
      const newOrder = orderService.create({
        customerId: 'cust-test',
        items: [],
        shippingAddress: { name: 'Test', company: null, address: '', city: '', region: null, postalCode: null, country: 'Lebanon', phone: null },
      });

      orderService.updateStatus(newOrder.id, ORDER_STATUS.CONFIRMED);
      orderService.updateStatus(newOrder.id, ORDER_STATUS.PROCESSING);
      const shipped = orderService.updateStatus(newOrder.id, ORDER_STATUS.SHIPPED);

      expect(shipped.shippedAt).toBeDefined();
    });

    it('should set deliveredAt when status is delivered', () => {
      const newOrder = orderService.create({
        customerId: 'cust-test',
        items: [],
        shippingAddress: { name: 'Test', company: null, address: '', city: '', region: null, postalCode: null, country: 'Lebanon', phone: null },
      });

      const delivered = orderService.updateStatus(newOrder.id, ORDER_STATUS.DELIVERED);
      expect(delivered.deliveredAt).toBeDefined();
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', () => {
      const newOrder = orderService.create({
        customerId: 'cust-test',
        items: [{ productId: 'p1', productName: 'Test', sku: 'T1', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        shippingAddress: { name: 'Test', company: null, address: '', city: '', region: null, postalCode: null, country: 'Lebanon', phone: null },
      });

      const updated = orderService.updatePaymentStatus(newOrder.id, PAYMENT_STATUS.PAID);
      expect(updated.paymentStatus).toBe(PAYMENT_STATUS.PAID);
      expect(updated.paidAt).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete an existing order', () => {
      const newOrder = orderService.create({
        customerId: 'cust-delete',
        items: [],
        shippingAddress: { name: 'Delete Test', company: null, address: '', city: '', region: null, postalCode: null, country: 'Lebanon', phone: null },
      });

      const result = orderService.delete(newOrder.id);
      expect(result).toBe(true);

      const retrieved = orderService.getById(newOrder.id);
      expect(retrieved).toBeNull();
    });

    it('should throw error for non-existent order', () => {
      expect(() => {
        orderService.delete('non-existent-id');
      }).toThrow(/not found/);
    });
  });

  describe('getPaginated', () => {
    it('should return paginated results', () => {
      const result = orderService.getPaginated({ page: 1, limit: 5 });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.total).toBeGreaterThan(0);
      expect(result.totalPages).toBeDefined();
    });

    it('should support filtering by status', () => {
      const result = orderService.getPaginated(
        { page: 1, limit: 10 },
        { status: ORDER_STATUS.PENDING }
      );

      result.data.forEach(order => {
        expect(order.status).toBe(ORDER_STATUS.PENDING);
      });
    });
  });

  describe('getStats', () => {
    it('should return order statistics', () => {
      const stats = orderService.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.pending).toBe('number');
      expect(typeof stats.totalRevenue).toBe('number');
      expect(typeof stats.averageOrderValue).toBe('number');
    });
  });

  describe('getCount', () => {
    it('should return total order count', () => {
      const count = orderService.getCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getPendingCount', () => {
    it('should return pending order count', () => {
      const pendingCount = orderService.getPendingCount();
      const totalCount = orderService.getCount();
      expect(typeof pendingCount).toBe('number');
      expect(pendingCount).toBeLessThanOrEqual(totalCount);
    });
  });

  describe('getPaginated - additional filters', () => {
    it('should filter by search term', () => {
      const orders = orderService.getAll();
      const orderNumber = orders[0].orderNumber;

      const result = orderService.getPaginated(
        { page: 1, limit: 100 },
        { search: orderNumber }
      );

      expect(result.data.some(o => o.orderNumber === orderNumber)).toBe(true);
    });

    it('should filter by paymentStatus', () => {
      const result = orderService.getPaginated(
        { page: 1, limit: 100 },
        { paymentStatus: PAYMENT_STATUS.PENDING }
      );

      result.data.forEach(o => {
        expect(o.paymentStatus).toBe(PAYMENT_STATUS.PENDING);
      });
    });

    it('should filter by customerId', () => {
      const orders = orderService.getAll();
      const customerId = orders[0].customerId;

      const result = orderService.getPaginated(
        { page: 1, limit: 100 },
        { customerId }
      );

      result.data.forEach(o => {
        expect(o.customerId).toBe(customerId);
      });
    });

    it('should filter by dateFrom', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = orderService.getPaginated(
        { page: 1, limit: 100 },
        { dateFrom: yesterday.toISOString() }
      );

      result.data.forEach(o => {
        expect(new Date(o.createdAt).getTime()).toBeGreaterThanOrEqual(yesterday.getTime());
      });
    });

    it('should filter by dateTo', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = orderService.getPaginated(
        { page: 1, limit: 100 },
        { dateTo: tomorrow.toISOString() }
      );

      result.data.forEach(o => {
        expect(new Date(o.createdAt).getTime()).toBeLessThanOrEqual(tomorrow.getTime());
      });
    });

    it('should sort by string field ascending', () => {
      const result = orderService.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'customerName',
        sortOrder: 'asc'
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].customerName.localeCompare(result.data[i-1].customerName)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort by string field descending', () => {
      const result = orderService.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'customerName',
        sortOrder: 'desc'
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].customerName.localeCompare(result.data[i-1].customerName)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort by numeric field ascending', () => {
      const result = orderService.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'total',
        sortOrder: 'asc'
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].total).toBeGreaterThanOrEqual(result.data[i-1].total);
      }
    });

    it('should sort by numeric field descending', () => {
      const result = orderService.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'total',
        sortOrder: 'desc'
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].total).toBeLessThanOrEqual(result.data[i-1].total);
      }
    });

    it('should calculate hasMore correctly', () => {
      const result = orderService.getPaginated({ page: 1, limit: 1 });

      if (result.total > 1) {
        expect(result.hasMore).toBe(true);
      }

      const lastPage = orderService.getPaginated({ page: result.totalPages, limit: 1 });
      expect(lastPage.hasMore).toBe(false);
    });
  });

  describe('create - additional fields', () => {
    it('should create order with shippingCost', () => {
      const newOrder = orderService.create({
        customerId: 'cust-ship',
        items: [
          { productId: 'p1', productName: 'Test', sku: 'T1', quantity: 1, unitPrice: 100, totalPrice: 100 },
        ],
        shippingAddress: { name: 'Test', company: null, address: '', city: '', region: null, postalCode: null, country: 'Lebanon', phone: null },
        shippingCost: 15,
      });

      expect(newOrder.shippingCost).toBe(15);
      expect(newOrder.total).toBe(115); // 100 + 15 shipping

      // Cleanup
      orderService.delete(newOrder.id);
    });

    it('should create order with discount', () => {
      const newOrder = orderService.create({
        customerId: 'cust-disc',
        items: [
          { productId: 'p1', productName: 'Test', sku: 'T1', quantity: 1, unitPrice: 100, totalPrice: 100 },
        ],
        shippingAddress: { name: 'Test', company: null, address: '', city: '', region: null, postalCode: null, country: 'Lebanon', phone: null },
        discount: 10,
      });

      expect(newOrder.discount).toBe(10);
      expect(newOrder.total).toBe(90); // 100 - 10 discount

      // Cleanup
      orderService.delete(newOrder.id);
    });

    it('should create order with customerNote', () => {
      const newOrder = orderService.create({
        customerId: 'cust-note',
        items: [],
        shippingAddress: { name: 'Test', company: null, address: '', city: '', region: null, postalCode: null, country: 'Lebanon', phone: null },
        customerNote: 'Please deliver in the morning',
      });

      expect(newOrder.customerNote).toBe('Please deliver in the morning');

      // Cleanup
      orderService.delete(newOrder.id);
    });

    it('should create order with internalNote', () => {
      const newOrder = orderService.create({
        customerId: 'cust-internal',
        items: [],
        shippingAddress: { name: 'Test', company: null, address: '', city: '', region: null, postalCode: null, country: 'Lebanon', phone: null },
        internalNote: 'VIP customer',
      });

      expect(newOrder.internalNote).toBe('VIP customer');

      // Cleanup
      orderService.delete(newOrder.id);
    });

    it('should calculate itemCount correctly', () => {
      const newOrder = orderService.create({
        customerId: 'cust-items',
        items: [
          { productId: 'p1', productName: 'Test1', sku: 'T1', quantity: 2, unitPrice: 50, totalPrice: 100 },
          { productId: 'p2', productName: 'Test2', sku: 'T2', quantity: 3, unitPrice: 30, totalPrice: 90 },
        ],
        shippingAddress: { name: 'Test', company: null, address: '', city: '', region: null, postalCode: null, country: 'Lebanon', phone: null },
      });

      expect(newOrder.itemCount).toBe(5); // 2 + 3
      expect(newOrder.subtotal).toBe(190); // 100 + 90

      // Cleanup
      orderService.delete(newOrder.id);
    });
  });

  describe('search - additional coverage', () => {
    it('should search by customer email', () => {
      const orders = orderService.getAll();
      const orderWithEmail = orders.find(o => o.customerEmail);

      if (orderWithEmail && orderWithEmail.customerEmail) {
        const results = orderService.search(orderWithEmail.customerEmail);
        expect(results.some(o => o.customerEmail === orderWithEmail.customerEmail)).toBe(true);
      }
    });
  });

  describe('updatePaymentStatus - additional coverage', () => {
    it('should not set paidAt for non-paid status', () => {
      const newOrder = orderService.create({
        customerId: 'cust-payment',
        items: [],
        shippingAddress: { name: 'Test', company: null, address: '', city: '', region: null, postalCode: null, country: 'Lebanon', phone: null },
      });

      const updated = orderService.updatePaymentStatus(newOrder.id, PAYMENT_STATUS.FAILED);
      expect(updated.paymentStatus).toBe(PAYMENT_STATUS.FAILED);
      expect(updated.paidAt).toBeNull();

      // Cleanup
      orderService.delete(newOrder.id);
    });
  });
});
