/**
 * Rate Limiting Utility
 *
 * In-memory sliding window rate limiter for sensitive API routes.
 * Protects against brute-force login attempts, password reset abuse,
 * and API spam.
 *
 * For production at scale, replace with Redis-backed rate limiting
 * (e.g., @upstash/ratelimit) to work across multiple server instances.
 *
 * @module lib/security/rateLimit
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp in ms
}

// In-memory store — cleared on server restart
// For multi-instance deployments, use Redis instead
const store = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

/**
 * Extract client IP from request headers.
 * Supports X-Forwarded-For (common behind proxies/load balancers).
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the first IP (original client) from the chain
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Prefix for the rate limit key (e.g., 'login', 'api') */
  prefix: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

/**
 * Check rate limit for a given key.
 *
 * @param identifier - Unique identifier (usually IP or userId)
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed and remaining quota
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpiredEntries();

  const key = `${config.prefix}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const entry = store.get(key);

  // No existing entry or window expired — allow and start new window
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + windowMs,
      retryAfterSeconds: 0,
    };
  }

  // Within window — check count
  if (entry.count < config.maxRequests) {
    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
      retryAfterSeconds: 0,
    };
  }

  // Rate limit exceeded
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt,
    retryAfterSeconds,
  };
}

/**
 * Create a rate-limited response with proper headers.
 */
export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}

// ═══════════════════════════════════════════════════════════════
// PRE-CONFIGURED RATE LIMITERS
// ═══════════════════════════════════════════════════════════════

/** Login: max 5 attempts per 15 minutes per IP */
export const LOGIN_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 15 * 60,
  prefix: 'rl:login',
};

/** Password reset: max 3 requests per hour per IP */
export const PASSWORD_RESET_LIMIT: RateLimitConfig = {
  maxRequests: 3,
  windowSeconds: 60 * 60,
  prefix: 'rl:password-reset',
};

/** General API writes: max 100 per minute per user */
export const API_WRITE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowSeconds: 60,
  prefix: 'rl:api-write',
};

/** Contact form: max 5 per hour per IP */
export const CONTACT_FORM_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 60 * 60,
  prefix: 'rl:contact',
};

/**
 * Convenience wrapper: check rate limit for a request and return
 * a 429 response if exceeded, or null if allowed.
 */
export function enforceRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): NextResponse | null {
  const id = identifier || getClientIp(request);
  const result = checkRateLimit(id, config);

  if (!result.allowed) {
    return rateLimitResponse(result.retryAfterSeconds);
  }

  return null; // Allowed — proceed
}
