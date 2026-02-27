/**
 * Category Service for Motico Solutions CRM
 *
 * CRUD operations for categories using localStorage.
 * Supports hierarchical parent-child relationships.
 *
 * @module lib/data/categoryService
 */

import {
  Category,
  CategoryInput,
  CategoryWithChildren,
  PaginatedResult,
  PaginationParams,
  generateId,
  generateSlug,
  getCurrentTimestamp,
} from './types';
import { MOCK_CATEGORIES } from './mockCategories';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'motico_categories';
const isClient = typeof window !== 'undefined';

// ═══════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize storage with mock data if empty
 */
function initializeStorage(): void {
  if (!isClient) return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CATEGORIES));
  }
}

/**
 * Get all categories from storage
 */
function getFromStorage(): Category[] {
  if (!isClient) return MOCK_CATEGORIES;

  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : MOCK_CATEGORIES;
}

/**
 * Save categories to storage
 */
function saveToStorage(categories: Category[]): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

// ═══════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all categories
 */
export function getAllCategories(): Category[] {
  return getFromStorage().sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get top-level categories only (no parent)
 */
export function getRootCategories(): Category[] {
  return getAllCategories().filter(cat => cat.parentId === null);
}

/**
 * Get subcategories of a parent category
 */
export function getSubcategories(parentId: string): Category[] {
  return getAllCategories().filter(cat => cat.parentId === parentId);
}

/**
 * Get active categories only
 */
export function getActiveCategories(): Category[] {
  return getAllCategories().filter(cat => cat.isActive);
}

/**
 * Get active root categories with active subcategories
 */
export function getActiveCategoriesWithChildren(): CategoryWithChildren[] {
  const categories = getActiveCategories();
  const rootCategories = categories.filter(cat => cat.parentId === null);

  return rootCategories.map(root => ({
    ...root,
    children: categories
      .filter(cat => cat.parentId === root.id)
      .map(child => ({ ...child, children: [] })),
  }));
}

/**
 * Get full category tree (all categories with children)
 */
export function getCategoryTree(): CategoryWithChildren[] {
  const categories = getAllCategories();
  const rootCategories = categories.filter(cat => cat.parentId === null);

  const buildChildren = (parentId: string): CategoryWithChildren[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(cat => ({
        ...cat,
        children: buildChildren(cat.id),
      }));
  };

  return rootCategories
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(root => ({
      ...root,
      children: buildChildren(root.id),
    }));
}

/**
 * Get categories with pagination
 */
export function getCategoriesPaginated(
  params: PaginationParams & { parentId?: string | null }
): PaginatedResult<Category> {
  const { page = 1, limit = 10, sortBy = 'sortOrder', sortOrder = 'asc', parentId } = params;

  let categories = getFromStorage();

  // Filter by parent if specified
  if (parentId !== undefined) {
    categories = categories.filter(cat => cat.parentId === parentId);
  }

  // Sort
  categories = categories.sort((a, b) => {
    const aVal = a[sortBy as keyof Category];
    const bVal = b[sortBy as keyof Category];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  const total = categories.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = categories.slice(offset, offset + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

/**
 * Get category by ID
 */
export function getCategoryById(id: string): Category | null {
  const categories = getFromStorage();
  return categories.find(cat => cat.id === id) || null;
}

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): Category | null {
  const categories = getFromStorage();
  return categories.find(cat => cat.slug === slug) || null;
}

/**
 * Search categories by name
 */
export function searchCategories(query: string): Category[] {
  const categories = getFromStorage();
  const lowerQuery = query.toLowerCase();
  return categories.filter(
    cat =>
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get parent category of a subcategory
 */
export function getParentCategory(categoryId: string): Category | null {
  const category = getCategoryById(categoryId);
  if (!category || !category.parentId) return null;
  return getCategoryById(category.parentId);
}

/**
 * Get category breadcrumb path
 */
export function getCategoryBreadcrumb(categoryId: string): Category[] {
  const breadcrumb: Category[] = [];
  let current = getCategoryById(categoryId);

  while (current) {
    breadcrumb.unshift(current);
    current = current.parentId ? getCategoryById(current.parentId) : null;
  }

  return breadcrumb;
}

/**
 * Create a new category
 */
export function createCategory(input: CategoryInput): Category {
  const categories = getFromStorage();

  // Check for duplicate slug
  const slug = input.slug || generateSlug(input.name);
  const existingSlug = categories.find(c => c.slug === slug);
  if (existingSlug) {
    throw new Error(`A category with slug "${slug}" already exists`);
  }

  // Validate parent exists if specified
  if (input.parentId) {
    const parent = categories.find(c => c.id === input.parentId);
    if (!parent) {
      throw new Error(`Parent category with ID "${input.parentId}" not found`);
    }
  }

  const now = getCurrentTimestamp();

  // Get max sort order within the same level
  const siblings = categories.filter(c => c.parentId === (input.parentId || null));
  const maxSortOrder = Math.max(...siblings.map(c => c.sortOrder), 0);

  const newCategory: Category = {
    id: generateId(),
    name: input.name,
    slug,
    description: input.description || null,
    image: input.image || null,
    parentId: input.parentId || null,
    sortOrder: input.sortOrder ?? maxSortOrder + 1,
    isActive: input.isActive ?? true,
    productCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  categories.push(newCategory);
  saveToStorage(categories);

  return newCategory;
}

/**
 * Update an existing category
 */
export function updateCategory(id: string, input: Partial<CategoryInput>): Category {
  const categories = getFromStorage();
  const index = categories.findIndex(cat => cat.id === id);

  if (index === -1) {
    throw new Error(`Category with ID "${id}" not found`);
  }

  // Check for duplicate slug if changing
  if (input.slug && input.slug !== categories[index].slug) {
    const existingSlug = categories.find(c => c.slug === input.slug && c.id !== id);
    if (existingSlug) {
      throw new Error(`A category with slug "${input.slug}" already exists`);
    }
  }

  // Prevent setting self as parent
  if (input.parentId === id) {
    throw new Error('A category cannot be its own parent');
  }

  // Prevent circular references
  if (input.parentId) {
    let parent = getCategoryById(input.parentId);
    while (parent) {
      if (parent.parentId === id) {
        throw new Error('This would create a circular reference');
      }
      parent = parent.parentId ? getCategoryById(parent.parentId) : null;
    }
  }

  const updatedCategory: Category = {
    ...categories[index],
    ...input,
    updatedAt: getCurrentTimestamp(),
  };

  categories[index] = updatedCategory;
  saveToStorage(categories);

  return updatedCategory;
}

/**
 * Delete a category
 */
export function deleteCategory(id: string): boolean {
  const categories = getFromStorage();
  const index = categories.findIndex(cat => cat.id === id);

  if (index === -1) {
    throw new Error(`Category with ID "${id}" not found`);
  }

  // Check for subcategories
  const subcategories = categories.filter(c => c.parentId === id);
  if (subcategories.length > 0) {
    throw new Error('Cannot delete category with subcategories. Delete subcategories first.');
  }

  // TODO: Check if category has products before deleting
  // In real implementation, either prevent deletion or handle cascade

  categories.splice(index, 1);
  saveToStorage(categories);

  return true;
}

/**
 * Toggle category active status
 */
export function toggleCategoryStatus(id: string): Category {
  const categories = getFromStorage();
  const category = categories.find(c => c.id === id);

  if (!category) {
    throw new Error(`Category with ID "${id}" not found`);
  }

  return updateCategory(id, { isActive: !category.isActive });
}

/**
 * Reorder categories within the same level
 */
export function reorderCategories(parentId: string | null, orderedIds: string[]): Category[] {
  const categories = getFromStorage();

  orderedIds.forEach((id, index) => {
    const category = categories.find(c => c.id === id && c.parentId === parentId);
    if (category) {
      category.sortOrder = index + 1;
      category.updatedAt = getCurrentTimestamp();
    }
  });

  saveToStorage(categories);
  return getAllCategories();
}

/**
 * Update product count for a category
 */
export function updateProductCount(categoryId: string, count: number): Category {
  return updateCategory(categoryId, { productCount: count } as unknown as Partial<CategoryInput>);
}

/**
 * Get category count
 */
export function getCategoryCount(): number {
  return getFromStorage().length;
}

/**
 * Get root category count
 */
export function getRootCategoryCount(): number {
  return getFromStorage().filter(c => c.parentId === null).length;
}

/**
 * Reset to mock data (for testing)
 */
export function resetCategories(): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CATEGORIES));
}

/**
 * Clear all categories (for testing)
 */
export function clearCategories(): void {
  if (!isClient) return;
  localStorage.removeItem(STORAGE_KEY);
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════

export const categoryService = {
  getAll: getAllCategories,
  getRoot: getRootCategories,
  getSubcategories,
  getActive: getActiveCategories,
  getActiveWithChildren: getActiveCategoriesWithChildren,
  getTree: getCategoryTree,
  getPaginated: getCategoriesPaginated,
  getById: getCategoryById,
  getBySlug: getCategoryBySlug,
  search: searchCategories,
  getParent: getParentCategory,
  getBreadcrumb: getCategoryBreadcrumb,
  create: createCategory,
  update: updateCategory,
  delete: deleteCategory,
  toggleStatus: toggleCategoryStatus,
  reorder: reorderCategories,
  updateProductCount,
  getCount: getCategoryCount,
  getRootCount: getRootCategoryCount,
  reset: resetCategories,
  clear: clearCategories,
};

export default categoryService;
