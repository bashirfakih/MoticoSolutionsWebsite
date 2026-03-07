#!/usr/bin/env bash
# =============================================================================
# Import data to Supabase PostgreSQL
# =============================================================================
# Usage: DIRECT_URL="postgresql://..." bash backup/import.sh
#
# Prerequisites:
#   1. Supabase project created
#   2. Migrations already applied: DATABASE_URL=$DIRECT_URL npx prisma migrate deploy
#   3. Export completed: bash backup/export.sh
# =============================================================================

set -euo pipefail

DUMP_FILE="./backup/motico_data.sql"

echo "=== Motico Data Import to Supabase ==="
echo ""

# Check DIRECT_URL is set
if [ -z "${DIRECT_URL:-}" ]; then
  echo "ERROR: DIRECT_URL environment variable is not set."
  echo ""
  echo "Usage:"
  echo "  DIRECT_URL=\"postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres\" bash backup/import.sh"
  exit 1
fi

# Check dump file exists
if [ ! -s "$DUMP_FILE" ]; then
  echo "ERROR: Dump file not found or empty: $DUMP_FILE"
  echo "Run export first: bash backup/export.sh"
  exit 1
fi

echo "1. Importing data to Supabase..."
psql "$DIRECT_URL" -f "$DUMP_FILE"

echo ""
echo "2. Verifying row counts in Supabase:"
psql "$DIRECT_URL" -c "
  SELECT
    (SELECT COUNT(*) FROM \"users\") as users,
    (SELECT COUNT(*) FROM \"products\") as products,
    (SELECT COUNT(*) FROM \"categories\") as categories,
    (SELECT COUNT(*) FROM \"brands\") as brands,
    (SELECT COUNT(*) FROM \"customers\") as customers,
    (SELECT COUNT(*) FROM \"orders\") as orders,
    (SELECT COUNT(*) FROM \"quotes\") as quotes,
    (SELECT COUNT(*) FROM \"messages\") as messages,
    (SELECT COUNT(*) FROM \"hero_slides\") as hero_slides,
    (SELECT COUNT(*) FROM \"testimonials\") as testimonials,
    (SELECT COUNT(*) FROM \"partner_logos\") as partner_logos,
    (SELECT COUNT(*) FROM \"site_settings\") as site_settings;
"

echo ""
echo "Import complete. Compare row counts above with export output."
echo ""
echo "Next steps:"
echo "  1. Verify app works: DATABASE_URL=<supabase_pooler_url> npm run dev"
echo "  2. Run tests:        DATABASE_URL=<supabase_pooler_url> DIRECT_URL=<supabase_direct_url> npm test"
