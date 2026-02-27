/**
 * Product API Client
 *
 * Client-side service for product API operations.
 *
 * @module lib/api/productApi
 */

import { Product, ProductInput, PaginatedResult, PaginationParams, StockStatus } from '@/lib/data/types';

const API_BASE = '/api/products';

export interface ProductFilter {
  search?: string;
  categoryId?: string;
  brandId?: string;
  published?: boolean;
  featured?: boolean;
  stockStatus?: StockStatus;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Fetch all products (or with filters/pagination)
 */
export async function getProducts(
  params?: PaginationParams,
  filter?: ProductFilter
): Promise<PaginatedResult<Product>> {
  const searchParams = new URLSearchParams();

  if (params) {
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  }

  if (filter) {
    if (filter.search) searchParams.set('search', filter.search);
    if (filter.categoryId) searchParams.set('categoryId', filter.categoryId);
    if (filter.brandId) searchParams.set('brandId', filter.brandId);
    if (filter.published !== undefined) searchParams.set('published', String(filter.published));
    if (filter.featured !== undefined) searchParams.set('featured', String(filter.featured));
    if (filter.stockStatus) searchParams.set('stockStatus', filter.stockStatus);
    if (filter.minPrice !== undefined) searchParams.set('minPrice', String(filter.minPrice));
    if (filter.maxPrice !== undefined) searchParams.set('maxPrice', String(filter.maxPrice));
  }

  const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE;
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch products');
  }

  return res.json();
}

/**
 * Fetch published products only
 */
export async function getPublishedProducts(): Promise<Product[]> {
  const result = await getProducts(undefined, { published: true });
  return result.data;
}

/**
 * Fetch featured products
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const result = await getProducts(undefined, { featured: true, published: true });
  return result.data;
}

/**
 * Fetch products by category
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const result = await getProducts(undefined, { categoryId, published: true });
  return result.data;
}

/**
 * Fetch products by brand
 */
export async function getProductsByBrand(brandId: string): Promise<Product[]> {
  const result = await getProducts(undefined, { brandId, published: true });
  return result.data;
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const res = await fetch(`${API_BASE}/${id}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch product');
  }

  return res.json();
}

/**
 * Create a new product
 */
export async function createProduct(input: ProductInput): Promise<Product> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create product');
  }

  return res.json();
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, input: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update product');
  }

  return res.json();
}

/**
 * Toggle product published status
 */
export async function togglePublished(id: string): Promise<Product> {
  const product = await getProductById(id);
  if (!product) {
    throw new Error('Product not found');
  }
  return updateProduct(id, { isPublished: !product.isPublished });
}

/**
 * Toggle product featured status
 */
export async function toggleFeatured(id: string): Promise<Product> {
  const product = await getProductById(id);
  if (!product) {
    throw new Error('Product not found');
  }
  return updateProduct(id, { isFeatured: !product.isFeatured });
}

/**
 * Update stock quantity
 */
export async function updateStock(id: string, quantity: number): Promise<Product> {
  return updateProduct(id, {
    stockQuantity: quantity,
    stockStatus: quantity <= 0 ? 'out_of_stock' : quantity <= 10 ? 'low_stock' : 'in_stock',
  });
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete product');
  }

  return true;
}

/**
 * Product API service object (for compatibility with existing code)
 */
export const productApiService = {
  getAll: async () => (await getProducts()).data,
  getPublished: getPublishedProducts,
  getFeatured: getFeaturedProducts,
  getByCategory: getProductsByCategory,
  getByBrand: getProductsByBrand,
  getPaginated: getProducts,
  getById: getProductById,
  create: createProduct,
  update: updateProduct,
  togglePublished,
  toggleFeatured,
  updateStock,
  delete: deleteProduct,
};
