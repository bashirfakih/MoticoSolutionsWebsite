# CLAUDE.md — Motico Solutions B2B Platform Agent Manual
# Version 1.2.0 | Last Updated: March 2026

## Project Identity
Full-stack B2B e-commerce platform for industrial abrasives & tools.
Target: Industrial manufacturers, workshops, distributors in Lebanon & MENA.
Client: Motico Solutions | info@moticosolutions.com | +961 3 741 565

---

## Tech Stack (EXACT VERSIONS — never upgrade without asking)
- Next.js 15.5.12 (App Router, React 19)
- Tailwind CSS 3.4.1
- Prisma 6.1.0 ORM
- PostgreSQL (production) / SQLite (development)
- Custom JWT auth with httpOnly cookies
- Jest 29.7.0
- TypeScript 5.x
- Sharp (image optimization)
- react-easy-crop (image cropping)
- Lucide React (icons)

---

## Architecture Rules (NEVER violate these)
- Service Layer Pattern: ALL business logic lives in service classes, never inline in API routes
- Repository Pattern: ALL data access through Prisma — no raw SQL unless explicitly told
- Provider Pattern: state management through React Context (Settings, Auth, Toast, Theme)
- Server Components for data fetching, Client Components ONLY when interaction required
- Named exports only — no default exports for components
- Functional components with hooks only — no class components

---

## Database Rules (CRITICAL)
- Development DB: SQLite (.env DATABASE_URL points to dev.db)
- Production DB: PostgreSQL
- ALWAYS run migrations with: npx prisma migrate dev --name <description>
- NEVER run: npx prisma migrate reset (destroys dev data)
- NEVER run: npx prisma db push in production
- After schema changes, always regenerate client: npx prisma generate
- Test DB is isolated — use TEST_DATABASE_URL env var for Jest

---

## Authentication System
- Custom JWT with httpOnly cookies (NOT NextAuth, NOT Clerk)
- Roles: customer | admin
- Admin-only user creation — NO self-registration endpoint
- Session check: use getServerSession() from src/lib/auth.ts
- RBAC middleware at src/middleware.ts — protect /admin/* routes

---

## Key Business Logic (understand before touching)

### User Discount System
- Each user has discountPercentage (Decimal 0-100%) set by admin
- Discounted price = basePrice * (1 - discountPercentage/100)
- Applied at order/quote creation time — stored in QuoteItem.discountApplied
- NEVER recalculate from current user discount after order creation
- Show discount badge "X% OFF" only to authenticated users

### Quote/Order Flow
Pending → Under Review → Quoted → Accepted/Rejected → Order Created
- Quote items store: selectedDimension, selectedSize, selectedGrit, selectedPackaging
- QuoteItem.discountApplied = user's discount% at time of order (immutable after)

### Guest vs Authenticated Product View
- Guest: specs locked, price hidden, show "Login to Order" button
- Authenticated: full specs, discounted price, "Order Now" button, WhatsApp button

---

## File Structure
src/
├── app/
│   ├── (public)/          # Public-facing pages
│   ├── admin/             # Admin dashboard (admin role only)
│   ├── account/           # Customer dashboard (customer role)
│   ├── api/               # API routes (serverless functions)
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Reusable atomic components
│   ├── admin/             # Admin-specific components
│   └── shop/              # Storefront components
├── lib/
│   ├── auth.ts            # JWT session helpers
│   ├── prisma.ts          # Prisma client singleton
│   └── services/          # Business logic services
└── types/                 # TypeScript interfaces

---

## API Endpoint Patterns
- Public: /api/products, /api/categories, /api/brands
- Authenticated: /api/quotes, /api/orders, /api/account/*
- Admin only: /api/admin/*, /api/users (creation)
- Always validate role in API handler before proceeding
- Return format: { data: ..., error: null } | { data: null, error: "message" }

---

## Image Optimization Rules
- All uploads go through Sharp pipeline — NEVER save raw user uploads
- Product images → /public/images/products/
- Category images → /public/images/ (16:9, 1920x1080 recommended)
- Brand logos → /public/images/logos/
- Slides → /public/images/slides/
- Always convert to WebP, compress 80-95%
- Use react-easy-crop for zoom/position/crop before upload

---

## Testing Strategy
- ALWAYS build feature first, THEN write tests
- Test files: *.test.ts (unit) | *.e2e.ts (end-to-end)
- Run tests: npm test
- Test DB must be isolated from dev DB (use TEST_DATABASE_URL)
- Current coverage: API tests for discount routes, quote flows, E2E for ordering

---

## Allowed Auto-Run Commands
npm run dev | npm run build | npm run lint | npm test
npx prisma generate | npx prisma migrate dev
git add | git commit | git push | git checkout -b

## DENIED Commands (ask before running)
npx prisma migrate reset
npx prisma db push --force-reset
rm -rf public/images (never delete client uploads)
DROP TABLE | truncate (any destructive DB operation)
git push --force

---

## Before EVERY Commit
1. npm run build → must pass with 0 errors
2. npm run lint → must pass with 0 warnings  
3. npm test → all existing tests must pass
4. Check: did schema change? → run npx prisma generate
5. Commit format: feat(scope): description | fix(scope): description | chore(scope): description

---

## Current Version: 1.2.0
## Next Milestone: Phase 1 — Q2 2026
Priority queue:
- [ ] Payment gateway (Stripe)
- [ ] Product reviews & ratings
- [ ] Wishlist functionality
- [ ] Real-time inventory sync
- [ ] Advanced analytics
```

---

## Your Slash Commands

Create `.claude/commands/` with these files:

**`feature.md`** — for every new feature
```
Before writing any code:
1. Read relevant existing files (service, API route, component) to understand current patterns
2. Check schema in prisma/schema.prisma if DB change needed
3. Write a full implementation plan:
   - Files to create/modify
   - Schema changes (if any) with migration name
   - API endpoints affected
   - Components affected
   - Tests to write after implementation
4. Wait for approval before coding
5. After implementation: run /build-check, then write tests
```

**`build-check.md`**
```
Run in sequence:
1. npm run build — fix ALL errors before continuing
2. npm run lint — fix ALL warnings
3. npm test — all tests must pass
4. If schema was changed: npx prisma generate
Report results. Do NOT exit until all pass.
```

**`db-change.md`** — for any Prisma schema edit
```
1. Show me the exact schema change you plan to make
2. Wait for my approval
3. Apply the change to prisma/schema.prisma
4. Run: npx prisma migrate dev --name <descriptive-name>
5. Run: npx prisma generate
6. Update any affected TypeScript types
7. Run /build-check
```

**`new-api.md`** — for new API routes
```
Before creating a new API route:
1. Check existing routes in src/app/api/ for pattern consistency
2. Confirm auth requirement: public | customer | admin
3. Use the standard response format: { data, error }
4. Add input validation with TypeScript
5. Create service function in src/lib/services/ — NOT inline logic
6. Write the route handler that calls the service
7. Add the endpoint to PROJECT_DOCUMENTATION.md API table
```

**`phase1.md`** — for Q2 2026 roadmap items
```
I am working on a Phase 1 feature. Before starting:
1. Read the Future Enhancements section in PROJECT_DOCUMENTATION.md
2. Check what's already done in the changelog
3. Create a mini-spec for this feature covering:
   - Schema changes needed
   - New API endpoints
   - UI components needed
   - Impact on existing quote/order flow
4. Present the plan for approval before any implementation