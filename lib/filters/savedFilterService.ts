/**
 * Saved Filters Service
 *
 * localStorage-based service for managing saved filters.
 * Supports CRUD operations and pinning filters.
 *
 * @module lib/filters/savedFilterService
 */

import { SavedFilter, FilterPageType, FilterCondition } from './types';

const STORAGE_KEY = 'motico_saved_filters';

// ═══════════════════════════════════════════════════════════════
// CORE CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all saved filters
 */
export function getAllSavedFilters(): SavedFilter[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get saved filters for a specific page
 */
export function getSavedFilters(pageType: FilterPageType): SavedFilter[] {
  return getAllSavedFilters()
    .filter((f) => f.pageType === pageType)
    .sort((a, b) => {
      // Pinned first, then by updatedAt
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

/**
 * Get a saved filter by ID
 */
export function getSavedFilterById(id: string): SavedFilter | null {
  return getAllSavedFilters().find((f) => f.id === id) || null;
}

/**
 * Save filters to localStorage
 */
function saveFilters(filters: SavedFilter[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));

  // Dispatch event for listeners
  window.dispatchEvent(new CustomEvent('saved-filters-update'));
}

/**
 * Create a new saved filter
 */
export function createSavedFilter(
  name: string,
  pageType: FilterPageType,
  conditions: FilterCondition[],
  sortField?: string,
  sortDirection?: 'asc' | 'desc'
): SavedFilter {
  const now = new Date().toISOString();
  const newFilter: SavedFilter = {
    id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    pageType,
    conditions,
    sortField,
    sortDirection,
    createdAt: now,
    updatedAt: now,
    isPinned: false,
  };

  const filters = getAllSavedFilters();
  filters.push(newFilter);
  saveFilters(filters);

  return newFilter;
}

/**
 * Update an existing saved filter
 */
export function updateSavedFilter(
  id: string,
  updates: Partial<Pick<SavedFilter, 'name' | 'conditions' | 'sortField' | 'sortDirection' | 'isPinned'>>
): SavedFilter | null {
  const filters = getAllSavedFilters();
  const index = filters.findIndex((f) => f.id === id);

  if (index === -1) return null;

  filters[index] = {
    ...filters[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveFilters(filters);
  return filters[index];
}

/**
 * Delete a saved filter
 */
export function deleteSavedFilter(id: string): boolean {
  const filters = getAllSavedFilters();
  const newFilters = filters.filter((f) => f.id !== id);

  if (newFilters.length === filters.length) return false;

  saveFilters(newFilters);
  return true;
}

/**
 * Toggle pin status of a filter
 */
export function toggleFilterPin(id: string): SavedFilter | null {
  const filter = getSavedFilterById(id);
  if (!filter) return null;

  return updateSavedFilter(id, { isPinned: !filter.isPinned });
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a filter name already exists for a page
 */
export function filterNameExists(name: string, pageType: FilterPageType, excludeId?: string): boolean {
  return getSavedFilters(pageType).some(
    (f) => f.name.toLowerCase() === name.toLowerCase() && f.id !== excludeId
  );
}

/**
 * Get count of saved filters for a page
 */
export function getSavedFilterCount(pageType: FilterPageType): number {
  return getSavedFilters(pageType).length;
}

/**
 * Clear all saved filters for a page
 */
export function clearSavedFilters(pageType: FilterPageType): void {
  const filters = getAllSavedFilters().filter((f) => f.pageType !== pageType);
  saveFilters(filters);
}

/**
 * Export filters as JSON
 */
export function exportFilters(pageType?: FilterPageType): string {
  const filters = pageType ? getSavedFilters(pageType) : getAllSavedFilters();
  return JSON.stringify(filters, null, 2);
}

/**
 * Import filters from JSON
 */
export function importFilters(json: string, pageType?: FilterPageType): number {
  try {
    const imported: SavedFilter[] = JSON.parse(json);

    if (!Array.isArray(imported)) return 0;

    const validFilters = imported.filter((f) =>
      f.id && f.name && f.pageType && Array.isArray(f.conditions)
    );

    if (pageType) {
      validFilters.forEach((f) => { f.pageType = pageType; });
    }

    const existing = getAllSavedFilters();
    const existingIds = new Set(existing.map((f) => f.id));

    // Only add filters that don't already exist
    const newFilters = validFilters.filter((f) => !existingIds.has(f.id));

    saveFilters([...existing, ...newFilters]);
    return newFilters.length;
  } catch {
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT FILTERS (Preset templates)
// ═══════════════════════════════════════════════════════════════

export interface FilterPreset {
  name: string;
  pageType: FilterPageType;
  conditions: FilterCondition[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export const FILTER_PRESETS: FilterPreset[] = [
  // Products presets
  {
    name: 'Low Stock Items',
    pageType: 'products',
    conditions: [{ field: 'stockStatus', operator: 'equals', value: 'low_stock' }],
    sortField: 'stockQuantity',
    sortDirection: 'asc',
  },
  {
    name: 'Out of Stock',
    pageType: 'products',
    conditions: [{ field: 'stockStatus', operator: 'equals', value: 'out_of_stock' }],
  },
  {
    name: 'Active Products',
    pageType: 'products',
    conditions: [{ field: 'status', operator: 'equals', value: 'active' }],
  },
  {
    name: 'Draft Products',
    pageType: 'products',
    conditions: [{ field: 'status', operator: 'equals', value: 'draft' }],
  },
  // Orders presets
  {
    name: 'Pending Orders',
    pageType: 'orders',
    conditions: [{ field: 'status', operator: 'equals', value: 'pending' }],
    sortField: 'createdAt',
    sortDirection: 'desc',
  },
  {
    name: 'Processing Orders',
    pageType: 'orders',
    conditions: [{ field: 'status', operator: 'equals', value: 'processing' }],
  },
  {
    name: 'Unpaid Orders',
    pageType: 'orders',
    conditions: [{ field: 'paymentStatus', operator: 'equals', value: 'pending' }],
  },
  {
    name: 'High Value Orders',
    pageType: 'orders',
    conditions: [{ field: 'total', operator: 'gte', value: 1000 }],
    sortField: 'total',
    sortDirection: 'desc',
  },
  // Customers presets
  {
    name: 'VIP Customers',
    pageType: 'customers',
    conditions: [{ field: 'totalSpent', operator: 'gte', value: 5000 }],
    sortField: 'totalSpent',
    sortDirection: 'desc',
  },
  {
    name: 'New Customers',
    pageType: 'customers',
    conditions: [{ field: 'totalOrders', operator: 'equals', value: 1 }],
  },
];

/**
 * Get presets for a page type
 */
export function getFilterPresets(pageType: FilterPageType): FilterPreset[] {
  return FILTER_PRESETS.filter((p) => p.pageType === pageType);
}

/**
 * Create a saved filter from a preset
 */
export function createFromPreset(preset: FilterPreset): SavedFilter {
  return createSavedFilter(
    preset.name,
    preset.pageType,
    preset.conditions,
    preset.sortField,
    preset.sortDirection
  );
}
