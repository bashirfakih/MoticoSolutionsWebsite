/**
 * Single Order API Route Tests
 *
 * Tests for /api/orders/[id] endpoint
 * GET - Fetch order details
 * PATCH - Update order status, payment, shipping
 * DELETE - Delete pending/cancelled orders
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockOrderFindUnique = jest.fn();
const mockOrderUpdate = jest.fn();
const mockOrderDelete = jest.fn();
const mockCustomerUpdate = jest.fn();
const mockInventoryLogFindFirst = jest.fn();
const mockInventoryLogCreate = jest.fn();
const mockProductFindUnique = jest.fn();
const mockProductUpdate = jest.fn();
const mockSiteSettingsFindFirst = jest.fn();
const mockTransaction = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findUnique: (...args: unknown[]) => mockOrderFindUnique(...args),
      update: (...args: unknown[]) => mockOrderUpdate(...args),
      delete: (...args: unknown[]) => mockOrderDelete(...args),
    },
    customer: {
      update: (...args: unknown[]) => mockCustomerUpdate(...args),
    },
    inventoryLog: {
      findFirst: (...args: unknown[]) => mockInventoryLogFindFirst(...args),
      create: (...args: unknown[]) => mockInventoryLogCreate(...args),
    },
    product: {
      findUnique: (...args: unknown[]) => mockProductFindUnique(...args),
      update: (...args: unknown[]) => mockProductUpdate(...args),
    },
    siteSettings: {
      findFirst: (...args: unknown[]) => mockSiteSettingsFindFirst(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

// Mock auth session
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Import route handlers after mocks
import { GET, PATCH, DELETE } from '@/app/api/orders/[id]/route';

describe('Orders [id] API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCustomerUpdate.mockResolvedValue({});
    // Default mocks for inventory service operations
    mockInventoryLogFindFirst.mockResolvedValue(null); // No existing restoration
    mockInventoryLogCreate.mockResolvedValue({});
    mockProductFindUnique.mockResolvedValue(null);
    mockProductUpdate.mockResolvedValue({});
    mockSiteSettingsFindFirst.mockResolvedValue({ lowStockThreshold: 10 });
    // Default mock for auth
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'admin' });
  });

  // ═══════════════════════════════════════════════════════════════
  // GET /api/orders/[id]
  // ═══════════════════════════════════════════════════════════════

  describe('GET /api/orders/[id]', () => {
    describe('Success (200)', () => {
      it('returns order with all details', async () => {
        const mockOrder = {
          id: 'order-1',
          orderNumber: 'ORD-2024-0001',
          customerName: 'John Doe',
          status: 'pending',
          subtotal: 100,
          shippingCost: 10,
          tax: 5,
          discount: 0,
          total: 115,
          customer: { id: 'cust-1', name: 'John', email: 'john@example.com', company: 'Acme', phone: '+961' },
          items: [
            { id: 'item-1', productName: 'Product', unitPrice: 50, totalPrice: 100, product: { id: 'p1', name: 'P', slug: 'p' } },
          ],
          quote: { id: 'quote-1', quoteNumber: 'QT-2024-0001' },
        };
        mockOrderFindUnique.mockResolvedValue(mockOrder);

        const request = createMockRequest('http://localhost/api/orders/order-1');
        const params = createRouteParams({ id: 'order-1' });

        const response = await GET(request as never, params);
        const data = await getResponseJson(response) as { id: string; subtotal: number; items: { unitPrice: number }[] };

        expect(response.status).toBe(200);
        expect(data.id).toBe('order-1');
        expect(typeof data.subtotal).toBe('number');
        expect(typeof data.items[0].unitPrice).toBe('number');
      });

      it('transforms Decimal fields to numbers', async () => {
        mockOrderFindUnique.mockResolvedValue({
          id: 'order-1',
          subtotal: 100.50,
          shippingCost: 15.00,
          tax: 8.25,
          discount: 5.00,
          total: 118.75,
          items: [{ unitPrice: 50.25, totalPrice: 100.50 }],
        });

        const request = createMockRequest('http://localhost/api/orders/order-1');
        const params = createRouteParams({ id: 'order-1' });

        const response = await GET(request as never, params);
        const data = await getResponseJson(response) as { subtotal: number; shippingCost: number; tax: number; discount: number; total: number };

        expect(data.subtotal).toBe(100.5);
        expect(data.shippingCost).toBe(15);
        expect(data.tax).toBe(8.25);
        expect(data.discount).toBe(5);
        expect(data.total).toBe(118.75);
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when order does not exist', async () => {
        mockOrderFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/orders/non-existent');
        const params = createRouteParams({ id: 'non-existent' });

        const response = await GET(request as never, params);
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Order not found' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockOrderFindUnique.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/orders/order-1');
        const params = createRouteParams({ id: 'order-1' });

        const response = await GET(request as never, params);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch order' });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PATCH /api/orders/[id]
  // ═══════════════════════════════════════════════════════════════

  describe('PATCH /api/orders/[id]', () => {
    const existingOrder = {
      id: 'order-1',
      status: 'pending',
      paymentStatus: 'pending',
      subtotal: 100,
      shippingCost: 10,
      tax: 5,
      discount: 0,
      total: 115,
      shippedAt: null,
      deliveredAt: null,
      paidAt: null,
    };

    describe('Success (200)', () => {
      it('updates order status', async () => {
        mockOrderFindUnique.mockResolvedValue(existingOrder);
        mockOrderUpdate.mockResolvedValue({
          ...existingOrder,
          status: 'confirmed',
          items: [],
        });

        const request = createMockRequest('http://localhost/api/orders/order-1', {
          method: 'PATCH',
          body: { status: 'confirmed' },
        });
        const params = createRouteParams({ id: 'order-1' });

        const response = await PATCH(request as never, params);

        expect(response.status).toBe(200);
        expect(mockOrderUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ status: 'confirmed' }),
          })
        );
      });

      it('sets shippedAt when status changes to shipped', async () => {
        mockOrderFindUnique.mockResolvedValue(existingOrder);
        mockOrderUpdate.mockResolvedValue({
          ...existingOrder,
          status: 'shipped',
          shippedAt: new Date(),
          items: [],
        });

        const request = createMockRequest('http://localhost/api/orders/order-1', {
          method: 'PATCH',
          body: { status: 'shipped' },
        });
        const params = createRouteParams({ id: 'order-1' });

        await PATCH(request as never, params);

        expect(mockOrderUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              status: 'shipped',
              shippedAt: expect.any(Date),
            }),
          })
        );
      });

      it('sets deliveredAt when status changes to delivered', async () => {
        mockOrderFindUnique.mockResolvedValue({ ...existingOrder, status: 'shipped' });
        mockOrderUpdate.mockResolvedValue({
          ...existingOrder,
          status: 'delivered',
          deliveredAt: new Date(),
          items: [],
        });

        const request = createMockRequest('http://localhost/api/orders/order-1', {
          method: 'PATCH',
          body: { status: 'delivered' },
        });
        const params = createRouteParams({ id: 'order-1' });

        await PATCH(request as never, params);

        expect(mockOrderUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              status: 'delivered',
              deliveredAt: expect.any(Date),
            }),
          })
        );
      });

      it('updates payment status', async () => {
        mockOrderFindUnique.mockResolvedValue(existingOrder);
        mockOrderUpdate.mockResolvedValue({
          ...existingOrder,
          paymentStatus: 'paid',
          items: [],
        });

        const request = createMockRequest('http://localhost/api/orders/order-1', {
          method: 'PATCH',
          body: { paymentStatus: 'paid' },
        });
        const params = createRouteParams({ id: 'order-1' });

        await PATCH(request as never, params);

        expect(mockOrderUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              paymentStatus: 'paid',
              paidAt: expect.any(Date),
            }),
          })
        );
      });

      it('recalculates total when shipping cost changes', async () => {
        mockOrderFindUnique.mockResolvedValue(existingOrder);
        mockOrderUpdate.mockResolvedValue({
          ...existingOrder,
          shippingCost: 20,
          total: 125,
          items: [],
        });

        const request = createMockRequest('http://localhost/api/orders/order-1', {
          method: 'PATCH',
          body: { shippingCost: 20 },
        });
        const params = createRouteParams({ id: 'order-1' });

        await PATCH(request as never, params);

        expect(mockOrderUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              shippingCost: 20,
              total: 125, // 100 + 20 + 5 - 0
            }),
          })
        );
      });

      it('recalculates total when discount changes', async () => {
        mockOrderFindUnique.mockResolvedValue(existingOrder);
        mockOrderUpdate.mockResolvedValue({
          ...existingOrder,
          discount: 15,
          total: 100,
          items: [],
        });

        const request = createMockRequest('http://localhost/api/orders/order-1', {
          method: 'PATCH',
          body: { discount: 15 },
        });
        const params = createRouteParams({ id: 'order-1' });

        await PATCH(request as never, params);

        expect(mockOrderUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              discount: 15,
              total: 100, // 100 + 10 + 5 - 15
            }),
          })
        );
      });

      it('updates shipping address', async () => {
        mockOrderFindUnique.mockResolvedValue(existingOrder);
        mockOrderUpdate.mockResolvedValue({ ...existingOrder, items: [] });

        const shippingAddress = { street: '123 Main', city: 'Beirut', country: 'Lebanon' };

        const request = createMockRequest('http://localhost/api/orders/order-1', {
          method: 'PATCH',
          body: { shippingAddress },
        });
        const params = createRouteParams({ id: 'order-1' });

        await PATCH(request as never, params);

        expect(mockOrderUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ shippingAddress }),
          })
        );
      });

      it('updates internal note', async () => {
        mockOrderFindUnique.mockResolvedValue(existingOrder);
        mockOrderUpdate.mockResolvedValue({ ...existingOrder, items: [] });

        const request = createMockRequest('http://localhost/api/orders/order-1', {
          method: 'PATCH',
          body: { internalNote: 'Rush order' },
        });
        const params = createRouteParams({ id: 'order-1' });

        await PATCH(request as never, params);

        expect(mockOrderUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ internalNote: 'Rush order' }),
          })
        );
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when order does not exist', async () => {
        mockOrderFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/orders/non-existent', {
          method: 'PATCH',
          body: { status: 'confirmed' },
        });
        const params = createRouteParams({ id: 'non-existent' });

        const response = await PATCH(request as never, params);
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Order not found' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on update failure', async () => {
        mockOrderFindUnique.mockResolvedValue(existingOrder);
        mockOrderUpdate.mockRejectedValue(new Error('Update failed'));

        const request = createMockRequest('http://localhost/api/orders/order-1', {
          method: 'PATCH',
          body: { status: 'confirmed' },
        });
        const params = createRouteParams({ id: 'order-1' });

        const response = await PATCH(request as never, params);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to update order' });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // DELETE /api/orders/[id]
  // ═══════════════════════════════════════════════════════════════

  describe('DELETE /api/orders/[id]', () => {
    describe('Success (200)', () => {
      it('deletes pending order', async () => {
        // First call: route handler checks if order exists and status
        // Second call: processOrderStockRestore gets order with items
        mockOrderFindUnique
          .mockResolvedValueOnce({
            id: 'order-1',
            status: 'pending',
            paymentStatus: 'pending',
            customerId: 'cust-1',
            total: 100,
          })
          .mockResolvedValueOnce({
            id: 'order-1',
            items: [], // No items - no stock to restore
          });
        mockOrderDelete.mockResolvedValue({});

        // Mock transaction for stock restore
        mockTransaction.mockImplementation(async (fn) => {
          const mockTx = {
            product: {
              findUnique: jest.fn().mockResolvedValue(null),
              update: jest.fn(),
            },
            inventoryLog: {
              create: jest.fn(),
            },
            siteSettings: {
              findFirst: jest.fn().mockResolvedValue({ lowStockThreshold: 10 }),
            },
          };
          return fn(mockTx);
        });

        const request = createMockRequest('http://localhost/api/orders/order-1', { method: 'DELETE' });
        const params = createRouteParams({ id: 'order-1' });

        const response = await DELETE(request as never, params);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data).toEqual({ success: true });
        expect(mockOrderDelete).toHaveBeenCalledWith({ where: { id: 'order-1' } });
      });

      it('deletes cancelled order', async () => {
        // Cancelled orders don't need stock restoration (already restored on cancel)
        mockOrderFindUnique.mockResolvedValue({
          id: 'order-1',
          status: 'cancelled',
          paymentStatus: 'pending',
          customerId: 'cust-1',
        });
        mockOrderDelete.mockResolvedValue({});

        const request = createMockRequest('http://localhost/api/orders/order-1', { method: 'DELETE' });
        const params = createRouteParams({ id: 'order-1' });

        const response = await DELETE(request as never, params);

        expect(response.status).toBe(200);
        expect(mockOrderDelete).toHaveBeenCalled();
      });

      it('decrements customer stats for paid deleted orders', async () => {
        // First call: route handler checks if order exists
        // Second call: processOrderStockRestore gets order with items
        mockOrderFindUnique
          .mockResolvedValueOnce({
            id: 'order-1',
            status: 'pending',
            paymentStatus: 'paid',
            customerId: 'cust-1',
            total: 150,
          })
          .mockResolvedValueOnce({
            id: 'order-1',
            items: [], // No items
          });
        mockOrderDelete.mockResolvedValue({});

        // Mock transaction for stock restore
        mockTransaction.mockImplementation(async (fn) => {
          const mockTx = {
            product: {
              findUnique: jest.fn().mockResolvedValue(null),
              update: jest.fn(),
            },
            inventoryLog: {
              create: jest.fn(),
            },
            siteSettings: {
              findFirst: jest.fn().mockResolvedValue({ lowStockThreshold: 10 }),
            },
          };
          return fn(mockTx);
        });

        const request = createMockRequest('http://localhost/api/orders/order-1', { method: 'DELETE' });
        const params = createRouteParams({ id: 'order-1' });

        await DELETE(request as never, params);

        expect(mockCustomerUpdate).toHaveBeenCalledWith({
          where: { id: 'cust-1' },
          data: {
            totalOrders: { decrement: 1 },
            totalSpent: { decrement: 150 },
          },
        });
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when deleting confirmed order', async () => {
        mockOrderFindUnique.mockResolvedValue({
          id: 'order-1',
          status: 'confirmed',
          customerId: 'cust-1',
        });

        const request = createMockRequest('http://localhost/api/orders/order-1', { method: 'DELETE' });
        const params = createRouteParams({ id: 'order-1' });

        const response = await DELETE(request as never, params);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Can only delete pending or cancelled orders' });
      });

      it('returns 400 when deleting shipped order', async () => {
        mockOrderFindUnique.mockResolvedValue({
          id: 'order-1',
          status: 'shipped',
          customerId: 'cust-1',
        });

        const request = createMockRequest('http://localhost/api/orders/order-1', { method: 'DELETE' });
        const params = createRouteParams({ id: 'order-1' });

        const response = await DELETE(request as never, params);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Can only delete pending or cancelled orders' });
      });

      it('returns 400 when deleting delivered order', async () => {
        mockOrderFindUnique.mockResolvedValue({
          id: 'order-1',
          status: 'delivered',
          customerId: 'cust-1',
        });

        const request = createMockRequest('http://localhost/api/orders/order-1', { method: 'DELETE' });
        const params = createRouteParams({ id: 'order-1' });

        const response = await DELETE(request as never, params);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Can only delete pending or cancelled orders' });
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when order does not exist', async () => {
        mockOrderFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/orders/non-existent', { method: 'DELETE' });
        const params = createRouteParams({ id: 'non-existent' });

        const response = await DELETE(request as never, params);
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Order not found' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on deletion failure', async () => {
        mockOrderFindUnique.mockResolvedValue({
          id: 'order-1',
          status: 'pending',
          paymentStatus: 'pending',
          customerId: 'cust-1',
        });
        mockOrderDelete.mockRejectedValue(new Error('Delete failed'));

        const request = createMockRequest('http://localhost/api/orders/order-1', { method: 'DELETE' });
        const params = createRouteParams({ id: 'order-1' });

        const response = await DELETE(request as never, params);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to delete order' });
      });
    });
  });
});
