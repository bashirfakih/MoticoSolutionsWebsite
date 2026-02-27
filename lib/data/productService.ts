/**
 * Product Service for Motico Solutions CRM
 *
 * CRUD operations for products with inventory tracking.
 * Supports variants, filtering, and stock management.
 *
 * @module lib/data/productService
 */

import {
  Product,
  ProductInput,
  ProductFilter,
  ProductWithRelations,
  PaginatedResult,
  PaginationParams,
  DashboardStats,
  InventoryLog,
  InventoryReason,
  INVENTORY_REASON,
  STOCK_STATUS,
  CURRENCY,
  generateId,
  generateSlug,
  getCurrentTimestamp,
  calculateStockStatus,
} from './types';
import { MOCK_PRODUCTS } from './mockProducts';
import { getCategoryById } from './categoryService';
import { getBrandById } from './brandService';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const PRODUCTS_STORAGE_KEY = 'motico_products';
const INVENTORY_LOG_KEY = 'motico_inventory_log';
const isClient = typeof window !== 'undefined';

// ═══════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

function initializeStorage(): void {
  if (!isClient) return;

  const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
  }

  const inventoryLog = localStorage.getItem(INVENTORY_LOG_KEY);
  if (!inventoryLog) {
    localStorage.setItem(INVENTORY_LOG_KEY, JSON.stringify([]));
  }
}

function getFromStorage(): Product[] {
  if (!isClient) return MOCK_PRODUCTS;

  initializeStorage();
  const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : MOCK_PRODUCTS;
}

