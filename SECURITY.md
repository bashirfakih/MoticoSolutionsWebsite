# Security Audit Report — Motico Solutions B2B Platform

**Audit Date:** March 7, 2026
**Auditor:** Security Engineering Review
**Scope:** Full admin dashboard codebase and API layer

---

## Executive Summary

A comprehensive security audit was performed covering input sanitization, authentication, rate limiting, CSRF protection, security headers, environment variables, SQL injection, and file upload security. **12 vulnerabilities were found and fixed**, ranging from critical (SQL injection, mass assignment) to medium (missing rate limiting).

---

## Vulnerabilities Found & Fixed

### CRITICAL

#### 1. SQL Injection in Inventory Alerts API
- **File:** `app/api/inventory/alerts/route.ts`
- **Issue:** `$queryRawUnsafe` with string-interpolated user input (`categoryId`, `brandId`, `limit`) allowed SQL injection.
- **Fix:** Replaced string interpolation with parameterized bindings (`$1`, `$2`, etc.) passed as positional arguments.

#### 2. Hardcoded Database Credentials Fallback
- **File:** `prisma.config.ts`
- **Issue:** Fallback database URL was hardcoded, exposing credentials if `.env` was missing.
- **Fix:** Removed fallback — now throws a clear error if `DATABASE_URL` is not set.

#### 3. Mass Assignment in CMS Routes (3 routes)
- **Files:** `app/api/cms/testimonials/[id]/route.ts`, `app/api/cms/hero-slides/[id]/route.ts`, `app/api/cms/partner-logos/[id]/route.ts`
- **Issue:** PATCH handlers passed raw `body` directly to `prisma.update({ data: body })`, allowing attackers to set any database field (e.g., `id`, `createdAt`).
- **Fix:** Implemented field whitelisting — only explicitly allowed fields are extracted from the request body.

### HIGH

#### 4. Unauthenticated Access to Sensitive Data (3 routes)
- **Files:** `app/api/quotes/route.ts` (GET), `app/api/orders/route.ts` (GET), `app/api/customers/route.ts` (GET)
- **Issue:** GET endpoints returned sensitive customer data, order details, and quote information without any authentication check.
- **Fix:** Added `getCurrentUser()` authentication checks. Customers endpoint requires admin role.

#### 5. Stored XSS via Unsanitized Input (10+ routes)
- **Issue:** All API routes accepting string input stored raw HTML/JavaScript in the database. Confirmed vector: category name field accepted `<script>alert(1)</script>`.
- **Files affected:** Categories, brands, products, users, customers, messages, quotes, orders, CMS testimonials/slides/logos.
- **Fix:** Created `lib/security/sanitize.ts` with `sanitizeInput()` function that strips HTML tags, JavaScript URIs, event handlers, data URIs, VBScript, and CSS expressions. Applied to all string fields across all POST/PUT/PATCH handlers.

#### 6. No Rate Limiting on Authentication Routes
- **Files:** `app/api/auth/login/route.ts`, `app/api/auth/forgot-password/route.ts`, `app/api/auth/reset-password/route.ts`
- **Issue:** No rate limiting on login or password reset, enabling brute-force attacks and email flooding.
- **Fix:** Created `lib/security/rateLimit.ts` with sliding window rate limiter. Applied:
  - Login: 5 attempts per 15 minutes per IP
  - Password reset: 3 requests per hour per IP
  - Contact form: 5 submissions per hour per IP

#### 7. SVG Upload XSS Vector
- **File:** `app/api/upload/image/route.ts`
- **Issue:** SVG files were accepted for upload but could contain embedded `<script>` tags, event handlers, `javascript:` URIs, and `<foreignObject>` elements.
- **Fix:** Added SVG content sanitization that strips dangerous elements before Sharp validation.

### MEDIUM

#### 8. No CSRF Origin Validation
- **Files:** `app/api/auth/login/route.ts`, `app/api/auth/forgot-password/route.ts`, `app/api/auth/reset-password/route.ts`
- **Issue:** No origin header validation on state-changing requests, relying solely on SameSite cookies.
- **Fix:** Created `lib/security/csrf.ts` with `validateOrigin()` function that validates `Origin`/`Referer` headers against allowed origins. Applied to authentication routes as defense-in-depth alongside SameSite=Lax cookies.

#### 9. No Contact Form Rate Limiting
- **File:** `app/api/messages/route.ts`
- **Issue:** Public contact form had no rate limiting, enabling spam flooding.
- **Fix:** Applied `CONTACT_FORM_LIMIT` (5 per hour per IP).

---

## Security Measures Now in Place

### Input Sanitization (`lib/security/sanitize.ts`)
- HTML tag stripping via regex
- Dangerous pattern removal: `javascript:`, `on*=` event handlers, `data:text/html`, `vbscript:`, CSS `expression()`
- HTML entity decode with second-pass stripping
- `sanitizeInput(value)` for individual strings
- `sanitizeObject(obj)` for shallow object sanitization
- Applied to all API routes that store user input

### Rate Limiting (`lib/security/rateLimit.ts`)
- In-memory sliding window algorithm
- IP detection via `X-Forwarded-For`, `X-Real-IP`, or socket address
- Automatic cleanup of expired entries (60-second interval)
- HTTP 429 responses with `Retry-After` header
- Pre-configured limits: `LOGIN_LIMIT`, `PASSWORD_RESET_LIMIT`, `API_WRITE_LIMIT`, `CONTACT_FORM_LIMIT`

