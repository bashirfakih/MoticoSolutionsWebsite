/**
 * Orders API Route Tests
 *
 * Tests for /api/orders and /api/orders/[id] endpoints
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockOrderFindMany = jest.fn();
const mockOrderFindUnique = jest.fn();
const mockOrderCreate = jest.fn();
const mockOrderUpdate = jest.fn();
const mockOrderDelete = jest.fn();
const mockOrderCount = jest.fn();
const mockCustomerFindUnique = jest.fn();
const mockCustomerUpdate = jest.fn();
const mockSiteSettingsFind = jest.fn();
const mockProductFindUnique = jest.fn();
const mockTransaction = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findMany: (...args: unknown[]) => mockOrderFindMany(...args),
      findUnique: (...args: unknown[]) => mockOrderFindUnique(...args),
      create: (...args: unknown[]) => mockOrderCreate(...args),
      update: (...args: unknown[]) => mockOrderUpdate(...args),
      delete: (...args: unknown[]) => mockOrderDelete(...args),
      count: (...args: unknown[]) => mockOrderCount(...args),
    },
    customer: {
      findUnique: (...args: unknown[]) => mockCustomerFindUnique(...args),
      update: (...args: unknown[]) => mockCustomerUpdate(...args),
    },
    siteSettings: {
      findFirst: (...args: unknown[]) => mockSiteSettingsFind(...args),
    },
    product: {
      findUnique: (...args: unknown[]) => mockProductFindUnique(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/orders/route';

describe('Orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCustomerUpdate.mockResolvedValue({});
    // Default: inventory tracking disabled to simplify existing tests
    mockSiteSettingsFind.mockResolvedValue({
      trackInventory: false,
      allowBackorders: false,
      lowStockThreshold: 10,
    });
    // Set up transaction mock to execute the callback with mock transaction client
    mockTransaction.mockImplementation(async (fn) => {
      const mockTx = {
        order: {
          create: mockOrderCreate,
        },
        customer: {
          update: mockCustomerUpdate,
        },
        product: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
        siteSettings: {
          findFirst: jest.fn().mockResolvedValue({ lowStockThreshold: 10 }),
        },
        inventoryLog: {
          create: jest.fn(),
        },
        productVariant: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
      };
      return fn(mockTx);
    });
  });

  describe('GET /api/orders', () => {
    describe('Success (200)', () => {
      it('returns paginated orders list', async () => {
        const mockOrders = [
          {
            id: 'order-1',
            orderNumber: 'ORD-2024-0001',
            customerName: 'John Doe',
            subtotal: 100,
            shippingCost: 10,
            tax: 5,
            discount: 0,
            total: 115,
            customer: { id: 'cust-1', name: 'John', email: 'john@example.com' },
            _count: { items: 3 },
          },
        ];
        mockOrderFindMany.mockResolvedValue(mockOrders);
        mockOrderCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/orders');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: unknown[]; total: number };

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(1);
        expect(data.total).toBe(1);
      });

      it('transforms Decimal fields to numbers and itemCount', async () => {
        mockOrderFindMany.mockResolvedValue([
          {
            id: 'order-1',
            subtotal: 100.50,
            shippingCost: 15.00,
            tax: 8.25,
            discount: 5.00,
            total: 118.75,
            _count: { items: 5 },
          },
        ]);
        mockOrderCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/orders');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: { subtotal: number; itemCount: number; _count?: unknown }[] };

        expect(typeof data.data[0].subtotal).toBe('number');
        expect(data.data[0].itemCount).toBe(5);
        expect(data.data[0]._count).toBeUndefined();
      });

      it('filters by search query', async () => {
        mockOrderFindMany.mockResolvedValue([]);
        mockOrderCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/orders?search=ORD-2024');
        await GET(request);

        expect(mockOrderFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                { orderNumber: { contains: 'ORD-2024', mode: 'insensitive' } },
                { customerName: { contains: 'ORD-2024', mode: 'insensitive' } },
              ]),
            }),
          })
        );
      });

      it('filters by status', async () => {
        mockOrderFindMany.mockResolvedValue([]);
        mockOrderCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/orders?status=pending');
        await GET(request);

        expect(mockOrderFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ status: 'pending' }),
          })
        );
      });

      it('filters by payment status', async () => {
        mockOrderFindMany.mockResolvedValue([]);
        mockOrderCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/orders?paymentStatus=paid');
        await GET(request);

        expect(mockOrderFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ paymentStatus: 'paid' }),
          })
        );
      });

      it('filters by customerId', async () => {
        mockOrderFindMany.mockResolvedValue([]);
        mockOrderCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/orders?customerId=cust-1');
        await GET(request);

        expect(mockOrderFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ customerId: 'cust-1' }),
          })
        );
      });

      it('filters by date range', async () => {
        mockOrderFindMany.mockResolvedValue([]);
        mockOrderCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/orders?fromDate=2024-01-01&toDate=2024-12-31');
        await GET(request);

        expect(mockOrderFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              createdAt: expect.objectContaining({
                gte: expect.any(Date),
                lte: expect.any(Date),
              }),
            }),
          })
        );
      });

      it('supports pagination', async () => {
        mockOrderFindMany.mockResolvedValue([]);
        mockOrderCount.mockResolvedValue(50);

        const request = createMockRequest('http://localhost/api/orders?page=2&limit=10');
        const response = await GET(request);
        const data = await getResponseJson(response) as { page: number; limit: number; totalPages: number };

        expect(data.page).toBe(2);
        expect(data.limit).toBe(10);
        expect(data.totalPages).toBe(5);
      });

      it('supports sorting', async () => {
        mockOrderFindMany.mockResolvedValue([]);
        mockOrderCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/orders?sortBy=total&sortOrder=desc');
        await GET(request);

        expect(mockOrderFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { total: 'desc' },
          })
        );
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockOrderCount.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/orders');
        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch orders' });
      });
    });
  });

  describe('POST /api/orders', () => {
    describe('Success (201)', () => {
      it('creates a new order', async () => {
        const customer = { id: 'cust-1', name: 'John Doe', email: 'john@example.com', phone: '123' };
        mockCustomerFindUnique.mockResolvedValue(customer);
        mockOrderCreate.mockResolvedValue({
          id: 'order-new',
          orderNumber: 'ORD-2024-0001',
          subtotal: 100,
          shippingCost: 10,
          tax: 5,
          discount: 0,
          total: 115,
          customer,
          items: [
            { id: 'item-1', unitPrice: 50, totalPrice: 100 },
          ],
        });

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'cust-1',
            items: [
              { productId: 'prod-1', productName: 'Product', productSku: 'SKU-1', quantity: 2, unitPrice: 50, totalPrice: 100 },
            ],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response) as { id: string; orderNumber: string };

        expect(response.status).toBe(201);
        expect(data.id).toBe('order-new');
        expect(data.orderNumber).toMatch(/^ORD-\d{4}-\d{4}$/);
      });

      it('generates unique order number', async () => {
        mockCustomerFindUnique.mockResolvedValue({ id: 'cust-1', name: 'Test', email: 'test@test.com' });
        mockOrderCreate.mockResolvedValue({
          id: 'order-1',
          orderNumber: 'ORD-2024-1234',
          subtotal: 100,
          shippingCost: 0,
          tax: 0,
          discount: 0,
          total: 100,
          items: [],
        });

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'cust-1',
            items: [{ productId: 'p1', productName: 'P', productSku: 'S', quantity: 1, unitPrice: 100, totalPrice: 100 }],
          },
        });
        await POST(request);

        expect(mockOrderCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              orderNumber: expect.stringMatching(/^ORD-\d{4}-\d{4}$/),
            }),
          })
        );
      });

      it('updates customer stats after order creation', async () => {
        mockCustomerFindUnique.mockResolvedValue({ id: 'cust-1', name: 'Test', email: 'test@test.com' });
        mockOrderCreate.mockResolvedValue({
          id: 'order-1',
          subtotal: 100,
          shippingCost: 10,
          tax: 5,
          discount: 0,
          total: 115,
          items: [],
        });

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'cust-1',
            items: [{ productId: 'p1', productName: 'P', productSku: 'S', quantity: 1, unitPrice: 100, totalPrice: 100 }],
            shippingCost: 10,
            tax: 5,
          },
        });
        await POST(request);

        expect(mockCustomerUpdate).toHaveBeenCalledWith({
          where: { id: 'cust-1' },
          data: expect.objectContaining({
            totalOrders: { increment: 1 },
            totalSpent: { increment: 115 },
          }),
        });
      });

      it('creates order with shipping address', async () => {
        mockCustomerFindUnique.mockResolvedValue({ id: 'cust-1', name: 'Test', email: 'test@test.com' });
        mockOrderCreate.mockResolvedValue({
          id: 'order-1',
          subtotal: 100,
          shippingCost: 0,
          tax: 0,
          discount: 0,
          total: 100,
          items: [],
        });

        const shippingAddress = {
          street: '123 Main St',
          city: 'Beirut',
          country: 'Lebanon',
        };

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'cust-1',
            items: [{ productId: 'p1', productName: 'P', productSku: 'S', quantity: 1, unitPrice: 100, totalPrice: 100 }],
            shippingAddress,
          },
        });
        await POST(request);

        expect(mockOrderCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              shippingAddress,
            }),
          })
        );
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when customerId is missing', async () => {
        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            items: [{ productId: 'p1', productName: 'P', productSku: 'S', quantity: 1, unitPrice: 100, totalPrice: 100 }],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Customer and items are required' });
      });

      it('returns 400 when items are missing', async () => {
        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: { customerId: 'cust-1' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Customer and items are required' });
      });

      it('returns 400 when items array is empty', async () => {
        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: { customerId: 'cust-1', items: [] },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Customer and items are required' });
      });

      it('returns 400 when customer not found', async () => {
        mockCustomerFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'non-existent',
            items: [{ productId: 'p1', productName: 'P', productSku: 'S', quantity: 1, unitPrice: 100, totalPrice: 100 }],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Customer not found' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on creation failure', async () => {
        mockCustomerFindUnique.mockResolvedValue({ id: 'cust-1', name: 'Test', email: 'test@test.com' });
        mockOrderCreate.mockRejectedValue(new Error('Create failed'));

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'cust-1',
            items: [{ productId: 'p1', productName: 'P', productSku: 'S', quantity: 1, unitPrice: 100, totalPrice: 100 }],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to create order' });
      });
    });
  });
});
