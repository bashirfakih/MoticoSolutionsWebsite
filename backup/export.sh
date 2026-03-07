#!/usr/bin/env bash
# =============================================================================
# Export data from local Docker PostgreSQL
# =============================================================================
# Usage: bash backup/export.sh
#
# Exports data-only SQL dump from the local Docker container (motico_postgres).
# Schema is NOT included — it will be applied via Prisma migrations on Supabase.
# =============================================================================

set -euo pipefail

CONTAINER="motico_postgres"
DB_USER="motico"
DB_NAME="motico_dev"
DUMP_FILE="./backup/motico_data.sql"

echo "=== Motico Data Export ==="
echo ""

# Check Docker container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "ERROR: Docker container '${CONTAINER}' is not running."
  echo "Start it with: docker-compose up -d"
  exit 1
fi

echo "1. Exporting data from Docker PostgreSQL..."
docker exec -t "$CONTAINER" pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --data-only \
  --no-owner \
  --no-privileges \
  --disable-triggers \
  -f /tmp/motico_data.sql

# Copy from container to host
docker cp "${CONTAINER}:/tmp/motico_data.sql" "$DUMP_FILE"

echo "2. Verifying dump file..."
if [ ! -s "$DUMP_FILE" ]; then
  echo "ERROR: Dump file is empty or missing."
  exit 1
fi

LINES=$(wc -l < "$DUMP_FILE")
SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "   File: $DUMP_FILE"
echo "   Lines: $LINES"
echo "   Size: $SIZE"

echo ""
echo "3. Row counts in source database:"
docker exec -t "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
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
echo "Export complete. Next step:"
echo "  bash backup/import.sh"
