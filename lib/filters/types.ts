/**
 * Saved Filters Type Definitions
 *
 * Types for the saved filters system across admin tables.
 *
 * @module lib/filters/types
 */

/**
 * Page types that support saved filters
 */
export type FilterPageType = 'products' | 'orders' | 'customers';

/**
 * A single filter condition
 */
export interface FilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
  value: string | number | boolean | string[] | [number, number];
}

/**
 * Saved filter configuration
 */
export interface SavedFilter {
  id: string;
  name: string;
  pageType: FilterPageType;
  conditions: FilterCondition[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

/**
 * Filter state for a page (current active filters)
 */
export interface FilterState {
  search: string;
  conditions: FilterCondition[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Products page specific filter fields
 */
export const PRODUCT_FILTER_FIELDS = [
  { value: 'name', label: 'Product Name', type: 'text' },
  { value: 'sku', label: 'SKU', type: 'text' },
  { value: 'category', label: 'Category', type: 'select' },
  { value: 'brand', label: 'Brand', type: 'select' },
  { value: 'status', label: 'Status', type: 'select', options: ['active', 'draft', 'archived'] },
  { value: 'stockStatus', label: 'Stock Status', type: 'select', options: ['in_stock', 'low_stock', 'out_of_stock'] },
  { value: 'price', label: 'Price', type: 'number' },
  { value: 'stockQuantity', label: 'Stock Quantity', type: 'number' },
] as const;

/**
 * Orders page specific filter fields
 */
export const ORDER_FILTER_FIELDS = [
  { value: 'orderNumber', label: 'Order Number', type: 'text' },
  { value: 'customerName', label: 'Customer', type: 'text' },
  { value: 'status', label: 'Status', type: 'select', options: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
  { value: 'paymentStatus', label: 'Payment', type: 'select', options: ['pending', 'paid', 'refunded', 'failed'] },
  { value: 'total', label: 'Total', type: 'number' },
  { value: 'createdAt', label: 'Date', type: 'date' },
] as const;

/**
 * Customers page specific filter fields
 */
export const CUSTOMER_FILTER_FIELDS = [
  { value: 'name', label: 'Customer Name', type: 'text' },
  { value: 'email', label: 'Email', type: 'text' },
  { value: 'company', label: 'Company', type: 'text' },
  { value: 'country', label: 'Country', type: 'text' },
  { value: 'totalOrders', label: 'Total Orders', type: 'number' },
  { value: 'totalSpent', label: 'Total Spent', type: 'number' },
  { value: 'tags', label: 'Tags', type: 'multiselect' },
] as const;

/**
 * Get filter fields for a page type
 */
export function getFilterFieldsForPage(pageType: FilterPageType) {
  switch (pageType) {
    case 'products':
      return PRODUCT_FILTER_FIELDS;
    case 'orders':
      return ORDER_FILTER_FIELDS;
    case 'customers':
      return CUSTOMER_FILTER_FIELDS;
    default:
      return [];
  }
}

/**
 * Operator labels for display
 */
export const OPERATOR_LABELS: Record<FilterCondition['operator'], string> = {
  equals: 'equals',
  contains: 'contains',
  startsWith: 'starts with',
  endsWith: 'ends with',
  gt: 'greater than',
  lt: 'less than',
  gte: 'at least',
  lte: 'at most',
  in: 'is one of',
  between: 'between',
};

/**
 * Get available operators for a field type
 */
export function getOperatorsForFieldType(fieldType: string): FilterCondition['operator'][] {
  switch (fieldType) {
    case 'text':
      return ['equals', 'contains', 'startsWith', 'endsWith'];
    case 'number':
      return ['equals', 'gt', 'lt', 'gte', 'lte', 'between'];
    case 'select':
      return ['equals'];
    case 'multiselect':
      return ['in'];
    case 'date':
      return ['equals', 'gt', 'lt', 'between'];
    default:
      return ['equals'];
  }
}
