/**
 * Inventory Service
 *
 * Handles all inventory-related operations:
 * - Stock validation before order placement
 * - Stock decrement/increment with logging
 * - Stock status calculation and updates
 * - Order-level batch operations
 */

import { prisma } from '@/lib/db';
import { InventoryReason, StockStatus, Prisma } from '@prisma/client';

// Type for Prisma transaction client
type PrismaTransaction = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface OrderItemForStock {
  productId: string;
  variantId?: string | null;
  quantity: number;
  productName?: string;
}

export interface StockValidationError {
  productId: string;
  productName: string;
  requested: number;
  available: number;
  allowBackorder: boolean;
}

export interface StockValidationResult {
  valid: boolean;
  errors: StockValidationError[];
}

// ═══════════════════════════════════════════════════════════════
// STOCK STATUS CALCULATION
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate the appropriate stock status based on quantity and thresholds
 */
export function calculateStockStatus(
  quantity: number,
  minStockLevel: number,
  globalThreshold?: number
): StockStatus {
  if (quantity <= 0) return 'out_of_stock';

  const threshold = globalThreshold !== undefined
    ? Math.max(minStockLevel, globalThreshold)
    : minStockLevel;

  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}

// ═══════════════════════════════════════════════════════════════
// STOCK VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validate stock availability for an order's items (batched query)
 * Returns validation result with any stock errors
 * NOTE: For race-condition-safe validation, use validateStockInTransaction instead
 */
export async function validateStockForOrder(
  items: OrderItemForStock[]
): Promise<StockValidationResult> {
  const productIds = items
    .map(item => item.productId)
    .filter((id): id is string => !!id);

  if (productIds.length === 0) {
    return { valid: true, errors: [] };
  }

  // Batch query all products at once (fixes N+1)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      stockQuantity: true,
      trackInventory: true,
      allowBackorder: true,
    },
  });

  const productMap = new Map(products.map(p => [p.id, p]));
  const errors: StockValidationError[] = [];

  for (const item of items) {
    if (!item.productId) continue;

    const product = productMap.get(item.productId);
    if (!product) {
      console.warn(`Product not found for stock validation: ${item.productId}`);
      continue;
    }

    // Skip validation if tracking is disabled or backorders allowed
    if (!product.trackInventory || product.allowBackorder) continue;

    // Check if requested quantity exceeds available stock
    if (product.stockQuantity < item.quantity) {
      errors.push({
        productId: product.id,
        productName: item.productName || product.name,
        requested: item.quantity,
        available: product.stockQuantity,
        allowBackorder: product.allowBackorder,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate stock availability within a transaction (race-condition safe)
 * Uses the transaction client to ensure consistent reads with subsequent decrements
 */
export async function validateStockInTransaction(
  tx: PrismaTransaction,
  items: OrderItemForStock[]
): Promise<StockValidationResult> {
  const productIds = items
    .map(item => item.productId)
    .filter((id): id is string => !!id);

  if (productIds.length === 0) {
    return { valid: true, errors: [] };
  }

  // Batch query all products within the transaction
  const products = await tx.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      stockQuantity: true,
      trackInventory: true,
      allowBackorder: true,
    },
  });

  const productMap = new Map(products.map(p => [p.id, p]));
  const errors: StockValidationError[] = [];

  for (const item of items) {
    if (!item.productId) continue;

    const product = productMap.get(item.productId);
    if (!product) {
      console.warn(`Product not found for stock validation: ${item.productId}`);
      continue;
    }

    // Skip validation if tracking is disabled or backorders allowed
    if (!product.trackInventory || product.allowBackorder) continue;

    // Check if requested quantity exceeds available stock
    if (product.stockQuantity < item.quantity) {
      errors.push({
        productId: product.id,
        productName: item.productName || product.name,
        requested: item.quantity,
        available: product.stockQuantity,
        allowBackorder: product.allowBackorder,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════
// STOCK OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Decrement stock for a product (within a transaction)
 * Creates an inventory log entry
 * @param lowStockThreshold - Optional pre-fetched threshold to avoid repeated queries
 */
export async function decrementStock(
  tx: PrismaTransaction,
  productId: string,
  variantId: string | null,
  quantity: number,
  reason: InventoryReason,
  userId: string,
  notes?: string,
  lowStockThreshold?: number
): Promise<void> {
  // Get current product state
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      stockQuantity: true,
      minStockLevel: true,
      trackInventory: true,
    },
  });

  if (!product) {
    console.warn(`Product not found for stock decrement: ${productId}`);
    return;
  }
  if (!product.trackInventory) return;

  // Calculate new quantity (don't go below 0)
  const previousQuantity = product.stockQuantity;
  const newQuantity = Math.max(0, previousQuantity - quantity);
  const actualChange = previousQuantity - newQuantity;

  // Get global threshold for status calculation (use passed value or fetch)
  let threshold = lowStockThreshold;
  if (threshold === undefined) {
    const settings = await tx.siteSettings.findFirst({
      select: { lowStockThreshold: true },
    });
    threshold = settings?.lowStockThreshold;
  }

  const newStatus = calculateStockStatus(
    newQuantity,
    product.minStockLevel,
    threshold
  );

  // Update product stock
  await tx.product.update({
    where: { id: productId },
    data: {
      stockQuantity: newQuantity,
      stockStatus: newStatus,
    },
  });

  // Create inventory log
  await tx.inventoryLog.create({
    data: {
      productId,
      variantId,
      previousQuantity,
      newQuantity,
      change: -actualChange,
      reason,
      notes,
      userId,
    },
  });

  // Handle variant stock if applicable
  if (variantId) {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { stockQuantity: true },
    });

    if (variant) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: {
          stockQuantity: Math.max(0, variant.stockQuantity - quantity),
        },
      });
    }
  }
}

