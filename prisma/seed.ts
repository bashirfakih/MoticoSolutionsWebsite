/**
 * Database Seed Script
 *
 * Seeds the database with initial mock data.
 * Run with: npx prisma db seed
 *
 * @module prisma/seed
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter for pg
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // ═══════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════
  console.log('Creating users...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const customerPassword = await bcrypt.hash('customer123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@moticosolutions.com' },
    update: {},
    create: {
      email: 'admin@moticosolutions.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'admin',
      company: 'Motico Solutions',
      isActive: true,
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'john.smith@email.com' },
    update: {},
    create: {
      email: 'john.smith@email.com',
      passwordHash: customerPassword,
      name: 'John Smith',
      role: 'customer',
      company: 'Smith Industries',
      isActive: true,
    },
  });

  console.log(`  ✓ Created ${2} users`);

  // ═══════════════════════════════════════════════════════════════
  // BRANDS
  // ═══════════════════════════════════════════════════════════════
  console.log('Creating brands...');

  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'hermes' },
      update: {},
      create: {
        name: 'Hermes Abrasives',
        slug: 'hermes',
        description: 'Premium German-engineered abrasive solutions for industrial applications.',
        website: 'https://www.hermes-abrasives.com',
        countryOfOrigin: 'Germany',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'dca' },
      update: {},
      create: {
        name: 'DCA Power Tools',
        slug: 'dca',
        description: 'Professional-grade power tools for demanding industrial applications.',
        website: 'https://www.dcapowertools.com',
        countryOfOrigin: 'China',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'vsm' },
      update: {},
      create: {
        name: 'VSM Abrasives',
        slug: 'vsm',
        description: 'High-performance abrasive solutions from Germany.',
        website: 'https://www.vsm-abrasives.com',
        countryOfOrigin: 'Germany',
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'sia' },
      update: {},
      create: {
        name: 'SIA Abrasives',
        slug: 'sia',
        description: 'Swiss precision in abrasive technology.',
        website: 'https://www.sia-abrasives.com',
        countryOfOrigin: 'Switzerland',
        isActive: true,
        sortOrder: 4,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'klingspor' },
      update: {},
      create: {
        name: 'Klingspor',
        slug: 'klingspor',
        description: 'German manufacturer of coated and bonded abrasives.',
        website: 'https://www.klingspor.com',
        countryOfOrigin: 'Germany',
        isActive: true,
        sortOrder: 5,
      },
    }),
  ]);

  console.log(`  ✓ Created ${brands.length} brands`);

  // ═══════════════════════════════════════════════════════════════
  // CATEGORIES
  // ═══════════════════════════════════════════════════════════════
  console.log('Creating categories...');

  const abrasiveBelts = await prisma.category.upsert({
    where: { slug: 'abrasive-belts' },
    update: {},
    create: {
      name: 'Abrasive Belts',
      slug: 'abrasive-belts',
      description: 'High-quality sanding belts for various applications.',
      isActive: true,
      sortOrder: 1,
    },
  });

  const grindingSleeves = await prisma.category.upsert({
    where: { slug: 'grinding-sleeves' },
    update: {},
    create: {
      name: 'Grinding Sleeves',
      slug: 'grinding-sleeves',
      description: 'Precision grinding sleeves for cylindrical sanding.',
      isActive: true,
      sortOrder: 2,
    },
  });

  const airPowerTools = await prisma.category.upsert({
    where: { slug: 'air-power-tools' },
    update: {},
    create: {
      name: 'Air & Power Tools',
      slug: 'air-power-tools',
      description: 'Professional pneumatic and electric power tools.',
      isActive: true,
      sortOrder: 3,
    },
  });

  const flapDiscs = await prisma.category.upsert({
    where: { slug: 'flap-discs' },
    update: {},
    create: {
      name: 'Flap Discs',
      slug: 'flap-discs',
      description: 'Versatile abrasive discs for grinding and finishing.',
      isActive: true,
      sortOrder: 4,
    },
  });

  const sandingSheets = await prisma.category.upsert({
    where: { slug: 'sanding-sheets' },
    update: {},
    create: {
      name: 'Sanding Sheets',
      slug: 'sanding-sheets',
      description: 'Abrasive sheets for hand sanding and finishing.',
      isActive: true,
      sortOrder: 5,
    },
  });

  console.log(`  ✓ Created 5 categories`);

  // ═══════════════════════════════════════════════════════════════
  // PRODUCTS
  // ═══════════════════════════════════════════════════════════════
  console.log('Creating products...');

  const hermesBrand = brands.find(b => b.slug === 'hermes')!;
  const dcaBrand = brands.find(b => b.slug === 'dca')!;

  // Sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'HRM-BK-100-P80' },
      update: {},
      create: {
        sku: 'HRM-BK-100-P80',
        name: 'Hermes BK Sanding Belt 100x915mm P80',
        slug: 'hermes-bk-sanding-belt-100x915-p80',
        shortDescription: 'Premium aluminum oxide sanding belt for metal and wood.',
        description: 'The Hermes BK sanding belt features premium aluminum oxide grain for aggressive material removal on metal and wood surfaces. The X-weight cotton backing provides excellent flexibility and durability.',
        features: ['Aluminum oxide grain', 'X-weight cotton backing', 'For metal and wood', 'Long service life'],
        categoryId: abrasiveBelts.id,
        brandId: hermesBrand.id,
        hasVariants: true,
        price: 8.50,
        currency: 'USD',
        stockQuantity: 150,
        stockStatus: 'in_stock',
        minStockLevel: 20,
        isPublished: true,
        isFeatured: true,
        isNew: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'DCA-ASM04-125' },
      update: {},
      create: {
        sku: 'DCA-ASM04-125',
        name: 'DCA 125mm Angle Grinder ASM04-125',
        slug: 'dca-125mm-angle-grinder-asm04-125',
        shortDescription: '1400W professional angle grinder with safety features.',
        description: 'The DCA ASM04-125 is a powerful 1400W angle grinder designed for professional use. Features include soft start, anti-vibration handle, and dust-sealed switch for extended tool life.',
        features: ['1400W motor', 'Soft start', 'Anti-vibration handle', 'Dust-sealed switch', '11000 RPM'],
        categoryId: airPowerTools.id,
        brandId: dcaBrand.id,
        hasVariants: false,
        price: 89.00,
        currency: 'USD',
        stockQuantity: 45,
        stockStatus: 'in_stock',
        minStockLevel: 10,
        isPublished: true,
        isFeatured: true,
        isNew: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'HRM-GS-60-120' },
      update: {},
      create: {
        sku: 'HRM-GS-60-120',
        name: 'Hermes Grinding Sleeve 60x120mm',
        slug: 'hermes-grinding-sleeve-60x120',
        shortDescription: 'Spiral wound grinding sleeve for drum sanders.',
        description: 'Premium spiral wound grinding sleeve designed for use with drum sanders. Excellent for shaping and smoothing curved surfaces on wood and metal workpieces.',
        features: ['Spiral wound construction', 'Aluminum oxide grain', 'For drum sanders', 'Multiple grits available'],
        categoryId: grindingSleeves.id,
        brandId: hermesBrand.id,
        hasVariants: true,
        price: 12.00,
        currency: 'USD',
        stockQuantity: 80,
        stockStatus: 'in_stock',
        minStockLevel: 15,
        isPublished: true,
        isFeatured: false,
        isNew: false,
      },
    }),
  ]);

  // Add images for products
  for (const product of products) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `/products/${product.slug}.jpg`,
        alt: product.name,
        sortOrder: 0,
        isPrimary: true,
      },
    });
  }

  console.log(`  ✓ Created ${products.length} products`);

  // ═══════════════════════════════════════════════════════════════
  // CUSTOMERS
  // ═══════════════════════════════════════════════════════════════
  console.log('Creating customers...');

  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'hassan.khalil@industrialco.lb' },
      update: {},
      create: {
        email: 'hassan.khalil@industrialco.lb',
        name: 'Hassan Khalil',
        company: 'Industrial Solutions Co.',
        phone: '+961 1 234 567',
        address: 'Sin El Fil Industrial Zone',
        city: 'Beirut',
        country: 'Lebanon',
        status: 'active',
        isVerified: true,
        totalOrders: 15,
        totalSpent: 4500.00,
        tags: ['wholesale', 'vip'],
      },
    }),
    prisma.customer.upsert({
      where: { email: 'ahmed.said@fabrication.ae' },
      update: {},
      create: {
        email: 'ahmed.said@fabrication.ae',
        name: 'Ahmed Said',
        company: 'UAE Fabrication LLC',
        phone: '+971 4 567 8901',
        address: 'Industrial Area 2',
        city: 'Dubai',
        country: 'UAE',
        status: 'active',
        isVerified: true,
        totalOrders: 8,
        totalSpent: 2800.00,
        tags: ['international'],
      },
    }),
    prisma.customer.upsert({
      where: { email: 'maria.santos@metalworks.ng' },
      update: {},
      create: {
        email: 'maria.santos@metalworks.ng',
        name: 'Maria Santos',
        company: 'Lagos Metalworks',
        phone: '+234 1 234 5678',
        address: 'Victoria Island',
        city: 'Lagos',
        country: 'Nigeria',
        status: 'active',
        isVerified: false,
        totalOrders: 3,
        totalSpent: 950.00,
        tags: ['new'],
      },
    }),
  ]);

  console.log(`  ✓ Created ${customers.length} customers`);

  // ═══════════════════════════════════════════════════════════════
  // ORDERS
  // ═══════════════════════════════════════════════════════════════
  console.log('Creating orders...');

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-001',
      customerId: customers[0].id,
      customerName: customers[0].name,
      customerEmail: customers[0].email,
      customerPhone: customers[0].phone,
      itemCount: 2,
      subtotal: 255.00,
      shippingCost: 15.00,
      tax: 0,
      discount: 0,
      total: 270.00,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'bank_transfer',
      shippingAddress: {
        name: customers[0].name,
        company: customers[0].company,
        address: customers[0].address,
        city: customers[0].city,
        country: customers[0].country,
        phone: customers[0].phone,
      },
      paidAt: new Date('2026-02-15'),
      shippedAt: new Date('2026-02-17'),
      deliveredAt: new Date('2026-02-20'),
      items: {
        create: [
          {
            productId: products[0].id,
            productName: products[0].name,
            productSku: products[0].sku,
            quantity: 20,
            unitPrice: 8.50,
            totalPrice: 170.00,
          },
          {
            productId: products[1].id,
            productName: products[1].name,
            productSku: products[1].sku,
            quantity: 1,
            unitPrice: 85.00,
            totalPrice: 85.00,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-002',
      customerId: customers[1].id,
      customerName: customers[1].name,
      customerEmail: customers[1].email,
      customerPhone: customers[1].phone,
      itemCount: 1,
      subtotal: 356.00,
      shippingCost: 45.00,
      tax: 0,
      discount: 0,
      total: 401.00,
      status: 'processing',
      paymentStatus: 'paid',
      paymentMethod: 'credit_card',
      shippingAddress: {
        name: customers[1].name,
        company: customers[1].company,
        address: customers[1].address,
        city: customers[1].city,
        country: customers[1].country,
        phone: customers[1].phone,
      },
      paidAt: new Date('2026-02-25'),
      items: {
        create: [
          {
            productId: products[1].id,
            productName: products[1].name,
            productSku: products[1].sku,
            quantity: 4,
            unitPrice: 89.00,
            totalPrice: 356.00,
          },
        ],
      },
    },
  });

  console.log(`  ✓ Created 2 orders`);

  // ═══════════════════════════════════════════════════════════════
  // QUOTES
  // ═══════════════════════════════════════════════════════════════
  console.log('Creating quotes...');

  await prisma.quote.create({
    data: {
      quoteNumber: 'QUO-2026-001',
      customerId: customers[2].id,
      customerName: customers[2].name,
      customerEmail: customers[2].email,
      customerPhone: customers[2].phone,
      company: customers[2].company,
      status: 'pending',
      customerMessage: 'Looking for bulk pricing on abrasive belts for our production line.',
      items: {
        create: [
          {
            productName: 'Hermes BK Sanding Belt 100x915mm',
            sku: 'HRM-BK-100',
            quantity: 500,
            description: 'Assorted grits P60, P80, P120',
          },
        ],
      },
    },
  });

  console.log(`  ✓ Created 1 quote`);

  // ═══════════════════════════════════════════════════════════════
  // MESSAGES
  // ═══════════════════════════════════════════════════════════════
  console.log('Creating messages...');

  await prisma.message.createMany({
    data: [
      {
        name: 'Robert Chen',
        email: 'robert.chen@factory.com',
        phone: '+1 555 123 4567',
        company: 'Chen Manufacturing',
        subject: 'Bulk Order Inquiry',
        message: 'We are interested in placing a bulk order for abrasive belts. Can you provide pricing for quantities of 1000+ units?',
        type: 'inquiry',
        status: 'unread',
        isStarred: true,
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@techcorp.com',
        subject: 'Product Support Request',
        message: 'I need help selecting the right grit for stainless steel finishing. Can someone assist?',
        type: 'support',
        status: 'read',
        readAt: new Date(),
      },
      {
        name: 'Michael Brown',
        email: 'mbrown@workshop.net',
        subject: 'Feedback on Recent Order',
        message: 'Just wanted to say the quality of the products exceeded our expectations. Will definitely order again!',
        type: 'feedback',
        status: 'replied',
        replyMessage: 'Thank you for your kind feedback! We appreciate your business.',
        repliedAt: new Date(),
      },
    ],
  });

  console.log(`  ✓ Created 3 messages`);

  // ═══════════════════════════════════════════════════════════════
  // SITE SETTINGS
  // ═══════════════════════════════════════════════════════════════
  console.log('Creating site settings...');

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Motico Solutions',
      siteDescription: 'Premium Industrial Abrasives & Power Tools',
      contactEmail: 'info@moticosolutions.com',
      contactPhone: '+961 1 234 567',
      address: 'Sin El Fil Industrial Zone, Beirut, Lebanon',
      currency: 'USD',
      taxRate: 0,
      shippingFee: 15.00,
      freeShippingThreshold: 500.00,
      orderNotificationEmail: 'orders@moticosolutions.com',
      lowStockAlertThreshold: 10,
      enableEmailNotifications: true,
    },
  });

  console.log(`  ✓ Created site settings`);

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@moticosolutions.com / admin123');
  console.log('   Customer: john.smith@email.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
