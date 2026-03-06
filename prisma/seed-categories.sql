-- ═══════════════════════════════════════════════════════════════
-- Motico Solutions - Categories Seed Data
-- Run this script to populate the categories table
-- ═══════════════════════════════════════════════════════════════

-- Clear existing categories (development only)
TRUNCATE TABLE categories CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- TOP-LEVEL CATEGORIES
-- ═══════════════════════════════════════════════════════════════

INSERT INTO categories (id, name, slug, description, image, icon, color, "featuredBrand", "parentId", "sortOrder", "isActive", "productCount", "createdAt", "updatedAt")
VALUES
  ('cat-abrasive-belts', 'Abrasive Belts', 'abrasive-belts', 'Premium coated abrasive belts for metal, wood, and composite finishing. Available in various sizes, grits, and backing materials.', '/categories/abrasive-belts.jpg', 'Layers', '#bb0c15', 'Hermes', NULL, 1, true, 0, NOW(), NOW()),
  ('cat-grinding-wheels', 'Grinding & Cutting Discs', 'grinding-cutting-discs', 'Bonded abrasive wheels for grinding, cutting, and finishing operations. Includes depressed center wheels, cut-off wheels, and flap discs.', '/categories/grinding-wheels.jpg', 'Disc', '#004D8B', 'Sandwox', NULL, 2, true, 0, NOW(), NOW()),
  ('cat-grinding-sleeves', 'Grinding Sleeves & Drums', 'grinding-sleeves', 'Spiral wound abrasive sleeves and rubber drums for contour sanding and finishing curved surfaces.', '/categories/grinding-sleeves.jpg', 'Disc', '#bb0c15', 'Eisenblätter', NULL, 3, true, 0, NOW(), NOW()),
  ('cat-sanding-sheets', 'Sanding Sheets & Rolls', 'sanding-sheets', 'Coated abrasive sheets, rolls, and hand pads for manual sanding and finishing applications.', '/categories/sanding-sheets.jpg', 'Layers', '#004D8B', '3M', NULL, 4, true, 0, NOW(), NOW()),
  ('cat-flap-discs', 'Flap Discs & Wheels', 'flap-discs', 'Overlapping abrasive flaps for grinding, blending, and finishing. Ideal for weld removal and surface preparation.', '/categories/flap-discs.jpg', 'Disc', '#bb0c15', 'Sandwox', NULL, 5, true, 0, NOW(), NOW()),
  ('cat-air-power-tools', 'Air & Power Tools', 'air-power-tools', 'Professional pneumatic and electric power tools for grinding, sanding, polishing, and cutting operations.', '/categories/air-power-tools.jpg', 'Wrench', '#004D8B', 'DCA', NULL, 6, true, 0, NOW(), NOW()),
  ('cat-surface-finishing', 'Surface Finishing', 'surface-finishing', 'Non-woven abrasives, conditioning discs, and specialty finishing products for fine surface preparation.', '/categories/surface-finishing.jpg', 'Layers', '#bb0c15', '3M', NULL, 7, true, 0, NOW(), NOW()),
  ('cat-polishing', 'Polishing & Buffing', 'polishing-buffing', 'Polishing compounds, buffing wheels, and accessories for achieving mirror finishes on metal surfaces.', '/categories/polishing.jpg', 'ShieldCheck', '#004D8B', '3M', NULL, 8, true, 0, NOW(), NOW()),
  ('cat-safety', 'Safety Equipment', 'safety-equipment', 'Personal protective equipment (PPE) including safety glasses, gloves, respirators, and hearing protection.', '/categories/safety.jpg', 'Shield', '#bb0c15', NULL, NULL, 9, true, 0, NOW(), NOW()),
  ('cat-machines', 'Machines & Equipment', 'machines-equipment', 'Industrial grinding machines, belt sanders, bench grinders, and finishing equipment.', '/categories/machines.jpg', 'Package', '#004D8B', 'Hoffmann', NULL, 10, true, 0, NOW(), NOW()),
  ('cat-accessories', 'Accessories & Consumables', 'accessories', 'Backing pads, adapters, lubricants, and other consumables for abrasive applications.', '/categories/accessories.jpg', 'Settings', '#bb0c15', 'Osborn', NULL, 11, true, 0, NOW(), NOW()),
  ('cat-hand-tools', 'Hand Tools', 'hand-tools', 'Manual finishing tools including files, rasps, sanding blocks, and hand scrapers.', '/categories/hand-tools.jpg', 'Hammer', '#004D8B', NULL, NULL, 12, true, 0, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════════
-- SUBCATEGORIES - Abrasive Belts
-- ═══════════════════════════════════════════════════════════════

INSERT INTO categories (id, name, slug, description, image, icon, color, "featuredBrand", "parentId", "sortOrder", "isActive", "productCount", "createdAt", "updatedAt")
VALUES
  ('subcat-narrow-belts', 'Narrow Belts', 'narrow-belts', 'Narrow abrasive belts for file belt sanders and portable grinders.', NULL, NULL, NULL, NULL, 'cat-abrasive-belts', 1, true, 0, NOW(), NOW()),
  ('subcat-wide-belts', 'Wide Belts', 'wide-belts', 'Wide abrasive belts for stroke sanders and wide belt machines.', NULL, NULL, NULL, NULL, 'cat-abrasive-belts', 2, true, 0, NOW(), NOW()),
  ('subcat-centerless-belts', 'Centerless Grinding Belts', 'centerless-belts', 'Specialized belts for centerless grinding applications.', NULL, NULL, NULL, NULL, 'cat-abrasive-belts', 3, true, 0, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════════
-- SUBCATEGORIES - Air & Power Tools
-- ═══════════════════════════════════════════════════════════════

INSERT INTO categories (id, name, slug, description, image, icon, color, "featuredBrand", "parentId", "sortOrder", "isActive", "productCount", "createdAt", "updatedAt")
VALUES
  ('subcat-angle-grinders', 'Angle Grinders', 'angle-grinders', 'Electric and pneumatic angle grinders for grinding, cutting, and polishing.', NULL, NULL, NULL, NULL, 'cat-air-power-tools', 1, true, 0, NOW(), NOW()),
  ('subcat-die-grinders', 'Die Grinders', 'die-grinders', 'Precision die grinders for detail work and hard-to-reach areas.', NULL, NULL, NULL, NULL, 'cat-air-power-tools', 2, true, 0, NOW(), NOW()),
  ('subcat-sanders', 'Sanders', 'sanders', 'Belt sanders, orbital sanders, and finishing sanders.', NULL, NULL, NULL, NULL, 'cat-air-power-tools', 3, true, 0, NOW(), NOW()),
  ('subcat-polishers', 'Polishers', 'polishers', 'Rotary and dual-action polishers for surface finishing.', NULL, NULL, NULL, NULL, 'cat-air-power-tools', 4, true, 0, NOW(), NOW()),
  ('subcat-drills', 'Drills', 'drills', 'Impact drills, hammer drills, and rotary drills.', NULL, NULL, NULL, NULL, 'cat-air-power-tools', 5, true, 0, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════════
-- SUBCATEGORIES - Grinding Wheels
-- ═══════════════════════════════════════════════════════════════

INSERT INTO categories (id, name, slug, description, image, icon, color, "featuredBrand", "parentId", "sortOrder", "isActive", "productCount", "createdAt", "updatedAt")
VALUES
  ('subcat-cutting-discs', 'Cutting Discs', 'cutting-discs', 'Thin cut-off wheels for metal, stainless steel, and stone.', NULL, NULL, NULL, NULL, 'cat-grinding-wheels', 1, true, 0, NOW(), NOW()),
  ('subcat-grinding-discs', 'Grinding Discs', 'grinding-discs', 'Depressed center grinding wheels for stock removal.', NULL, NULL, NULL, NULL, 'cat-grinding-wheels', 2, true, 0, NOW(), NOW()),
  ('subcat-wire-wheels', 'Wire Wheels & Brushes', 'wire-wheels', 'Wire cup brushes and wheel brushes for rust and paint removal.', NULL, NULL, NULL, NULL, 'cat-grinding-wheels', 3, true, 0, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════════
-- Verify the data
-- ═══════════════════════════════════════════════════════════════

SELECT
  COUNT(*) as total_categories,
  COUNT(*) FILTER (WHERE "parentId" IS NULL) as top_level,
  COUNT(*) FILTER (WHERE "parentId" IS NOT NULL) as subcategories
FROM categories;

-- Show all categories
SELECT id, name, slug, "parentId", "sortOrder" FROM categories ORDER BY "parentId" NULLS FIRST, "sortOrder";