/**
 * Increment stock for a product (within a transaction)
 * Creates an inventory log entry
 * @param lowStockThreshold - Optional pre-fetched threshold to avoid repeated queries
 */
export async function incrementStock(
  tx: PrismaTransaction,
  productId: string,
  variantId: string | null,
  quantity: number,
  reason: InventoryReason,
  userId: string,
  notes?: string,
  lowStockThreshold?: number
): Promise<void> {
  // Get current product state
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      stockQuantity: true,
      minStockLevel: true,
      trackInventory: true,
    },
  });

  if (!product) {
    console.warn(`Product not found for stock increment: ${productId}`);
    return;
  }
  if (!product.trackInventory) return;

  // Calculate new quantity
  const previousQuantity = product.stockQuantity;
  const newQuantity = previousQuantity + quantity;

  // Get global threshold for status calculation (use passed value or fetch)
  let threshold = lowStockThreshold;
  if (threshold === undefined) {
    const settings = await tx.siteSettings.findFirst({
      select: { lowStockThreshold: true },
    });
    threshold = settings?.lowStockThreshold;
  }

  const newStatus = calculateStockStatus(
    newQuantity,
    product.minStockLevel,
    threshold
  );

  // Update product stock
  await tx.product.update({
    where: { id: productId },
    data: {
      stockQuantity: newQuantity,
      stockStatus: newStatus,
    },
  });

  // Create inventory log
  await tx.inventoryLog.create({
    data: {
      productId,
      variantId,
      previousQuantity,
      newQuantity,
      change: quantity,
      reason,
      notes,
      userId,
    },
  });

  // Handle variant stock if applicable
  if (variantId) {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { stockQuantity: true },
    });

    if (variant) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: {
          stockQuantity: variant.stockQuantity + quantity,
        },
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// ORDER-LEVEL OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Process stock decrement for all items in an order
 * Should be called within a transaction during order creation
 * Pre-fetches settings once to avoid N+1 on settings
 */
export async function processOrderStockDecrement(
  tx: PrismaTransaction,
  orderId: string,
  items: OrderItemForStock[],
  userId: string
): Promise<void> {
  // Pre-fetch settings once for all items
  const settings = await tx.siteSettings.findFirst({
    select: { lowStockThreshold: true },
  });
  const lowStockThreshold = settings?.lowStockThreshold;

  for (const item of items) {
    if (!item.productId) continue;

    await decrementStock(
      tx,
      item.productId,
      item.variantId || null,
      item.quantity,
      'sale',
      userId,
      `Order: ${orderId}`,
      lowStockThreshold
    );
  }
}

/**
 * Restore stock for all items in an order (cancellation/refund)
 * Creates new transaction if not already in one
 * Includes idempotency check to prevent double restoration
 */
export async function processOrderStockRestore(
  orderId: string,
  userId: string
): Promise<{ restored: boolean; alreadyRestored: boolean }> {
  // Check if stock was already restored (idempotency)
  const existingRestoration = await prisma.inventoryLog.findFirst({
    where: {
      notes: { contains: orderId },
      reason: 'return_item',
    },
  });

  if (existingRestoration) {
    console.warn(`Stock already restored for order: ${orderId}`);
    return { restored: false, alreadyRestored: true };
  }

  // Get order with items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          productId: true,
          variantId: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    console.warn(`Order not found for stock restoration: ${orderId}`);
    return { restored: false, alreadyRestored: false };
  }

  // Process stock restoration in a transaction
  await prisma.$transaction(async (tx) => {
    // Pre-fetch settings once for all items
    const settings = await tx.siteSettings.findFirst({
      select: { lowStockThreshold: true },
    });
    const lowStockThreshold = settings?.lowStockThreshold;

    for (const item of order.items) {
      if (!item.productId) continue;

      await incrementStock(
        tx,
        item.productId,
        item.variantId,
        item.quantity,
        'return_item',
        userId,
        `Order cancelled/refunded: ${orderId}`,
        lowStockThreshold
      );
    }
  });

  return { restored: true, alreadyRestored: false };
}

// ═══════════════════════════════════════════════════════════════
// SITE SETTINGS HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Get inventory-related settings
 */
export async function getInventorySettings(): Promise<{
  trackInventory: boolean;
  allowBackorders: boolean;
  lowStockThreshold: number;
}> {
  const settings = await prisma.siteSettings.findFirst({
    select: {
      trackInventory: true,
      allowBackorders: true,
      lowStockThreshold: true,
    },
  });

  return {
    trackInventory: settings?.trackInventory ?? true,
    allowBackorders: settings?.allowBackorders ?? false,
    lowStockThreshold: settings?.lowStockThreshold ?? 10,
  };
}
