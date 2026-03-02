/**
 * Quotes API Route Tests
 *
 * Tests for /api/quotes and /api/quotes/[id] endpoints
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockQuoteFindMany = jest.fn();
const mockQuoteFindUnique = jest.fn();
const mockQuoteCreate = jest.fn();
const mockQuoteUpdate = jest.fn();
const mockQuoteCount = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    quote: {
      findMany: (...args: unknown[]) => mockQuoteFindMany(...args),
      findUnique: (...args: unknown[]) => mockQuoteFindUnique(...args),
      create: (...args: unknown[]) => mockQuoteCreate(...args),
      update: (...args: unknown[]) => mockQuoteUpdate(...args),
      count: (...args: unknown[]) => mockQuoteCount(...args),
    },
  },
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/quotes/route';

describe('Quotes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/quotes', () => {
    describe('Success (200)', () => {
      it('returns paginated quotes list', async () => {
        const mockQuotes = [
          {
            id: 'quote-1',
            quoteNumber: 'QT-2024-0001',
            customerName: 'John Doe',
            subtotal: 500,
            discount: 0,
            total: 500,
            customer: { id: 'cust-1', name: 'John', email: 'john@example.com' },
            _count: { items: 3 },
          },
        ];
        mockQuoteFindMany.mockResolvedValue(mockQuotes);
        mockQuoteCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/quotes');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: unknown[]; total: number };

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(1);
        expect(data.total).toBe(1);
      });

      it('transforms Decimal fields and itemCount', async () => {
        mockQuoteFindMany.mockResolvedValue([
          { id: 'quote-1', subtotal: 500.50, discount: 25.00, total: 475.50, _count: { items: 5 } },
        ]);
        mockQuoteCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/quotes');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: { subtotal: number; itemCount: number; _count?: unknown }[] };

        expect(typeof data.data[0].subtotal).toBe('number');
        expect(data.data[0].itemCount).toBe(5);
        expect(data.data[0]._count).toBeUndefined();
      });

      it('filters by search query', async () => {
        mockQuoteFindMany.mockResolvedValue([]);
        mockQuoteCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/quotes?search=QT-2024');
        await GET(request);

        expect(mockQuoteFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                { quoteNumber: { contains: 'QT-2024', mode: 'insensitive' } },
                { customerName: { contains: 'QT-2024', mode: 'insensitive' } },
              ]),
            }),
          })
        );
      });

      it('filters by status', async () => {
        mockQuoteFindMany.mockResolvedValue([]);
        mockQuoteCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/quotes?status=pending');
        await GET(request);

        expect(mockQuoteFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ status: 'pending' }),
          })
        );
      });

      it('filters by customerId', async () => {
        mockQuoteFindMany.mockResolvedValue([]);
        mockQuoteCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/quotes?customerId=cust-1');
        await GET(request);

        expect(mockQuoteFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ customerId: 'cust-1' }),
          })
        );
      });

      it('supports pagination', async () => {
        mockQuoteFindMany.mockResolvedValue([]);
        mockQuoteCount.mockResolvedValue(50);

        const request = createMockRequest('http://localhost/api/quotes?page=2&limit=10');
        const response = await GET(request);
        const data = await getResponseJson(response) as { page: number; totalPages: number };

        expect(data.page).toBe(2);
        expect(data.totalPages).toBe(5);
      });

      it('supports sorting', async () => {
        mockQuoteFindMany.mockResolvedValue([]);
        mockQuoteCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/quotes?sortBy=total&sortOrder=desc');
        await GET(request);

        expect(mockQuoteFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { total: 'desc' },
          })
        );
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockQuoteCount.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/quotes');
        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch quotes' });
      });
    });
  });

  describe('POST /api/quotes', () => {
    describe('Success (201)', () => {
      it('creates a new quote request', async () => {
        mockQuoteCreate.mockResolvedValue({
          id: 'quote-new',
          quoteNumber: 'QT-2024-0001',
          subtotal: null,
          discount: 0,
          total: null,
          items: [{ id: 'item-1', productName: 'Product', quantity: 2 }],
        });

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            items: [{ productName: 'Product', quantity: 2 }],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response) as { id: string; quoteNumber: string };

        expect(response.status).toBe(201);
        expect(data.id).toBe('quote-new');
        expect(data.quoteNumber).toMatch(/^QT-\d{4}-\d{4}$/);
      });

      it('generates unique quote number', async () => {
        mockQuoteCreate.mockResolvedValue({
          id: 'quote-1',
          quoteNumber: 'QT-2024-1234',
          subtotal: null,
          discount: 0,
          total: null,
          items: [],
        });

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Test',
            customerEmail: 'test@example.com',
            items: [{ productName: 'P', quantity: 1 }],
          },
        });
        await POST(request);

        expect(mockQuoteCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              quoteNumber: expect.stringMatching(/^QT-\d{4}-\d{4}$/),
              status: 'pending',
            }),
          })
        );
      });

      it('creates quote with linked customer', async () => {
        mockQuoteCreate.mockResolvedValue({
          id: 'quote-1',
          subtotal: null,
          discount: 0,
          total: null,
          items: [],
        });

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Test',
            customerEmail: 'test@example.com',
            customerId: 'cust-1',
            items: [{ productName: 'P', quantity: 1 }],
          },
        });
        await POST(request);

        expect(mockQuoteCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              customerId: 'cust-1',
            }),
          })
        );
      });

      it('creates quote items with product references', async () => {
        mockQuoteCreate.mockResolvedValue({
          id: 'quote-1',
          subtotal: null,
          discount: 0,
          total: null,
          items: [],
        });

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Test',
            customerEmail: 'test@example.com',
            items: [
              { productId: 'prod-1', productName: 'Product 1', sku: 'SKU-1', quantity: 2, description: 'Desc' },
            ],
          },
        });
        await POST(request);

        expect(mockQuoteCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              items: {
                create: expect.arrayContaining([
                  expect.objectContaining({
                    productId: 'prod-1',
                    productName: 'Product 1',
                    sku: 'SKU-1',
                    quantity: 2,
                  }),
                ]),
              },
            }),
          })
        );
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when customerName is missing', async () => {
        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerEmail: 'test@example.com',
            items: [{ productName: 'P', quantity: 1 }],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Customer name, email, and items are required' });
      });

      it('returns 400 when customerEmail is missing', async () => {
        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Test',
            items: [{ productName: 'P', quantity: 1 }],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Customer name, email, and items are required' });
      });

      it('returns 400 when items are missing', async () => {
        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Test',
            customerEmail: 'test@example.com',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Customer name, email, and items are required' });
      });

      it('returns 400 when items array is empty', async () => {
        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Test',
            customerEmail: 'test@example.com',
            items: [],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Customer name, email, and items are required' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on creation failure', async () => {
        mockQuoteCreate.mockRejectedValue(new Error('Create failed'));

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Test',
            customerEmail: 'test@example.com',
            items: [{ productName: 'P', quantity: 1 }],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to create quote' });
      });
    });
  });
});
