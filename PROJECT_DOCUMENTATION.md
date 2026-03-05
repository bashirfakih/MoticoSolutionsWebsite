# Motico Solutions - E-Commerce Website
## Comprehensive Project Documentation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Key Features](#key-features)
4. [Architecture](#architecture)
5. [User Features](#user-features)
6. [Admin Features](#admin-features)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Image Optimization System](#image-optimization-system)
10. [Authentication & Authorization](#authentication--authorization)
11. [Testing](#testing)
12. [Setup & Installation](#setup--installation)
13. [Project Structure](#project-structure)
14. [Performance Optimizations](#performance-optimizations)
15. [Future Enhancements](#future-enhancements)

---

## Project Overview

**Motico Solutions** is a full-stack B2B e-commerce platform specializing in industrial abrasive products, power tools, and machinery. The platform serves as both a product catalog and order management system for businesses purchasing industrial equipment and supplies.

### Business Model
- **B2B E-Commerce**: Business-to-business sales platform
- **Product Categories**: Abrasive belts, power tools, grinding wheels, sanders, and accessories
- **Brand Portfolio**: Authorized distributor for Hermes, DCA, 3M, Hoffmann, Sandwox, and more
- **Target Market**: Industrial manufacturers, workshops, and distributors in Lebanon and MENA region

### Project Goals
1. **Digital Transformation**: Move from traditional sales to modern e-commerce
2. **Customer Self-Service**: Allow businesses to browse, quote, and order 24/7
3. **Inventory Management**: Real-time stock tracking and low-stock alerts
4. **CRM Integration**: Customer relationship management with order history
5. **Quote System**: Request for Quote (RFQ) functionality for B2B sales
6. **Admin Dashboard**: Comprehensive management interface for all operations

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.12 (React 19)
- **Rendering**: App Router with Server Components
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React
- **Image Processing**: Sharp for optimization
- **Image Cropping**: react-easy-crop for zoom/position/crop
- **TypeScript**: Full type safety

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (serverless functions)
- **Database ORM**: Prisma 6.1.0
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: Custom JWT-based with httpOnly cookies
- **Session Management**: Server-side session handling

### Development & Testing
- **Testing Framework**: Jest 29.7.0
- **Type Checking**: TypeScript 5.x
- **Linting**: ESLint with Next.js config
- **Git**: Version control with feature branches

### DevOps & Deployment
- **Build Tool**: Next.js build system
- **Package Manager**: npm
- **Environment**: .env configuration
- **Docker**: PostgreSQL containerization (optional)

---

## Key Features

### 🛍️ E-Commerce Features
1. **Product Catalog**
   - 12 main categories with hierarchical subcategories
   - Multiple brands (10+ manufacturers)
   - Product variants (size, grit, material)
   - Advanced filtering and search
   - Product comparison
   - Related products

2. **Shopping Experience**
   - Product search with autocomplete
   - Category browsing with filters
   - Product detail pages with image galleries
   - Responsive design (mobile, tablet, desktop)
   - SEO-optimized pages
   - Fast page loads with image optimization

3. **Shopping Cart**
   - Add multiple products to cart before submitting
   - Cart persists in localStorage
   - Quantity controls (increase/decrease/remove)
   - Cart icon with item count badge in header
   - Full cart page with product details and specs
   - Quote summary with price breakdown
   - **TVA/Tax calculation** from site settings
   - **User discount applied** at cart level
   - Submit all items as single quote request
   - Cart cleared on successful quote submission
   - Cart cleared on logout

4. **Quote System (RFQ) & Product Ordering**
   - Request quotes for products
   - Bulk quote requests
   - Quote tracking and history
   - Admin quote management
   - Quote-to-order conversion
   - **Order from product page** (authenticated users)
   - **Selected specs recorded** (dimension, size, grit, packaging)
   - **User discount applied** at order time
   - **TVA/Tax stored** with quote for accurate pricing

5. **Order Management**
   - Order placement
   - Order tracking
   - Order history
   - Status updates (pending, processing, shipped, delivered)
   - Payment tracking
   - Invoice generation

### 👤 Customer Features

1. **User Authentication & Accounts**
   - Admin-only user creation (no self-registration)
   - Secure login with password hashing
   - Password reset functionality
   - Remember me option
   - Session management
   - Role-based access (customer, admin)
   - **Personalized discount percentage** (0-100%, set by admin)

2. **Customer Dashboard**
   - Profile management
   - Order history
   - Quote history
   - Saved addresses
   - Account settings
   - Activity log

3. **Communication**
   - Contact form
   - Message center
   - Admin replies to inquiries
   - Order notifications
   - Quote status updates

### 🎛️ Admin Features

1. **Dashboard Analytics**
   - Revenue metrics
   - Order statistics
   - Customer insights
   - Inventory alerts
   - Recent activities
   - Performance charts

2. **Product Management**
   - CRUD operations for products
   - Bulk import/export
   - Inventory tracking
   - Stock alerts
   - Product variants
   - Image upload and optimization
   - SEO metadata
   - Visibility controls

3. **Category Management**
   - Hierarchical categories
   - Category icons and colors
   - Brand associations
   - Category images
   - Slug management
   - Sort ordering

4. **Brand Management**
   - Brand profiles
   - Logo upload with optimization
   - Brand descriptions
   - Website links
   - Country of origin
   - Active/inactive status

5. **Order Management**
   - Order queue
   - Status updates
   - Payment tracking
   - Shipping management
   - Order notes
   - Customer communication
   - Export orders

6. **Customer Management**
   - Customer database
   - Customer profiles
   - Order history per customer
   - Customer tags
   - Contact information
   - Export customer data

7. **Quote Management**
   - Quote requests queue
   - Quote approval/rejection
   - Pricing management
   - Quote-to-order conversion
   - Quote history
   - Export quotes

8. **CMS Features**
   - Hero slide management
   - Testimonials
   - Partner logos
   - About page content
   - FAQ management
   - Blog posts (future)

9. **User Management**
   - User accounts
   - Role assignment
   - Password reset
   - Account activation/deactivation
   - Activity monitoring

10. **Settings**
    - Company information
    - Branding (logo, colors, fonts)
    - Localization (language, timezone, currency)
    - Email settings
    - Social media links
    - Inventory settings
    - Pricing & tax configuration
    - Feature toggles
    - Maintenance mode

### 📊 Reporting & Analytics

1. **Dashboard Metrics**
   - Total revenue
   - Orders count and breakdown
   - Customer growth
   - Product performance
   - Category analytics
   - Brand performance

2. **Inventory Reports**
   - Stock levels
   - Low stock alerts
   - Out of stock items
   - Stock value
   - Inventory turnover

3. **Export Capabilities**
   - Orders export (CSV)
   - Customers export (CSV)
   - Quotes export (CSV)
   - Inventory reports
   - Sales reports

---

## Architecture

### Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                          │
│  (Next.js Server Components + Client Components)             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js App Router                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Server      │  │  API Routes  │  │  Middleware  │      │
│  │  Components  │  │  (Backend)   │  │  (Auth)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Services    │  │  Auth        │  │  Utilities   │      │
│  │  (CRUD)      │  │  (Session)   │  │  (Helpers)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                          │
│  ┌──────────────────────────────────────────────────┐       │
│  │           Prisma ORM Client                      │       │
│  └──────────────────────────────────────────────────┘       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Database                           │
│  (Products, Users, Orders, Quotes, Categories, etc.)        │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

1. **Service Layer Pattern**
   - All business logic in service classes
   - Separation of concerns
   - Reusable across API routes and server components

2. **Repository Pattern**
   - Data access abstraction through Prisma
   - Consistent CRUD operations
   - Query optimization

3. **Provider Pattern**
   - React Context for state management
   - Settings provider
   - Auth provider
   - Toast notifications provider
   - Theme provider

4. **Component Composition**
   - Reusable UI components
   - Atomic design principles
   - Props-based customization

5. **Middleware Pattern**
   - Authentication middleware
   - Role-based access control
   - Request/response transformation

---

## User Features

### 1. Homepage

**Components:**
- Dynamic hero carousel with CMS-managed slides
- Featured categories grid with icons
- Products nav dropdown with elegant scrollable list view
- Brand showcase section
- Testimonials carousel
- Partner logos
- Call-to-action sections
- Newsletter signup (future)

**Navigation Features:**

- Elegant list-style category dropdown (replaces grid)
- Scrollable category list showing all categories
- Category icons, names, and product counts
- Hover effects with smooth transitions
- "Browse All Products" footer link

**Technologies:**
- Server-side rendering for SEO
- Optimized images with WebP
- Lazy loading for performance
- Responsive grid layouts

### 2. Product Catalog

**Features:**
- **Category Browsing**: Navigate through hierarchical categories
- **Product Grid**: Responsive product cards with images and key info
- **Filters**:
  - Category filter
  - Brand filter
  - Price range
  - Stock status
  - Product features
- **Search**: Full-text search with suggestions
- **Sorting**: By name, price, newest, popularity

**Product Detail Page:**
- High-resolution image gallery with zoom
- Product specifications
- Variants (size, grit, material)
- Stock status
- Related products
- Product description
- Technical specifications
- Brand information
- Breadcrumb navigation
- SEO metadata

**Authenticated User View:**
- Full product specs visible (dimensions, sizes, grits, packaging)
- Dropdown selectors for spec options
- Price with personalized discount applied
- Discount badge showing savings (e.g., "15% OFF")
- Quantity selector with +/- controls
- "Order Now" button creates quote
- WhatsApp quick contact button

**Guest/Unauthenticated View:**
- Specs locked with message: "Product specifications are available for registered customers"
- Price hidden with message: "Login to see pricing and place orders"
- "Login to Order" button (redirects to login)
- "Contact Us" button for inquiries

### 3. Quote System

**Quote Request:**
- Add products to quote
- Specify quantities
- Add notes/requirements
- Submit quote request
- Receive confirmation

**Quote Management:**
- View quote history
- Track quote status
- Receive admin responses
- Accept/reject quotes
- Convert approved quotes to orders

**Quote Status Flow:**
```
Pending → Under Review → Quoted → Accepted/Rejected → Order Created
```

### 4. Customer Account

**Profile Management:**
- Personal information
- Contact details
- Company information
- Password change
- Profile photo

**Dashboard:**
- Quick stats (orders, quotes)
- Recent orders
- Recent quotes
- Account activity
- Messages from admin

**Order History:**
- List all orders
- Order details
- Track shipments
- Download invoices
- Reorder functionality

**Quote History:**
- All submitted quotes
- Quote status
- Quote details
- Admin responses
- Quote acceptance

### 5. Contact & Support

**Contact Page:**
- Contact form
- Company information
- Map integration (future)
- Social media links
- Business hours
- Email and phone

**Message System:**
- Send inquiries
- Receive admin replies
- Message history
- Notification of new messages

---

## Admin Features

### 1. Admin Dashboard

**Overview Cards:**
- Total Revenue (current month)
- Total Orders (with status breakdown)
- Total Customers
- Low Stock Products

**Charts & Analytics:**
- Revenue chart (monthly)
- Orders chart (daily/weekly)
- Category performance
- Brand performance
- Customer growth

**Recent Activity:**
- Latest orders
- Recent quotes
- New customers
- Low stock alerts
- System notifications

**Quick Actions:**
- Add product
- Create order
- View pending quotes
- Manage customers
- Update settings

### 2. Product Management

**Product List:**
- Searchable table
- Filters (category, brand, status, stock)
- Bulk actions
- Quick edit
- Duplicate products
- Export products

**Add/Edit Product:**
- Basic Information:
  - Product name
  - SKU
  - Description
  - Category
  - Brand
- Pricing:
  - Base price
  - Sale price
  - Tax settings
- Inventory:
  - Stock quantity
  - Low stock threshold
  - Allow backorders
- Images:
  - Multiple image upload
  - Image optimization
  - Gallery ordering
  - Alt text for SEO
- Variants:
  - Size options
  - Material options
  - Color options
  - Variant-specific pricing
  - Variant-specific stock
- SEO:
  - Meta title
  - Meta description
  - URL slug
  - Keywords
- Advanced:
  - Product weight
  - Dimensions
  - Related products
  - Featured product
  - Visibility (public/hidden)
  - Tags

**Features:**
- Auto-generated SKU
- Slug generation from name
- Image drag-and-drop upload with cropping
- Image zoom and positioning before upload
- Inline brand creation (create new brand without leaving page)
- Auto-redirect to products list after creation
- Quick Specs with checkbox activation
- Real-time preview
- Validation
- Unsaved changes warning
- Keyboard shortcuts (Ctrl+S to save)

**Quick Specs:**
Optional product attributes that admin can activate per product:

| Spec         | Example Values            | Use Case                    |
| ------------ | ------------------------- | --------------------------- |
| Dimensions   | 90x100 mm, 150x200x10 mm  | Physical product dimensions |
| Sizes        | 115 mm, 125 mm, 150 mm    | Available disc/belt sizes   |
| Grits        | 36, 60, 80, 120           | Abrasive grit options       |

- Enable via checkbox in product form
- Only activated specs appear on product detail page
- User-friendly card display with labels

### 3. Category Management

**Category Tree:**
- Hierarchical display
- Drag-and-drop ordering
- Expand/collapse
- Visual hierarchy

**Category Form:**
- Name and slug
- Parent category
- Description
- Icon selection (from library)
- Color selection
- Hero image upload with cropping
- Brand associations
- SEO metadata
- Active status
- Sort order

**Features:**
- Icon library with 50+ icons
- Color picker
- Image upload with drag-and-drop
- Image cropping with zoom/position (16:9 aspect ratio)
- Image size recommendations (1920x1080px)
- Image optimization with WebP conversion
- Slug validation
- Parent-child relationships
- Breadcrumb preview

### 4. Brand Management

**Brand List:**
- Brand cards with logos
- Search and filter
- Active/inactive toggle
- Quick actions

**Brand Form:**
- Brand name
- Logo upload with optimization
- Description
- Website URL
- Country of origin
- Brand story
- Active status

**Features:**
- Automatic logo optimization
- Responsive size generation
- WebP conversion
- Brand slug generation
- External link validation

### 5. Order Management

**Order Queue:**
- Tabbed interface (All, Pending, Processing, Shipped, Delivered, Cancelled)
- Order cards with key info
- Status indicators
- Search and filter
- Date range filter
- Export to CSV

**Order Detail:**
- Order information
- Customer details
- Order items with images
- Pricing breakdown
- Payment information
- Shipping address
- Order notes
- Status history
- Admin notes (internal)

**Order Actions:**
- Update status
- Add tracking number
- Send notification to customer
- Add notes
- Print invoice
- Refund order (future)
- Cancel order

**Status Workflow:**
```
Pending → Processing → Shipped → Delivered
         ↓
      Cancelled
```

### 6. Customer Management

**Customer List:**
- Searchable table
- Filters (status, date joined, tags)
- Customer stats (orders, revenue)
- Quick actions
- Export to CSV

**Customer Detail:**
- Personal information
- Company information
- Contact details
- Order history
- Quote history
- Total revenue
- Average order value
- Customer tags
- Admin notes

**Customer Actions:**
- Edit customer info
- View orders
- View quotes
- Send message
- Add tags
- Deactivate account
- Password reset

**Customer Tags:**
- VIP customer
- Bulk buyer
- Distributor
- New customer
- At-risk customer
- Custom tags

### 7. Quote Management

**Quote Queue:**
- Pending quotes
- Under review
- Responded quotes
- Accepted/rejected
- Search and filter

**Quote Detail:**
- Customer information
- Requested products and quantities
- Customer notes
- Quote date
- Status

**Quote Actions:**
- Add pricing
- Add notes to customer
- Approve with pricing
- Reject with reason
- Convert to order
- Send to customer

**Quote Flow:**
1. Customer submits quote request
2. Admin reviews quote
3. Admin adds pricing and terms
4. Customer receives quote notification
5. Customer accepts/rejects
6. If accepted, convert to order

### 8. CMS Features

**Hero Slides:**
- Add/edit/delete slides
- Image upload with optimization
- Title and description
- Call-to-action button
- Link URL
- Sort order
- Active status
- Desktop and mobile preview

**Testimonials:**
- Customer name
- Role and company
- Testimonial text
- Rating (1-5 stars)
- Photo upload
- Active status
- Featured testimonial

**Partner Logos:**
- Partner name
- Logo upload
- Website URL
- Sort order
- Active status
- Hover effects

### 9. User Management

**User List:**
- All system users (customers and admins)
- Role filter
- Status filter
- Discount percentage display
- Search

**User Form:**
- Email and password
- Name
- Role (customer, admin)
- Status (active, inactive)
- **Discount Percentage (0-100%)** - Custom discount per user
- Profile information

**User Actions:**
- Create user with custom discount
- Edit user discount percentage
- Change role
- Reset password
- Activate/deactivate
- View activity log

**User Discount System:**
- Each user can have a unique discount percentage (0-100%)
- Discount is set by admin during user creation or editing
- Displayed as a green badge in users table
- Discounted prices shown to logged-in users on product pages
- Discount applied is recorded with each order/quote

### 10. Settings

**Company Information:**
- Company name
- Email, phone, address
- Tax ID
- Company description
- Business hours

**Branding:**
- Logo upload (company logo)
- Favicon upload
- Primary color
- Secondary color
- Accent color
- Font family

**Localization:**
- Default language
- Timezone
- Currency and symbol
- Date format
- Time format (12h/24h)

**Email Settings:**
- From name and address
- Order notification email
- Quote notification email
- Enable/disable notifications
- Email templates (future)

**Social Media:**
- Facebook URL
- Instagram URL
- LinkedIn URL
- YouTube URL
- Twitter URL
- TikTok URL

**Inventory Settings:**
- Low stock threshold
- Track inventory (on/off)
- Allow backorders
- Out of stock behavior

**Pricing & Tax:**
- Tax rate
- Tax label
- Prices include tax
- Show prices with tax
- Shipping fee
- Free shipping threshold
- Enable local pickup

**Features:**
- Enable quotes
- Enable reviews
- Enable wishlist
- Enable compare
- Enable blog

**Maintenance:**
- Maintenance mode (on/off)
- Maintenance message
- Allowed IP addresses (future)

---

## Database Schema

### Core Models

#### User
```prisma
model User {
  id                 String    @id @default(cuid())
  email              String    @unique
  passwordHash       String
  name               String
  role               UserRole  @default(customer)
  isActive           Boolean   @default(true)
  discountPercentage Decimal   @default(0) @db.Decimal(5, 2)  // 0-100%
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  // Relations
  orders       Order[]
  quotes       Quote[]    @relation("UserQuotes")
  messages     Message[]
}

enum UserRole {
  customer
  admin
}
```

#### Product
```prisma
model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  name        String
  slug        String   @unique
  description String?
  price       Float
  salePrice   Float?
  stock       Int      @default(0)
  lowStockThreshold Int @default(10)
  isActive    Boolean  @default(true)
  isFeatured  Boolean  @default(false)
  categoryId  String
  brandId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  category    Category @relation(...)
  brand       Brand    @relation(...)
  images      ProductImage[]
  variants    ProductVariant[]
  orderItems  OrderItem[]
  quoteItems  QuoteItem[]
}
```

#### Category
```prisma
model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  parentId    String?
  icon        String?
  color       String?
  image       String?
  sortOrder   Int        @default(0)
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Self-referential relation
  parent      Category?  @relation("CategoryHierarchy", ...)
  children    Category[] @relation("CategoryHierarchy")

  // Relations
  products    Product[]
}
```

#### Brand
```prisma
model Brand {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  logo            String?
  description     String?
  website         String?
  countryOfOrigin String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  products        Product[]
}
```

#### Order
```prisma
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  userId          String
  status          OrderStatus @default(pending)
  totalAmount     Float
  taxAmount       Float
  shippingAmount  Float
  paymentStatus   PaymentStatus @default(pending)
  paymentMethod   String?
  shippingAddress Json
  billingAddress  Json?
  notes           String?
  trackingNumber  String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  user            User        @relation(...)
  items           OrderItem[]
}

enum OrderStatus {
  pending
  processing
  shipped
  delivered
  cancelled
}

enum PaymentStatus {
  pending
  paid
  failed
  refunded
}
```

#### Quote
```prisma
model Quote {
  id              String      @id @default(cuid())
  quoteNumber     String      @unique
  customerId      String?
  userId          String?     // Link to authenticated user who placed order
  customerName    String
  customerEmail   String
  customerPhone   String?
  company         String?
  status          QuoteStatus @default(pending)
  customerMessage String?
  adminNotes      String?
  subtotal        Decimal?
  tax             Decimal     @default(0)  // TVA amount
  taxLabel        String?                  // e.g., "TVA", "VAT"
  discount        Decimal     @default(0)
  total           Decimal?
  currency        String      @default("USD")
  expiresAt       DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  customer    Customer?   @relation(...)
  user        User?       @relation("UserQuotes", ...)
  items       QuoteItem[]
}

enum QuoteStatus {
  pending
  under_review
  quoted
  accepted
  rejected
  expired
}
```

#### QuoteItem (with Selected Specs)
```prisma
model QuoteItem {
  id                String   @id @default(cuid())
  quoteId           String
  productId         String?
  productName       String
  sku               String?
  description       String?
  quantity          Int
  unitPrice         Decimal?
  totalPrice        Decimal?
  selectedDimension String?  // Selected dimension option
  selectedSize      String?  // Selected size option
  selectedGrit      String?  // Selected grit option
  selectedPackaging String?  // Selected packaging option
  discountApplied   Decimal? @db.Decimal(5, 2)  // User's discount % at order time

  // Relations
  quote   Quote   @relation(...)
  product Product? @relation(...)
}
```

#### Additional Models

- **ProductImage**: Product image gallery
- **ProductVariant**: Product size/color/material variants
- **OrderItem**: Individual items in an order
- **Message**: Customer support messages
- **HeroSlide**: CMS hero carousel slides
- **Testimonial**: Customer testimonials
- **PartnerLogo**: Partner/client logos
- **SiteSettings**: Global site configuration

---

## API Endpoints

### Authentication (`/api/auth/`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/register` | POST | Register new user | No |
| `/api/auth/login` | POST | Login user | No |
| `/api/auth/logout` | POST | Logout user | Yes |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/auth/forgot-password` | POST | Request password reset | No |
| `/api/auth/reset-password` | POST | Reset password with token | No |

### Products (`/api/products/`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/products` | GET | List all products | No |
| `/api/products` | POST | Create product | Admin |
| `/api/products/[id]` | GET | Get product by ID | No |
| `/api/products/[id]` | PATCH | Update product | Admin |
| `/api/products/[id]` | DELETE | Delete product | Admin |
| `/api/products/slug/[slug]` | GET | Get product by slug | No |
| `/api/products/search` | GET | Search products | No |
| `/api/products/search/suggestions` | GET | Search suggestions | No |

### Categories (`/api/categories/`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/categories` | GET | List categories | No |
| `/api/categories` | POST | Create category | Admin |
| `/api/categories/[id]` | GET | Get category | No |
| `/api/categories/[id]` | PATCH | Update category | Admin |
| `/api/categories/[id]` | DELETE | Delete category | Admin |
| `/api/categories/slug/[slug]` | GET | Get by slug | No |

### Brands (`/api/brands/`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/brands` | GET | List brands | No |
| `/api/brands` | POST | Create brand | Admin |
| `/api/brands/[id]` | GET | Get brand | No |
| `/api/brands/[id]` | PATCH | Update brand | Admin |
| `/api/brands/[id]` | DELETE | Delete brand | Admin |

### Orders (`/api/orders/`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/orders` | GET | List orders | User/Admin |
| `/api/orders` | POST | Create order | User |
| `/api/orders/[id]` | GET | Get order | User/Admin |
| `/api/orders/[id]` | PATCH | Update order | Admin |
| `/api/orders/track` | GET | Track order | No |
| `/api/orders/export` | GET | Export orders CSV | Admin |

### Quotes (`/api/quotes/`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/quotes` | GET | List quotes | User/Admin |
| `/api/quotes` | POST | Create quote | User |
| `/api/quotes/[id]` | GET | Get quote | User/Admin |
| `/api/quotes/[id]` | PATCH | Update quote | Admin |
| `/api/quotes/[id]/convert` | POST | Convert to order | Admin |
| `/api/quotes/export` | GET | Export quotes CSV | Admin |

### Customers (`/api/customers/`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/customers` | GET | List customers | Admin |
| `/api/customers` | POST | Create customer | Admin |
| `/api/customers/[id]` | GET | Get customer | Admin |
| `/api/customers/[id]` | PATCH | Update customer | Admin |
| `/api/customers/[id]` | DELETE | Delete customer | Admin |
| `/api/customers/export` | GET | Export CSV | Admin |

### CMS (`/api/cms/`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/cms/hero-slides` | GET | List slides | No |
| `/api/cms/hero-slides` | POST | Create slide | Admin |
| `/api/cms/hero-slides/[id]` | PATCH | Update slide | Admin |
| `/api/cms/hero-slides/[id]` | DELETE | Delete slide | Admin |
| `/api/cms/testimonials` | GET | List testimonials | No |
| `/api/cms/testimonials` | POST | Create testimonial | Admin |
| `/api/cms/testimonials/[id]` | PATCH | Update testimonial | Admin |
| `/api/cms/testimonials/[id]` | DELETE | Delete testimonial | Admin |
| `/api/cms/partner-logos` | GET | List logos | No |
| `/api/cms/partner-logos` | POST | Create logo | Admin |
| `/api/cms/partner-logos/[id]` | PATCH | Update logo | Admin |
| `/api/cms/partner-logos/[id]` | DELETE | Delete logo | Admin |

### Other Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/settings` | GET | Get settings | No |
| `/api/settings` | PATCH | Update settings | Admin |
| `/api/dashboard/stats` | GET | Dashboard metrics | Admin |
| `/api/messages` | GET | List messages | Admin |
| `/api/messages` | POST | Create message | User |
| `/api/messages/[id]` | PATCH | Update message | Admin |
| `/api/upload/image` | POST | Upload & optimize image | Admin |
| `/api/users` | GET | List users (with discountPercentage) | Admin |
| `/api/users` | POST | Create user (with discountPercentage) | Admin |
| `/api/users/[id]` | GET | Get user by ID | Admin |
| `/api/users/[id]` | PATCH | Update user (including discount) | Admin |
| `/api/users/[id]` | DELETE | Delete user | Admin |
| `/api/auth/me` | GET | Current user (includes discountPercentage) | Yes |
| `/api/inventory/alerts` | GET | Low stock alerts | Admin |

---

## Image Optimization System

### Overview
Advanced image processing system that automatically optimizes uploaded images for web performance.

### Features
1. **Automatic Validation**
   - Format check (JPEG, PNG, WebP, SVG, GIF)
   - Dimension validation (min 50px, max 10000px)
   - File size limit (10MB upload max)

2. **Smart Resizing**
   - Maintains aspect ratio
   - Type-specific max dimensions
   - No upscaling (preserves quality)

3. **Compression**
   - 80-95% file size reduction
   - Quality settings per image type
   - Lossless compression where applicable

4. **Format Conversion**
   - Automatic WebP generation
   - 25-35% additional size savings
   - Fallback to original format

5. **Responsive Variants**
   - Thumbnail (150px)
   - Small (400px)
   - Medium (800px)
   - Large (1200px)
   - Hero (1920px)

### Configuration by Type

```javascript
{
  'brand-logo': {
    maxWidth: 500,
    maxHeight: 500,
    quality: 90,
    sizes: ['thumbnail', 'small']
  },
  'product-image': {
    maxWidth: 2000,
    maxHeight: 2000,
    quality: 85,
    sizes: ['thumbnail', 'small', 'medium', 'large']
  },
  'hero-slide': {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    sizes: ['large', 'hero']
  }
}
```

### Image Cropping (Client-Side)

**ImageCropper Component:**
Uses `react-easy-crop` library for client-side image manipulation before upload.

**Features:**

- Full-screen cropping modal
- Drag to position image
- Scroll or slider to zoom (1x - 3x)
- Reset button to restore defaults
- Apply/Cancel actions
- Type-specific aspect ratios

**Aspect Ratios by Type:**

| Image Type       | Aspect Ratio      | Use Case          |
| ---------------- | ----------------- | ----------------- |
| `brand-logo`     | 1:1 (square)      | Brand logos       |
| `product-image`  | 1:1 (square)      | Product photos    |
| `category-image` | 16:9 (landscape)  | Category headers  |
| `hero-slide`     | 16:9 (landscape)  | Homepage carousel |
| `partner-logo`   | 1:1 (square)      | Partner logos     |
| `favicon`        | 1:1 (square)      | Browser favicon   |

**Crop Flow:**
```
User Selects Image
         ↓
  ImageCropper Opens (for PNG/JPG/WebP)
         ↓
  User Adjusts: Zoom, Position
         ↓
  Click Apply → Canvas crops image
         ↓
  Cropped blob sent to upload
```

### Upload Flow
```
User Selects File (e.g., 8MB, 4000×4000px)
         ↓
    Validation
         ↓
  [If croppable] → ImageCropper Modal
         ↓
  Convert to Buffer
         ↓
  Sharp Processing
    ├─ Resize to max dimensions
    ├─ Compress (85-90% quality)
    ├─ Generate WebP version
    └─ Create responsive sizes
         ↓
  Save to Disk (organized folders)
         ↓
Return URLs & Statistics
```

### File Organization
```
public/images/
├── logos/
│   ├── brands/          # Brand/partner logos
│   └── company/         # Company branding
├── products/
│   ├── categories/      # Category hero images
│   └── items/           # Product photos
└── slides/              # Homepage carousel
```

### Performance Impact
- **Before**: 2-10MB raw images, slow page loads
- **After**: 100-500KB optimized + 4 responsive sizes
- **Savings**: 80-95% file size reduction
- **WebP Bonus**: Additional 25-35% savings
- **Result**: Fast page loads, improved Core Web Vitals

### API Response Example
```json
{
  "success": true,
  "url": "/images/products/items/product-123.jpg",
  "webp": "/images/products/items/product-123.webp",
  "sizes": {
    "-thumb": {
      "url": "/images/products/items/product-123-thumb.jpg",
      "webp": "/images/products/items/product-123-thumb.webp"
    }
  },
  "originalSize": 5242880,
  "optimizedSize": 320000,
  "savings": 94,
  "width": 2000,
  "height": 2000
}
```

---

## Authentication & Authorization

### Authentication Flow

```
User Login
    ↓
Credentials Validation
    ↓
Password Hash Check (bcrypt)
    ↓
Generate Session Token (JWT)
    ↓
Store in httpOnly Cookie
    ↓
Return User Data
```

### Session Management
- **Token Storage**: httpOnly cookies (XSS protection)
- **Token Expiry**: 7 days (configurable)
- **Refresh**: Automatic on activity
- **Logout**: Cookie deletion

### Authorization Levels

| Role | Access |
|------|--------|
| **Guest** | Browse products, view public pages |
| **Customer** | All guest + place orders, request quotes, manage account |
| **Admin** | All customer + full admin panel access |

### Protected Routes
- `/admin/*` - Admin only
- `/account/*` - Logged in users
- `/api/orders` - User's own orders or admin
- `/api/products` POST/PATCH/DELETE - Admin only

### Middleware Protection
```typescript
export function middleware(request: NextRequest) {
  // Check session
  // Verify role
  // Redirect or allow
}
```

---

## Testing

### Test Coverage

**Total Tests**: 180+

**Test Categories:**

1. **API Routes** (85 tests)
   - Authentication endpoints
   - Product CRUD operations
   - Order management
   - Quote system (including order flow)
   - Customer management
   - CMS endpoints
   - **User discount routes** (create, update, validate 0-100%)
   - **Quote order flow** (specs, pricing, user linking)

2. **Components** (35 tests)
   - UI components
   - Form validation
   - Data tables
   - Image upload

3. **Utilities** (20 tests)
   - Helper functions
   - Validators
   - Formatters
   - Image optimization

4. **E2E Tests** (40 tests)
   - **Product ordering flow** (guest vs authenticated)
   - **User discount display** on product pages
   - **Spec selection** (dimension, size, grit, packaging)
   - **Quote creation** from product detail page
   - **Admin user discount management**
   - Authentication flows
   - Product browsing
   - Admin dashboard

### Test Framework

- **Jest**: Unit and API testing framework
- **Testing Library**: React component testing
- **Playwright**: E2E browser testing
- **MSW**: API mocking (future)

### Running Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- products.test.ts
```

### Test Structure
```typescript
describe('Products API - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all active products', async () => {
    // Arrange
    mockProductFindMany.mockResolvedValueOnce(mockProducts);

    // Act
    const response = await GET(request);
    const data = await getResponseJson(response);

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual(mockProducts);
  });
});
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+ (or use SQLite for dev)
- Git

### Installation Steps

1. **Clone Repository**
```bash
git clone [repository-url]
cd MoticoSolutionsWebsite
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/motico_dev"
AUTH_SECRET="your-32-character-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Database Setup**

For PostgreSQL:
```bash
# Using Docker (optional)
docker-compose up -d

# Or install PostgreSQL locally
# Then run migrations
npx prisma migrate dev
```

For SQLite (dev only):
```env
DATABASE_URL="file:./dev.db"
```

5. **Seed Database**
```bash
npx prisma db seed
```

This creates:
- Admin user (admin@motico.com / admin123)
- 5 brands
- 12 categories
- 50+ products
- Sample hero slides
- Testimonials
- Partner logos

6. **Run Development Server**
```bash
npm run dev
```

Open http://localhost:3000

7. **Login as Admin**
- Email: admin@motico.com
- Password: admin123

### Build for Production

```bash
# Build
npm run build

# Start production server
npm start
```

---

## Project Structure

```
motico-solutions/
├── __tests__/                 # Test files
│   ├── api/                   # API route tests
│   ├── components/            # Component tests
│   ├── unit/                  # Unit tests
│   └── helpers/               # Test utilities
│
├── app/                       # Next.js App Router
│   ├── (public)/              # Public routes
│   │   ├── page.tsx           # Homepage
│   │   ├── products/          # Product pages
│   │   ├── contact/           # Contact page
│   │   └── ...
│   ├── admin/                 # Admin dashboard
│   │   ├── layout.tsx         # Admin layout
│   │   ├── dashboard/         # Analytics
│   │   ├── products/          # Product management
│   │   ├── orders/            # Order management
│   │   ├── customers/         # Customer management
│   │   └── ...
│   ├── account/               # Customer account
│   │   ├── dashboard/
│   │   ├── orders/
│   │   └── quotes/
│   ├── api/                   # API routes
│   │   ├── auth/              # Authentication
│   │   ├── products/          # Products API
│   │   ├── orders/            # Orders API
│   │   └── ...
│   ├── login/                 # Login page
│   ├── register/              # Registration
│   └── layout.tsx             # Root layout
│
├── components/                # React components
│   ├── admin/                 # Admin components
│   │   ├── DataTable.tsx
│   │   ├── ImageUpload.tsx    # Drag-drop upload with cropping
│   │   ├── ImageCropper.tsx   # Zoom/position/crop modal
│   │   └── ...
│   ├── ui/                    # UI components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── OptimizedImage.tsx
│   │   └── ...
│   ├── auth/                  # Auth components
│   ├── cart/                  # Cart components
│   │   └── CartIcon.tsx       # Header cart icon with badge
│   ├── seo/                   # SEO components
│   └── providers/             # Context providers
│
├── lib/                       # Business logic
│   ├── data/                  # Data services
│   │   ├── productService.ts
│   │   ├── orderService.ts
│   │   ├── types.ts
│   │   └── ...
│   ├── auth/                  # Authentication
│   │   ├── session.ts
│   │   ├── password.ts
│   │   └── AuthContext.tsx
│   ├── cart/                  # Shopping cart
│   │   └── CartContext.tsx    # Cart state + localStorage
│   ├── utils/                 # Utilities
│   │   ├── imageOptimizer.ts
│   │   ├── validators.ts
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   │   ├── useSettings.ts
│   │   └── ...
│   └── db.ts                  # Prisma client
│
├── prisma/                    # Database
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed script
│   └── migrations/            # Migration history
│
├── public/                    # Static files
│   ├── images/                # Organized images
│   │   ├── logos/
│   │   ├── products/
│   │   └── slides/
│   ├── favicon.png
│   └── ...
│
├── .env                       # Environment variables
├── .env.example               # Example env file
├── next.config.js             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── tsconfig.json              # TypeScript config
├── jest.config.js             # Jest config
├── package.json               # Dependencies
├── PROJECT_DOCUMENTATION.md   # This file
└── IMAGE_OPTIMIZATION.md      # Image system docs
```

---

## Performance Optimizations

### 1. Image Optimization
- Automatic compression (80-95% reduction)
- WebP format for modern browsers
- Responsive image variants
- Lazy loading with Next.js Image
- CDN-ready architecture

### 2. Code Splitting
- Route-based code splitting
- Dynamic imports for heavy components
- Lazy loading of admin modules
- Reduced initial bundle size

### 3. Caching
- Static page generation where possible
- API response caching
- Image caching with immutable URLs
- Browser caching headers

### 4. Database Optimization
- Indexed columns (slug, email, SKU)
- Efficient queries with Prisma
- Connection pooling
- Query result caching (future)

### 5. Server-Side Rendering
- SSR for SEO-critical pages
- Server Components for data fetching
- Streaming for faster TTI
- Partial pre-rendering (future)

### 6. Build Optimizations
- Tree shaking
- Minification
- Gzip compression
- Asset optimization

### Performance Metrics
- **Lighthouse Score**: 90+ (goal)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

---

## Future Enhancements

### Phase 1 (Q2 2026)
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Real-time inventory sync
- [ ] Advanced analytics dashboard
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Product comparison

### Phase 2 (Q3 2026)
- [ ] Multi-language support (Arabic, English, French)
- [ ] Mobile app (React Native)
- [ ] Advanced search with filters
- [ ] Product bundles and kits
- [ ] Volume pricing tiers
- [ ] Customer loyalty program

### Phase 3 (Q4 2026)
- [ ] AI-powered product recommendations
- [ ] Chatbot customer support
- [ ] Advanced reporting and BI
- [ ] API for third-party integrations
- [ ] Marketplace for third-party sellers
- [ ] Subscription model for consumables

### Technical Improvements
- [ ] Redis caching layer
- [ ] ElasticSearch for product search
- [ ] GraphQL API option
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] CDN integration (CloudFlare/AWS)
- [ ] Real-time notifications (WebSockets)
- [ ] Progressive Web App (PWA)
- [ ] AVIF image format support
- [ ] Video product demos

### Business Features
- [ ] B2B credit terms
- [ ] Purchase orders
- [ ] Invoice generation
- [ ] Shipping integration (DHL, FedEx)
- [ ] Tax calculation API
- [ ] Multi-warehouse support
- [ ] Dropshipping integration
- [ ] ERP integration
- [ ] Accounting software sync
- [ ] Email marketing integration

---

## Security Features

### Implemented
✅ Password hashing (bcrypt)
✅ httpOnly cookies for sessions
✅ CSRF protection
✅ XSS prevention
✅ SQL injection prevention (Prisma)
✅ Input validation
✅ Role-based access control
✅ Secure file uploads
✅ Rate limiting on auth endpoints

### Planned
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Facebook)
- [ ] IP allowlist for admin
- [ ] Audit logs
- [ ] Security headers (CSP, HSTS)
- [ ] DDoS protection
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] GDPR compliance tools
- [ ] Data encryption at rest

---

## Contributing

### Development Workflow
1. Create feature branch from `develop`
2. Implement feature with tests
3. Run `npm test` and `npm run build`
4. Create pull request to `develop`
5. Code review and approval
6. Merge to `develop`
7. Regular merges to `master` for production

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Jest for testing
- Conventional commits
- Component documentation
- API documentation

### Branch Strategy
- `master` - Production
- `develop` - Development
- `feature/*` - Feature branches
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

---

## Support & Maintenance

### Documentation
- [IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md) - Image system guide
- [API.md](API.md) - API documentation (future)
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide (future)

### Issue Tracking
- Bug reports: Use GitHub Issues
- Feature requests: Use GitHub Discussions
- Security issues: Contact security@motico.com

### Monitoring
- Error tracking: Sentry (future)
- Performance monitoring: Vercel Analytics
- Uptime monitoring: UptimeRobot (future)
- User analytics: Google Analytics (future)

---

## License

**Proprietary** - © 2026 Motico Solutions. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited.

---

## Contact

**Motico Solutions**
- Website: https://moticosolutions.com
- Email: info@moticosolutions.com
- Phone: +961 [phone]
- Address: Lebanon

**Development Team**
- Project Lead: [Name]
- Backend Developer: [Name]
- Frontend Developer: [Name]
- DevOps: [Name]

---

## Changelog

### Version 1.3.0 (Current)

**Shopping Cart System:**

- ✅ Full shopping cart with multi-product support
- ✅ CartContext with localStorage persistence
- ✅ CartIcon component with item count badge
- ✅ Cart page with product list, specs, and quantity controls
- ✅ Quote summary with subtotal, discount, TVA, and total
- ✅ Submit all cart items as single quote request
- ✅ Cart cleared on successful submission and logout
- ✅ "Add to Cart" button replaces "Order Now" on product pages

**TVA/Tax System:**

- ✅ Admin-configurable tax rate in Site Settings
- ✅ Custom tax label (TVA, VAT, etc.)
- ✅ TVA calculated on discounted subtotal
- ✅ TVA breakdown displayed in cart and quote detail
- ✅ Tax fields stored with Quote model (tax, taxLabel)
- ✅ Quotes API returns tax information

**API Testing:**

- ✅ Tests for /api/quotes/[id]/convert (13 tests)
- ✅ Tests for /api/orders/[id] (22 tests)
- ✅ Tests for /api/orders/track (12 tests)

### Version 1.2.0

**User Discount & Ordering System:**
- ✅ User-specific discount percentage (0-100%)
- ✅ Admin-only user creation (self-registration disabled)
- ✅ Conditional product view (authenticated vs guest)
- ✅ Spec selectors for authenticated users (dimension, size, grit, packaging)
- ✅ Discounted price display with savings badge
- ✅ "Order Now" button creates quote with selected specs
- ✅ Guest users see locked specs and "Login to Order" button
- ✅ Quote items store selected specifications
- ✅ Discount applied recorded at order time
- ✅ Quotes linked to user accounts (userId field)

**Testing:**
- ✅ API tests for user discount routes
- ✅ API tests for quote order flow
- ✅ E2E tests for product ordering flow
- ✅ E2E tests for admin discount management

### Version 1.1.0

- ✅ Image cropping with zoom/position (react-easy-crop)
- ✅ Category image upload with drag-and-drop
- ✅ Inline brand creation in product form
- ✅ Auto-redirect after product creation
- ✅ Quick Specs (Dimensions, Sizes, Grits) with checkbox activation
- ✅ Elegant nav menu list view (replaces grid)
- ✅ Image reorganization to structured folders
- ✅ CMS API routes (hero slides, testimonials, partner logos)
- ✅ User management API routes
- ✅ Enhanced settings configuration

### Version 1.0.0

- ✅ Full e-commerce platform
- ✅ Admin dashboard
- ✅ Quote system
- ✅ Order management
- ✅ Customer management
- ✅ CMS features
- ✅ Image optimization system
- ✅ Comprehensive testing
- ✅ Production-ready

### Version 0.9.0 (Beta)
- Authentication system
- Product catalog
- Basic admin features
- Database schema
- Initial deployment

### Version 0.5.0 (Alpha)
- Project initialization
- Core architecture
- UI components
- Database design

---

**Document Version**: 1.3
**Last Updated**: March 6, 2026
**Maintained By**: Motico Solutions Development Team