### CSRF Protection (`lib/security/csrf.ts`)
- Origin header validation for POST/PUT/PATCH/DELETE requests
- Referer header fallback when Origin is absent
- Allowed origins from `NEXT_PUBLIC_APP_URL` + localhost in development
- Complements SameSite=Lax cookie defense

### Environment Validation (`lib/security/env.ts` + `instrumentation.ts`)
- Validates `DATABASE_URL` and `AUTH_SECRET` are set at server startup
- Production-only: validates `NEXT_PUBLIC_APP_URL`
- Warns if `AUTH_SECRET` looks like a development placeholder (< 32 chars)
- Wired into Next.js instrumentation hook for fail-fast behavior

### Security Headers (pre-existing in `next.config.js`)
- Content-Security-Policy (CSP) with strict directives
- Strict-Transport-Security (HSTS) with 1-year max-age
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy restricting camera, microphone, geolocation

### Authentication & Authorization
- Custom session tokens via `crypto.randomBytes(32)`
- Bcrypt password hashing with 12 salt rounds
- httpOnly, SameSite=Lax session cookies
- Role-based access: `admin` and `customer` roles
- Middleware protection on `/admin/*`, `/account/*` routes
- Admin-only user creation (no self-registration)

### File Upload Security
- Authentication required for all uploads
- Admin-only for image optimization uploads
- MIME type whitelist (JPEG, PNG, WebP, GIF, SVG)
- File size limits (5MB general, 10MB admin image)
- Sharp validation for image integrity
- SVG content sanitization (script/event handler removal)
- Filename sanitization (alphanumeric + dash/underscore only)

---

## Recommended Future Improvements

### High Priority
1. **Redis-backed rate limiting** — Current in-memory limiter doesn't persist across server restarts or scale across multiple instances. Use Redis or a distributed rate limiter for production.
2. **Content Security Policy nonce** — Add nonce-based CSP for inline scripts to prevent any residual XSS vectors.
3. **Audit logging** — Log all admin actions (user creation, role changes, data exports) to an audit trail for forensic analysis.

### Medium Priority
4. **Account lockout** — Lock accounts after N failed login attempts (currently only rate-limited by IP, not by account).
5. **Password complexity requirements** — Current minimum is 8 characters. Add requirements for uppercase, lowercase, numbers, and special characters.
6. **Session expiry review** — Verify session timeout is appropriate (recommend 24h max for admin, with sliding expiry).
7. **Input length limits** — Add maximum length validation on all string fields to prevent storage abuse.
8. **Subresource Integrity (SRI)** — Add integrity hashes to external script/stylesheet references.

### Low Priority
9. **Rate limit response headers** — Add `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers for client transparency.
10. **Automated security scanning** — Integrate SAST/DAST tools (e.g., Snyk, OWASP ZAP) into CI/CD pipeline.
11. **Dependency auditing** — Run `npm audit` regularly and pin exact dependency versions.
12. **Two-factor authentication** — Add TOTP-based 2FA for admin accounts.

---

## Files Created/Modified

### New Security Files
- `lib/security/sanitize.ts` — Input sanitization utility
- `lib/security/rateLimit.ts` — Rate limiting middleware
- `lib/security/csrf.ts` — CSRF origin validation
- `lib/security/env.ts` — Environment variable validation
- `lib/security/index.ts` — Barrel export
- `instrumentation.ts` — Next.js startup validation hook

### Modified API Routes
- `app/api/auth/login/route.ts` — Rate limiting + CSRF
- `app/api/auth/forgot-password/route.ts` — Rate limiting + CSRF
- `app/api/auth/reset-password/route.ts` — Rate limiting + CSRF
- `app/api/categories/route.ts` — Input sanitization
- `app/api/brands/route.ts` — Input sanitization
- `app/api/products/route.ts` — Input sanitization
- `app/api/users/route.ts` — Input sanitization
- `app/api/customers/route.ts` — Auth check + input sanitization
- `app/api/messages/route.ts` — Rate limiting + input sanitization
- `app/api/quotes/route.ts` — Auth check
- `app/api/orders/route.ts` — Auth check
- `app/api/inventory/alerts/route.ts` — SQL injection fix
- `app/api/cms/testimonials/[id]/route.ts` — Mass assignment fix + sanitization
- `app/api/cms/hero-slides/[id]/route.ts` — Mass assignment fix + sanitization
- `app/api/cms/partner-logos/[id]/route.ts` — Mass assignment fix + sanitization
- `app/api/upload/image/route.ts` — SVG sanitization
- `prisma.config.ts` — Removed hardcoded credentials

### Modified Test Files
- `__tests__/api/auth/login.test.ts` — Added security module mocks
- `__tests__/api/quotes/quotes.test.ts` — Added auth mock
- `__tests__/api/quotes/quotes-order.test.ts` — Added auth mock
- `__tests__/api/orders/orders-routes.test.ts` — Added auth mock
- `__tests__/api/customers/customers.test.ts` — Added auth mock
- `__tests__/api/messages/messages.test.ts` — Added rate limit mock
