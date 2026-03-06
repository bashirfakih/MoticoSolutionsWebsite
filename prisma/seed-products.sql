-- ═══════════════════════════════════════════════════════════════
-- Motico Solutions - Brands & Products Seed Data
-- Run this script AFTER seed-categories.sql
-- ═══════════════════════════════════════════════════════════════

-- Clear existing data (development only)
TRUNCATE TABLE brands CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- BRANDS (using actual logo paths from public folder)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO brands (id, name, slug, logo, description, website, "countryOfOrigin", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('brand-hermes', 'Hermes Abrasives', 'hermes', '/logo-hermes.png', 'German manufacturer of premium coated abrasives. Known for high-quality abrasive belts, discs, and sheets used in metalworking, woodworking, and industrial finishing applications.', 'https://www.hermes-abrasives.com', 'Germany', true, 1, NOW(), NOW()),
  ('brand-vsm', 'VSM Abrasives', 'vsm', '/logo-sandwox.png', 'Leading global manufacturer of coated abrasives. VSM produces high-performance abrasive belts, discs, and specialty products for demanding industrial applications.', 'https://www.vsm-abrasives.com', 'Germany', true, 2, NOW(), NOW()),
  ('brand-dca', 'DCA Power Tools', 'dca', '/logo-dca.png', 'Professional-grade power tools for industrial use. DCA offers a comprehensive range of angle grinders, drills, sanders, and specialty tools designed for demanding applications.', 'https://www.dcatools.com', 'China', true, 3, NOW(), NOW()),
  ('brand-3m', '3M Abrasives', '3m', '/logo-3m.png', 'Global science company with innovative abrasive solutions. 3M offers Cubitron II, Trizact, and other advanced abrasive technologies for superior metal finishing.', 'https://www.3m.com/abrasives', 'USA', true, 4, NOW(), NOW()),
  ('brand-eisenblaetter', 'Eisenblätter', 'eisenblaetter', '/logo-eisenblaetter.png', 'German manufacturer of premium grinding sleeves, flap wheels, and surface conditioning products.', 'https://www.eisenblaetter.de', 'Germany', true, 5, NOW(), NOW()),
  ('brand-klingspor', 'Klingspor', 'klingspor', '/logo-sandwox.png', 'German abrasive manufacturer with over 125 years of experience. Klingspor offers cutting discs, grinding discs, flap discs, and coated abrasives.', 'https://www.klingspor.com', 'Germany', true, 6, NOW(), NOW()),
  ('brand-hoffmann', 'Hoffmann Group', 'hoffmann', '/logo-hoffmann.png', 'Leading European system partner for quality tools and equipment. Offers machines, grinding solutions, and workshop equipment.', 'https://www.hoffmann-group.com', 'Germany', true, 7, NOW(), NOW()),
  ('brand-osborn', 'Osborn', 'osborn', '/logo-osborn.png', 'Global manufacturer of industrial brushes, polishing tools, and surface finishing products.', 'https://www.osborn.com', 'USA', true, 8, NOW(), NOW()),
  ('brand-egeli', 'Egeli', 'egeli', '/logo-egeli.png', 'Manufacturer of high-quality abrasive products for metal finishing applications.', NULL, 'Turkey', true, 9, NOW(), NOW()),
  ('brand-zat', 'ZAT', 'zat', '/logo-zat.jpg', 'Industrial abrasives and finishing products manufacturer.', NULL, 'Germany', true, 10, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  logo = EXCLUDED.logo,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  "countryOfOrigin" = EXCLUDED."countryOfOrigin",
  "isActive" = EXCLUDED."isActive",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = NOW();

-- ═══════════════════════════════════════════════════════════════
-- PRODUCTS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO products (id, sku, name, slug, "shortDescription", description, features, "categoryId", "subcategoryId", "brandId", "hasVariants", price, "compareAtPrice", currency, "stockQuantity", "stockStatus", "minStockLevel", "trackInventory", "allowBackorder", "isPublished", "isFeatured", "isNew", "metaTitle", "metaDescription", "createdAt", "updatedAt", "publishedAt")
VALUES
  -- Product 1: Hermes Sanding Belt
  (
    'prod-001',
    'HRM-BK-100x915-P80',
    'Hermes BK Sanding Belt 100x915mm',
    'hermes-bk-sanding-belt-100x915',
    'Premium aluminum oxide sanding belt for metal and wood finishing.',
    E'The Hermes BK sanding belt is a versatile abrasive belt suitable for a wide range of applications. The aluminum oxide grain provides excellent cutting performance on steel, stainless steel, and wood.\n\nThe cloth backing offers flexibility and durability for both stationary and portable belt sanders.',
    ARRAY['Aluminum oxide grain', 'Flexible cloth backing', 'Suitable for metal and wood', 'Multiple grit options available', 'Long service life'],
    'cat-abrasive-belts',
    'subcat-narrow-belts',
    'brand-hermes',
    true,
    6.50,
    NULL,
    'USD',
    500,
    'in_stock',
    100,
    true,
    true,
    true,
    true,
    false,
    'Hermes BK Sanding Belt 100x915mm | Motico Solutions',
    'Premium Hermes BK sanding belts for metal and wood finishing. Available in multiple grits.',
    '2024-01-15T10:00:00.000Z',
    NOW(),
    '2024-01-16T08:00:00.000Z'
  ),

  -- Product 2: DCA 125mm Angle Grinder ASM04-125
  (
    'prod-002',
    'DCA-ASM04-125',
    'DCA 125mm Angle Grinder ASM04-125',
    'dca-125mm-angle-grinder-asm04-125',
    'Professional 1400W angle grinder with soft start and anti-vibration system.',
    E'The DCA ASM04-125 is a professional-grade 125mm angle grinder designed for heavy-duty grinding, cutting, and polishing operations. Features include soft start for smooth acceleration, anti-vibration handle, and tool-free guard adjustment.\n\nThe powerful 1400W motor delivers consistent performance even under load, while the ergonomic design reduces operator fatigue during extended use.',
    ARRAY['1400W high-performance motor', 'Soft start technology', 'Anti-vibration handle', 'Tool-free guard adjustment', 'Spindle lock for easy disc changes', 'Side handle for control', 'Overload protection'],
    'cat-air-power-tools',
    'subcat-angle-grinders',
    'brand-dca',
    false,
    89.00,
    105.00,
    'USD',
    35,
    'in_stock',
    10,
    true,
    true,
    true,
    true,
    true,
    'DCA 125mm Angle Grinder ASM04-125 | 1400W Professional | Motico Solutions',
    'DCA ASM04-125 professional angle grinder with 1400W motor, soft start, and anti-vibration.',
    '2024-02-01T09:00:00.000Z',
    NOW(),
    '2024-02-02T08:00:00.000Z'
  ),

  -- Product 3: Grinding Sleeve
  (
    'prod-003',
    'EIS-GSK-30x30',
    'Eisenblätter Grinding Sleeve 30x30mm',
    'eisenblaetter-grinding-sleeve-30x30',
    'Spiral wound abrasive sleeves for consistent contour grinding and finishing.',
    E'Eisenblätter spiral wound grinding sleeves provide excellent flexibility and conformability for grinding curved and contoured surfaces. The spiral construction ensures consistent cutting action and prevents edge marking.\n\nUse with rubber expanding drums for optimal performance.',
    ARRAY['Spiral wound construction', 'Flexible and conformable', 'Consistent cutting action', 'No edge marking', 'Use with rubber drums'],
    'cat-grinding-sleeves',
    NULL,
    'brand-eisenblaetter',
    true,
    2.20,
    NULL,
    'USD',
    155,
    'low_stock',
    50,
    true,
    false,
    true,
    false,
    false,
    NULL,
    NULL,
    '2024-01-20T11:00:00.000Z',
    NOW(),
    '2024-01-21T08:00:00.000Z'
  ),

  -- Product 4: DCA Impact Drill
  (
    'prod-004',
    'DCA-AZJ04-13',
    'DCA 13mm Impact Drill AZJ04-13',
    'dca-13mm-impact-drill-azj04-13',
    'Heavy-duty 710W impact drill with variable speed and reverse function.',
    E'The DCA AZJ04-13 impact drill delivers powerful performance for drilling into concrete, masonry, metal, and wood. Variable speed control provides precision for different materials.\n\nFeatures a 13mm keyless chuck for fast bit changes and a comfortable ergonomic grip.',
    ARRAY['710W powerful motor', '13mm keyless chuck', 'Variable speed trigger', 'Forward/reverse switch', 'Hammer/drill mode selector', 'Auxiliary handle included'],
    'cat-air-power-tools',
    'subcat-drills',
    'brand-dca',
    false,
    52.00,
    NULL,
    'USD',
    8,
    'low_stock',
    10,
    true,
    true,
    true,
    false,
    true,
    NULL,
    NULL,
    '2024-02-05T14:00:00.000Z',
    NOW(),
    '2024-02-06T08:00:00.000Z'
  ),

  -- Product 5: Flap Disc
  (
    'prod-005',
    'SWX-FD-125-ZK',
    'Sandwox Zirconia Flap Disc 125mm',
    'sandwox-zirconia-flap-disc-125mm',
    'High-performance zirconia flap disc for aggressive grinding and finishing.',
    E'Sandwox zirconia flap discs combine grinding and finishing in a single operation. The self-sharpening zirconia grain provides consistent cutting action throughout the disc life.\n\nIdeal for weld removal, deburring, blending, and surface preparation.',
    ARRAY['Zirconia alumina grain', 'Self-sharpening technology', 'Grinds and finishes in one step', 'Fiberglass backing plate', 'Type 29 conical design'],
    'cat-flap-discs',
    NULL,
    'brand-vsm',
    true,
    4.50,
    NULL,
    'USD',
    630,
    'in_stock',
    100,
    true,
    true,
    true,
    true,
    false,
    NULL,
    NULL,
    '2024-01-10T13:00:00.000Z',
    NOW(),
    '2024-01-11T08:00:00.000Z'
  ),

  -- Product 6: Cutting Disc
  (
    'prod-006',
    'KSP-CD-115',
    'Klingspor Cutting Disc 115mm x 1mm',
    'klingspor-cutting-disc-115mm',
    'Ultra-thin metal cutting disc for clean, burr-free cuts.',
    E'Klingspor 115mm x 1mm cutting discs deliver precision cuts with minimal material loss. The thin profile reduces cutting time and produces clean edges.\n\nSuitable for cutting steel, stainless steel, and non-ferrous metals.',
    ARRAY['1mm thickness for fast cutting', 'Clean, burr-free cuts', 'Minimal material loss', 'Reinforced with fiberglass mesh', 'For steel and stainless steel'],
    'cat-grinding-wheels',
    'subcat-cutting-discs',
    'brand-klingspor',
    false,
    1.20,
    NULL,
    'USD',
    0,
    'out_of_stock',
    500,
    true,
    false,
    true,
    false,
    false,
    NULL,
    NULL,
    '2024-01-08T10:00:00.000Z',
    NOW(),
    '2024-01-09T08:00:00.000Z'
  ),

  -- Product 7: 3M Trizact Belt (Draft)
  (
    'prod-007',
    '3M-CB2-TRIZACT',
    '3M Trizact Conditioning Belt',
    '3m-trizact-conditioning-belt',
    'Structured abrasive belt for consistent finishing on stainless steel.',
    E'3M Trizact belts feature precision-shaped mineral technology that delivers a consistent, predictable finish throughout the belt life.\n\nIdeal for high-value parts where consistency is critical.',
    ARRAY['Precision-shaped mineral', 'Consistent cut and finish', 'Self-replicating abrasive', 'Long belt life', 'For stainless and aluminum'],
    'cat-abrasive-belts',
    'subcat-narrow-belts',
    'brand-3m',
    false,
    45.00,
    NULL,
    'USD',
    25,
    'in_stock',
    10,
    true,
    true,
    false,
    false,
    true,
    NULL,
    NULL,
    '2024-02-20T16:00:00.000Z',
    NOW(),
    NULL
  ),

  -- Product 8: Band-It Power File
  (
    'prod-008',
    'EIS-BANDIT-1100',
    'Band-It 1100 Power File',
    'band-it-1100-power-file',
    'Compact electric power file for precision grinding in tight spaces.',
    E'The Band-It 1100 is a versatile power file designed for grinding, deburring, and finishing in hard-to-reach areas. Features variable speed control and ergonomic design.\n\nIdeal for weld seam finishing, edge rounding, and surface preparation.',
    ARRAY['Compact design for tight spaces', 'Variable speed control', 'Ergonomic grip', 'Quick belt change system', 'Low vibration'],
    'cat-air-power-tools',
    'subcat-sanders',
    'brand-eisenblaetter',
    false,
    450.00,
    NULL,
    'USD',
    12,
    'in_stock',
    5,
    true,
    true,
    true,
    true,
    true,
    'Band-It 1100 Power File | Eisenblätter | Motico Solutions',
    'Compact power file for precision grinding in tight spaces.',
    '2024-02-10T09:00:00.000Z',
    NOW(),
    '2024-02-11T08:00:00.000Z'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  "shortDescription" = EXCLUDED."shortDescription",
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  "categoryId" = EXCLUDED."categoryId",
  "subcategoryId" = EXCLUDED."subcategoryId",
  "brandId" = EXCLUDED."brandId",
  "hasVariants" = EXCLUDED."hasVariants",
  price = EXCLUDED.price,
  "compareAtPrice" = EXCLUDED."compareAtPrice",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "stockStatus" = EXCLUDED."stockStatus",
  "isPublished" = EXCLUDED."isPublished",
  "isFeatured" = EXCLUDED."isFeatured",
  "isNew" = EXCLUDED."isNew",
  "updatedAt" = NOW();

-- ═══════════════════════════════════════════════════════════════
-- PRODUCT IMAGES (using actual image paths from public folder)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO product_images (id, "productId", url, alt, "sortOrder", "isPrimary")
VALUES
  -- Product 1: Hermes Belt
  ('img-001-1', 'prod-001', '/products/hermes-bk-sanding-belt-100x915-p80.jpg', 'Hermes BK Sanding Belt', 1, true),
  -- Product 2: DCA Angle Grinder
  ('img-002-1', 'prod-002', '/dca-asm04-125_01.png', 'DCA 125mm Angle Grinder ASM04-125', 1, true),
  ('img-002-2', 'prod-002', '/dca-asm04-125_02.png', 'DCA Angle Grinder Side View', 2, false),
  -- Product 3: Grinding Sleeve
  ('img-003-1', 'prod-003', '/product-grinding-sleeve-wheels.png', 'Eisenblätter Grinding Sleeve', 1, true),
  -- Product 4: DCA Impact Drill
  ('img-004-1', 'prod-004', '/dca-asn100_01.jpg', 'DCA 13mm Impact Drill', 1, true),
  ('img-004-2', 'prod-004', '/dca-asn100_02.jpg', 'DCA Impact Drill Side View', 2, false),
  -- Product 5: Flap Disc
  ('img-005-1', 'prod-005', '/product-abrasive-discs.png', 'Sandwox Zirconia Flap Disc', 1, true),
  -- Product 6: Cutting Disc
  ('img-006-1', 'prod-006', '/product-cutting-discs.png', 'Klingspor Cutting Disc', 1, true),
  -- Product 7: 3M Trizact
  ('img-007-1', 'prod-007', '/product-abrasive-belts.png', '3M Trizact Conditioning Belt', 1, true),
  -- Product 8: Band-It Power File
  ('img-008-1', 'prod-008', '/band-it-1100-power-file_01.jpg', 'Band-It 1100 Power File', 1, true),
  ('img-008-2', 'prod-008', '/band-it-1100-power-file_02.jpg', 'Band-It Power File Detail', 2, false),
  ('img-008-3', 'prod-008', '/band-it-1100-power-file_03.jpg', 'Band-It Power File In Use', 3, false)
ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt,
  "sortOrder" = EXCLUDED."sortOrder",
  "isPrimary" = EXCLUDED."isPrimary";

-- ═══════════════════════════════════════════════════════════════
-- PRODUCT SPECIFICATIONS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO product_specifications (id, "productId", key, label, value, unit, "group")
VALUES
  -- Product 1 specs
  ('spec-001-1', 'prod-001', 'grain', 'Grain Type', 'Aluminum Oxide', NULL, 'Material'),
  ('spec-001-2', 'prod-001', 'backing', 'Backing', 'Cloth', NULL, 'Material'),
  ('spec-001-3', 'prod-001', 'size', 'Size', '100x915', 'mm', 'Dimensions'),
  ('spec-001-4', 'prod-001', 'grit', 'Grit', 'P80', NULL, 'Options'),
  -- Product 2 specs
  ('spec-002-1', 'prod-002', 'power', 'Power', '1400', 'W', 'Performance'),
  ('spec-002-2', 'prod-002', 'disc_diameter', 'Disc Diameter', '125', 'mm', 'Dimensions'),
  ('spec-002-3', 'prod-002', 'no_load_speed', 'No Load Speed', '11000', 'RPM', 'Performance'),
  ('spec-002-4', 'prod-002', 'spindle_thread', 'Spindle Thread', 'M14', NULL, 'Specifications'),
  ('spec-002-5', 'prod-002', 'weight', 'Weight', '2.4', 'kg', 'Dimensions'),
  ('spec-002-6', 'prod-002', 'voltage', 'Voltage', '220-240', 'V', 'Electrical'),
  -- Product 3 specs
  ('spec-003-1', 'prod-003', 'construction', 'Construction', 'Spiral wound', NULL, 'Design'),
  ('spec-003-2', 'prod-003', 'grain', 'Grain Type', 'Aluminum Oxide', NULL, 'Material'),
  ('spec-003-3', 'prod-003', 'diameter', 'Diameter', '30', 'mm', 'Dimensions'),
  ('spec-003-4', 'prod-003', 'length', 'Length', '30', 'mm', 'Dimensions'),
  -- Product 4 specs
  ('spec-004-1', 'prod-004', 'power', 'Power', '710', 'W', 'Performance'),
  ('spec-004-2', 'prod-004', 'chuck_capacity', 'Chuck Capacity', '13', 'mm', 'Specifications'),
  ('spec-004-3', 'prod-004', 'no_load_speed', 'No Load Speed', '0-2800', 'RPM', 'Performance'),
  ('spec-004-4', 'prod-004', 'weight', 'Weight', '1.9', 'kg', 'Dimensions'),
  -- Product 5 specs
  ('spec-005-1', 'prod-005', 'grain', 'Grain Type', 'Zirconia Alumina', NULL, 'Material'),
  ('spec-005-2', 'prod-005', 'diameter', 'Diameter', '125', 'mm', 'Dimensions'),
  ('spec-005-3', 'prod-005', 'arbor', 'Arbor Hole', '22.23', 'mm', 'Dimensions'),
  ('spec-005-4', 'prod-005', 'max_rpm', 'Max RPM', '12200', NULL, 'Performance'),
  -- Product 6 specs
  ('spec-006-1', 'prod-006', 'diameter', 'Diameter', '115', 'mm', 'Dimensions'),
  ('spec-006-2', 'prod-006', 'thickness', 'Thickness', '1', 'mm', 'Dimensions'),
  ('spec-006-3', 'prod-006', 'arbor', 'Arbor Hole', '22.23', 'mm', 'Dimensions'),
  ('spec-006-4', 'prod-006', 'max_rpm', 'Max RPM', '13300', NULL, 'Performance'),
  -- Product 7 specs
  ('spec-007-1', 'prod-007', 'technology', 'Technology', 'Precision Shaped Grain', NULL, 'Design'),
  ('spec-007-2', 'prod-007', 'backing', 'Backing', 'Polyester', NULL, 'Material'),
  -- Product 8 specs
  ('spec-008-1', 'prod-008', 'power', 'Power', '1100', 'W', 'Performance'),
  ('spec-008-2', 'prod-008', 'belt_size', 'Belt Size', '13x457', 'mm', 'Dimensions'),
  ('spec-008-3', 'prod-008', 'speed', 'Belt Speed', '8-19', 'm/s', 'Performance'),
  ('spec-008-4', 'prod-008', 'weight', 'Weight', '1.8', 'kg', 'Dimensions')
ON CONFLICT (id) DO UPDATE SET
  key = EXCLUDED.key,
  label = EXCLUDED.label,
  value = EXCLUDED.value,
  unit = EXCLUDED.unit,
  "group" = EXCLUDED."group";

-- ═══════════════════════════════════════════════════════════════
-- PRODUCT VARIANTS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO product_variants (id, "productId", sku, name, price, "stockQuantity", attributes, "isActive")
VALUES
  -- Product 1 variants (Hermes Belt grits)
  ('var-001-1', 'prod-001', 'HRM-BK-100x915-P40', 'Grit P40', 6.50, 150, '{"size": "100x915mm", "grit": "P40"}', true),
  ('var-001-2', 'prod-001', 'HRM-BK-100x915-P60', 'Grit P60', 6.50, 200, '{"size": "100x915mm", "grit": "P60"}', true),
  ('var-001-3', 'prod-001', 'HRM-BK-100x915-P80', 'Grit P80', 6.50, 180, '{"size": "100x915mm", "grit": "P80"}', true),
  ('var-001-4', 'prod-001', 'HRM-BK-100x915-P120', 'Grit P120', 6.50, 100, '{"size": "100x915mm", "grit": "P120"}', true),
  -- Product 3 variants (Grinding Sleeve sizes)
  ('var-003-1', 'prod-003', 'EIS-GSK-30x30-60', '30x30mm Grit 60', 2.20, 80, '{"diameter": "30mm", "length": "30mm", "grit": "60"}', true),
  ('var-003-2', 'prod-003', 'EIS-GSK-30x30-80', '30x30mm Grit 80', 2.20, 15, '{"diameter": "30mm", "length": "30mm", "grit": "80"}', true),
  ('var-003-3', 'prod-003', 'EIS-GSK-45x30-60', '45x30mm Grit 60', 2.80, 60, '{"diameter": "45mm", "length": "30mm", "grit": "60"}', true),
  -- Product 5 variants (Flap Disc grits)
  ('var-005-1', 'prod-005', 'SWX-FD-125-ZK-40', 'Grit 40', 4.50, 200, '{"grit": "40"}', true),
  ('var-005-2', 'prod-005', 'SWX-FD-125-ZK-60', 'Grit 60', 4.50, 280, '{"grit": "60"}', true),
  ('var-005-3', 'prod-005', 'SWX-FD-125-ZK-80', 'Grit 80', 4.50, 150, '{"grit": "80"}', true)
ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  "stockQuantity" = EXCLUDED."stockQuantity",
  attributes = EXCLUDED.attributes,
  "isActive" = EXCLUDED."isActive";

-- ═══════════════════════════════════════════════════════════════
-- UPDATE CATEGORY PRODUCT COUNTS
-- ═══════════════════════════════════════════════════════════════

UPDATE categories c SET "productCount" = (
  SELECT COUNT(*) FROM products p
  WHERE p."categoryId" = c.id AND p."isPublished" = true
);

-- ═══════════════════════════════════════════════════════════════
-- Verify the data
-- ═══════════════════════════════════════════════════════════════

SELECT 'Brands' as entity, COUNT(*) as count FROM brands
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Product Images', COUNT(*) FROM product_images
UNION ALL
SELECT 'Product Specifications', COUNT(*) FROM product_specifications
UNION ALL
SELECT 'Product Variants', COUNT(*) FROM product_variants;

-- Show products with their categories and brands
SELECT
  p.name as product,
  c.name as category,
  b.name as brand,
  p."stockStatus",
  p."isPublished"
FROM products p
JOIN categories c ON p."categoryId" = c.id
JOIN brands b ON p."brandId" = b.id
ORDER BY p."createdAt";
