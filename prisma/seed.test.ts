/**
 * Test Database Seed Script
 *
 * Seeds the database with minimal test data for E2E tests.
 * Run with: npm run db:seed:test
 *
 * @module prisma/seed.test
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Use DIRECT_URL (bypasses pgBouncer) for seed scripts, fall back to DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding test database...');

  const adminPassword = await bcrypt.hash('admin123', 4); // Low rounds for speed
  const customerPassword = await bcrypt.hash('customer123', 4);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@moticosolutions.com' },
    update: {},
    create: {
      email: 'admin@moticosolutions.com',
      passwordHash: adminPassword,
      name: 'Test Admin',
      role: 'admin',
      company: 'Motico Solutions',
      isActive: true,
    },
  });

  // Customer user
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      passwordHash: customerPassword,
      name: 'Test Customer',
      role: 'customer',
      company: 'Test Corp',
      isActive: true,
    },
  });

  console.log(`  Created ${2} users`);

  // Brand
  const brand = await prisma.brand.upsert({
    where: { slug: 'test-brand' },
    update: {},
    create: {
      name: 'Test Brand',
      slug: 'test-brand',
      description: 'A test brand for E2E tests.',
      isActive: true,
      sortOrder: 1,
    },
  });

  // Category
  const category = await prisma.category.upsert({
    where: { slug: 'test-category' },
    update: {},
    create: {
      name: 'Test Category',
      slug: 'test-category',
      description: 'A test category for E2E tests.',
      isActive: true,
      sortOrder: 1,
    },
  });

  console.log('  Created brand and category');

  // Product
  await prisma.product.upsert({
    where: { sku: 'TEST-001' },
    update: {},
    create: {
      sku: 'TEST-001',
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product for E2E tests.',
      categoryId: category.id,
      brandId: brand.id,
      price: 49.99,
      stockQuantity: 100,
      stockStatus: 'in_stock',
      isPublished: true,
    },
  });

  console.log('  Created test product');

  // Customer record
  await prisma.customer.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      name: 'Test Customer',
      email: 'customer@test.com',
      company: 'Test Corp',
      country: 'Lebanon',
      status: 'active',
    },
  });

  console.log('  Created test customer');

  // Site settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'Motico Solutions',
      companyDescription: 'Test Instance',
      companyEmail: 'test@moticosolutions.com',
      companyPhone: '+961 3 741 565',
      primaryColor: '#004D8B',
      secondaryColor: '#bb0c15',
      currency: 'USD',
      taxRate: 0,
      shippingFee: 0,
      freeShippingThreshold: 0,
      lowStockThreshold: 10,
    },
  });

  console.log('  Created site settings');
  console.log('Test seed complete.');
}

main()
  .catch((e) => {
    console.error('Test seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
