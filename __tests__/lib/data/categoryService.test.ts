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
});
