/**
 * Inventory Service Unit Tests
 *
 * Tests for stock validation, stock operations, and status calculations
 */

// Mock Prisma
const mockProductFindUnique = jest.fn();
const mockProductUpdate = jest.fn();
const mockOrderFindUnique = jest.fn();
const mockSiteSettingsFind = jest.fn();
const mockInventoryLogCreate = jest.fn();
const mockProductVariantFindUnique = jest.fn();
const mockProductVariantUpdate = jest.fn();
const mockTransaction = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    product: {
      findUnique: (...args: unknown[]) => mockProductFindUnique(...args),
      update: (...args: unknown[]) => mockProductUpdate(...args),
    },
    order: {
      findUnique: (...args: unknown[]) => mockOrderFindUnique(...args),
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

import {
  calculateStockStatus,
  validateStockForOrder,
  decrementStock,
  incrementStock,
  processOrderStockRestore,
  getInventorySettings,
} from '@/lib/services/inventoryService';

describe('Inventory Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateStockStatus', () => {
    it('returns out_of_stock when quantity is 0', () => {
      expect(calculateStockStatus(0, 10)).toBe('out_of_stock');
    });

    it('returns out_of_stock when quantity is negative', () => {
      expect(calculateStockStatus(-5, 10)).toBe('out_of_stock');
    });

    it('returns low_stock when quantity is at minStockLevel', () => {
      expect(calculateStockStatus(10, 10)).toBe('low_stock');
    });

    it('returns low_stock when quantity is below minStockLevel', () => {
      expect(calculateStockStatus(5, 10)).toBe('low_stock');
    });

    it('returns in_stock when quantity is above minStockLevel', () => {
      expect(calculateStockStatus(15, 10)).toBe('in_stock');
    });

    it('uses globalThreshold when higher than minStockLevel', () => {
      // minStockLevel=10, globalThreshold=15, quantity=12
      // Should use globalThreshold (15), so 12 <= 15 means low_stock
      expect(calculateStockStatus(12, 10, 15)).toBe('low_stock');
    });

    it('uses minStockLevel when higher than globalThreshold', () => {
      // minStockLevel=20, globalThreshold=10, quantity=15
      // Should use minStockLevel (20), so 15 <= 20 means low_stock
      expect(calculateStockStatus(15, 20, 10)).toBe('low_stock');
    });

    it('returns in_stock when quantity exceeds both thresholds', () => {
      expect(calculateStockStatus(25, 10, 15)).toBe('in_stock');
    });
  });

  describe('validateStockForOrder', () => {
    it('returns valid when all items have sufficient stock', async () => {
      mockProductFindUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Product 1',
        stockQuantity: 10,
        trackInventory: true,
        allowBackorder: false,
      });

      const result = await validateStockForOrder([
        { productId: 'prod-1', quantity: 5 },
      ]);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns invalid when stock is insufficient', async () => {
      mockProductFindUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Test Product',
        stockQuantity: 5,
        trackInventory: true,
        allowBackorder: false,
      });

      const result = await validateStockForOrder([
        { productId: 'prod-1', quantity: 10, productName: 'Test Product' },
      ]);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        productId: 'prod-1',
        productName: 'Test Product',
        requested: 10,
        available: 5,
        allowBackorder: false,
      });
    });

    it('skips validation when trackInventory is false', async () => {
      mockProductFindUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Product 1',
        stockQuantity: 0,
        trackInventory: false,
        allowBackorder: false,
      });

      const result = await validateStockForOrder([
        { productId: 'prod-1', quantity: 10 },
      ]);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('skips validation when allowBackorder is true', async () => {
      mockProductFindUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Product 1',
        stockQuantity: 0,
        trackInventory: true,
        allowBackorder: true,
      });

      const result = await validateStockForOrder([
        { productId: 'prod-1', quantity: 10 },
      ]);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('skips items without productId', async () => {
      const result = await validateStockForOrder([
        { productId: '', quantity: 10 },
      ]);

      expect(result.valid).toBe(true);
      expect(mockProductFindUnique).not.toHaveBeenCalled();
    });

    it('skips items when product not found', async () => {
      mockProductFindUnique.mockResolvedValue(null);

      const result = await validateStockForOrder([
        { productId: 'non-existent', quantity: 10 },
      ]);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates multiple items', async () => {
      mockProductFindUnique
        .mockResolvedValueOnce({
          id: 'prod-1',
          name: 'Product 1',
          stockQuantity: 10,
          trackInventory: true,
          allowBackorder: false,
        })
        .mockResolvedValueOnce({
          id: 'prod-2',
          name: 'Product 2',
          stockQuantity: 3,
          trackInventory: true,
          allowBackorder: false,
        });

      const result = await validateStockForOrder([
        { productId: 'prod-1', quantity: 5 },
        { productId: 'prod-2', quantity: 10, productName: 'Product 2' },
      ]);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].productId).toBe('prod-2');
    });
  });

  describe('decrementStock', () => {
    const mockTx = {
      product: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      siteSettings: {
        findFirst: jest.fn(),
      },
      inventoryLog: {
        create: jest.fn(),
      },
      productVariant: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockTx.product.findUnique.mockReset();
      mockTx.product.update.mockReset();
      mockTx.siteSettings.findFirst.mockReset();
      mockTx.inventoryLog.create.mockReset();
    });

    it('decrements stock and creates inventory log', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        stockQuantity: 10,
        minStockLevel: 5,
        trackInventory: true,
      });
      mockTx.siteSettings.findFirst.mockResolvedValue({ lowStockThreshold: 5 });
      mockTx.product.update.mockResolvedValue({});
      mockTx.inventoryLog.create.mockResolvedValue({});

      await decrementStock(
        mockTx as unknown as Parameters<typeof decrementStock>[0],
        'prod-1',
        null,
        3,
        'sale',
        'user-1',
        'Test note'
      );

      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: {
          stockQuantity: 7,
          stockStatus: 'in_stock',
        },
      });

      expect(mockTx.inventoryLog.create).toHaveBeenCalledWith({
        data: {
          productId: 'prod-1',
          variantId: null,
          previousQuantity: 10,
          newQuantity: 7,
          change: -3,
          reason: 'sale',
          notes: 'Test note',
          userId: 'user-1',
        },
      });
    });

    it('does not go below 0', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        stockQuantity: 5,
        minStockLevel: 5,
        trackInventory: true,
      });
      mockTx.siteSettings.findFirst.mockResolvedValue({ lowStockThreshold: 5 });
      mockTx.product.update.mockResolvedValue({});
      mockTx.inventoryLog.create.mockResolvedValue({});

      await decrementStock(
        mockTx as unknown as Parameters<typeof decrementStock>[0],
        'prod-1',
        null,
        10,
        'sale',
        'user-1'
      );

      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: {
          stockQuantity: 0,
          stockStatus: 'out_of_stock',
        },
      });
    });

    it('skips when product not found', async () => {
      mockTx.product.findUnique.mockResolvedValue(null);

      await decrementStock(
        mockTx as unknown as Parameters<typeof decrementStock>[0],
        'non-existent',
        null,
        5,
        'sale',
        'user-1'
      );

      expect(mockTx.product.update).not.toHaveBeenCalled();
      expect(mockTx.inventoryLog.create).not.toHaveBeenCalled();
    });

    it('skips when trackInventory is false', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        stockQuantity: 10,
        minStockLevel: 5,
        trackInventory: false,
      });

      await decrementStock(
        mockTx as unknown as Parameters<typeof decrementStock>[0],
        'prod-1',
        null,
        5,
        'sale',
        'user-1'
      );

      expect(mockTx.product.update).not.toHaveBeenCalled();
      expect(mockTx.inventoryLog.create).not.toHaveBeenCalled();
    });

    it('updates variant stock when variantId provided', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        stockQuantity: 10,
        minStockLevel: 5,
        trackInventory: true,
      });
      mockTx.siteSettings.findFirst.mockResolvedValue({ lowStockThreshold: 5 });
      mockTx.product.update.mockResolvedValue({});
      mockTx.inventoryLog.create.mockResolvedValue({});
      mockTx.productVariant.findUnique.mockResolvedValue({
        stockQuantity: 8,
      });
      mockTx.productVariant.update.mockResolvedValue({});

      await decrementStock(
        mockTx as unknown as Parameters<typeof decrementStock>[0],
        'prod-1',
        'variant-1',
        3,
        'sale',
        'user-1'
      );

      expect(mockTx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant-1' },
        data: { stockQuantity: 5 },
      });
    });
  });

  describe('incrementStock', () => {
    const mockTx = {
      product: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      siteSettings: {
        findFirst: jest.fn(),
      },
      inventoryLog: {
        create: jest.fn(),
      },
      productVariant: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockTx.product.findUnique.mockReset();
      mockTx.product.update.mockReset();
      mockTx.siteSettings.findFirst.mockReset();
      mockTx.inventoryLog.create.mockReset();
    });

    it('increments stock and creates inventory log', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        stockQuantity: 5,
        minStockLevel: 10,
        trackInventory: true,
      });
      mockTx.siteSettings.findFirst.mockResolvedValue({ lowStockThreshold: 5 });
      mockTx.product.update.mockResolvedValue({});
      mockTx.inventoryLog.create.mockResolvedValue({});

      await incrementStock(
        mockTx as unknown as Parameters<typeof incrementStock>[0],
        'prod-1',
        null,
        10,
        'return_item',
        'user-1',
        'Order refunded'
      );

      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: {
          stockQuantity: 15,
          stockStatus: 'in_stock',
        },
      });

      expect(mockTx.inventoryLog.create).toHaveBeenCalledWith({
        data: {
          productId: 'prod-1',
          variantId: null,
          previousQuantity: 5,
          newQuantity: 15,
          change: 10,
          reason: 'return_item',
          notes: 'Order refunded',
          userId: 'user-1',
        },
      });
    });

    it('updates status from out_of_stock to in_stock', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        stockQuantity: 0,
        minStockLevel: 5,
        trackInventory: true,
      });
      mockTx.siteSettings.findFirst.mockResolvedValue({ lowStockThreshold: 5 });
      mockTx.product.update.mockResolvedValue({});
      mockTx.inventoryLog.create.mockResolvedValue({});

      await incrementStock(
        mockTx as unknown as Parameters<typeof incrementStock>[0],
        'prod-1',
        null,
        20,
        'restock',
        'user-1'
      );

      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: {
          stockQuantity: 20,
          stockStatus: 'in_stock',
        },
      });
    });
  });

  describe('processOrderStockRestore', () => {
    it('restores stock for all items in cancelled order', async () => {
      mockOrderFindUnique.mockResolvedValue({
        id: 'order-1',
        items: [
          { productId: 'prod-1', variantId: null, quantity: 3 },
          { productId: 'prod-2', variantId: 'var-1', quantity: 2 },
        ],
      });

      const mockIncrementCalls: unknown[] = [];
      mockTransaction.mockImplementation(async (fn) => {
        const mockTx = {
          product: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'prod-1',
              stockQuantity: 5,
              minStockLevel: 5,
              trackInventory: true,
            }),
            update: jest.fn(),
          },
          siteSettings: {
            findFirst: jest.fn().mockResolvedValue({ lowStockThreshold: 5 }),
          },
          inventoryLog: {
            create: jest.fn((args) => {
              mockIncrementCalls.push(args);
              return {};
            }),
          },
          productVariant: {
            findUnique: jest.fn().mockResolvedValue({ stockQuantity: 5 }),
            update: jest.fn(),
          },
        };
        return fn(mockTx);
      });

      await processOrderStockRestore('order-1', 'user-1');

      expect(mockOrderFindUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: {
          items: {
            select: {
              productId: true,
              variantId: true,
              quantity: true,
            },
          },
        },
      });
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('does nothing when order not found', async () => {
      mockOrderFindUnique.mockResolvedValue(null);

      await processOrderStockRestore('non-existent', 'user-1');

      expect(mockTransaction).not.toHaveBeenCalled();
    });
  });

  describe('getInventorySettings', () => {
    it('returns settings from database', async () => {
      mockSiteSettingsFind.mockResolvedValue({
        trackInventory: true,
        allowBackorders: true,
        lowStockThreshold: 20,
      });

      const result = await getInventorySettings();

      expect(result).toEqual({
        trackInventory: true,
        allowBackorders: true,
        lowStockThreshold: 20,
      });
    });

    it('returns defaults when no settings exist', async () => {
      mockSiteSettingsFind.mockResolvedValue(null);

      const result = await getInventorySettings();

      expect(result).toEqual({
        trackInventory: true,
        allowBackorders: false,
        lowStockThreshold: 10,
      });
    });
  });
});