function saveToStorage(products: Product[]): void {
  if (!isClient) return;
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function getInventoryLogs(): InventoryLog[] {
  if (!isClient) return [];

  initializeStorage();
  const stored = localStorage.getItem(INVENTORY_LOG_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveInventoryLog(log: InventoryLog): void {
  if (!isClient) return;
  const logs = getInventoryLogs();
  logs.push(log);
  localStorage.setItem(INVENTORY_LOG_KEY, JSON.stringify(logs));
}

// ═══════════════════════════════════════════════════════════════
// READ OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all products
 */
export function getAllProducts(): Product[] {
  return getFromStorage();
}

/**
 * Get published products only
 */
export function getPublishedProducts(): Product[] {
  return getAllProducts().filter(p => p.isPublished);
}

/**
 * Get featured products
 */
export function getFeaturedProducts(): Product[] {
  return getPublishedProducts().filter(p => p.isFeatured);
}

/**
 * Get new products
 */
export function getNewProducts(): Product[] {
  return getPublishedProducts().filter(p => p.isNew);
}

/**
 * Apply filters to products
 */
function applyFilters(products: Product[], filter: ProductFilter): Product[] {
  let result = [...products];

  if (filter.search) {
    const search = filter.search.toLowerCase();
    result = result.filter(
      p =>
        p.name.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.shortDescription?.toLowerCase().includes(search)
    );
  }

  if (filter.categoryId) {
    result = result.filter(p => p.categoryId === filter.categoryId);
  }

  if (filter.subcategoryId) {
    result = result.filter(p => p.subcategoryId === filter.subcategoryId);
  }

  if (filter.brandId) {
    result = result.filter(p => p.brandId === filter.brandId);
  }

  if (filter.stockStatus) {
    result = result.filter(p => p.stockStatus === filter.stockStatus);
  }

  if (filter.isPublished !== undefined) {
    result = result.filter(p => p.isPublished === filter.isPublished);
  }

  if (filter.isFeatured !== undefined) {
    result = result.filter(p => p.isFeatured === filter.isFeatured);
  }

  if (filter.priceMin !== undefined) {
    result = result.filter(p => (p.price ?? 0) >= filter.priceMin!);
  }

  if (filter.priceMax !== undefined) {
    result = result.filter(p => (p.price ?? 0) <= filter.priceMax!);
  }

  return result;
}

/**
 * Get products with pagination and filtering
 */
export function getProductsPaginated(
  params: PaginationParams,
  filter?: ProductFilter
): PaginatedResult<Product> {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  let products = getFromStorage();

  // Apply filters
  if (filter) {
    products = applyFilters(products, filter);
  }

  // Sort
  products = products.sort((a, b) => {
    const aVal = a[sortBy as keyof Product];
    const bVal = b[sortBy as keyof Product];

    if (aVal === null || aVal === undefined) return sortOrder === 'asc' ? 1 : -1;
    if (bVal === null || bVal === undefined) return sortOrder === 'asc' ? -1 : 1;

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

  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = products.slice(offset, offset + limit);

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
 * Get product by ID
 */
export function getProductById(id: string): Product | null {
  const products = getFromStorage();
  return products.find(p => p.id === id) || null;
}

/**
 * Get product by SKU
 */
export function getProductBySku(sku: string): Product | null {
  const products = getFromStorage();
  return products.find(p => p.sku === sku) || null;
}

/**
 * Get product by slug
 */
export function getProductBySlug(slug: string): Product | null {
  const products = getFromStorage();
  return products.find(p => p.slug === slug) || null;
}

/**
 * Get product with full relations (category, brand)
 */
export function getProductWithRelations(id: string): ProductWithRelations | null {
  const product = getProductById(id);
  if (!product) return null;

  const category = getCategoryById(product.categoryId);
  const subcategory = product.subcategoryId
    ? getCategoryById(product.subcategoryId)
    : null;
  const brand = getBrandById(product.brandId);

  if (!category || !brand) return null;

  return {
    ...product,
    category,
    subcategory,
    brand,
  };
}

/**
 * Search products
 */
export function searchProducts(query: string): Product[] {
  return applyFilters(getPublishedProducts(), { search: query });
}

/**
 * Get products by category
 */
export function getProductsByCategory(categoryId: string): Product[] {
  return getPublishedProducts().filter(
    p => p.categoryId === categoryId || p.subcategoryId === categoryId
  );
}

/**
 * Get products by brand
 */
export function getProductsByBrand(brandId: string): Product[] {
  return getPublishedProducts().filter(p => p.brandId === brandId);
}

/**
 * Get low stock products
 */
export function getLowStockProducts(): Product[] {
  return getAllProducts().filter(p => p.stockStatus === STOCK_STATUS.LOW_STOCK);
}

/**
 * Get out of stock products
 */
export function getOutOfStockProducts(): Product[] {
  return getAllProducts().filter(p => p.stockStatus === STOCK_STATUS.OUT_OF_STOCK);
}

// ═══════════════════════════════════════════════════════════════
// CREATE OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new product
 */
export function createProduct(input: ProductInput, userId?: string): Product {
  const products = getFromStorage();

  // Check for duplicate SKU
  const existingSku = products.find(p => p.sku === input.sku);
  if (existingSku) {
    throw new Error(`A product with SKU "${input.sku}" already exists`);
  }

  // Check for duplicate slug
  const slug = input.slug || generateSlug(input.name);
  const existingSlug = products.find(p => p.slug === slug);
  if (existingSlug) {
    throw new Error(`A product with slug "${slug}" already exists`);
  }

  const now = getCurrentTimestamp();
  const stockQuantity = input.stockQuantity ?? 0;
  const minStockLevel = input.minStockLevel ?? 10;

  const newProduct: Product = {
    id: generateId(),
    sku: input.sku,
    name: input.name,
    slug,
    shortDescription: input.shortDescription || null,
    description: input.description,
    features: input.features || [],
    categoryId: input.categoryId,
    subcategoryId: input.subcategoryId || null,
    brandId: input.brandId,
    images: input.images || [],
    specifications: input.specifications || [],
    variants: input.variants || [],
    hasVariants: input.hasVariants ?? false,
    price: input.price ?? null,
    compareAtPrice: input.compareAtPrice ?? null,
    currency: input.currency ?? CURRENCY.USD,
    stockQuantity,
    stockStatus: calculateStockStatus(stockQuantity, minStockLevel),
    minStockLevel,
    trackInventory: input.trackInventory ?? true,
    allowBackorder: input.allowBackorder ?? false,
    isPublished: input.isPublished ?? false,
    isFeatured: input.isFeatured ?? false,
    isNew: input.isNew ?? true,
    metaTitle: input.metaTitle ?? null,
    metaDescription: input.metaDescription ?? null,
    createdAt: now,
    updatedAt: now,
    publishedAt: input.isPublished ? now : null,
  };

  products.push(newProduct);
  saveToStorage(products);

  // Log initial inventory
  if (newProduct.trackInventory && stockQuantity > 0) {
    saveInventoryLog({
      id: generateId(),
      productId: newProduct.id,
      variantId: null,
      previousQuantity: 0,
      newQuantity: stockQuantity,
      change: stockQuantity,
      reason: INVENTORY_REASON.INITIAL,
      notes: 'Initial stock on product creation',
      userId: userId || 'system',
      createdAt: now,
    });
  }

  return newProduct;
}

// ═══════════════════════════════════════════════════════════════
// UPDATE OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Update a product
 */
export function updateProduct(id: string, input: Partial<ProductInput>): Product {
  const products = getFromStorage();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    throw new Error(`Product with ID "${id}" not found`);
  }

  const existing = products[index];

  // Check for duplicate SKU if changing
  if (input.sku && input.sku !== existing.sku) {
    const existingSku = products.find(p => p.sku === input.sku && p.id !== id);
    if (existingSku) {
      throw new Error(`A product with SKU "${input.sku}" already exists`);
    }
  }

  // Check for duplicate slug if changing
  if (input.slug && input.slug !== existing.slug) {
    const existingSlug = products.find(p => p.slug === input.slug && p.id !== id);
    if (existingSlug) {
      throw new Error(`A product with slug "${input.slug}" already exists`);
    }
  }

  const now = getCurrentTimestamp();

  // Calculate new stock status if quantity changed
  const stockQuantity = input.stockQuantity ?? existing.stockQuantity;
  const minStockLevel = input.minStockLevel ?? existing.minStockLevel;
  const stockStatus = calculateStockStatus(stockQuantity, minStockLevel);

  // Handle publishing
  let publishedAt = existing.publishedAt;
  if (input.isPublished === true && !existing.isPublished) {
    publishedAt = now;
  } else if (input.isPublished === false) {
    publishedAt = null;
  }

  const updatedProduct: Product = {
    ...existing,
    ...input,
    stockStatus,
    publishedAt,
    updatedAt: now,
  };

  products[index] = updatedProduct;
  saveToStorage(products);

  return updatedProduct;
}

/**
 * Delete a product
 */
export function deleteProduct(id: string): boolean {
  const products = getFromStorage();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    throw new Error(`Product with ID "${id}" not found`);
  }

  products.splice(index, 1);
  saveToStorage(products);

  return true;
}

/**
 * Bulk delete products
 */
export function deleteProducts(ids: string[]): number {
  const products = getFromStorage();
  const initialCount = products.length;

  const filtered = products.filter(p => !ids.includes(p.id));
  saveToStorage(filtered);

  return initialCount - filtered.length;
}

/**
 * Toggle product published status
 */
export function togglePublished(id: string): Product {
  const product = getProductById(id);
  if (!product) {
    throw new Error(`Product with ID "${id}" not found`);
  }

  return updateProduct(id, { isPublished: !product.isPublished });
}

/**
 * Toggle product featured status
 */
export function toggleFeatured(id: string): Product {
  const product = getProductById(id);
  if (!product) {
    throw new Error(`Product with ID "${id}" not found`);
  }

  return updateProduct(id, { isFeatured: !product.isFeatured });
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Adjust inventory for a product
 */
export function adjustInventory(
  productId: string,
  change: number,
  reason: InventoryReason,
  notes?: string,
  userId?: string
): Product {
  const products = getFromStorage();
  const index = products.findIndex(p => p.id === productId);

  if (index === -1) {
    throw new Error(`Product with ID "${productId}" not found`);
  }

  const product = products[index];
  const previousQuantity = product.stockQuantity;
  const newQuantity = Math.max(0, previousQuantity + change);

  product.stockQuantity = newQuantity;
  product.stockStatus = calculateStockStatus(newQuantity, product.minStockLevel);
  product.updatedAt = getCurrentTimestamp();

  products[index] = product;
  saveToStorage(products);

  // Log the change
  saveInventoryLog({
    id: generateId(),
    productId,
    variantId: null,
    previousQuantity,
    newQuantity,
    change,
    reason,
    notes: notes || null,
    userId: userId || 'system',
    createdAt: getCurrentTimestamp(),
  });

  return product;
}

/**
 * Set inventory to a specific value
 */
export function setInventory(
  productId: string,
  quantity: number,
  notes?: string,
  userId?: string
): Product {
  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product with ID "${productId}" not found`);
  }

  const change = quantity - product.stockQuantity;
  return adjustInventory(
    productId,
    change,
    INVENTORY_REASON.ADJUSTMENT,
    notes,
    userId
  );
}

/**
 * Get inventory logs for a product
 */
export function getProductInventoryLogs(productId: string): InventoryLog[] {
  return getInventoryLogs()
    .filter(log => log.productId === productId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════

/**
 * Get dashboard statistics
 */
export function getDashboardStats(): DashboardStats {
  const products = getAllProducts();

  return {
    totalProducts: products.length,
    publishedProducts: products.filter(p => p.isPublished).length,
    lowStockProducts: products.filter(p => p.stockStatus === STOCK_STATUS.LOW_STOCK).length,
    outOfStockProducts: products.filter(p => p.stockStatus === STOCK_STATUS.OUT_OF_STOCK).length,
    totalCategories: 0, // Would be calculated from categoryService
    totalBrands: 0, // Would be calculated from brandService
  };
}

/**
 * Get product count
 */
export function getProductCount(): number {
  return getFromStorage().length;
}

/**
 * Get published product count
 */
export function getPublishedProductCount(): number {
  return getFromStorage().filter(p => p.isPublished).length;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Duplicate a product
 */
export function duplicateProduct(id: string): Product {
  const product = getProductById(id);
  if (!product) {
    throw new Error(`Product with ID "${id}" not found`);
  }

  const { id: _, createdAt, updatedAt, publishedAt, ...rest } = product;

  return createProduct({
    ...rest,
    sku: `${rest.sku}-COPY`,
    name: `${rest.name} (Copy)`,
    slug: `${rest.slug}-copy`,
    isPublished: false,
    stockQuantity: 0,
  });
}

/**
 * Reset to mock data (for testing)
 */
export function resetProducts(): void {
  if (!isClient) return;
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
  localStorage.setItem(INVENTORY_LOG_KEY, JSON.stringify([]));
}

/**
 * Clear all products (for testing)
 */
export function clearProducts(): void {
  if (!isClient) return;
  localStorage.removeItem(PRODUCTS_STORAGE_KEY);
  localStorage.removeItem(INVENTORY_LOG_KEY);
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════

export const productService = {
  // Read
  getAll: getAllProducts,
  getPublished: getPublishedProducts,
  getFeatured: getFeaturedProducts,
  getNew: getNewProducts,
  getPaginated: getProductsPaginated,
  getById: getProductById,
  getBySku: getProductBySku,
  getBySlug: getProductBySlug,
  getWithRelations: getProductWithRelations,
  search: searchProducts,
  getByCategory: getProductsByCategory,
  getByBrand: getProductsByBrand,
  getLowStock: getLowStockProducts,
  getOutOfStock: getOutOfStockProducts,

  // Create
  create: createProduct,

  // Update
  update: updateProduct,
  delete: deleteProduct,
  deleteMany: deleteProducts,
  togglePublished,
  toggleFeatured,
  duplicate: duplicateProduct,

  // Inventory
  adjustInventory,
  setInventory,
  getInventoryLogs: getProductInventoryLogs,

  // Stats
  getStats: getDashboardStats,
  getCount: getProductCount,
  getPublishedCount: getPublishedProductCount,

  // Utility
  reset: resetProducts,
  clear: clearProducts,
};

export default productService;
