/**
 * Next.js Middleware for Route Protection
 *
 * Protects routes based on authentication status using httpOnly session cookies.
 * Runs at the edge before the page is rendered.
 *
 * Note: Middleware can only check for cookie presence, not validate sessions
 * (that requires database access). API routes handle actual session validation.
 *
 * @module middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const SESSION_COOKIE_NAME = 'motico_session';

// Routes that require admin role (validated by API/client)
const ADMIN_ROUTES = ['/admin'];

// Routes that require authentication (any role)
const PROTECTED_ROUTES = ['/account', '/quotes'];

// Public routes that should redirect if already logged in
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a path matches a route prefix
 */
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some(route => path === route || path.startsWith(`${route}/`));
}

/**
 * Check if session cookie exists
 * Note: Actual session validation happens in API routes
 */
function hasSessionCookie(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  return !!sessionCookie?.value;
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and _next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const hasSession = hasSessionCookie(request);

  // Protected routes: require session cookie
  if (matchesRoute(pathname, PROTECTED_ROUTES) || matchesRoute(pathname, ADMIN_ROUTES)) {
    if (!hasSession) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth routes: redirect to dashboard if already logged in
  if (hasSession && matchesRoute(pathname, AUTH_ROUTES)) {
    // Default to account dashboard - client will redirect to admin if needed
    return NextResponse.redirect(new URL('/account/dashboard', request.url));
  }

  return NextResponse.next();
}

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
