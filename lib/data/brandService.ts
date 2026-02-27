/**
 * Brand Service for Motico Solutions CRM
 *
 * CRUD operations for brands using localStorage.
 * Designed to be easily swapped with a real API later.
 *
 * @module lib/data/brandService
 */

import {
  Brand,
  BrandInput,
  PaginatedResult,
  PaginationParams,
  generateId,
  generateSlug,
  getCurrentTimestamp,
} from './types';
import { MOCK_BRANDS } from './mockBrands';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'motico_brands';
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_BRANDS));
  }
}

/**
 * Get all brands from storage
 */
function getFromStorage(): Brand[] {
  if (!isClient) return MOCK_BRANDS;

  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : MOCK_BRANDS;
}

/**
 * Save brands to storage
 */
function saveToStorage(brands: Brand[]): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
}

// ═══════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all brands
 */
export function getAllBrands(): Brand[] {
  return getFromStorage().sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get active brands only
 */
export function getActiveBrands(): Brand[] {
  return getAllBrands().filter(brand => brand.isActive);
}

/**
 * Get brands with pagination
 */
export function getBrandsPaginated(params: PaginationParams): PaginatedResult<Brand> {
  const { page = 1, limit = 10, sortBy = 'sortOrder', sortOrder = 'asc' } = params;

  let brands = getFromStorage();

  // Sort
  brands = brands.sort((a, b) => {
    const aVal = a[sortBy as keyof Brand];
    const bVal = b[sortBy as keyof Brand];

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

  const total = brands.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = brands.slice(offset, offset + limit);

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
 * Get brand by ID
 */
export function getBrandById(id: string): Brand | null {
  const brands = getFromStorage();
  return brands.find(brand => brand.id === id) || null;
}

/**
 * Get brand by slug
 */
export function getBrandBySlug(slug: string): Brand | null {
  const brands = getFromStorage();
  return brands.find(brand => brand.slug === slug) || null;
}

/**
 * Search brands by name
 */
export function searchBrands(query: string): Brand[] {
  const brands = getFromStorage();
  const lowerQuery = query.toLowerCase();
  return brands.filter(
    brand =>
      brand.name.toLowerCase().includes(lowerQuery) ||
      brand.description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Create a new brand
 */
export function createBrand(input: BrandInput): Brand {
  const brands = getFromStorage();

  // Check for duplicate slug
  const slug = input.slug || generateSlug(input.name);
  const existingSlug = brands.find(b => b.slug === slug);
  if (existingSlug) {
    throw new Error(`A brand with slug "${slug}" already exists`);
  }

  const now = getCurrentTimestamp();
  const maxSortOrder = Math.max(...brands.map(b => b.sortOrder), 0);

  const newBrand: Brand = {
    id: generateId(),
    name: input.name,
    slug,
    logo: input.logo || null,
    description: input.description || null,
    website: input.website || null,
    countryOfOrigin: input.countryOfOrigin || null,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? maxSortOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  brands.push(newBrand);
  saveToStorage(brands);

  return newBrand;
}

/**
 * Update an existing brand
 */
export function updateBrand(id: string, input: Partial<BrandInput>): Brand {
  const brands = getFromStorage();
  const index = brands.findIndex(brand => brand.id === id);

  if (index === -1) {
    throw new Error(`Brand with ID "${id}" not found`);
  }

  // Check for duplicate slug if changing
  if (input.slug && input.slug !== brands[index].slug) {
    const existingSlug = brands.find(b => b.slug === input.slug && b.id !== id);
    if (existingSlug) {
      throw new Error(`A brand with slug "${input.slug}" already exists`);
    }
  }

  const updatedBrand: Brand = {
    ...brands[index],
    ...input,
    updatedAt: getCurrentTimestamp(),
  };

  brands[index] = updatedBrand;
  saveToStorage(brands);

  return updatedBrand;
}

/**
 * Delete a brand
 */
export function deleteBrand(id: string): boolean {
  const brands = getFromStorage();
  const index = brands.findIndex(brand => brand.id === id);

  if (index === -1) {
    throw new Error(`Brand with ID "${id}" not found`);
  }

  // TODO: Check if brand has products before deleting
  // In real implementation, either prevent deletion or handle cascade

  brands.splice(index, 1);
  saveToStorage(brands);

  return true;
}

/**
 * Toggle brand active status
 */
export function toggleBrandStatus(id: string): Brand {
  const brands = getFromStorage();
  const brand = brands.find(b => b.id === id);

  if (!brand) {
    throw new Error(`Brand with ID "${id}" not found`);
  }

  return updateBrand(id, { isActive: !brand.isActive });
}

/**
 * Reorder brands
 */
export function reorderBrands(orderedIds: string[]): Brand[] {
  const brands = getFromStorage();

  orderedIds.forEach((id, index) => {
    const brand = brands.find(b => b.id === id);
    if (brand) {
      brand.sortOrder = index + 1;
      brand.updatedAt = getCurrentTimestamp();
    }
  });

  saveToStorage(brands);
  return getAllBrands();
}

/**
 * Get brand count
 */
export function getBrandCount(): number {
  return getFromStorage().length;
}

/**
 * Get active brand count
 */
export function getActiveBrandCount(): number {
  return getFromStorage().filter(b => b.isActive).length;
}

/**
 * Reset to mock data (for testing)
 */
export function resetBrands(): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_BRANDS));
}

/**
 * Clear all brands (for testing)
 */
export function clearBrands(): void {
  if (!isClient) return;
  localStorage.removeItem(STORAGE_KEY);
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SERVICE OBJECT (for easier mocking in tests)
// ═══════════════════════════════════════════════════════════════

export const brandService = {
  getAll: getAllBrands,
  getActive: getActiveBrands,
  getPaginated: getBrandsPaginated,
  getById: getBrandById,
  getBySlug: getBrandBySlug,
  search: searchBrands,
  create: createBrand,
  update: updateBrand,
  delete: deleteBrand,
  toggleStatus: toggleBrandStatus,
  reorder: reorderBrands,
  getCount: getBrandCount,
  getActiveCount: getActiveBrandCount,
  reset: resetBrands,
  clear: clearBrands,
};

export default brandService;
