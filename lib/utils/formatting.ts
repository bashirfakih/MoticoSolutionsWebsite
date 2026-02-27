/**
 * Formatting Utilities
 * Currency, date, number, and text formatting functions
 */

// ═══════════════════════════════════════════════════════════════
// CURRENCY FORMATTING
// ═══════════════════════════════════════════════════════════════

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

// ═══════════════════════════════════════════════════════════════
// DATE FORMATTING
// ═══════════════════════════════════════════════════════════════

export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'relative' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return formatDateShort(d);
  }

  if (format === 'long') {
    return formatDateLong(d);
  }

  return formatDateRelative(d);
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ═══════════════════════════════════════════════════════════════
// NUMBER FORMATTING
// ═══════════════════════════════════════════════════════════════

export function formatNumber(
  num: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompact(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

// ═══════════════════════════════════════════════════════════════
// PHONE FORMATTING
// ═══════════════════════════════════════════════════════════════

export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Lebanon format: +961 X XXX XXX
  if (digits.startsWith('961') && digits.length === 11) {
    return `+961 ${digits[3]} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  // 8-digit local format: XX XXX XXX
  if (digits.length === 8) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }

  return phone; // Return original if can't format
}

// ═══════════════════════════════════════════════════════════════
// TEXT UTILITIES
// ═══════════════════════════════════════════════════════════════

export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Unicode normalization: replace common symbols with ASCII equivalents
    .replace(/×/g, 'x')           // multiplication sign → x
    .replace(/÷/g, 'div')         // division sign
    .replace(/±/g, 'plus-minus')  // plus-minus sign
    .replace(/°/g, 'deg')         // degree sign
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function deslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ═══════════════════════════════════════════════════════════════
// ADDRESS FORMATTING
// ═══════════════════════════════════════════════════════════════

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export function formatAddress(address: Address): string {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
}

// ═══════════════════════════════════════════════════════════════
// FILE SIZE FORMATTING
// ═══════════════════════════════════════════════════════════════

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ═══════════════════════════════════════════════════════════════
// ORDER NUMBER FORMATTING
// ═══════════════════════════════════════════════════════════════

export function formatOrderNumber(
  prefix: string,
  number: number,
  padding: number = 6
): string {
  return `${prefix}-${String(number).padStart(padding, '0')}`;
}

export function parseOrderNumber(
  orderNumber: string
): { prefix: string; number: number } | null {
  const match = orderNumber.match(/^([A-Z]+)-(\d+)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    number: parseInt(match[2], 10),
  };
}

// ═══════════════════════════════════════════════════════════════
// PLURALIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Returns the singular or plural form of a word based on count.
 * Handles common irregular plurals.
 *
 * @example
 * pluralize(1, 'product') // '1 product'
 * pluralize(5, 'product') // '5 products'
 * pluralize(1, 'category', 'categories') // '1 category'
 * pluralize(5, 'category', 'categories') // '5 categories'
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const word = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${word}`;
}
