/**
 * Orders API Inventory Integration Tests
 *
 * Tests for stock validation and decrement during order creation
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockOrderCreate = jest.fn();
const mockOrderCount = jest.fn();
const mockOrderFindMany = jest.fn();
const mockCustomerFindUnique = jest.fn();
const mockCustomerUpdate = jest.fn();
const mockProductFindUnique = jest.fn();
const mockProductUpdate = jest.fn();
const mockSiteSettingsFind = jest.fn();
const mockInventoryLogCreate = jest.fn();
const mockProductVariantFindUnique = jest.fn();
const mockProductVariantUpdate = jest.fn();
const mockTransaction = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    order: {
      create: (...args: unknown[]) => mockOrderCreate(...args),
      count: (...args: unknown[]) => mockOrderCount(...args),
      findMany: (...args: unknown[]) => mockOrderFindMany(...args),
    },
    customer: {
      findUnique: (...args: unknown[]) => mockCustomerFindUnique(...args),
      update: (...args: unknown[]) => mockCustomerUpdate(...args),
    },
    product: {
      findUnique: (...args: unknown[]) => mockProductFindUnique(...args),
      update: (...args: unknown[]) => mockProductUpdate(...args),
    },
    siteSettings: {
      findFirst: (...args: unknown[]) => mockSiteSettingsFind(...args),
    },
    inventoryLog: {
      create: (...args: unknown[]) => mockInventoryLogCreate(...args),
    },
    productVariant: {
      findUnique: (...args: unknown[]) => mockProductVariantFindUnique(...args),
      update: (...args: unknown[]) => mockProductVariantUpdate(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

// Import route handlers after mocks
import { POST } from '@/app/api/orders/route';

describe('Orders API - Inventory Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCustomerUpdate.mockResolvedValue({});
    mockSiteSettingsFind.mockResolvedValue({
      trackInventory: true,
      allowBackorders: false,
      lowStockThreshold: 10,
    });
  });

  describe('POST /api/orders - Stock Validation', () => {
    describe('Insufficient Stock (400)', () => {
      it('returns 400 when stock is insufficient and backorders disabled', async () => {
        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-1',
          name: 'Test Customer',
          email: 'test@test.com',
        });

        // Product has less stock than requested
        mockProductFindUnique.mockResolvedValue({
          id: 'prod-1',
          name: 'Test Product',
          stockQuantity: 5,
          trackInventory: true,
          allowBackorder: false,
        });

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'cust-1',
            items: [
              {
                productId: 'prod-1',
                productName: 'Test Product',
                productSku: 'SKU-001',
                quantity: 10,
                unitPrice: 50,
                totalPrice: 500,
              },
            ],
          },
        });

        const response = await POST(request as Parameters<typeof POST>[0]);
        const data = await getResponseJson(response) as { error: string; details: unknown[] };

        expect(response.status).toBe(400);
        expect(data.error).toBe('Insufficient stock for one or more items');
        expect(data.details).toHaveLength(1);
      });

      it('returns details for multiple items with insufficient stock', async () => {
        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-1',
          name: 'Test Customer',
          email: 'test@test.com',
        });

        mockProductFindUnique
          .mockResolvedValueOnce({
            id: 'prod-1',
            name: 'Product 1',
            stockQuantity: 5,
            trackInventory: true,
            allowBackorder: false,
          })
          .mockResolvedValueOnce({
            id: 'prod-2',
            name: 'Product 2',
            stockQuantity: 2,
            trackInventory: true,
            allowBackorder: false,
          });

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'cust-1',
            items: [
              {
                productId: 'prod-1',
                productName: 'Product 1',
                productSku: 'SKU-001',
                quantity: 10,
                unitPrice: 50,
                totalPrice: 500,
              },
              {
                productId: 'prod-2',
                productName: 'Product 2',
                productSku: 'SKU-002',
                quantity: 5,
                unitPrice: 30,
                totalPrice: 150,
              },
            ],
          },
        });

        const response = await POST(request as Parameters<typeof POST>[0]);
        const data = await getResponseJson(response) as { error: string; details: { productId: string }[] };

        expect(response.status).toBe(400);
        expect(data.details).toHaveLength(2);
        expect(data.details[0].productId).toBe('prod-1');
        expect(data.details[1].productId).toBe('prod-2');
      });
    });

    describe('Stock Validation Skip Conditions', () => {
      it('skips validation when trackInventory is disabled globally', async () => {
        mockSiteSettingsFind.mockResolvedValue({
          trackInventory: false,
          allowBackorders: false,
          lowStockThreshold: 10,
        });

        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-1',
          name: 'Test Customer',
          email: 'test@test.com',
        });

        mockTransaction.mockImplementation(async (fn) => {
          const mockTx = {
            order: {
              create: jest.fn().mockResolvedValue({
                id: 'order-1',
                orderNumber: 'ORD-2024-0001',
                subtotal: 500,
                shippingCost: 0,
                tax: 0,
                discount: 0,
                total: 500,
                items: [],
              }),
            },
            customer: {
              update: jest.fn(),
            },
          };
          return fn(mockTx);
        });

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'cust-1',
            items: [
              {
                productId: 'prod-1',
                productName: 'Test Product',
                productSku: 'SKU-001',
                quantity: 100,
                unitPrice: 5,
                totalPrice: 500,
              },
            ],
          },
        });

        const response = await POST(request as Parameters<typeof POST>[0]);

        expect(response.status).toBe(201);
        // Should not have called product findUnique for validation
        expect(mockProductFindUnique).not.toHaveBeenCalled();
      });

      it('allows order when allowBackorders is enabled globally', async () => {
        mockSiteSettingsFind.mockResolvedValue({
          trackInventory: true,
          allowBackorders: true,
          lowStockThreshold: 10,
        });

        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-1',
          name: 'Test Customer',
          email: 'test@test.com',
        });

        mockProductFindUnique.mockResolvedValue({
          id: 'prod-1',
          name: 'Test Product',
          stockQuantity: 0,
          trackInventory: true,
          allowBackorder: false,
        });

        mockTransaction.mockImplementation(async (fn) => {
          const mockTx = {
            order: {
              create: jest.fn().mockResolvedValue({
                id: 'order-1',
                orderNumber: 'ORD-2024-0001',
                subtotal: 500,
                shippingCost: 0,
                tax: 0,
                discount: 0,
                total: 500,
                items: [],
              }),
            },
            customer: {
              update: jest.fn(),
            },
            product: {
              findUnique: jest.fn().mockResolvedValue({
                id: 'prod-1',
                stockQuantity: 0,
                minStockLevel: 5,
                trackInventory: true,
              }),
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

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'cust-1',
            items: [
              {
                productId: 'prod-1',
                productName: 'Test Product',
                productSku: 'SKU-001',
                quantity: 100,
                unitPrice: 5,
                totalPrice: 500,
              },
            ],
          },
        });

        const response = await POST(request as Parameters<typeof POST>[0]);

        // Should allow the order despite insufficient stock
        expect(response.status).toBe(201);
      });

      it('allows order when product has allowBackorder enabled', async () => {
        mockSiteSettingsFind.mockResolvedValue({
          trackInventory: true,
          allowBackorders: false,
          lowStockThreshold: 10,
        });

        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-1',
          name: 'Test Customer',
          email: 'test@test.com',
        });

        // Product has allowBackorder: true
        mockProductFindUnique.mockResolvedValue({
          id: 'prod-1',
          name: 'Test Product',
          stockQuantity: 0,
          trackInventory: true,
          allowBackorder: true,
        });

        mockTransaction.mockImplementation(async (fn) => {
          const mockTx = {
            order: {
              create: jest.fn().mockResolvedValue({
                id: 'order-1',
                orderNumber: 'ORD-2024-0001',
                subtotal: 500,
                shippingCost: 0,
                tax: 0,
                discount: 0,
                total: 500,
                items: [],
              }),
            },
            customer: {
              update: jest.fn(),
            },
            product: {
              findUnique: jest.fn().mockResolvedValue({
                id: 'prod-1',
                stockQuantity: 0,
                minStockLevel: 5,
                trackInventory: true,
              }),
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

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'cust-1',
            items: [
              {
                productId: 'prod-1',
                productName: 'Test Product',
                productSku: 'SKU-001',
                quantity: 100,
                unitPrice: 5,
                totalPrice: 500,
              },
            ],
          },
        });

        const response = await POST(request as Parameters<typeof POST>[0]);

        // Validation passes because product allows backorders
        expect(response.status).toBe(201);
      });
    });

    describe('Stock Decrement on Order Creation', () => {
      it('decrements stock when order is created successfully', async () => {
        mockSiteSettingsFind.mockResolvedValue({
          trackInventory: true,
          allowBackorders: false,
          lowStockThreshold: 10,
        });

        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-1',
          name: 'Test Customer',
          email: 'test@test.com',
        });

        // Product has sufficient stock
        mockProductFindUnique.mockResolvedValue({
          id: 'prod-1',
          name: 'Test Product',
          stockQuantity: 20,
          trackInventory: true,
          allowBackorder: false,
        });

        let stockDecrementCalled = false;
        let inventoryLogCreated = false;

        mockTransaction.mockImplementation(async (fn) => {
          const mockTx = {
            order: {
              create: jest.fn().mockResolvedValue({
                id: 'order-1',
                orderNumber: 'ORD-2024-0001',
                subtotal: 250,
                shippingCost: 0,
                tax: 0,
                discount: 0,
                total: 250,
                items: [{ id: 'item-1', unitPrice: 50, totalPrice: 250 }],
              }),
            },
            customer: {
              update: jest.fn(),
            },
            product: {
              findUnique: jest.fn().mockResolvedValue({
                id: 'prod-1',
                stockQuantity: 20,
                minStockLevel: 5,
                trackInventory: true,
              }),
              update: jest.fn().mockImplementation(() => {
                stockDecrementCalled = true;
                return {};
              }),
            },
            siteSettings: {
              findFirst: jest.fn().mockResolvedValue({ lowStockThreshold: 10 }),
            },
            inventoryLog: {
              create: jest.fn().mockImplementation(() => {
                inventoryLogCreated = true;
                return {};
              }),
            },
            productVariant: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          };
          return fn(mockTx);
        });

        const request = createMockRequest('http://localhost/api/orders', {
          method: 'POST',
          body: {
            customerId: 'cust-1',
            items: [
              {
                productId: 'prod-1',
                productName: 'Test Product',
                productSku: 'SKU-001',
                quantity: 5,
                unitPrice: 50,
                totalPrice: 250,
              },
            ],
          },
        });

        const response = await POST(request as Parameters<typeof POST>[0]);

        expect(response.status).toBe(201);
        expect(stockDecrementCalled).toBe(true);
        expect(inventoryLogCreated).toBe(true);
      });
    });
  });
});
