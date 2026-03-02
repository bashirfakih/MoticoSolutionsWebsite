/**
 * Export Utilities
 *
 * Functions for generating CSV and PDF exports
 */

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): string {
  // Header row
  const header = columns.map(col => escapeCSV(col.label)).join(',');

  // Data rows
  const rows = data.map(item =>
    columns.map(col => escapeCSV(item[col.key])).join(',')
  );

  return [header, ...rows].join('\r\n');
}

/**
 * Generate orders CSV export
 */
export function generateOrdersCSV(orders: Array<{
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  createdAt: Date | string;
  paidAt: Date | string | null;
  shippedAt: Date | string | null;
  deliveredAt: Date | string | null;
}>): string {
  const columns = [
    { key: 'orderNumber' as const, label: 'Order Number' },
    { key: 'customerName' as const, label: 'Customer Name' },
    { key: 'customerEmail' as const, label: 'Customer Email' },
    { key: 'status' as const, label: 'Status' },
    { key: 'paymentStatus' as const, label: 'Payment Status' },
    { key: 'itemCount' as const, label: 'Items' },
    { key: 'subtotal' as const, label: 'Subtotal' },
    { key: 'shippingCost' as const, label: 'Shipping' },
    { key: 'tax' as const, label: 'Tax' },
    { key: 'discount' as const, label: 'Discount' },
    { key: 'total' as const, label: 'Total' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'createdAt' as const, label: 'Order Date' },
    { key: 'paidAt' as const, label: 'Paid Date' },
    { key: 'shippedAt' as const, label: 'Shipped Date' },
    { key: 'deliveredAt' as const, label: 'Delivered Date' },
  ];

  const formattedData = orders.map(order => ({
    ...order,
    createdAt: formatDate(order.createdAt),
    paidAt: order.paidAt ? formatDate(order.paidAt) : '',
    shippedAt: order.shippedAt ? formatDate(order.shippedAt) : '',
    deliveredAt: order.deliveredAt ? formatDate(order.deliveredAt) : '',
    subtotal: formatCurrency(order.subtotal, order.currency),
    shippingCost: formatCurrency(order.shippingCost, order.currency),
    tax: formatCurrency(order.tax, order.currency),
    discount: formatCurrency(order.discount, order.currency),
    total: formatCurrency(order.total, order.currency),
  }));

  return arrayToCSV(formattedData, columns);
}

/**
 * Generate order items CSV export
 */
export function generateOrderItemsCSV(items: Array<{
  orderNumber: string;
  productName: string;
  productSku: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
}>): string {
  const columns = [
    { key: 'orderNumber' as const, label: 'Order Number' },
    { key: 'productName' as const, label: 'Product Name' },
    { key: 'productSku' as const, label: 'SKU' },
    { key: 'variantName' as const, label: 'Variant' },
    { key: 'quantity' as const, label: 'Quantity' },
    { key: 'unitPrice' as const, label: 'Unit Price' },
    { key: 'totalPrice' as const, label: 'Total Price' },
    { key: 'currency' as const, label: 'Currency' },
  ];

  const formattedData = items.map(item => ({
    ...item,
    variantName: item.variantName || '',
    unitPrice: formatCurrency(item.unitPrice, item.currency),
    totalPrice: formatCurrency(item.totalPrice, item.currency),
  }));

  return arrayToCSV(formattedData, columns);
}

/**
 * Generate quotes CSV export
 */
export function generateQuotesCSV(quotes: Array<{
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  company: string | null;
  status: string;
  subtotal: number | null;
  discount: number;
  total: number | null;
  currency: string;
  validUntil: Date | string | null;
  createdAt: Date | string;
}>): string {
  const columns = [
    { key: 'quoteNumber' as const, label: 'Quote Number' },
    { key: 'customerName' as const, label: 'Customer Name' },
    { key: 'customerEmail' as const, label: 'Customer Email' },
    { key: 'company' as const, label: 'Company' },
    { key: 'status' as const, label: 'Status' },
    { key: 'subtotal' as const, label: 'Subtotal' },
    { key: 'discount' as const, label: 'Discount' },
    { key: 'total' as const, label: 'Total' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'validUntil' as const, label: 'Valid Until' },
    { key: 'createdAt' as const, label: 'Created Date' },
  ];

  const formattedData = quotes.map(quote => ({
    ...quote,
    company: quote.company || '',
    subtotal: quote.subtotal ? formatCurrency(quote.subtotal, quote.currency) : '',
    discount: formatCurrency(quote.discount, quote.currency),
    total: quote.total ? formatCurrency(quote.total, quote.currency) : '',
    validUntil: quote.validUntil ? formatDate(quote.validUntil) : '',
    createdAt: formatDate(quote.createdAt),
  }));

  return arrayToCSV(formattedData, columns);
}

/**
 * Generate customers CSV export
 */
export function generateCustomersCSV(customers: Array<{
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string;
  status: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date | string;
}>): string {
  const columns = [
    { key: 'name' as const, label: 'Name' },
    { key: 'email' as const, label: 'Email' },
    { key: 'company' as const, label: 'Company' },
    { key: 'phone' as const, label: 'Phone' },
    { key: 'address' as const, label: 'Address' },
    { key: 'city' as const, label: 'City' },
    { key: 'region' as const, label: 'Region' },
    { key: 'postalCode' as const, label: 'Postal Code' },
    { key: 'country' as const, label: 'Country' },
    { key: 'status' as const, label: 'Status' },
    { key: 'totalOrders' as const, label: 'Total Orders' },
    { key: 'totalSpent' as const, label: 'Total Spent' },
    { key: 'createdAt' as const, label: 'Created Date' },
  ];

  const formattedData = customers.map(customer => ({
    ...customer,
    company: customer.company || '',
    phone: customer.phone || '',
    address: customer.address || '',
    city: customer.city || '',
    region: customer.region || '',
    postalCode: customer.postalCode || '',
    totalSpent: formatCurrency(customer.totalSpent, 'USD'),
    createdAt: formatDate(customer.createdAt),
  }));

  return arrayToCSV(formattedData, columns);
}

/**
 * Generate products CSV export
 */
export function generateProductsCSV(products: Array<{
  sku: string;
  name: string;
  categoryName: string;
  brandName: string;
  price: number | null;
  currency: string;
  stockQuantity: number;
  stockStatus: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date | string;
}>): string {
  const columns = [
    { key: 'sku' as const, label: 'SKU' },
    { key: 'name' as const, label: 'Name' },
    { key: 'categoryName' as const, label: 'Category' },
    { key: 'brandName' as const, label: 'Brand' },
    { key: 'price' as const, label: 'Price' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'stockQuantity' as const, label: 'Stock' },
    { key: 'stockStatus' as const, label: 'Stock Status' },
    { key: 'isPublished' as const, label: 'Published' },
    { key: 'isFeatured' as const, label: 'Featured' },
    { key: 'createdAt' as const, label: 'Created Date' },
  ];

  const formattedData = products.map(product => ({
    ...product,
    price: product.price ? formatCurrency(product.price, product.currency) : '',
    isPublished: product.isPublished ? 'Yes' : 'No',
    isFeatured: product.isFeatured ? 'Yes' : 'No',
    createdAt: formatDate(product.createdAt),
  }));

  return arrayToCSV(formattedData, columns);
}

// Helper functions
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(value);
}
