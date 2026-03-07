/**
 * Input Sanitization Utility
 *
 * Strips HTML tags and dangerous content from user-supplied strings
 * before they reach the database. Prevents stored XSS attacks.
 *
 * Uses a lightweight approach compatible with Edge Runtime (no jsdom dependency).
 * React's default JSX escaping handles output encoding, but we sanitize on input
 * as defense-in-depth.
 *
 * @module lib/security/sanitize
 */

// HTML tag pattern — matches opening, closing, and self-closing tags
const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;

// Common dangerous patterns beyond simple tags
const DANGEROUS_PATTERNS = [
  /javascript\s*:/gi,
  /on\w+\s*=/gi, // onclick=, onerror=, etc.
  /data\s*:\s*text\/html/gi,
  /vbscript\s*:/gi,
  /expression\s*\(/gi, // CSS expression()
];

/**
 * Sanitize a string input by stripping HTML tags and dangerous patterns.
 * Safe for storing in the database and rendering in React (which also escapes output).
 *
 * @param value - The raw user input string
 * @returns Sanitized string with HTML tags and dangerous patterns removed
 */
export function sanitizeInput(value: string): string {
  if (!value || typeof value !== 'string') return '';

  let sanitized = value.trim();

  // Strip all HTML tags
  sanitized = sanitized.replace(HTML_TAG_REGEX, '');

  // Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Decode common HTML entities that might be used to bypass tag stripping
  sanitized = sanitized
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(HTML_TAG_REGEX, ''); // Second pass after entity decode

  return sanitized.trim();
}

/**
 * Sanitize all string values in an object (shallow, one level deep).
 * Useful for sanitizing request body objects before database operations.
 *
 * @param obj - Object with string values to sanitize
 * @returns New object with sanitized string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(value);
    }
  }
  return sanitized;
}
