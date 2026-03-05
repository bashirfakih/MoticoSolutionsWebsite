/**
 * Order Tracking API Route Tests
 *
 * Tests GET /api/orders/track
 * Public endpoint for customers to track their orders
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockOrderFindFirst = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findFirst: (...args: unknown[]) => mockOrderFindFirst(...args),
    },
  },
}));

// Import route handler after mocks
import { GET } from '@/app/api/orders/track/route';

describe('GET /api/orders/track', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Errors (400)', () => {
    it('returns 400 when orderNumber is missing', async () => {
      const request = createMockRequest('http://localhost/api/orders/track?email=test@example.com');

      const response = await GET(request as never);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Order number and email are required' });
    });

    it('returns 400 when email is missing', async () => {
      const request = createMockRequest('http://localhost/api/orders/track?orderNumber=ORD-2024-0001');

      const response = await GET(request as never);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Order number and email are required' });
    });

    it('returns 400 when both params are missing', async () => {
      const request = createMockRequest('http://localhost/api/orders/track');

      const response = await GET(request as never);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Order number and email are required' });
    });
  });

  describe('Not Found (404)', () => {
    it('returns 404 when order not found', async () => {
      mockOrderFindFirst.mockResolvedValue(null);

      const request = createMockRequest(
        'http://localhost/api/orders/track?orderNumber=ORD-2024-0001&email=test@example.com'
      );

      const response = await GET(request as never);
      const data = await getResponseJson(response);

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Order not found. Please check your order number and email.' });
    });

    it('normalizes order number and email for search', async () => {
      mockOrderFindFirst.mockResolvedValue(null);

      const request = createMockRequest(
        'http://localhost/api/orders/track?orderNumber=ord-2024-0001&email=TEST@Example.COM'
      );

      await GET(request as never);

      expect(mockOrderFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            orderNumber: 'ORD-2024-0001',
            customerEmail: 'test@example.com',
          },
        })
      );
    });
  });

  describe('Success (200)', () => {
    const mockOrder = {
      id: 'order-1',
      orderNumber: 'ORD-2024-0001',
      customerName: 'John Doe',
      status: 'shipped',
      paymentStatus: 'paid',
      itemCount: 3,
      subtotal: 100,
      shippingCost: 10,
      tax: 5,
      discount: 0,
      total: 115,
      currency: 'USD',
      shippingAddress: { street: '123 Main', city: 'Beirut' },
      createdAt: new Date('2024-02-01'),
      paidAt: new Date('2024-02-01'),
      shippedAt: new Date('2024-02-05'),
      deliveredAt: null,
      items: [
        {
          id: 'item-1',
          productName: 'Abrasive Belt',
          productSku: 'AB-001',
          variantName: null,
          quantity: 2,
          unitPrice: 50,
          totalPrice: 100,
        },
      ],
    };

    it('returns order details with timeline', async () => {
      mockOrderFindFirst.mockResolvedValue(mockOrder);

      const request = createMockRequest(
        'http://localhost/api/orders/track?orderNumber=ORD-2024-0001&email=john@example.com'
      );

      const response = await GET(request as never);
      const data = await getResponseJson(response) as {
        order: typeof mockOrder & { subtotal: number };
        timeline: { status: string; completed: boolean; current: boolean }[];
      };

      expect(response.status).toBe(200);
      expect(data.order.orderNumber).toBe('ORD-2024-0001');
      expect(data.order.status).toBe('shipped');
      expect(data.timeline).toBeDefined();
      expect(Array.isArray(data.timeline)).toBe(true);
    });

    it('transforms Decimal fields to numbers', async () => {
      mockOrderFindFirst.mockResolvedValue(mockOrder);

      const request = createMockRequest(
        'http://localhost/api/orders/track?orderNumber=ORD-2024-0001&email=john@example.com'
      );

      const response = await GET(request as never);
      const data = await getResponseJson(response) as { order: { subtotal: number; items: { unitPrice: number }[] } };

      expect(typeof data.order.subtotal).toBe('number');
      expect(data.order.subtotal).toBe(100);
      expect(typeof data.order.items[0].unitPrice).toBe('number');
    });

    it('builds correct timeline for pending order', async () => {
      mockOrderFindFirst.mockResolvedValue({
        ...mockOrder,
        status: 'pending',
        shippedAt: null,
        deliveredAt: null,
      });

      const request = createMockRequest(
        'http://localhost/api/orders/track?orderNumber=ORD-2024-0001&email=john@example.com'
      );

      const response = await GET(request as never);
      const data = await getResponseJson(response) as {
        timeline: { status: string; completed: boolean; current: boolean }[];
      };

      const pendingStep = data.timeline.find(t => t.status === 'pending');
      const shippedStep = data.timeline.find(t => t.status === 'shipped');

      expect(pendingStep?.completed).toBe(true);
      expect(pendingStep?.current).toBe(true);
      expect(shippedStep?.completed).toBe(false);
      expect(shippedStep?.current).toBe(false);
    });

    it('builds correct timeline for shipped order', async () => {
      mockOrderFindFirst.mockResolvedValue(mockOrder);

      const request = createMockRequest(
        'http://localhost/api/orders/track?orderNumber=ORD-2024-0001&email=john@example.com'
      );

      const response = await GET(request as never);
      const data = await getResponseJson(response) as {
        timeline: { status: string; completed: boolean; current: boolean }[];
      };

      const shippedStep = data.timeline.find(t => t.status === 'shipped');
      const deliveredStep = data.timeline.find(t => t.status === 'delivered');

      expect(shippedStep?.completed).toBe(true);
      expect(shippedStep?.current).toBe(true);
      expect(deliveredStep?.completed).toBe(false);
      expect(deliveredStep?.current).toBe(false);
    });

    it('builds correct timeline for delivered order', async () => {
      mockOrderFindFirst.mockResolvedValue({
        ...mockOrder,
        status: 'delivered',
        deliveredAt: new Date('2024-02-10'),
      });

      const request = createMockRequest(
        'http://localhost/api/orders/track?orderNumber=ORD-2024-0001&email=john@example.com'
      );

      const response = await GET(request as never);
      const data = await getResponseJson(response) as {
        timeline: { status: string; completed: boolean; current: boolean }[];
      };

      const deliveredStep = data.timeline.find(t => t.status === 'delivered');
      expect(deliveredStep?.completed).toBe(true);
      expect(deliveredStep?.current).toBe(true);
    });

    it('adds cancelled status to timeline when order is cancelled', async () => {
      mockOrderFindFirst.mockResolvedValue({
        ...mockOrder,
        status: 'cancelled',
        shippedAt: null,
        deliveredAt: null,
      });

      const request = createMockRequest(
        'http://localhost/api/orders/track?orderNumber=ORD-2024-0001&email=john@example.com'
      );

      const response = await GET(request as never);
      const data = await getResponseJson(response) as {
        timeline: { status: string; label: string; current: boolean }[];
      };

      const cancelledStep = data.timeline.find(t => t.status === 'cancelled');
      expect(cancelledStep).toBeDefined();
      expect(cancelledStep?.label).toBe('Cancelled');
      expect(cancelledStep?.current).toBe(true);
    });

    it('adds refunded status to timeline when order is refunded', async () => {
      mockOrderFindFirst.mockResolvedValue({
        ...mockOrder,
        status: 'refunded',
        shippedAt: null,
        deliveredAt: null,
      });

      const request = createMockRequest(
        'http://localhost/api/orders/track?orderNumber=ORD-2024-0001&email=john@example.com'
      );

      const response = await GET(request as never);
      const data = await getResponseJson(response) as {
        timeline: { status: string; label: string; current: boolean }[];
      };

      const refundedStep = data.timeline.find(t => t.status === 'refunded');
      expect(refundedStep).toBeDefined();
      expect(refundedStep?.label).toBe('Refunded');
      expect(refundedStep?.current).toBe(true);
    });

    it('includes all order items in response', async () => {
      const multiItemOrder = {
        ...mockOrder,
        items: [
          { id: 'item-1', productName: 'Belt A', productSku: 'BA', variantName: null, quantity: 2, unitPrice: 25, totalPrice: 50 },
          { id: 'item-2', productName: 'Belt B', productSku: 'BB', variantName: '80 Grit', quantity: 1, unitPrice: 50, totalPrice: 50 },
        ],
      };
      mockOrderFindFirst.mockResolvedValue(multiItemOrder);

      const request = createMockRequest(
        'http://localhost/api/orders/track?orderNumber=ORD-2024-0001&email=john@example.com'
      );

      const response = await GET(request as never);
      const data = await getResponseJson(response) as { order: { items: { productName: string }[] } };

      expect(data.order.items).toHaveLength(2);
      expect(data.order.items[0].productName).toBe('Belt A');
      expect(data.order.items[1].productName).toBe('Belt B');
    });
  });

  describe('Server Error (500)', () => {
    it('returns 500 on database error', async () => {
      mockOrderFindFirst.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest(
        'http://localhost/api/orders/track?orderNumber=ORD-2024-0001&email=test@example.com'
      );

      const response = await GET(request as never);
      const data = await getResponseJson(response);

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to track order' });
    });
  });
});
