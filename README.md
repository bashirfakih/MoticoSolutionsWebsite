# Motico Solutions E-Commerce Platform

Modern B2B e-commerce platform for industrial abrasive products, power tools, and machinery. Built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.12-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.1.0-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-29.7.0-C21325)](https://jestjs.io/)

---

## 🚀 Features

### Customer Features
- 🛍️ **Product Catalog** - Browse 12+ categories with 50+ products
- 🔍 **Advanced Search** - Full-text search with autocomplete
- 📋 **Quote System** - Request for Quote (RFQ) for B2B sales
- 📦 **Order Tracking** - Real-time order status updates
- 👤 **Customer Dashboard** - Order history, quotes, profile management
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop

### Admin Features
- 📊 **Analytics Dashboard** - Revenue, orders, customers, inventory insights
- 🎯 **Product Management** - CRUD operations, inventory, variants, images
- 🏷️ **Category Management** - Hierarchical categories with icons and colors
- 🎨 **Brand Management** - Brand profiles with optimized logo uploads
- 📋 **Order Management** - Order queue, status updates, tracking
- 👥 **Customer Management** - Customer database, tags, order history
- 💬 **Quote Management** - RFQ handling, pricing, quote-to-order conversion
- 🎨 **CMS Features** - Hero slides, testimonials, partner logos
- ⚙️ **Settings** - Company info, branding, localization, features toggles

### Technical Features
- 🖼️ **Image Optimization** - Automatic resize, compression, WebP conversion (80-95% size reduction)
- 🔐 **Authentication** - Secure JWT-based auth with httpOnly cookies
- 🎯 **Role-Based Access** - Customer and admin roles
- 🧪 **Comprehensive Testing** - 130+ tests with Jest
- 📱 **SEO Optimized** - Meta tags, structured data, sitemap
- ⚡ **Performance** - Server-side rendering, code splitting, lazy loading

---

## ⚡ Quick Start

```bash
# Clone repository
git clone [repository-url]
cd MoticoSolutionsWebsite

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default Admin Credentials:**
- Email: `admin@motico.com`
- Password: `admin123`

---

## 📦 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **PostgreSQL** 14.x or higher (or SQLite for development)
- **Git**

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone [repository-url]
cd MoticoSolutionsWebsite
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

**Option A: PostgreSQL (Recommended for Production)**

Using Docker:
```bash
docker-compose up -d
```

Or install PostgreSQL locally, then:
```bash
npx prisma migrate dev
```

**Option B: SQLite (Quick Development)**

Update `.env`:
```env
DATABASE_URL="file:./dev.db"
```

Then:
```bash
npx prisma migrate dev
```

### 4. Seed Database

```bash
npx prisma db seed
```

This creates:
- Admin user (admin@motico.com / admin123)
- 5 brands (Hermes, DCA, 3M, Hoffmann, Sandwox)
- 12 product categories
- 50+ sample products
- Hero slides, testimonials, partner logos

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/motico_dev"

# Authentication
AUTH_SECRET="your-32-character-secret-key-here"

# App
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Generate Auth Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Create migrations
npx prisma generate  # Generate Prisma client

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

### Development Workflow

1. **Start dev server**: `npm run dev`
2. **Database GUI**: `npx prisma studio` (opens at http://localhost:5555)
3. **Make changes**
4. **Run tests**: `npm test`
5. **Build**: `npm run build`
6. **Commit changes**

---

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific test
npm test -- products.test.ts
```

### Test Coverage

- **API Routes**: 65 tests
- **Components**: 35 tests
- **Utilities**: 20 tests
- **Integration**: 10 tests
- **Total**: 130+ tests

---

## CI/CD Pipeline

### Pipeline Overview

```text
Push / PR to main
      |
      v
+------------------+     +------------------+
|   CI Workflow    |     |  E2E Workflow    |
|                  |     |                  |
|  1. Type check   |     |  1. Install deps |
|  2. Lint         |     |  2. Start Postgres|
|  3. Unit tests   |     |  3. Run migrations|
|  4. Build        |     |  4. Seed test DB  |
+--------+---------+     |  5. Build app     |
         |               |  6. Playwright    |
         |               +--------+---------+
         |                        |
         +------+    +------------+
                |    |
                v    v
         +------+----+------+
         |  Deploy Workflow  |
         |  (main only)      |
         |                   |
         |  1. Vercel build  |
         |  2. Deploy staging|
         |  3. Output URL    |
         +-------------------+
```

### Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI | `.github/workflows/ci.yml` | Push + PR to `main` | Type check, lint, unit tests, build |
| E2E | `.github/workflows/e2e.yml` | Push + PR to `main` | Playwright tests against PostgreSQL |
| Deploy | `.github/workflows/deploy.yml` | Push to `main` (after CI + E2E pass) | Deploy to Vercel staging |

### Required GitHub Secrets

Add these in **Settings > Secrets and variables > Actions**:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token (from vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel org ID (from `.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | Vercel project ID (from `.vercel/project.json`) |
| `SUPABASE_DATABASE_URL` | Supabase pooled connection (port 6543, pgBouncer) |
| `SUPABASE_DIRECT_URL` | Supabase direct connection (port 5432, for migrations) |

CI and E2E workflows use hardcoded test values for `DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET` — no secrets needed.

### Branch Protection Rules

Enable in **Settings > Branches > Add rule** for `main`:

- Require status checks to pass before merging:
  - `ci` (from CI workflow)
  - `e2e` (from E2E workflow)
- Require branches to be up to date before merging
- Dismiss stale pull request approvals when new commits are pushed

---

## Deployment

### Staging (Vercel + Supabase)

The app is deployed to Vercel with a Supabase-managed PostgreSQL database.

**Automatic deploys:** Every push to `main`/`master` triggers CI + E2E tests, then deploys to staging via GitHub Actions.

**Manual deploy:**

```bash
# From project root (requires Vercel CLI + login)
vercel deploy --prod=false
```

### Environment Variables (Vercel Dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase pooled connection (port 6543, pgBouncer) |
| `DIRECT_URL` | Yes | Supabase direct connection (port 5432, for migrations) |
| `AUTH_SECRET` | Yes | 32+ char secret for JWT signing |
| `NEXT_PUBLIC_APP_URL` | Yes | Staging URL (e.g., `https://motico-staging.vercel.app`) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name for image uploads |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `SMTP_HOST` | No | SMTP server for email notifications |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |

### Run Migrations on Supabase

```bash
# Apply all pending migrations (uses DIRECT_URL from prisma.config.ts)
DIRECT_URL=<supabase_direct_url> npx prisma migrate deploy
```

### Local Development

Local dev still uses Docker PostgreSQL (no Supabase needed):

```bash
docker-compose up -d      # Start local PostgreSQL
npm run dev               # Start Next.js dev server
```

---

## 📚 Documentation

### Core Documentation
- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Complete project overview (40+ pages)
- **[IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md)** - Image system guide
- **[API Documentation](#)** - API endpoints reference (in PROJECT_DOCUMENTATION.md)

### Key Sections
1. **Features** - Complete feature list
2. **Architecture** - System design and patterns
3. **Database Schema** - All models and relations
4. **API Endpoints** - All routes with examples
5. **Image Optimization** - How the system works
6. **Setup Guide** - Installation and configuration
7. **Testing** - Test structure and guidelines

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.12 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React
- **TypeScript**: Full type safety

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL / SQLite
- **ORM**: Prisma 6.1.0
- **Auth**: Custom JWT with httpOnly cookies

### DevOps
- **CI/CD**: GitHub Actions (lint, test, build, E2E, deploy)
- **Testing**: Jest 30 + Playwright E2E
- **Linting**: ESLint
- **Deployment**: Vercel (automated via CI)
- **Docker**: PostgreSQL container

### Key Libraries
- **Image Processing**: Sharp (optimization)
- **Password Hashing**: bcryptjs
- **Date Handling**: date-fns
- **Form Validation**: Zod (future)

---

## 📁 Project Structure

```
motico-solutions/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages
│   ├── admin/             # Admin dashboard
│   ├── account/           # Customer account
│   └── api/               # API routes
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── ui/               # UI components
│   └── providers/        # Context providers
├── lib/                   # Business logic
│   ├── data/             # Services
│   ├── auth/             # Authentication
│   ├── utils/            # Utilities
│   └── hooks/            # Custom hooks
├── prisma/               # Database
│   ├── schema.prisma     # Schema definition
│   └── seed.ts           # Seed script
├── public/               # Static assets
│   └── images/           # Organized images
├── __tests__/            # Test files
└── [config files]        # Various configs
```

---

## 🎯 Key Features Detail

### 1. Image Optimization System

Automatic image processing with Sharp:
- ✅ **Validation** - Format, dimensions, file size
- ✅ **Resizing** - Smart resizing to optimal dimensions
- ✅ **Compression** - 80-95% file size reduction
- ✅ **WebP Conversion** - Modern format for 25-35% additional savings
- ✅ **Responsive Variants** - Generates thumbnail, small, medium, large sizes
- ✅ **Organized Storage** - Logical folder structure

**Example Upload:**
```
Input:  8MB, 4000×4000px product photo
Output: 320KB optimized + 210KB WebP + 4 responsive sizes
Savings: 96% file size reduction
```

### 2. Admin Dashboard

Comprehensive management interface:
- **Analytics** - Revenue, orders, customers, inventory metrics
- **Product Management** - Full CRUD with variants and images
- **Order Management** - Queue, status updates, tracking
- **Customer Management** - Database, tags, history
- **Quote Management** - RFQ handling, pricing, conversion
- **CMS** - Hero slides, testimonials, partner logos
- **Settings** - Company, branding, features, localization

### 3. Quote System (RFQ)

B2B request-for-quote workflow:
1. Customer requests quote for products
2. Admin reviews and adds pricing
3. Customer receives notification
4. Customer accepts/rejects quote
5. Accepted quotes convert to orders

### 4. Authentication

Secure authentication system:
- **Password Hashing** - bcrypt with salt
- **Session Management** - JWT tokens in httpOnly cookies
- **Role-Based Access** - Customer and admin roles
- **Password Reset** - Email-based reset flow
- **Session Expiry** - Configurable timeout

---

## 🤝 Contributing

### Development Process

1. **Fork & Clone**
2. **Create Feature Branch** - `git checkout -b feature/amazing-feature`
3. **Make Changes**
4. **Add Tests**
5. **Run Tests** - `npm test`
6. **Build** - `npm run build`
7. **Commit** - `git commit -m 'Add amazing feature'`
8. **Push** - `git push origin feature/amazing-feature`
9. **Open Pull Request**

### Code Standards

- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Component documentation
- ✅ Test coverage for new features
- ✅ Meaningful commit messages

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

**Database Connection Error**
```bash
# Check PostgreSQL is running
docker ps

# Reset database
npx prisma migrate reset
npx prisma db seed
```

**Module Not Found**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Regenerate Prisma client
npx prisma generate
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

---

## 📊 Performance

### Metrics
- **Lighthouse Score**: 90+ (target)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Image Optimization**: 80-95% size reduction
- **Code Splitting**: Route-based
- **Caching**: Aggressive caching strategy

### Optimizations
- ✅ Image optimization with Sharp
- ✅ Server-side rendering
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Efficient database queries
- ✅ Optimized bundle size

---

## 🛣️ Roadmap

### Q2 2026
- [ ] Payment gateway integration
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced analytics

### Q3 2026
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] AI product recommendations
- [ ] API for integrations

### Q4 2026
- [ ] Marketplace for sellers
- [ ] Subscription model
- [ ] Advanced CRM features
- [ ] ERP integration

---

## 📄 License

**Proprietary** - © 2026 Motico Solutions. All rights reserved.

This is proprietary software. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 📞 Contact

**Motico Solutions**
- 🌐 Website: https://moticosolutions.com
- 📧 Email: info@moticosolutions.com
- 📱 Phone: +961 3 741 565
- 📍 Location: Beirut, Lebanon

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Prisma** - Excellent ORM
- **Tailwind CSS** - Utility-first CSS
- **Sharp** - Fast image processing
- **Community** - Open source contributors

---

## 📈 Status

- ✅ **Version**: 1.0.0
- ✅ **Status**: Production Ready
- ✅ **Tests**: 130+ passing
- ✅ **Documentation**: Complete
- ✅ **Deployment**: Ready

---

**Built with ❤️ by Motico Solutions Development Team**
