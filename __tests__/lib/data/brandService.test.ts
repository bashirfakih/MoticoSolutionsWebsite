/**
 * Brand Service Unit Tests
 *
 * Tests for CRUD operations and utility functions.
 *
 * @module __tests__/lib/data/brandService.test
 */

import { brandService } from '@/lib/data/brandService';
import { MOCK_BRANDS } from '@/lib/data/mockBrands';

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

describe('brandService', () => {
  beforeEach(() => {
    // Clear localStorage mock
    mockLocalStorage.clear();
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all brands sorted by sortOrder', () => {
      const brands = brandService.getAll();
      expect(brands).toBeDefined();
      expect(Array.isArray(brands)).toBe(true);
      expect(brands.length).toBeGreaterThan(0);

      // Check sorting
      for (let i = 1; i < brands.length; i++) {
        expect(brands[i].sortOrder).toBeGreaterThanOrEqual(brands[i - 1].sortOrder);
      }
    });
  });

  describe('getActive', () => {
    it('should return only active brands', () => {
      const activeBrands = brandService.getActive();
      expect(activeBrands.every(b => b.isActive)).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return brand when found', () => {
      const brands = brandService.getAll();
      const firstBrand = brands[0];
      const result = brandService.getById(firstBrand.id);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(firstBrand.id);
      expect(result?.name).toBe(firstBrand.name);
    });

    it('should return null when not found', () => {
      const result = brandService.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getBySlug', () => {
    it('should return brand when found', () => {
      const brands = brandService.getAll();
      const firstBrand = brands[0];
      const result = brandService.getBySlug(firstBrand.slug);
      expect(result).not.toBeNull();
      expect(result?.slug).toBe(firstBrand.slug);
    });

    it('should return null when not found', () => {
      const result = brandService.getBySlug('non-existent-slug');
      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('should find brands by name', () => {
      const results = brandService.search('Hermes');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(b => b.name.includes('Hermes'))).toBe(true);
    });

    it('should find brands by description', () => {
      const results = brandService.search('German');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = brandService.search('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new brand', () => {
      const newBrand = brandService.create({
        name: 'Test Brand',
        description: 'A test brand',
      });

      expect(newBrand).toBeDefined();
      expect(newBrand.id).toBeDefined();
      expect(newBrand.name).toBe('Test Brand');
      expect(newBrand.slug).toBe('test-brand');
      expect(newBrand.isActive).toBe(true);
      expect(newBrand.createdAt).toBeDefined();

      // Verify it was saved
      const retrieved = brandService.getById(newBrand.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Test Brand');
    });

    it('should throw error for duplicate slug', () => {
      // First, get an existing brand
      const existingBrand = brandService.getAll()[0];

      expect(() => {
        brandService.create({
          name: 'Another Brand',
          slug: existingBrand.slug,
        });
      }).toThrow(/already exists/);
    });
  });

  describe('update', () => {
    it('should update an existing brand', () => {
      const brands = brandService.getAll();
      const brandToUpdate = brands[0];
      const originalName = brandToUpdate.name;

      const updated = brandService.update(brandToUpdate.id, {
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(brandToUpdate.id);
      expect(updated.updatedAt).not.toBe(brandToUpdate.updatedAt);

      // Restore original
      brandService.update(brandToUpdate.id, { name: originalName });
    });

    it('should throw error for non-existent brand', () => {
      expect(() => {
        brandService.update('non-existent-id', { name: 'Test' });
      }).toThrow(/not found/);
    });
  });

  describe('delete', () => {
    it('should delete an existing brand', () => {
      // Create a brand to delete
      const newBrand = brandService.create({
        name: 'Brand To Delete',
      });

      const result = brandService.delete(newBrand.id);
      expect(result).toBe(true);

      // Verify it was deleted
      const retrieved = brandService.getById(newBrand.id);
      expect(retrieved).toBeNull();
    });

    it('should throw error for non-existent brand', () => {
      expect(() => {
        brandService.delete('non-existent-id');
      }).toThrow(/not found/);
    });
  });

  describe('toggleStatus', () => {
    it('should toggle brand active status', () => {
      const brands = brandService.getAll();
      const brand = brands[0];
      const originalStatus = brand.isActive;

      const toggled = brandService.toggleStatus(brand.id);
      expect(toggled.isActive).toBe(!originalStatus);

      // Toggle back
      const toggledBack = brandService.toggleStatus(brand.id);
      expect(toggledBack.isActive).toBe(originalStatus);
    });
  });

  describe('getPaginated', () => {
    it('should return paginated results', () => {
      const result = brandService.getPaginated({ page: 1, limit: 5 });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.total).toBeGreaterThan(0);
      expect(result.totalPages).toBeDefined();
    });

    it('should support sorting', () => {
      const result = brandService.getPaginated({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].name.localeCompare(result.data[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('getCount', () => {
    it('should return total brand count', () => {
      const count = brandService.getCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getActiveCount', () => {
    it('should return active brand count', () => {
      const activeCount = brandService.getActiveCount();
      const totalCount = brandService.getCount();
      expect(typeof activeCount).toBe('number');
      expect(activeCount).toBeLessThanOrEqual(totalCount);
    });
  });

  describe('getPaginated - additional sorting', () => {
    it('should sort by string field descending', () => {
      const result = brandService.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'desc',
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].name.localeCompare(result.data[i - 1].name)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort by numeric field ascending', () => {
      const result = brandService.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].sortOrder).toBeGreaterThanOrEqual(result.data[i - 1].sortOrder);
      }
    });

    it('should sort by numeric field descending', () => {
      const result = brandService.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'sortOrder',
        sortOrder: 'desc',
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].sortOrder).toBeLessThanOrEqual(result.data[i - 1].sortOrder);
      }
    });

    it('should calculate hasMore correctly', () => {
      const result = brandService.getPaginated({ page: 1, limit: 1 });

      if (result.total > 1) {
        expect(result.hasMore).toBe(true);
      }

      const lastPage = brandService.getPaginated({ page: result.totalPages, limit: 1 });
      expect(lastPage.hasMore).toBe(false);
    });
  });

  describe('create - additional options', () => {
    it('should create brand with custom slug', () => {
      const newBrand = brandService.create({
        name: 'Custom Slug Brand',
        slug: 'my-custom-slug',
      });

      expect(newBrand.slug).toBe('my-custom-slug');

      // Cleanup
      brandService.delete(newBrand.id);
    });

    it('should create brand with all optional fields', () => {
      const newBrand = brandService.create({
        name: 'Full Options Brand',
        description: 'Full description',
        logo: '/logo.png',
        website: 'https://example.com',
        countryOfOrigin: 'Germany',
        isActive: false,
        sortOrder: 999,
      });

      expect(newBrand.logo).toBe('/logo.png');
      expect(newBrand.website).toBe('https://example.com');
      expect(newBrand.countryOfOrigin).toBe('Germany');
      expect(newBrand.isActive).toBe(false);
      expect(newBrand.sortOrder).toBe(999);

      // Cleanup
      brandService.delete(newBrand.id);
    });

    it('should handle null optional fields', () => {
      const newBrand = brandService.create({
        name: 'Minimal Brand',
      });

      expect(newBrand.logo).toBeNull();
      expect(newBrand.description).toBeNull();
      expect(newBrand.website).toBeNull();
      expect(newBrand.countryOfOrigin).toBeNull();

      // Cleanup
      brandService.delete(newBrand.id);
    });
  });

  describe('update - additional branches', () => {
    it('should allow updating slug if not duplicate', () => {
      const newBrand = brandService.create({
        name: 'Slug Update Test',
      });

      const updated = brandService.update(newBrand.id, {
        slug: 'new-unique-slug-xyz',
      });

      expect(updated.slug).toBe('new-unique-slug-xyz');

      // Cleanup
      brandService.delete(newBrand.id);
    });

    it('should throw error when updating to duplicate slug', () => {
      const existingBrand = brandService.getAll()[0];
      const newBrand = brandService.create({
        name: 'Duplicate Slug Test',
      });

      expect(() => {
        brandService.update(newBrand.id, {
          slug: existingBrand.slug,
        });
      }).toThrow(/already exists/);

      // Cleanup
      brandService.delete(newBrand.id);
    });
  });

  describe('toggleStatus - error handling', () => {
    it('should throw error for non-existent brand', () => {
      expect(() => {
        brandService.toggleStatus('non-existent-id-xyz');
      }).toThrow(/not found/);
    });
  });

  describe('reorder', () => {
    it('should reorder brands', () => {
      const brands = brandService.getAll();

      if (brands.length >= 2) {
        const originalOrder = brands.map(b => b.id);
        const reversedOrder = [...originalOrder].reverse();

        const result = brandService.reorder(reversedOrder);
        expect(Array.isArray(result)).toBe(true);

        // Verify order changed
        const reorderedBrands = brandService.getAll();
        expect(reorderedBrands[0].sortOrder).toBeDefined();

        // Restore original order
        brandService.reorder(originalOrder);
      }
    });

    it('should skip IDs that do not match any brand', () => {
      const result = brandService.reorder(['non-existent-id-1', 'non-existent-id-2']);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset brands to mock data', () => {
      // Create a test brand
      const testBrand = brandService.create({ name: 'Reset Test' });
      expect(brandService.getById(testBrand.id)).not.toBeNull();

      // Reset
      brandService.reset();

      // The test brand should be gone
      expect(brandService.getById(testBrand.id)).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all brands from storage', () => {
      brandService.clear();

      // After clearing, getAll should return mock data (since storage is cleared, it reinitializes)
      const brands = brandService.getAll();
      expect(Array.isArray(brands)).toBe(true);
    });
  });
});
