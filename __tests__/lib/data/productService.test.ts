/**
 * Product Service Unit Tests
 *
 * Tests for CRUD operations, filtering, and inventory management.
 *
 * @module __tests__/lib/data/productService.test
 */

import { productService } from '@/lib/data/productService';
import { STOCK_STATUS, INVENTORY_REASON, CURRENCY } from '@/lib/data/types';

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

describe('productService', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products', () => {
      const products = productService.getAll();
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });
  });

  describe('getPublished', () => {
    it('should return only published products', () => {
      const published = productService.getPublished();
      expect(published.every(p => p.isPublished)).toBe(true);
    });
  });

  describe('getFeatured', () => {
    it('should return only featured published products', () => {
      const featured = productService.getFeatured();
      expect(featured.every(p => p.isFeatured && p.isPublished)).toBe(true);
    });
  });

  describe('getNew', () => {
    it('should return only new published products', () => {
      const newProducts = productService.getNew();
      expect(newProducts.every(p => p.isNew && p.isPublished)).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return product when found', () => {
      const products = productService.getAll();
      const firstProduct = products[0];
      const result = productService.getById(firstProduct.id);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(firstProduct.id);
    });

    it('should return null when not found', () => {
      const result = productService.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getBySku', () => {
    it('should return product when found', () => {
      const products = productService.getAll();
      const firstProduct = products[0];
      const result = productService.getBySku(firstProduct.sku);
      expect(result).not.toBeNull();
      expect(result?.sku).toBe(firstProduct.sku);
    });
  });

  describe('getBySlug', () => {
    it('should return product when found', () => {
      const products = productService.getAll();
      const firstProduct = products[0];
      const result = productService.getBySlug(firstProduct.slug);
      expect(result).not.toBeNull();
      expect(result?.slug).toBe(firstProduct.slug);
    });
  });

  describe('search', () => {
    it('should find products by name', () => {
      const results = productService.search('Hermes');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find products by SKU', () => {
      const products = productService.getPublished();
      const product = products[0];
      const results = productService.search(product.sku.substring(0, 5));
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = productService.search('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('getLowStock', () => {
    it('should return products with low stock status', () => {
      const lowStock = productService.getLowStock();
      expect(lowStock.every(p => p.stockStatus === STOCK_STATUS.LOW_STOCK)).toBe(true);
    });
  });

  describe('getOutOfStock', () => {
    it('should return products with out of stock status', () => {
      const outOfStock = productService.getOutOfStock();
      expect(outOfStock.every(p => p.stockStatus === STOCK_STATUS.OUT_OF_STOCK)).toBe(true);
    });
  });

  describe('getPaginated', () => {
    it('should return paginated results', () => {
      const result = productService.getPaginated({ page: 1, limit: 3 });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should filter by category', () => {
      const products = productService.getAll();
      const categoryId = products[0].categoryId;

      const result = productService.getPaginated(
        { page: 1, limit: 10 },
        { categoryId }
      );

      expect(result.data.every(p => p.categoryId === categoryId)).toBe(true);
    });

    it('should filter by brand', () => {
      const products = productService.getAll();
      const brandId = products[0].brandId;

      const result = productService.getPaginated(
        { page: 1, limit: 10 },
        { brandId }
      );

      expect(result.data.every(p => p.brandId === brandId)).toBe(true);
    });

    it('should filter by stock status', () => {
      const result = productService.getPaginated(
        { page: 1, limit: 10 },
        { stockStatus: STOCK_STATUS.IN_STOCK }
      );

      expect(result.data.every(p => p.stockStatus === STOCK_STATUS.IN_STOCK)).toBe(true);
    });

    it('should filter by published status', () => {
      const result = productService.getPaginated(
        { page: 1, limit: 10 },
        { isPublished: true }
      );

      expect(result.data.every(p => p.isPublished)).toBe(true);
    });

    it('should search by text', () => {
      const result = productService.getPaginated(
        { page: 1, limit: 10 },
        { search: 'Hermes' }
      );

      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('create', () => {
    it('should create a new product', () => {
      const products = productService.getAll();
      const categoryId = products[0].categoryId;
      const brandId = products[0].brandId;

      const newProduct = productService.create({
        sku: 'TEST-SKU-001',
        name: 'Test Product',
        description: 'A test product description',
        categoryId,
        brandId,
        stockQuantity: 100,
        price: 25.99,
      });

      expect(newProduct).toBeDefined();
      expect(newProduct.id).toBeDefined();
      expect(newProduct.sku).toBe('TEST-SKU-001');
      expect(newProduct.name).toBe('Test Product');
      expect(newProduct.slug).toBe('test-product');
      expect(newProduct.stockQuantity).toBe(100);
      expect(newProduct.stockStatus).toBe(STOCK_STATUS.IN_STOCK);
      expect(newProduct.isPublished).toBe(false);
      expect(newProduct.isNew).toBe(true);
    });

    it('should throw error for duplicate SKU', () => {
      const existingProduct = productService.getAll()[0];

      expect(() => {
        productService.create({
          sku: existingProduct.sku,
          name: 'Another Product',
          description: 'Description',
          categoryId: existingProduct.categoryId,
          brandId: existingProduct.brandId,
        });
      }).toThrow(/already exists/);
    });

    it('should calculate correct stock status on creation', () => {
      const products = productService.getAll();
      const categoryId = products[0].categoryId;
      const brandId = products[0].brandId;

      // Low stock
      const lowStockProduct = productService.create({
        sku: 'TEST-LOW-STOCK',
        name: 'Low Stock Product',
        description: 'Description',
        categoryId,
        brandId,
        stockQuantity: 5,
        minStockLevel: 10,
      });
      expect(lowStockProduct.stockStatus).toBe(STOCK_STATUS.LOW_STOCK);

      // Out of stock
      const outOfStockProduct = productService.create({
        sku: 'TEST-OUT-STOCK',
        name: 'Out of Stock Product',
        description: 'Description',
        categoryId,
        brandId,
        stockQuantity: 0,
      });
      expect(outOfStockProduct.stockStatus).toBe(STOCK_STATUS.OUT_OF_STOCK);
    });
  });

  describe('update', () => {
    it('should update an existing product', () => {
      const products = productService.getAll();
      const productToUpdate = products[0];
      const originalName = productToUpdate.name;

      const updated = productService.update(productToUpdate.id, {
        name: 'Updated Product Name',
      });

      expect(updated.name).toBe('Updated Product Name');
      expect(updated.id).toBe(productToUpdate.id);
      expect(updated.updatedAt).not.toBe(productToUpdate.updatedAt);

      // Restore
      productService.update(productToUpdate.id, { name: originalName });
    });

    it('should update stock status when quantity changes', () => {
      const products = productService.getAll();
      const product = products.find(p => p.stockStatus === STOCK_STATUS.IN_STOCK);

      if (product) {
        const originalQty = product.stockQuantity;

        // Set to 0
        const updated = productService.update(product.id, {
          stockQuantity: 0,
        });
        expect(updated.stockStatus).toBe(STOCK_STATUS.OUT_OF_STOCK);

        // Restore
        productService.update(product.id, { stockQuantity: originalQty });
      }
    });

    it('should throw error for non-existent product', () => {
      expect(() => {
        productService.update('non-existent-id', { name: 'Test' });
      }).toThrow(/not found/);
    });
  });

  describe('delete', () => {
    it('should delete an existing product', () => {
      const products = productService.getAll();
      const categoryId = products[0].categoryId;
      const brandId = products[0].brandId;

      // Create a product to delete
      const newProduct = productService.create({
        sku: 'PRODUCT-TO-DELETE',
        name: 'Product To Delete',
        description: 'Description',
        categoryId,
        brandId,
      });

      const result = productService.delete(newProduct.id);
      expect(result).toBe(true);

      const retrieved = productService.getById(newProduct.id);
      expect(retrieved).toBeNull();
    });

    it('should throw error for non-existent product', () => {
      expect(() => {
        productService.delete('non-existent-id');
      }).toThrow(/not found/);
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple products', () => {
      const products = productService.getAll();
      const categoryId = products[0].categoryId;
      const brandId = products[0].brandId;

      // Create products to delete
      const p1 = productService.create({
        sku: 'BULK-DEL-1',
        name: 'Bulk Delete 1',
        description: 'Description',
        categoryId,
        brandId,
      });
      const p2 = productService.create({
        sku: 'BULK-DEL-2',
        name: 'Bulk Delete 2',
        description: 'Description',
        categoryId,
        brandId,
      });

      const deletedCount = productService.deleteMany([p1.id, p2.id]);
      expect(deletedCount).toBe(2);
    });
  });

  describe('togglePublished', () => {
    it('should toggle product published status', () => {
      const products = productService.getAll();
      const product = products[0];
      const originalStatus = product.isPublished;

      const toggled = productService.togglePublished(product.id);
      expect(toggled.isPublished).toBe(!originalStatus);

      // Toggle back
      productService.togglePublished(product.id);
    });
  });

  describe('toggleFeatured', () => {
    it('should toggle product featured status', () => {
      const products = productService.getAll();
      const product = products[0];
      const originalStatus = product.isFeatured;

      const toggled = productService.toggleFeatured(product.id);
      expect(toggled.isFeatured).toBe(!originalStatus);

      // Toggle back
      productService.toggleFeatured(product.id);
    });
  });

  describe('duplicate', () => {
    it('should duplicate a product', () => {
      const products = productService.getAll();
      const original = products[0];

      const duplicate = productService.duplicate(original.id);

      expect(duplicate.id).not.toBe(original.id);
      expect(duplicate.sku).toContain('-COPY');
      expect(duplicate.name).toContain('(Copy)');
      expect(duplicate.isPublished).toBe(false);
      expect(duplicate.stockQuantity).toBe(0);
    });
  });

  describe('adjustInventory', () => {
    it('should increase inventory', () => {
      const products = productService.getAll();
      const product = products[0];
      const originalQty = product.stockQuantity;

      const updated = productService.adjustInventory(
        product.id,
        50,
        INVENTORY_REASON.RESTOCK,
        'Test restock'
      );

      expect(updated.stockQuantity).toBe(originalQty + 50);

      // Restore
      productService.adjustInventory(product.id, -50, INVENTORY_REASON.ADJUSTMENT);
    });

    it('should decrease inventory', () => {
      const products = productService.getAll();
      const product = products.find(p => p.stockQuantity > 10);

      if (product) {
        const originalQty = product.stockQuantity;

        const updated = productService.adjustInventory(
          product.id,
          -5,
          INVENTORY_REASON.SALE,
          'Test sale'
        );

        expect(updated.stockQuantity).toBe(originalQty - 5);

        // Restore
        productService.adjustInventory(product.id, 5, INVENTORY_REASON.RETURN);
      }
    });

    it('should not go below zero', () => {
      const products = productService.getAll();
      const product = products[0];
      const originalQty = product.stockQuantity;

      const updated = productService.adjustInventory(
        product.id,
        -(originalQty + 100),
        INVENTORY_REASON.ADJUSTMENT
      );

      expect(updated.stockQuantity).toBe(0);

      // Restore
      productService.setInventory(product.id, originalQty);
    });

    it('should update stock status', () => {
      const products = productService.getAll();
      const product = products.find(p => p.stockStatus === STOCK_STATUS.IN_STOCK);

      if (product) {
        const originalQty = product.stockQuantity;

        // Set to low stock
        productService.setInventory(product.id, 5);
        const lowStock = productService.getById(product.id);
        expect(lowStock?.stockStatus).toBe(STOCK_STATUS.LOW_STOCK);

        // Restore
        productService.setInventory(product.id, originalQty);
      }
    });
  });

  describe('setInventory', () => {
    it('should set inventory to specific value', () => {
      const products = productService.getAll();
      const product = products[0];
      const originalQty = product.stockQuantity;

      const updated = productService.setInventory(product.id, 999);
      expect(updated.stockQuantity).toBe(999);

      // Restore
      productService.setInventory(product.id, originalQty);
    });
  });

  describe('getInventoryLogs', () => {
    it('should return inventory logs for a product', () => {
      const products = productService.getAll();
      const product = products[0];
      const originalQty = product.stockQuantity;

      // Make some adjustments
      productService.adjustInventory(product.id, 10, INVENTORY_REASON.RESTOCK, 'Test');
      productService.adjustInventory(product.id, -5, INVENTORY_REASON.SALE, 'Test');

      const logs = productService.getInventoryLogs(product.id);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].productId).toBe(product.id);

      // Restore
      productService.setInventory(product.id, originalQty);
    });
  });

  describe('getStats', () => {
    it('should return dashboard statistics', () => {
      const stats = productService.getStats();

      expect(stats.totalProducts).toBeDefined();
      expect(stats.publishedProducts).toBeDefined();
      expect(stats.lowStockProducts).toBeDefined();
      expect(stats.outOfStockProducts).toBeDefined();
      expect(typeof stats.totalProducts).toBe('number');
    });
  });

  describe('getCount', () => {
    it('should return total product count', () => {
      const count = productService.getCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getPublishedCount', () => {
    it('should return published product count', () => {
      const publishedCount = productService.getPublishedCount();
      const totalCount = productService.getCount();
      expect(typeof publishedCount).toBe('number');
      expect(publishedCount).toBeLessThanOrEqual(totalCount);
    });
  });
});
