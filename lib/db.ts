/**
 * Prisma Client Singleton
 *
 * Ensures a single Prisma client instance across the application.
 * Prevents connection pool exhaustion during development with hot reloading.
 * Uses Prisma 7's driver adapter pattern for PostgreSQL.
 *
 * Supports Supabase (production) and local Docker PostgreSQL (development).
 * - Production: DATABASE_URL points to Supabase pgBouncer (port 6543) with SSL
 * - Development: DATABASE_URL points to local Docker PostgreSQL (no SSL)
 *
 * @module lib/db
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  const isProduction = process.env.NODE_ENV === 'production';

  // Create PostgreSQL connection pool
  // Production (Supabase): requires SSL
  // Development (Docker): no SSL needed
  const pool = globalForPrisma.pool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    ...(isProduction && {
      ssl: { rejectUnauthorized: false },
    }),
  });

  if (!isProduction) {
    globalForPrisma.pool = pool;
  }

  // Create Prisma adapter for pg
  const adapter = new PrismaPg(pool);

  // Create Prisma client with adapter
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
