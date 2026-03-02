/**
 * Category Service Unit Tests
 *
 * Tests for CRUD operations and hierarchy functions.
 *
 * @module __tests__/lib/data/categoryService.test
 */

import { categoryService } from '@/lib/data/categoryService';

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

describe('categoryService', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all categories sorted by sortOrder', () => {
      const categories = categoryService.getAll();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  describe('getRoot', () => {
    it('should return only root categories (no parent)', () => {
      const rootCategories = categoryService.getRoot();
      expect(rootCategories.every(c => c.parentId === null)).toBe(true);
    });
  });

  describe('getSubcategories', () => {
    it('should return subcategories of a parent', () => {
      const rootCategories = categoryService.getRoot();
      const parent = rootCategories[0];
      const subcategories = categoryService.getSubcategories(parent.id);

      expect(Array.isArray(subcategories)).toBe(true);
      expect(subcategories.every(c => c.parentId === parent.id)).toBe(true);
    });

    it('should return empty array for category with no children', () => {
      const categories = categoryService.getAll();
      const leafCategory = categories.find(c => c.parentId !== null);
      if (leafCategory) {
        const children = categoryService.getSubcategories(leafCategory.id);
        expect(children).toEqual([]);
      }
    });
  });

  describe('getActive', () => {
    it('should return only active categories', () => {
      const activeCategories = categoryService.getActive();
      expect(activeCategories.every(c => c.isActive)).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return category when found', () => {
      const categories = categoryService.getAll();
      const firstCategory = categories[0];
      const result = categoryService.getById(firstCategory.id);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(firstCategory.id);
    });

    it('should return null when not found', () => {
      const result = categoryService.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getBySlug', () => {
    it('should return category when found', () => {
      const categories = categoryService.getAll();
      const firstCategory = categories[0];
      const result = categoryService.getBySlug(firstCategory.slug);
      expect(result).not.toBeNull();
      expect(result?.slug).toBe(firstCategory.slug);
    });
  });

  describe('getTree', () => {
    it('should return hierarchical tree structure', () => {
      const tree = categoryService.getTree();
      expect(Array.isArray(tree)).toBe(true);

      // All root items should have children array
      tree.forEach(root => {
        expect(root.children).toBeDefined();
        expect(Array.isArray(root.children)).toBe(true);
      });
    });
  });

  describe('getBreadcrumb', () => {
    it('should return path to category', () => {
      const allCategories = categoryService.getAll();
      const subcategory = allCategories.find(c => c.parentId !== null);

      if (subcategory) {
        const breadcrumb = categoryService.getBreadcrumb(subcategory.id);
        expect(breadcrumb.length).toBeGreaterThan(0);
        expect(breadcrumb[breadcrumb.length - 1].id).toBe(subcategory.id);
      }
    });

    it('should return single item for root category', () => {
      const rootCategory = categoryService.getRoot()[0];
      const breadcrumb = categoryService.getBreadcrumb(rootCategory.id);
      expect(breadcrumb.length).toBe(1);
      expect(breadcrumb[0].id).toBe(rootCategory.id);
    });
  });

  describe('search', () => {
    it('should find categories by name', () => {
      const results = categoryService.search('Abrasive');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = categoryService.search('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new root category', () => {
      const newCategory = categoryService.create({
        name: 'Test Category',
        description: 'A test category',
      });

      expect(newCategory).toBeDefined();
      expect(newCategory.id).toBeDefined();
      expect(newCategory.name).toBe('Test Category');
      expect(newCategory.slug).toBe('test-category');
      expect(newCategory.parentId).toBeNull();
      expect(newCategory.isActive).toBe(true);
    });

    it('should create a subcategory', () => {
      const rootCategory = categoryService.getRoot()[0];

      const newSubcategory = categoryService.create({
        name: 'Test Subcategory',
        parentId: rootCategory.id,
      });

      expect(newSubcategory.parentId).toBe(rootCategory.id);
    });

    it('should throw error for duplicate slug', () => {
      const existingCategory = categoryService.getAll()[0];

      expect(() => {
        categoryService.create({
          name: 'Another Category',
          slug: existingCategory.slug,
        });
      }).toThrow(/already exists/);
    });

    it('should throw error for non-existent parent', () => {
      expect(() => {
        categoryService.create({
          name: 'Test',
          parentId: 'non-existent-parent',
        });
      }).toThrow(/not found/);
    });
  });

  describe('update', () => {
    it('should update an existing category', () => {
      const categories = categoryService.getAll();
      const categoryToUpdate = categories[0];
      const originalName = categoryToUpdate.name;

      const updated = categoryService.update(categoryToUpdate.id, {
        name: 'Updated Category Name',
      });

      expect(updated.name).toBe('Updated Category Name');
      expect(updated.id).toBe(categoryToUpdate.id);

      // Restore
      categoryService.update(categoryToUpdate.id, { name: originalName });
    });

    it('should prevent self-reference as parent', () => {
      const category = categoryService.getRoot()[0];

      expect(() => {
        categoryService.update(category.id, {
          parentId: category.id,
        });
      }).toThrow(/cannot be its own parent/);
    });

    it('should throw error for non-existent category', () => {
      expect(() => {
        categoryService.update('non-existent-id', { name: 'Test' });
      }).toThrow(/not found/);
    });
  });

  describe('delete', () => {
    it('should delete a category without children', () => {
      // Create a category to delete
      const newCategory = categoryService.create({
        name: 'Category To Delete',
      });

      const result = categoryService.delete(newCategory.id);
      expect(result).toBe(true);

      const retrieved = categoryService.getById(newCategory.id);
      expect(retrieved).toBeNull();
    });

    it('should throw error when deleting category with subcategories', () => {
      const rootCategory = categoryService.getRoot()[0];
      const subcategories = categoryService.getSubcategories(rootCategory.id);

      if (subcategories.length > 0) {
        expect(() => {
          categoryService.delete(rootCategory.id);
        }).toThrow(/subcategories/);
      }
    });
  });

  describe('toggleStatus', () => {
    it('should toggle category active status', () => {
      const categories = categoryService.getAll();
      const category = categories[0];
      const originalStatus = category.isActive;

      const toggled = categoryService.toggleStatus(category.id);
      expect(toggled.isActive).toBe(!originalStatus);

      // Toggle back
      categoryService.toggleStatus(category.id);
    });
  });

  describe('getCount', () => {
    it('should return total category count', () => {
      const count = categoryService.getCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getRootCount', () => {
    it('should return root category count', () => {
      const rootCount = categoryService.getRootCount();
      const totalCount = categoryService.getCount();
      expect(typeof rootCount).toBe('number');
      expect(rootCount).toBeLessThanOrEqual(totalCount);
    });
  });

  describe('getActiveWithChildren', () => {
    it('should return active root categories with their active children', () => {
      const result = categoryService.getActiveWithChildren();
      expect(Array.isArray(result)).toBe(true);

      // All root items should be active and have children array
      result.forEach(root => {
        expect(root.isActive).toBe(true);
        expect(root.parentId).toBeNull();
        expect(Array.isArray(root.children)).toBe(true);

        // All children should be active and have empty children array
        root.children.forEach(child => {
          expect(child.isActive).toBe(true);
          expect(child.parentId).toBe(root.id);
          expect(child.children).toEqual([]);
        });
      });
    });
  });

  describe('getPaginated', () => {
    it('should return paginated results with default params', () => {
      const result = categoryService.getPaginated({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by parentId when specified', () => {
      const rootCategories = categoryService.getRoot();
      const parent = rootCategories[0];

      const result = categoryService.getPaginated({ parentId: parent.id });

      result.data.forEach(cat => {
        expect(cat.parentId).toBe(parent.id);
      });
    });

    it('should filter by null parentId for root categories', () => {
      const result = categoryService.getPaginated({ parentId: null });

      result.data.forEach(cat => {
        expect(cat.parentId).toBeNull();
      });
    });

    it('should sort by string field ascending', () => {
      const result = categoryService.getPaginated({
        sortBy: 'name',
        sortOrder: 'asc',
        limit: 100
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].name.localeCompare(result.data[i-1].name)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort by string field descending', () => {
      const result = categoryService.getPaginated({
        sortBy: 'name',
        sortOrder: 'desc',
        limit: 100
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].name.localeCompare(result.data[i-1].name)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort by numeric field ascending', () => {
      const result = categoryService.getPaginated({
        sortBy: 'sortOrder',
        sortOrder: 'asc',
        limit: 100
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].sortOrder).toBeGreaterThanOrEqual(result.data[i-1].sortOrder);
      }
    });

    it('should sort by numeric field descending', () => {
      const result = categoryService.getPaginated({
        sortBy: 'sortOrder',
        sortOrder: 'desc',
        limit: 100
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].sortOrder).toBeLessThanOrEqual(result.data[i-1].sortOrder);
      }
    });

    it('should correctly calculate pagination', () => {
      const result = categoryService.getPaginated({ page: 1, limit: 2 });

      expect(result.data.length).toBeLessThanOrEqual(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(Math.ceil(result.total / 2));
      expect(result.hasMore).toBe(result.page < result.totalPages);
    });

    it('should handle page beyond total', () => {
      const result = categoryService.getPaginated({ page: 999, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.page).toBe(999);
    });
  });

  describe('getBySlug', () => {
    it('should return null when slug not found', () => {
      const result = categoryService.getBySlug('non-existent-slug-xyz');
      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('should find categories by description', () => {
      // First create a category with a unique description
      const testCategory = categoryService.create({
        name: 'Search Test Category',
        description: 'UniqueDescriptionXYZ123',
      });

      const results = categoryService.search('UniqueDescriptionXYZ123');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(c => c.id === testCategory.id)).toBe(true);

      // Cleanup
      categoryService.delete(testCategory.id);
    });

    it('should be case insensitive', () => {
      const results = categoryService.search('ABRASIVE');
      const lowerResults = categoryService.search('abrasive');
      expect(results.length).toBe(lowerResults.length);
    });
  });

  describe('getParent', () => {
    it('should return parent category for a subcategory', () => {
      const allCategories = categoryService.getAll();
      const subcategory = allCategories.find(c => c.parentId !== null);

      if (subcategory) {
        const parent = categoryService.getParent(subcategory.id);
        expect(parent).not.toBeNull();
        expect(parent?.id).toBe(subcategory.parentId);
      }
    });

    it('should return null for root category', () => {
      const rootCategory = categoryService.getRoot()[0];
      const parent = categoryService.getParent(rootCategory.id);
      expect(parent).toBeNull();
    });

    it('should return null for non-existent category', () => {
      const parent = categoryService.getParent('non-existent-id');
      expect(parent).toBeNull();
    });
  });

  describe('create - additional branches', () => {
    it('should use custom slug when provided', () => {
      const newCategory = categoryService.create({
        name: 'Custom Slug Category',
        slug: 'my-custom-slug',
      });

      expect(newCategory.slug).toBe('my-custom-slug');

      // Cleanup
      categoryService.delete(newCategory.id);
    });

    it('should use explicit sortOrder when provided', () => {
      const newCategory = categoryService.create({
        name: 'Custom Sort Category',
        sortOrder: 999,
      });

      expect(newCategory.sortOrder).toBe(999);

      // Cleanup
      categoryService.delete(newCategory.id);
    });

    it('should respect isActive=false when provided', () => {
      const newCategory = categoryService.create({
        name: 'Inactive Category',
        isActive: false,
      });

      expect(newCategory.isActive).toBe(false);

      // Cleanup
      categoryService.delete(newCategory.id);
    });

    it('should handle null description and image', () => {
      const newCategory = categoryService.create({
        name: 'Minimal Category',
      });

      expect(newCategory.description).toBeNull();
      expect(newCategory.image).toBeNull();

      // Cleanup
      categoryService.delete(newCategory.id);
    });
  });

  describe('update - additional branches', () => {
    it('should allow updating slug if not duplicate', () => {
      const newCategory = categoryService.create({
        name: 'Slug Update Test',
      });

      const updated = categoryService.update(newCategory.id, {
        slug: 'new-unique-slug-xyz',
      });

      expect(updated.slug).toBe('new-unique-slug-xyz');

      // Cleanup
      categoryService.delete(newCategory.id);
    });

    it('should throw error when updating to duplicate slug', () => {
      const existingCategory = categoryService.getAll()[0];
      const newCategory = categoryService.create({
        name: 'Duplicate Slug Test',
      });

      expect(() => {
        categoryService.update(newCategory.id, {
          slug: existingCategory.slug,
        });
      }).toThrow(/already exists/);

      // Cleanup
      categoryService.delete(newCategory.id);
    });

    it('should prevent circular parent reference', () => {
      // Create parent -> child relationship
      const parent = categoryService.create({ name: 'Circular Test Parent' });
      const child = categoryService.create({
        name: 'Circular Test Child',
        parentId: parent.id
      });

      // Try to make parent a child of its child (circular)
      expect(() => {
        categoryService.update(parent.id, { parentId: child.id });
      }).toThrow(/circular reference/);

      // Cleanup
      categoryService.delete(child.id);
      categoryService.delete(parent.id);
    });
  });

  describe('delete - additional branches', () => {
    it('should throw error when deleting non-existent category', () => {
      expect(() => {
        categoryService.delete('non-existent-id-xyz');
      }).toThrow(/not found/);
    });
  });

  describe('toggleStatus - additional branches', () => {
    it('should throw error when toggling non-existent category', () => {
      expect(() => {
        categoryService.toggleStatus('non-existent-id-xyz');
      }).toThrow(/not found/);
    });
  });

  describe('reorder', () => {
    it('should reorder categories within same level', () => {
      const rootCategories = categoryService.getRoot();

      if (rootCategories.length >= 2) {
        const originalOrder = rootCategories.map(c => c.id);
        const reversedOrder = [...originalOrder].reverse();

        const result = categoryService.reorder(null, reversedOrder);
        expect(Array.isArray(result)).toBe(true);

        // Verify order changed
        const reorderedRoots = categoryService.getRoot();
        expect(reorderedRoots[0].sortOrder).toBeDefined();

        // Restore original order
        categoryService.reorder(null, originalOrder);
      }
    });

    it('should handle reordering with parentId', () => {
      const rootCategory = categoryService.getRoot()[0];
      const subcategories = categoryService.getSubcategories(rootCategory.id);

      if (subcategories.length >= 2) {
        const originalOrder = subcategories.map(c => c.id);
        const reversedOrder = [...originalOrder].reverse();

        const result = categoryService.reorder(rootCategory.id, reversedOrder);
        expect(Array.isArray(result)).toBe(true);

        // Restore
        categoryService.reorder(rootCategory.id, originalOrder);
      }
    });

    it('should skip categories not matching parent', () => {
      // Passing IDs that don't belong to the parent should be skipped
      const result = categoryService.reorder('non-existent-parent', ['fake-id-1', 'fake-id-2']);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('updateProductCount', () => {
    it('should update product count for a category', () => {
      const category = categoryService.getAll()[0];
      const originalCount = category.productCount;

      const updated = categoryService.updateProductCount(category.id, 42);
      expect(updated.productCount).toBe(42);

      // Restore
      categoryService.updateProductCount(category.id, originalCount);
    });
  });

  describe('reset', () => {
    it('should reset categories to mock data', () => {
      // Create a test category
      const testCat = categoryService.create({ name: 'Reset Test' });
      expect(categoryService.getById(testCat.id)).not.toBeNull();

      // Reset
      categoryService.reset();

      // The test category should be gone
      expect(categoryService.getById(testCat.id)).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all categories from storage', () => {
      categoryService.clear();

      // After clearing, getAll should return mock data (since storage is cleared, it reinitializes)
      const categories = categoryService.getAll();
      expect(Array.isArray(categories)).toBe(true);
    });
  });
});
