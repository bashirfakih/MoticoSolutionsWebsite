/**
 * Category API Client
 *
 * Client-side service for category API operations.
 *
 * @module lib/api/categoryApi
 */

import { Category, CategoryInput, PaginatedResult, PaginationParams } from '@/lib/data/types';

const API_BASE = '/api/categories';

export interface CategoryFilter {
  search?: string;
  active?: boolean;
  parentId?: string | null;
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  parent?: { id: string; name: string; slug: string } | null;
  childrenCount?: number;
}

/**
 * Fetch all categories (or with filters/pagination)
 */
export async function getCategories(
  params?: PaginationParams,
  filter?: CategoryFilter
): Promise<PaginatedResult<CategoryWithChildren>> {
  const searchParams = new URLSearchParams();

  if (params) {
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  }

  if (filter) {
    if (filter.search) searchParams.set('search', filter.search);
    if (filter.active !== undefined) searchParams.set('active', String(filter.active));
    if (filter.parentId !== undefined) {
      searchParams.set('parentId', filter.parentId === null ? 'null' : filter.parentId);
    }
  }

  const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE;
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch categories');
  }

  return res.json();
}

/**
 * Fetch category tree (hierarchical structure)
 */
export async function getCategoryTree(): Promise<CategoryWithChildren[]> {
  const res = await fetch(`${API_BASE}?tree=true`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch category tree');
  }

  const result = await res.json();
  return result.data;
}

/**
 * Fetch active categories only
 */
export async function getActiveCategories(): Promise<Category[]> {
  const result = await getCategories(undefined, { active: true });
  return result.data;
}

/**
 * Fetch root categories (no parent)
 */
export async function getRootCategories(): Promise<Category[]> {
  const result = await getCategories(undefined, { parentId: null });
  return result.data;
}

/**
 * Fetch a single category by ID
 */
export async function getCategoryById(id: string): Promise<CategoryWithChildren | null> {
  const res = await fetch(`${API_BASE}/${id}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch category');
  }

  return res.json();
}

/**
 * Create a new category
 */
export async function createCategory(input: CategoryInput): Promise<Category> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create category');
  }

  return res.json();
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update category');
  }

  return res.json();
}

/**
 * Toggle category active status
 */
export async function toggleCategoryStatus(id: string): Promise<Category> {
  const category = await getCategoryById(id);
  if (!category) {
    throw new Error('Category not found');
  }
  return updateCategory(id, { isActive: !category.isActive });
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete category');
  }

  return true;
}

/**
 * Category API service object (for compatibility with existing code)
 */
export const categoryApiService = {
  getAll: async () => (await getCategories()).data,
  getActive: getActiveCategories,
  getTree: getCategoryTree,
  getRootCategories,
  getPaginated: getCategories,
  getById: getCategoryById,
  create: createCategory,
  update: updateCategory,
  toggleStatus: toggleCategoryStatus,
  delete: deleteCategory,
};
