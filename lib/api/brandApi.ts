/**
 * Brand API Client
 *
 * Client-side service for brand API operations.
 *
 * @module lib/api/brandApi
 */

import { Brand, BrandInput, PaginatedResult, PaginationParams } from '@/lib/data/types';

const API_BASE = '/api/brands';

export interface BrandFilter {
  search?: string;
  active?: boolean;
}

/**
 * Fetch all brands (or with filters/pagination)
 */
export async function getBrands(
  params?: PaginationParams,
  filter?: BrandFilter
): Promise<PaginatedResult<Brand>> {
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
  }

  const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE;
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch brands');
  }

  return res.json();
}

/**
 * Fetch active brands only
 */
export async function getActiveBrands(): Promise<Brand[]> {
  const result = await getBrands(undefined, { active: true });
  return result.data;
}

/**
 * Fetch a single brand by ID
 */
export async function getBrandById(id: string): Promise<Brand | null> {
  const res = await fetch(`${API_BASE}/${id}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch brand');
  }

  return res.json();
}

/**
 * Create a new brand
 */
export async function createBrand(input: BrandInput): Promise<Brand> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create brand');
  }

  return res.json();
}

/**
 * Update an existing brand
 */
export async function updateBrand(id: string, input: Partial<BrandInput>): Promise<Brand> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update brand');
  }

  return res.json();
}

/**
 * Toggle brand active status
 */
export async function toggleBrandStatus(id: string): Promise<Brand> {
  const brand = await getBrandById(id);
  if (!brand) {
    throw new Error('Brand not found');
  }
  return updateBrand(id, { isActive: !brand.isActive });
}

/**
 * Delete a brand
 */
export async function deleteBrand(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete brand');
  }

  return true;
}

/**
 * Brand API service object (for compatibility with existing code)
 */
export const brandApiService = {
  getAll: async () => (await getBrands()).data,
  getActive: getActiveBrands,
  getPaginated: getBrands,
  getById: getBrandById,
  create: createBrand,
  update: updateBrand,
  toggleStatus: toggleBrandStatus,
  delete: deleteBrand,
};
