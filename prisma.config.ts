// Prisma 7 configuration
// See: https://pris.ly/d/config-datasource
import "dotenv/config";
import { defineConfig } from "prisma/config";

// DIRECT_URL: direct connection (port 5432) — used by Prisma Migrate (bypasses pgBouncer)
// Falls back to DATABASE_URL for local dev where both point to the same server
const migrateUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://motico:motico_dev_pass@127.0.0.1:5433/motico_dev";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: migrateUrl,
  },
});
