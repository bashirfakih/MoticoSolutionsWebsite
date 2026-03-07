/**
 * CSRF Protection Utility
 *
 * Validates the Origin header on state-changing requests (POST, PUT, PATCH, DELETE)
 * to prevent cross-site request forgery attacks.
 *
 * Combined with SameSite=Lax cookies, this provides strong CSRF protection.
 *
 * @module lib/security/csrf
 */

import { NextRequest, NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Get allowed origins for CSRF validation.
 * Includes the app's own URL and localhost for development.
 */
function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // Primary app URL
  if (APP_URL) {
    origins.add(new URL(APP_URL).origin);
  }

  // Development origins
  if (process.env.NODE_ENV === 'development') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
  }

  return Array.from(origins);
}

/**
 * Validate the Origin header on a request.
 * Returns a 403 response if the origin is not allowed, or null if valid.
 *
 * Only validates state-changing methods (POST, PUT, PATCH, DELETE).
 * GET and HEAD requests are considered safe (they should not mutate state).
 *
 * @param request - The incoming request
 * @returns NextResponse with 403 if invalid, null if valid
 */
export function validateOrigin(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase();

  // Safe methods don't need origin validation
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return null;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // If no origin header (e.g., server-to-server, same-origin navigation),
  // fall back to checking referer
  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  // Allow requests with no origin/referer (same-origin or non-browser clients)
  // SameSite cookies provide the primary CSRF defense for browser requests
  if (!requestOrigin) {
    return null;
  }

  const allowed = getAllowedOrigins();
  if (!allowed.includes(requestOrigin)) {
    return NextResponse.json(
      { error: 'Forbidden: invalid request origin' },
      { status: 403 }
    );
  }

  return null; // Origin is valid
}
