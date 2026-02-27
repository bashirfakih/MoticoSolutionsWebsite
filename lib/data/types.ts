/**
 * Data Types for Motico Solutions CRM
 *
 * Central type definitions for products, categories, brands, and inventory.
 * These types define the schema that will later map to the database.
 *
 * @module lib/data/types
 */

// ═══════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

export type StockStatus = typeof STOCK_STATUS[keyof typeof STOCK_STATUS];

export const CURRENCY = {
  USD: 'USD',
  EUR: 'EUR',
  LBP: 'LBP',
} as const;

export type Currency = typeof CURRENCY[keyof typeof CURRENCY];

// ═══════════════════════════════════════════════════════════════
// BRAND
// ═══════════════════════════════════════════════════════════════

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  countryOfOrigin: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrandInput {
  name: string;
  slug?: string;
  logo?: string | null;
  description?: string | null;
  website?: string | null;
  countryOfOrigin?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY
// ═══════════════════════════════════════════════════════════════

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null; // null for top-level categories
  sortOrder: number;
  isActive: boolean;
  productCount: number; // computed field
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

// For tree display
export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT IMAGE
// ═══════════════════════════════════════════════════════════════

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT SPECIFICATION
// ═══════════════════════════════════════════════════════════════

export interface ProductSpecification {
  key: string;
  label: string;
  value: string;
  unit?: string;
  group?: string; // e.g., "Dimensions", "Material", "Performance"
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT VARIANT (for products with size/color options)
// ═══════════════════════════════════════════════════════════════

export interface ProductVariant {
  id: string;
  sku: string;
  name: string; // e.g., "100x915mm", "Red"
  price: number | null;
  stockQuantity: number;
  attributes: Record<string, string>; // e.g., { size: "100x915mm", grit: "80" }
  isActive: boolean;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT
// ═══════════════════════════════════════════════════════════════

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  features: string[];

  // Relationships
  categoryId: string;
  subcategoryId: string | null;
  brandId: string;

  // Images
  images: ProductImage[];

  // Specifications
  specifications: ProductSpecification[];

  // Variants (optional, for products with multiple sizes/options)
  variants: ProductVariant[];
  hasVariants: boolean;

  // Pricing (if no variants, or base price)
  price: number | null;
  compareAtPrice: number | null; // original price for sale items
  currency: Currency;

  // Inventory
  stockQuantity: number;
  stockStatus: StockStatus;
  minStockLevel: number; // alert threshold
  trackInventory: boolean;
  allowBackorder: boolean;

  // Status
  isPublished: boolean;
  isFeatured: boolean;
  isNew: boolean;

  // SEO
  metaTitle: string | null;
  metaDescription: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ProductInput {
  sku: string;
  name: string;
  slug?: string;
  shortDescription?: string | null;
  description: string;
  features?: string[];

  categoryId: string;
  subcategoryId?: string | null;
  brandId: string;

  images?: ProductImage[];
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  hasVariants?: boolean;

  price?: number | null;
  compareAtPrice?: number | null;
  currency?: Currency;

  stockQuantity?: number;
  minStockLevel?: number;
  trackInventory?: boolean;
  allowBackorder?: boolean;

  isPublished?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;

  metaTitle?: string | null;
  metaDescription?: string | null;
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY LOG (for tracking stock changes)
// ═══════════════════════════════════════════════════════════════

export const INVENTORY_REASON = {
  SALE: 'sale',
  RETURN: 'return',
  ADJUSTMENT: 'adjustment',
  RESTOCK: 'restock',
  DAMAGED: 'damaged',
  INITIAL: 'initial',
} as const;

export type InventoryReason = typeof INVENTORY_REASON[keyof typeof INVENTORY_REASON];

export interface InventoryLog {
  id: string;
  productId: string;
  variantId: string | null;
  previousQuantity: number;
  newQuantity: number;
  change: number; // positive or negative
  reason: InventoryReason;
  notes: string | null;
  userId: string; // who made the change
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════
// QUERY & FILTER TYPES
// ═══════════════════════════════════════════════════════════════

export interface ProductFilter {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  stockStatus?: StockStatus;
  isPublished?: boolean;
  isFeatured?: boolean;
  priceMin?: number;
  priceMax?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════

export type ProductWithRelations = Product & {
  category: Category;
  subcategory: Category | null;
  brand: Brand;
};

export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  totalBrands: number;
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate stock status from quantity and threshold
 */
export function calculateStockStatus(
  quantity: number,
  minStockLevel: number
): StockStatus {
  if (quantity <= 0) return STOCK_STATUS.OUT_OF_STOCK;
  if (quantity <= minStockLevel) return STOCK_STATUS.LOW_STOCK;
  return STOCK_STATUS.IN_STOCK;
}

/**
 * Get current ISO timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// ═══════════════════════════════════════════════════════════════
// ORDER STATUS
// ═══════════════════════════════════════════════════════════════

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// ═══════════════════════════════════════════════════════════════
// ORDER ITEM
// ═══════════════════════════════════════════════════════════════

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ═══════════════════════════════════════════════════════════════
// ORDER
// ═══════════════════════════════════════════════════════════════

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;

  // Items
  items: OrderItem[];
  itemCount: number;

  // Pricing
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: Currency;

  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;

  // Shipping
  shippingAddress: {
    name: string;
    company: string | null;
    address: string;
    city: string;
    region: string | null;
    postalCode: string | null;
    country: string;
    phone: string | null;
  };

  // Notes
  customerNote: string | null;
  internalNote: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface OrderInput {
  customerId: string;
  items: Omit<OrderItem, 'id'>[];
  shippingAddress: Order['shippingAddress'];
  customerNote?: string | null;
  internalNote?: string | null;
  shippingCost?: number;
  discount?: number;
}

export interface OrderFilter {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ═══════════════════════════════════════════════════════════════
// CUSTOMER
// ═══════════════════════════════════════════════════════════════

export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
} as const;

export type CustomerStatus = typeof CUSTOMER_STATUS[keyof typeof CUSTOMER_STATUS];

export interface Customer {
  id: string;
  email: string;
  name: string;
  company: string | null;
  phone: string | null;

  // Address
  address: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string;

  // Stats
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;

  // Status
  status: CustomerStatus;
  isVerified: boolean;

  // Notes
  notes: string | null;
  tags: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  email: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string;
  status?: CustomerStatus;
  notes?: string | null;
  tags?: string[];
}

export interface CustomerFilter {
  search?: string;
  status?: CustomerStatus;
  country?: string;
  hasOrders?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// QUOTE
// ═══════════════════════════════════════════════════════════════

export const QUOTE_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  CONVERTED: 'converted',
} as const;

export type QuoteStatus = typeof QUOTE_STATUS[keyof typeof QUOTE_STATUS];

export interface QuoteItem {
  id: string;
  productId: string | null;
  productName: string;
  description: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
}

export interface Quote {
  id: string;
  quoteNumber: string;

  // Customer Info (may or may not be existing customer)
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  company: string | null;

  // Items
  items: QuoteItem[];

  // Pricing
  subtotal: number | null;
  discount: number;
  total: number | null;
  currency: Currency;

  // Status
  status: QuoteStatus;
  validUntil: string | null;

  // Communication
  customerMessage: string | null;
  internalNotes: string | null;
  responseMessage: string | null;

  // Conversion
  orderId: string | null; // if converted to order

  // Timestamps
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  sentAt: string | null;
  respondedAt: string | null;
}

export interface QuoteInput {
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  company?: string | null;
  items: Omit<QuoteItem, 'id'>[];
  customerMessage?: string | null;
}

export interface QuoteFilter {
  search?: string;
  status?: QuoteStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE (Contact Form Submissions)
// ═══════════════════════════════════════════════════════════════

export const MESSAGE_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
  REPLIED: 'replied',
  ARCHIVED: 'archived',
  SPAM: 'spam',
} as const;

export type MessageStatus = typeof MESSAGE_STATUS[keyof typeof MESSAGE_STATUS];

export const MESSAGE_TYPE = {
  CONTACT: 'contact',
  SUPPORT: 'support',
  INQUIRY: 'inquiry',
  FEEDBACK: 'feedback',
} as const;

export type MessageType = typeof MESSAGE_TYPE[keyof typeof MESSAGE_TYPE];

export interface Message {
  id: string;

  // Sender Info
  name: string;
  email: string;
  phone: string | null;
  company: string | null;

  // Content
  subject: string;
  message: string;
  type: MessageType;

  // Status
  status: MessageStatus;
  isStarred: boolean;

  // Response
  replyMessage: string | null;
  repliedAt: string | null;
  repliedBy: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
}

export interface MessageInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject: string;
  message: string;
  type?: MessageType;
}

export interface MessageFilter {
  search?: string;
  status?: MessageStatus;
  type?: MessageType;
  isStarred?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════

export interface SiteSettings {
  // General
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;

  // Business
  currency: Currency;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number | null;

  // Notifications
  orderNotificationEmail: string;
  lowStockAlertThreshold: number;
  enableEmailNotifications: boolean;

  // Social Media
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialLinkedIn: string | null;
  socialYouTube: string | null;
}

// ═══════════════════════════════════════════════════════════════
// EXTENDED DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════

export interface ExtendedDashboardStats extends DashboardStats {
  // Orders
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;

  // Customers
  totalCustomers: number;
  newCustomersThisMonth: number;

  // Quotes
  pendingQuotes: number;

  // Messages
  unreadMessages: number;

  // Revenue
  totalRevenue: number;
  monthlyRevenue: number;
}
