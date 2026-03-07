/**
 * Quotes Order Flow API Tests
 *
 * Tests for the quote creation flow used for ordering products:
 * - POST /api/quotes (create order with user, specs, and discount)
 * - GET /api/quotes (list quotes for admin)
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockQuoteFindMany = jest.fn();
const mockQuoteCreate = jest.fn();
const mockQuoteCount = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    quote: {
      findMany: (...args: unknown[]) => mockQuoteFindMany(...args),
      create: (...args: unknown[]) => mockQuoteCreate(...args),
      count: (...args: unknown[]) => mockQuoteCount(...args),
    },
  },
}));

// Mock auth — GET /api/quotes now requires authentication
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/quotes/route';

describe('Quotes Order Flow API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: authenticated admin user for GET tests
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'admin', email: 'admin@test.com' });
  });

  describe('POST /api/quotes - Create Order', () => {
    describe('Validation', () => {
      it('returns 400 when customerName is missing', async () => {
        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerEmail: 'customer@example.com',
            items: [{ productName: 'Test Product', quantity: 1 }],
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
            customerName: 'John Doe',
            items: [{ productName: 'Test Product', quantity: 1 }],
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
            customerName: 'John Doe',
            customerEmail: 'customer@example.com',
            items: [],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Customer name, email, and items are required' });
      });

      it('returns 400 when items is missing', async () => {
        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'John Doe',
            customerEmail: 'customer@example.com',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Customer name, email, and items are required' });
      });
    });

    describe('Quote Creation for Authenticated User', () => {
      it('creates quote with userId for authenticated user', async () => {
        const newQuote = {
          id: 'quote-1',
          quoteNumber: 'QT-2024-0001',
          userId: 'user-1',
          customerId: null,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+1234567890',
          company: 'Test Company',
          status: 'pending',
          currency: 'USD',
          subtotal: null,
          discount: 0,
          total: null,
          customerMessage: 'Order request for Test Product',
          items: [
            {
              id: 'item-1',
              productId: 'prod-1',
              productName: 'Test Product',
              sku: 'TEST-001',
              quantity: 2,
              unitPrice: 85,
              totalPrice: 170,
              selectedDimension: '100x50mm',
              selectedSize: 'Medium',
              selectedGrit: '120',
              selectedPackaging: 'Box of 10',
              discountApplied: 15,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockQuoteCreate.mockResolvedValue(newQuote);

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            userId: 'user-1',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerPhone: '+1234567890',
            company: 'Test Company',
            customerMessage: 'Order request for Test Product',
            items: [
              {
                productId: 'prod-1',
                productName: 'Test Product',
                sku: 'TEST-001',
                quantity: 2,
                unitPrice: 85,
                totalPrice: 170,
                selectedDimension: '100x50mm',
                selectedSize: 'Medium',
                selectedGrit: '120',
                selectedPackaging: 'Box of 10',
                discountApplied: 15,
              },
            ],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(201);
        expect(mockQuoteCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              userId: 'user-1',
              customerName: 'John Doe',
              customerEmail: 'john@example.com',
              status: 'pending',
            }),
          })
        );
        expect(data).toHaveProperty('id', 'quote-1');
        expect(data).toHaveProperty('items');
      });

      it('creates quote items with selected specifications', async () => {
        const newQuote = {
          id: 'quote-1',
          quoteNumber: 'QT-2024-0001',
          items: [
            {
              id: 'item-1',
              productName: 'Abrasive Belt',
              selectedDimension: '150x2000mm',
              selectedSize: 'Large',
              selectedGrit: '80',
              selectedPackaging: 'Box of 25',
              discountApplied: 10,
            },
          ],
          subtotal: null,
          discount: 0,
          total: null,
        };
        mockQuoteCreate.mockResolvedValue(newQuote);

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            items: [
              {
                productName: 'Abrasive Belt',
                quantity: 5,
                selectedDimension: '150x2000mm',
                selectedSize: 'Large',
                selectedGrit: '80',
                selectedPackaging: 'Box of 25',
                discountApplied: 10,
              },
            ],
          },
        });
        const response = await POST(request);

        expect(response.status).toBe(201);
        expect(mockQuoteCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              items: {
                create: expect.arrayContaining([
                  expect.objectContaining({
                    productName: 'Abrasive Belt',
                    quantity: 5,
                    selectedDimension: '150x2000mm',
                    selectedSize: 'Large',
                    selectedGrit: '80',
                    selectedPackaging: 'Box of 25',
                    discountApplied: 10,
                  }),
                ]),
              },
            }),
          })
        );
      });

      it('creates quote with multiple items', async () => {
        const newQuote = {
          id: 'quote-1',
          quoteNumber: 'QT-2024-0001',
          items: [
            { id: 'item-1', productName: 'Product 1' },
            { id: 'item-2', productName: 'Product 2' },
            { id: 'item-3', productName: 'Product 3' },
          ],
          subtotal: null,
          discount: 0,
          total: null,
        };
        mockQuoteCreate.mockResolvedValue(newQuote);

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Multi Order',
            customerEmail: 'multi@example.com',
            items: [
              { productName: 'Product 1', quantity: 1 },
              { productName: 'Product 2', quantity: 2 },
              { productName: 'Product 3', quantity: 3 },
            ],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response) as { items: unknown[] };

        expect(response.status).toBe(201);
        expect(data.items).toHaveLength(3);
      });

      it('creates quote with price calculations', async () => {
        const newQuote = {
          id: 'quote-1',
          quoteNumber: 'QT-2024-0001',
          items: [
            {
              id: 'item-1',
              productName: 'Expensive Tool',
              quantity: 3,
              unitPrice: 100,
              totalPrice: 255, // 100 * 3 * 0.85 (15% discount)
              discountApplied: 15,
            },
          ],
          subtotal: null,
          discount: 0,
          total: null,
        };
        mockQuoteCreate.mockResolvedValue(newQuote);

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            userId: 'user-1',
            customerName: 'Price Test',
            customerEmail: 'price@example.com',
            items: [
              {
                productName: 'Expensive Tool',
                quantity: 3,
                unitPrice: 100,
                totalPrice: 255,
                discountApplied: 15,
              },
            ],
          },
        });
        const response = await POST(request);

        expect(response.status).toBe(201);
        expect(mockQuoteCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              items: {
                create: expect.arrayContaining([
                  expect.objectContaining({
                    unitPrice: 100,
                    totalPrice: 255,
                    discountApplied: 15,
                  }),
                ]),
              },
            }),
          })
        );
      });

      it('handles optional fields as null', async () => {
        const newQuote = {
          id: 'quote-1',
          quoteNumber: 'QT-2024-0001',
          items: [{ id: 'item-1', productName: 'Basic Product' }],
          subtotal: null,
          discount: 0,
          total: null,
        };
        mockQuoteCreate.mockResolvedValue(newQuote);

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Minimal Order',
            customerEmail: 'minimal@example.com',
            items: [
              {
                productName: 'Basic Product',
                quantity: 1,
                // No optional fields provided
              },
            ],
          },
        });
        await POST(request);

        expect(mockQuoteCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              userId: null,
              customerId: null,
              customerPhone: null,
              company: null,
              customerMessage: null,
              items: {
                create: expect.arrayContaining([
                  expect.objectContaining({
                    productId: null,
                    sku: null,
                    description: null,
                    unitPrice: null,
                    totalPrice: null,
                    selectedDimension: null,
                    selectedSize: null,
                    selectedGrit: null,
                    selectedPackaging: null,
                    discountApplied: null,
                  }),
                ]),
              },
            }),
          })
        );
      });

      it('generates unique quote number', async () => {
        mockQuoteCreate.mockImplementation((args: { data: { quoteNumber: string } }) =>
          Promise.resolve({
            id: 'quote-1',
            ...args.data,
            items: [],
            subtotal: null,
            discount: 0,
            total: null,
          })
        );

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Quote Number Test',
            customerEmail: 'quote@example.com',
            items: [{ productName: 'Test', quantity: 1 }],
          },
        });
        await POST(request);

        expect(mockQuoteCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              quoteNumber: expect.stringMatching(/^QT-\d{4}-\d{4}$/),
            }),
          })
        );
      });
    });

    describe('Currency Handling', () => {
      it('defaults to USD currency', async () => {
        mockQuoteCreate.mockResolvedValue({
          id: 'quote-1',
          currency: 'USD',
          items: [],
          subtotal: null,
          discount: 0,
          total: null,
        });

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Currency Test',
            customerEmail: 'currency@example.com',
            items: [{ productName: 'Test', quantity: 1 }],
          },
        });
        await POST(request);

        expect(mockQuoteCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              currency: 'USD',
            }),
          })
        );
      });

      it('accepts custom currency', async () => {
        mockQuoteCreate.mockResolvedValue({
          id: 'quote-1',
          currency: 'EUR',
          items: [],
          subtotal: null,
          discount: 0,
          total: null,
        });

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Euro Customer',
            customerEmail: 'euro@example.com',
            currency: 'EUR',
            items: [{ productName: 'Test', quantity: 1 }],
          },
        });
        await POST(request);

        expect(mockQuoteCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              currency: 'EUR',
            }),
          })
        );
      });
    });

    describe('Server Error Handling', () => {
      it('returns 500 on database error', async () => {
        mockQuoteCreate.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/quotes', {
          method: 'POST',
          body: {
            customerName: 'Error Test',
            customerEmail: 'error@example.com',
            items: [{ productName: 'Test', quantity: 1 }],
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to create quote' });
      });
    });
  });

  describe('GET /api/quotes - List Quotes', () => {
    it('returns paginated quotes list', async () => {
      const mockQuotes = [
        {
          id: 'quote-1',
          quoteNumber: 'QT-2024-0001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          status: 'pending',
          subtotal: { toNumber: () => 100 },
          discount: { toNumber: () => 10 },
          total: { toNumber: () => 90 },
          customer: null,
          _count: { items: 3 },
          createdAt: new Date(),
        },
        {
          id: 'quote-2',
          quoteNumber: 'QT-2024-0002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          status: 'sent',
          subtotal: { toNumber: () => 200 },
          discount: { toNumber: () => 0 },
          total: { toNumber: () => 200 },
          customer: { id: 'cust-1', name: 'Jane', email: 'jane@example.com', company: 'Jane Co' },
          _count: { items: 1 },
          createdAt: new Date(),
        },
      ];
      mockQuoteFindMany.mockResolvedValue(mockQuotes);
      mockQuoteCount.mockResolvedValue(2);

      const request = createMockRequest('http://localhost/api/quotes');
      const response = await GET(request);
      const data = await getResponseJson(response) as {
        data: Array<{ itemCount: number }>;
        total: number;
        page: number;
        totalPages: number
      };

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(data.page).toBe(1);
      expect(data.totalPages).toBe(1);
      expect(data.data[0].itemCount).toBe(3);
    });

    it('filters quotes by status', async () => {
      mockQuoteFindMany.mockResolvedValue([]);
      mockQuoteCount.mockResolvedValue(0);

      const request = createMockRequest('http://localhost/api/quotes?status=pending');
      await GET(request);

      expect(mockQuoteFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'pending',
          }),
        })
      );
    });

    it('filters quotes by customerId', async () => {
      mockQuoteFindMany.mockResolvedValue([]);
      mockQuoteCount.mockResolvedValue(0);

      const request = createMockRequest('http://localhost/api/quotes?customerId=cust-1');
      await GET(request);

      expect(mockQuoteFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: 'cust-1',
          }),
        })
      );
    });

    it('searches quotes by quote number, name, email, or company', async () => {
      mockQuoteFindMany.mockResolvedValue([]);
      mockQuoteCount.mockResolvedValue(0);

      const request = createMockRequest('http://localhost/api/quotes?search=john');
      await GET(request);

      expect(mockQuoteFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { quoteNumber: { contains: 'john', mode: 'insensitive' } },
              { customerName: { contains: 'john', mode: 'insensitive' } },
              { customerEmail: { contains: 'john', mode: 'insensitive' } },
              { company: { contains: 'john', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('supports pagination parameters', async () => {
      mockQuoteFindMany.mockResolvedValue([]);
      mockQuoteCount.mockResolvedValue(50);

      const request = createMockRequest('http://localhost/api/quotes?page=2&limit=10');
      const response = await GET(request);
      const data = await getResponseJson(response) as { page: number; limit: number; totalPages: number };

      expect(data.page).toBe(2);
      expect(data.limit).toBe(10);
      expect(data.totalPages).toBe(5);
      expect(mockQuoteFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('supports sorting', async () => {
      mockQuoteFindMany.mockResolvedValue([]);
      mockQuoteCount.mockResolvedValue(0);

      const request = createMockRequest('http://localhost/api/quotes?sortBy=customerName&sortOrder=asc');
      await GET(request);

      expect(mockQuoteFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { customerName: 'asc' },
        })
      );
    });

    it('converts Decimal fields to numbers in response', async () => {
      const mockQuotes = [
        {
          id: 'quote-1',
          quoteNumber: 'QT-2024-0001',
          subtotal: { toNumber: () => 150.50 },
          discount: { toNumber: () => 15.05 },
          total: { toNumber: () => 135.45 },
          customer: null,
          _count: { items: 2 },
        },
      ];
      mockQuoteFindMany.mockResolvedValue(mockQuotes);
      mockQuoteCount.mockResolvedValue(1);

      const request = createMockRequest('http://localhost/api/quotes');
      const response = await GET(request);
      const data = await getResponseJson(response) as {
        data: Array<{ subtotal: number; discount: number; total: number }>
      };

      expect(typeof data.data[0].subtotal).toBe('number');
      expect(typeof data.data[0].discount).toBe('number');
      expect(typeof data.data[0].total).toBe('number');
    });

    it('handles null Decimal fields', async () => {
      const mockQuotes = [
        {
          id: 'quote-1',
          quoteNumber: 'QT-2024-0001',
          subtotal: null,
          discount: { toNumber: () => 0 },
          total: null,
          customer: null,
          _count: { items: 1 },
        },
      ];
      mockQuoteFindMany.mockResolvedValue(mockQuotes);
      mockQuoteCount.mockResolvedValue(1);

      const request = createMockRequest('http://localhost/api/quotes');
      const response = await GET(request);
      const data = await getResponseJson(response) as {
        data: Array<{ subtotal: number | null; total: number | null }>
      };

      expect(data.data[0].subtotal).toBeNull();
      expect(data.data[0].total).toBeNull();
    });

    it('includes customer relation data', async () => {
      const mockQuotes = [
        {
          id: 'quote-1',
          quoteNumber: 'QT-2024-0001',
          subtotal: null,
          discount: { toNumber: () => 0 },
          total: null,
          customer: {
            id: 'cust-1',
            name: 'Test Customer',
            email: 'customer@example.com',
            company: 'Customer Corp',
          },
          _count: { items: 1 },
        },
      ];
      mockQuoteFindMany.mockResolvedValue(mockQuotes);
      mockQuoteCount.mockResolvedValue(1);

      const request = createMockRequest('http://localhost/api/quotes');
      const response = await GET(request);
      const data = await getResponseJson(response) as {
        data: Array<{ customer: { name: string; company: string } }>
      };

      expect(data.data[0].customer).toEqual({
        id: 'cust-1',
        name: 'Test Customer',
        email: 'customer@example.com',
        company: 'Customer Corp',
      });
    });

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
