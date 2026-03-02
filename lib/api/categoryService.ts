/**
 * Category API Service
 *
 * Client-side service for category CRUD operations via API
 */

import { Category, CategoryInput } from '@/lib/data/types';

const API_BASE = '/api/categories';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  parent?: { id: string; name: string; slug: string } | null;
  childrenCount?: number;
}

export interface CategoryTreeItem extends ApiCategory {
  children: CategoryTreeItem[];
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}?limit=500`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  const data = await response.json();
  return data.data.map(mapApiToCategory);
}

/**
 * Get category tree (hierarchical)
 */
export async function getCategoryTree(): Promise<CategoryTreeItem[]> {
  const response = await fetch(`${API_BASE}?tree=true`);
  if (!response.ok) {
    throw new Error('Failed to fetch category tree');
  }
  const data = await response.json();
  return data.data;
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const response = await fetch(`${API_BASE}/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch category');
  }
  const data = await response.json();
  return mapApiToCategory(data);
}

/**
 * Create a new category
 */
export async function createCategory(input: CategoryInput): Promise<Category> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create category');
  }

  const data = await response.json();
  return mapApiToCategory(data);
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update category');
  }

  const data = await response.json();
  return mapApiToCategory(data);
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }

  return true;
}

/**
 * Map API response to Category type
 */
function mapApiToCategory(api: ApiCategory): Category {
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    description: api.description,
    image: api.image,
    parentId: api.parentId,
    sortOrder: api.sortOrder,
    isActive: api.isActive,
    productCount: api.productCount ?? 0,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export const categoryApiService = {
  getAll: getAllCategories,
  getTree: getCategoryTree,
  getById: getCategoryById,
  create: createCategory,
  update: updateCategory,
  delete: deleteCategory,
};

export default categoryApiService;
