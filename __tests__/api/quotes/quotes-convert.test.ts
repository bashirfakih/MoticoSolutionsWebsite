/**
 * Quote to Order Conversion API Tests
 *
 * Tests POST /api/quotes/[id]/convert
 * CRITICAL: This is the core B2B flow for converting accepted quotes to orders
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../helpers/testHelpers';

// Mock auth session
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Mock Prisma
const mockQuoteFindUnique = jest.fn();
const mockQuoteUpdate = jest.fn();
const mockOrderCreate = jest.fn();
const mockCustomerUpdate = jest.fn();
const mockTransaction = jest.fn();
const mockSiteSettingsFind = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    quote: {
      findUnique: (...args: unknown[]) => mockQuoteFindUnique(...args),
      update: (...args: unknown[]) => mockQuoteUpdate(...args),
    },
    order: {
      create: (...args: unknown[]) => mockOrderCreate(...args),
    },
    customer: {
      update: (...args: unknown[]) => mockCustomerUpdate(...args),
    },
    siteSettings: {
      findFirst: (...args: unknown[]) => mockSiteSettingsFind(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

// Import route handler after mocks
import { POST } from '@/app/api/quotes/[id]/convert/route';

describe('POST /api/quotes/[id]/convert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: disable inventory tracking to simplify existing tests
    mockSiteSettingsFind.mockResolvedValue({
      trackInventory: false,
      allowBackorders: false,
      lowStockThreshold: 10,
    });
  });

  describe('Unauthorized (401)', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = createMockRequest('http://localhost/api/quotes/quote-1/convert', {
        method: 'POST',
        body: {},
      });
      const params = createRouteParams({ id: 'quote-1' });

      const response = await POST(request as never, params);
      const data = await getResponseJson(response);

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 401 when user is not admin', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'customer' });

      const request = createMockRequest('http://localhost/api/quotes/quote-1/convert', {
        method: 'POST',
        body: {},
      });
      const params = createRouteParams({ id: 'quote-1' });

      const response = await POST(request as never, params);
      const data = await getResponseJson(response);

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('Not Found (404)', () => {
    it('returns 404 when quote does not exist', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockQuoteFindUnique.mockResolvedValue(null);

      const request = createMockRequest('http://localhost/api/quotes/non-existent/convert', {
        method: 'POST',
        body: {},
      });
      const params = createRouteParams({ id: 'non-existent' });

      const response = await POST(request as never, params);
      const data = await getResponseJson(response);

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Quote not found' });
    });
  });

  describe('Validation Errors (400)', () => {
    it('returns 400 when quote is not in accepted status', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockQuoteFindUnique.mockResolvedValue({
        id: 'quote-1',
        quoteNumber: 'QT-2024-0001',
        status: 'pending',
        items: [{ id: 'item-1' }],
        total: 100,
      });

      const request = createMockRequest('http://localhost/api/quotes/quote-1/convert', {
        method: 'POST',
        body: {},
      });
      const params = createRouteParams({ id: 'quote-1' });

      const response = await POST(request as never, params);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Only accepted quotes can be converted to orders' });
    });

    it('returns 400 when quote has no items', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockQuoteFindUnique.mockResolvedValue({
        id: 'quote-1',
        quoteNumber: 'QT-2024-0001',
        status: 'accepted',
        items: [],
        total: 100,
      });

      const request = createMockRequest('http://localhost/api/quotes/quote-1/convert', {
        method: 'POST',
        body: {},
      });
      const params = createRouteParams({ id: 'quote-1' });

      const response = await POST(request as never, params);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Quote must have items with prices to convert' });
    });

    it('returns 400 when quote has no total', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockQuoteFindUnique.mockResolvedValue({
        id: 'quote-1',
        quoteNumber: 'QT-2024-0001',
        status: 'accepted',
        items: [{ id: 'item-1' }],
        total: null,
      });

      const request = createMockRequest('http://localhost/api/quotes/quote-1/convert', {
        method: 'POST',
        body: {},
      });
      const params = createRouteParams({ id: 'quote-1' });

      const response = await POST(request as never, params);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Quote must have items with prices to convert' });
    });
  });

  describe('Success (200)', () => {
    const mockQuote = {
      id: 'quote-1',
      quoteNumber: 'QT-2024-0001',
      status: 'accepted',
      customerId: 'cust-1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+961 3 741 565',
      company: 'Acme Corp',
      currency: 'USD',
      subtotal: 100,
      discount: 10,
      total: 90,
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          productName: 'Abrasive Belt',
          sku: 'AB-001',
          quantity: 5,
          unitPrice: 20,
          totalPrice: 100,
        },
      ],
      customer: { id: 'cust-1', name: 'John Doe' },
    };

    const mockOrder = {
      id: 'order-1',
      orderNumber: 'ORD-202403-ABCD',
      customerId: 'cust-1',
      customerName: 'John Doe',
      status: 'pending',
      items: mockQuote.items,
    };

    it('converts accepted quote to order successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockQuoteFindUnique.mockResolvedValue(mockQuote);

      // Mock transaction to execute the callback
      mockTransaction.mockImplementation(async (fn) => {
        const mockTx = {
          order: { create: jest.fn().mockResolvedValue(mockOrder) },
          quote: { update: jest.fn().mockResolvedValue({}) },
          customer: { update: jest.fn().mockResolvedValue({}) },
          product: { findUnique: jest.fn(), update: jest.fn() },
          siteSettings: { findFirst: jest.fn().mockResolvedValue({ lowStockThreshold: 10 }) },
          inventoryLog: { create: jest.fn() },
          productVariant: { findUnique: jest.fn(), update: jest.fn() },
        };
        return fn(mockTx);
      });

      const request = createMockRequest('http://localhost/api/quotes/quote-1/convert', {
        method: 'POST',
        body: {},
      });
      const params = createRouteParams({ id: 'quote-1' });

      const response = await POST(request as never, params);
      const data = await getResponseJson(response) as { success: boolean; order: typeof mockOrder; message: string };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.order).toBeDefined();
      expect(data.message).toContain('QT-2024-0001');
      expect(data.message).toContain('converted to order');
    });

    it('accepts custom shipping address', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockQuoteFindUnique.mockResolvedValue(mockQuote);

      let capturedOrderData: Record<string, unknown> | null = null;
      mockTransaction.mockImplementation(async (fn) => {
        const mockTx = {
          order: {
            create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) => {
              capturedOrderData = args.data;
              return mockOrder;
            }),
          },
          quote: { update: jest.fn().mockResolvedValue({}) },
          customer: { update: jest.fn().mockResolvedValue({}) },
          product: { findUnique: jest.fn(), update: jest.fn() },
          siteSettings: { findFirst: jest.fn().mockResolvedValue({ lowStockThreshold: 10 }) },
          inventoryLog: { create: jest.fn() },
          productVariant: { findUnique: jest.fn(), update: jest.fn() },
        };
        return fn(mockTx);
      });

      const shippingAddress = {
        street: '123 Industrial Zone',
        city: 'Beirut',
        country: 'Lebanon',
      };

      const request = createMockRequest('http://localhost/api/quotes/quote-1/convert', {
        method: 'POST',
        body: { shippingAddress },
      });
      const params = createRouteParams({ id: 'quote-1' });

      await POST(request as never, params);

      expect(capturedOrderData?.shippingAddress).toEqual(shippingAddress);
    });

    it('updates customer stats on conversion', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockQuoteFindUnique.mockResolvedValue(mockQuote);

      let customerUpdateCalled = false;
      mockTransaction.mockImplementation(async (fn) => {
        const mockTx = {
          order: { create: jest.fn().mockResolvedValue(mockOrder) },
          quote: { update: jest.fn().mockResolvedValue({}) },
          customer: {
            update: jest.fn().mockImplementation(() => {
              customerUpdateCalled = true;
              return {};
            }),
          },
          product: { findUnique: jest.fn(), update: jest.fn() },
          siteSettings: { findFirst: jest.fn().mockResolvedValue({ lowStockThreshold: 10 }) },
          inventoryLog: { create: jest.fn() },
          productVariant: { findUnique: jest.fn(), update: jest.fn() },
        };
        return fn(mockTx);
      });

      const request = createMockRequest('http://localhost/api/quotes/quote-1/convert', {
        method: 'POST',
        body: {},
      });
      const params = createRouteParams({ id: 'quote-1' });

      await POST(request as never, params);

      expect(customerUpdateCalled).toBe(true);
    });

    it('updates quote status to converted', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockQuoteFindUnique.mockResolvedValue(mockQuote);

      let quoteUpdateArgs: { where: { id: string }; data: { status: string; orderId: string } } | null = null;
      mockTransaction.mockImplementation(async (fn) => {
        const mockTx = {
          order: { create: jest.fn().mockResolvedValue(mockOrder) },
          quote: {
            update: jest.fn().mockImplementation((args: { where: { id: string }; data: { status: string; orderId: string } }) => {
              quoteUpdateArgs = args;
              return {};
            }),
          },
          customer: { update: jest.fn().mockResolvedValue({}) },
          product: { findUnique: jest.fn(), update: jest.fn() },
          siteSettings: { findFirst: jest.fn().mockResolvedValue({ lowStockThreshold: 10 }) },
          inventoryLog: { create: jest.fn() },
          productVariant: { findUnique: jest.fn(), update: jest.fn() },
        };
        return fn(mockTx);
      });

      const request = createMockRequest('http://localhost/api/quotes/quote-1/convert', {
        method: 'POST',
        body: {},
      });
      const params = createRouteParams({ id: 'quote-1' });

      await POST(request as never, params);

      expect(quoteUpdateArgs?.data.status).toBe('converted');
      expect(quoteUpdateArgs?.data.orderId).toBe('order-1');
    });
  });

  describe('Server Error (500)', () => {
    it('returns 500 when transaction fails', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockQuoteFindUnique.mockResolvedValue({
        id: 'quote-1',
        quoteNumber: 'QT-2024-0001',
        status: 'accepted',
        items: [{ id: 'item-1' }],
        total: 100,
      });
      mockTransaction.mockRejectedValue(new Error('Transaction failed'));

      const request = createMockRequest('http://localhost/api/quotes/quote-1/convert', {
        method: 'POST',
        body: {},
      });
      const params = createRouteParams({ id: 'quote-1' });

      const response = await POST(request as never, params);
      const data = await getResponseJson(response);

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to convert quote to order' });
    });
  });
});
