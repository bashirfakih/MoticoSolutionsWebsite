/**
 * Mock Products Data for Motico Solutions
 *
 * Sample products with inventory tracking, variants, and specifications.
 * Based on real product catalog from the existing website.
 *
 * @module lib/data/mockProducts
 */

import { Product, STOCK_STATUS, CURRENCY } from './types';

export const MOCK_PRODUCTS: Product[] = [
  // ═══════════════════════════════════════════════════════════════
  // HERMES ABRASIVE BELTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'prod-001',
    sku: 'HRM-RB346-100x915',
    name: 'Hermes RB 346 MX Abrasive Belt',
    slug: 'hermes-rb-346-mx-abrasive-belt',
    shortDescription: 'Premium ceramic grain abrasive belt for heavy stock removal on stainless steel and exotic alloys.',
    description: `The Hermes RB 346 MX is a high-performance abrasive belt featuring ceramic grain technology for aggressive stock removal and extended belt life. Ideal for grinding stainless steel, Inconel, titanium, and other difficult-to-grind materials.

The polyester backing provides excellent tear resistance and flexibility, making it suitable for both heavy grinding and finishing operations. The active grinding aid reduces heat buildup and prevents loading.`,
    features: [
      'Ceramic grain for aggressive cutting action',
      'Polyester cloth backing (X-weight)',
      'Self-sharpening grain technology',
      'Cool cutting with reduced heat buildup',
      'Ideal for stainless steel and exotic alloys',
      'Long service life',
    ],
    categoryId: 'cat-abrasive-belts',
    subcategoryId: 'subcat-narrow-belts',
    brandId: 'brand-hermes',
    images: [
      {
        id: 'img-001-1',
        url: '/products/hermes-rb346-belt-1.jpg',
        alt: 'Hermes RB 346 MX Abrasive Belt',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-001-2',
        url: '/products/hermes-rb346-belt-2.jpg',
        alt: 'Hermes RB 346 MX Belt Close-up',
        sortOrder: 2,
        isPrimary: false,
      },
    ],
    specifications: [
      { key: 'grain', label: 'Grain Type', value: 'Ceramic', group: 'Material' },
      { key: 'backing', label: 'Backing', value: 'Polyester X-weight', group: 'Material' },
      { key: 'coating', label: 'Coating', value: 'Closed coat', group: 'Material' },
      { key: 'grit_range', label: 'Available Grits', value: '24-120', group: 'Options' },
      { key: 'max_speed', label: 'Max Speed', value: '35 m/s', group: 'Performance' },
    ],
    variants: [
      { id: 'var-001-1', sku: 'HRM-RB346-100x915-36', name: 'Grit 36', price: 8.50, stockQuantity: 250, attributes: { size: '100x915mm', grit: '36' }, isActive: true },
      { id: 'var-001-2', sku: 'HRM-RB346-100x915-60', name: 'Grit 60', price: 8.50, stockQuantity: 320, attributes: { size: '100x915mm', grit: '60' }, isActive: true },
      { id: 'var-001-3', sku: 'HRM-RB346-100x915-80', name: 'Grit 80', price: 8.50, stockQuantity: 180, attributes: { size: '100x915mm', grit: '80' }, isActive: true },
      { id: 'var-001-4', sku: 'HRM-RB346-100x915-120', name: 'Grit 120', price: 8.50, stockQuantity: 45, attributes: { size: '100x915mm', grit: '120' }, isActive: true },
    ],
    hasVariants: true,
    price: 8.50,
    compareAtPrice: null,
    currency: CURRENCY.USD,
    stockQuantity: 795,
    stockStatus: STOCK_STATUS.IN_STOCK,
    minStockLevel: 100,
    trackInventory: true,
    allowBackorder: true,
    isPublished: true,
    isFeatured: true,
    isNew: false,
    metaTitle: 'Hermes RB 346 MX Abrasive Belt | Ceramic Grain | Motico Solutions',
    metaDescription: 'Premium Hermes RB 346 MX ceramic abrasive belts for stainless steel grinding. Available in multiple grits. Fast shipping to Lebanon & Middle East.',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-02-20T14:30:00.000Z',
    publishedAt: '2024-01-16T08:00:00.000Z',
  },

  {
    id: 'prod-002',
    sku: 'HRM-RB515-50x2000',
    name: 'Hermes RB 515 YX Zirconia Belt',
    slug: 'hermes-rb-515-yx-zirconia-belt',
    shortDescription: 'Heavy-duty zirconia belt for high-pressure grinding on steel and stainless steel.',
    description: `The Hermes RB 515 YX is a robust zirconia alumina abrasive belt designed for demanding stock removal applications. The Y-weight polyester backing provides maximum strength and tear resistance for high-pressure operations.

Perfect for weld grinding, deburring, and surface preparation on carbon steel and stainless steel components.`,
    features: [
      'Zirconia alumina grain for durability',
      'Y-weight polyester backing',
      'Excellent tear resistance',
      'High pressure grinding capability',
      'Ideal for weld removal',
    ],
    categoryId: 'cat-abrasive-belts',
    subcategoryId: 'subcat-narrow-belts',
    brandId: 'brand-hermes',
    images: [
      {
        id: 'img-002-1',
        url: '/products/hermes-rb515-belt.jpg',
        alt: 'Hermes RB 515 YX Zirconia Belt',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    specifications: [
      { key: 'grain', label: 'Grain Type', value: 'Zirconia Alumina', group: 'Material' },
      { key: 'backing', label: 'Backing', value: 'Polyester Y-weight', group: 'Material' },
      { key: 'coating', label: 'Coating', value: 'Closed coat', group: 'Material' },
      { key: 'grit_range', label: 'Available Grits', value: '24-120', group: 'Options' },
    ],
    variants: [],
    hasVariants: false,
    price: 6.75,
    compareAtPrice: 7.50,
    currency: CURRENCY.USD,
    stockQuantity: 520,
    stockStatus: STOCK_STATUS.IN_STOCK,
    minStockLevel: 100,
    trackInventory: true,
    allowBackorder: true,
    isPublished: true,
    isFeatured: false,
    isNew: false,
    metaTitle: null,
    metaDescription: null,
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-02-18T09:15:00.000Z',
    publishedAt: '2024-01-16T08:00:00.000Z',
  },

  // ═══════════════════════════════════════════════════════════════
  // GRINDING SLEEVES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'prod-003',
    sku: 'HRM-GSK-30x30',
    name: 'Hermes Spiral Grinding Sleeve',
    slug: 'hermes-spiral-grinding-sleeve',
    shortDescription: 'Spiral wound abrasive sleeves for consistent contour grinding and finishing.',
    description: `Hermes spiral wound grinding sleeves provide excellent flexibility and conformability for grinding curved and contoured surfaces. The spiral construction ensures consistent cutting action and prevents edge marking.

Use with rubber expanding drums for optimal performance. Available in various diameters and lengths to fit standard sleeve holders.`,
    features: [
      'Spiral wound construction',
      'Flexible and conformable',
      'Consistent cutting action',
      'No edge marking',
      'Use with rubber drums',
    ],
    categoryId: 'cat-grinding-sleeves',
    subcategoryId: null,
    brandId: 'brand-hermes',
    images: [
      {
        id: 'img-003-1',
        url: '/products/hermes-grinding-sleeve.jpg',
        alt: 'Hermes Spiral Grinding Sleeve',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    specifications: [
      { key: 'construction', label: 'Construction', value: 'Spiral wound', group: 'Design' },
      { key: 'grain', label: 'Grain Type', value: 'Aluminum Oxide', group: 'Material' },
      { key: 'backing', label: 'Backing', value: 'Cloth', group: 'Material' },
    ],
    variants: [
      { id: 'var-003-1', sku: 'HRM-GSK-30x30-60', name: '30x30mm Grit 60', price: 2.20, stockQuantity: 80, attributes: { diameter: '30mm', length: '30mm', grit: '60' }, isActive: true },
      { id: 'var-003-2', sku: 'HRM-GSK-30x30-80', name: '30x30mm Grit 80', price: 2.20, stockQuantity: 15, attributes: { diameter: '30mm', length: '30mm', grit: '80' }, isActive: true },
      { id: 'var-003-3', sku: 'HRM-GSK-45x30-60', name: '45x30mm Grit 60', price: 2.80, stockQuantity: 60, attributes: { diameter: '45mm', length: '30mm', grit: '60' }, isActive: true },
      { id: 'var-003-4', sku: 'HRM-GSK-60x30-60', name: '60x30mm Grit 60', price: 3.50, stockQuantity: 0, attributes: { diameter: '60mm', length: '30mm', grit: '60' }, isActive: true },
    ],
    hasVariants: true,
    price: 2.20,
    compareAtPrice: null,
    currency: CURRENCY.USD,
    stockQuantity: 155,
    stockStatus: STOCK_STATUS.LOW_STOCK,
    minStockLevel: 50,
    trackInventory: true,
    allowBackorder: false,
    isPublished: true,
    isFeatured: false,
    isNew: false,
    metaTitle: null,
    metaDescription: null,
    createdAt: '2024-01-20T11:00:00.000Z',
    updatedAt: '2024-02-25T16:45:00.000Z',
    publishedAt: '2024-01-21T08:00:00.000Z',
  },

  // ═══════════════════════════════════════════════════════════════
  // DCA POWER TOOLS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'prod-004',
    sku: 'DCA-ASM04-125',
    name: 'DCA 125mm Angle Grinder ASM04-125',
    slug: 'dca-125mm-angle-grinder-asm04-125',
    shortDescription: 'Professional 1400W angle grinder with soft start and anti-vibration system.',
    description: `The DCA ASM04-125 is a professional-grade 125mm angle grinder designed for heavy-duty grinding, cutting, and polishing operations. Features include soft start for smooth acceleration, anti-vibration handle, and tool-free guard adjustment.

The powerful 1400W motor delivers consistent performance even under load, while the ergonomic design reduces operator fatigue during extended use.`,
    features: [
      '1400W high-performance motor',
      'Soft start technology',
      'Anti-vibration handle',
      'Tool-free guard adjustment',
      'Spindle lock for easy disc changes',
      'Side handle for control',
      'Overload protection',
    ],
    categoryId: 'cat-air-power-tools',
    subcategoryId: 'subcat-angle-grinders',
    brandId: 'brand-dca',
    images: [
      {
        id: 'img-004-1',
        url: '/dca-asm04-125_01.png',
        alt: 'DCA 125mm Angle Grinder ASM04-125',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-004-2',
        url: '/dca-asm04-125_02.png',
        alt: 'DCA Angle Grinder Side View',
        sortOrder: 2,
        isPrimary: false,
      },
    ],
    specifications: [
      { key: 'power', label: 'Power', value: '1400', unit: 'W', group: 'Performance' },
      { key: 'disc_diameter', label: 'Disc Diameter', value: '125', unit: 'mm', group: 'Dimensions' },
      { key: 'no_load_speed', label: 'No Load Speed', value: '11000', unit: 'RPM', group: 'Performance' },
      { key: 'spindle_thread', label: 'Spindle Thread', value: 'M14', group: 'Specifications' },
      { key: 'weight', label: 'Weight', value: '2.4', unit: 'kg', group: 'Dimensions' },
      { key: 'voltage', label: 'Voltage', value: '220-240', unit: 'V', group: 'Electrical' },
    ],
    variants: [],
    hasVariants: false,
    price: 89.00,
    compareAtPrice: 105.00,
    currency: CURRENCY.USD,
    stockQuantity: 35,
    stockStatus: STOCK_STATUS.IN_STOCK,
    minStockLevel: 10,
    trackInventory: true,
    allowBackorder: true,
    isPublished: true,
    isFeatured: true,
    isNew: true,
    metaTitle: 'DCA 125mm Angle Grinder ASM04-125 | 1400W Professional | Motico Solutions',
    metaDescription: 'DCA ASM04-125 professional angle grinder with 1400W motor, soft start, and anti-vibration. Buy online from Motico Solutions Lebanon.',
    createdAt: '2024-02-01T09:00:00.000Z',
    updatedAt: '2024-02-26T10:00:00.000Z',
    publishedAt: '2024-02-02T08:00:00.000Z',
  },

  {
    id: 'prod-005',
    sku: 'DCA-AZJ04-13',
    name: 'DCA 13mm Impact Drill AZJ04-13',
    slug: 'dca-13mm-impact-drill-azj04-13',
    shortDescription: 'Heavy-duty 710W impact drill with variable speed and reverse function.',
    description: `The DCA AZJ04-13 impact drill delivers powerful performance for drilling into concrete, masonry, metal, and wood. Variable speed control provides precision for different materials, while the hammer action makes quick work of masonry applications.

Features a 13mm keyless chuck for fast bit changes and a comfortable ergonomic grip for extended use.`,
    features: [
      '710W powerful motor',
      '13mm keyless chuck',
      'Variable speed trigger',
      'Forward/reverse switch',
      'Hammer/drill mode selector',
      'Auxiliary handle included',
      'Depth gauge rod',
    ],
    categoryId: 'cat-air-power-tools',
    subcategoryId: 'subcat-drills',
    brandId: 'brand-dca',
    images: [
      {
        id: 'img-005-1',
        url: '/products/dca-impact-drill.jpg',
        alt: 'DCA 13mm Impact Drill',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    specifications: [
      { key: 'power', label: 'Power', value: '710', unit: 'W', group: 'Performance' },
      { key: 'chuck_capacity', label: 'Chuck Capacity', value: '13', unit: 'mm', group: 'Specifications' },
      { key: 'no_load_speed', label: 'No Load Speed', value: '0-2800', unit: 'RPM', group: 'Performance' },
      { key: 'impact_rate', label: 'Impact Rate', value: '0-44800', unit: 'BPM', group: 'Performance' },
      { key: 'weight', label: 'Weight', value: '1.9', unit: 'kg', group: 'Dimensions' },
    ],
    variants: [],
    hasVariants: false,
    price: 52.00,
    compareAtPrice: null,
    currency: CURRENCY.USD,
    stockQuantity: 8,
    stockStatus: STOCK_STATUS.LOW_STOCK,
    minStockLevel: 10,
    trackInventory: true,
    allowBackorder: true,
    isPublished: true,
    isFeatured: false,
    isNew: true,
    metaTitle: null,
    metaDescription: null,
    createdAt: '2024-02-05T14:00:00.000Z',
    updatedAt: '2024-02-26T11:30:00.000Z',
    publishedAt: '2024-02-06T08:00:00.000Z',
  },

  // ═══════════════════════════════════════════════════════════════
  // FLAP DISCS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'prod-006',
    sku: 'VSM-FD-125-ZK',
    name: 'VSM Zirconia Flap Disc 125mm',
    slug: 'vsm-zirconia-flap-disc-125mm',
    shortDescription: 'High-performance zirconia flap disc for aggressive grinding and finishing in one step.',
    description: `VSM zirconia flap discs combine grinding and finishing in a single operation. The self-sharpening zirconia grain provides consistent cutting action throughout the disc life, while the overlapping flaps create a smooth finish.

Ideal for weld removal, deburring, blending, and surface preparation on steel and stainless steel.`,
    features: [
      'Zirconia alumina grain',
      'Self-sharpening technology',
      'Grinds and finishes in one step',
      'Fiberglass backing plate',
      'Type 29 conical design',
      'Cool cutting action',
    ],
    categoryId: 'cat-flap-discs',
    subcategoryId: null,
    brandId: 'brand-vsm',
    images: [
      {
        id: 'img-006-1',
        url: '/products/vsm-flap-disc.jpg',
        alt: 'VSM Zirconia Flap Disc',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    specifications: [
      { key: 'grain', label: 'Grain Type', value: 'Zirconia Alumina', group: 'Material' },
      { key: 'diameter', label: 'Diameter', value: '125', unit: 'mm', group: 'Dimensions' },
      { key: 'arbor', label: 'Arbor Hole', value: '22.23', unit: 'mm', group: 'Dimensions' },
      { key: 'type', label: 'Type', value: 'Type 29 (Conical)', group: 'Design' },
      { key: 'max_rpm', label: 'Max RPM', value: '12200', group: 'Performance' },
    ],
    variants: [
      { id: 'var-006-1', sku: 'VSM-FD-125-ZK-40', name: 'Grit 40', price: 4.50, stockQuantity: 200, attributes: { grit: '40' }, isActive: true },
      { id: 'var-006-2', sku: 'VSM-FD-125-ZK-60', name: 'Grit 60', price: 4.50, stockQuantity: 280, attributes: { grit: '60' }, isActive: true },
      { id: 'var-006-3', sku: 'VSM-FD-125-ZK-80', name: 'Grit 80', price: 4.50, stockQuantity: 150, attributes: { grit: '80' }, isActive: true },
      { id: 'var-006-4', sku: 'VSM-FD-125-ZK-120', name: 'Grit 120', price: 4.50, stockQuantity: 0, attributes: { grit: '120' }, isActive: true },
    ],
    hasVariants: true,
    price: 4.50,
    compareAtPrice: null,
    currency: CURRENCY.USD,
    stockQuantity: 630,
    stockStatus: STOCK_STATUS.IN_STOCK,
    minStockLevel: 100,
    trackInventory: true,
    allowBackorder: true,
    isPublished: true,
    isFeatured: true,
    isNew: false,
    metaTitle: null,
    metaDescription: null,
    createdAt: '2024-01-10T13:00:00.000Z',
    updatedAt: '2024-02-22T15:00:00.000Z',
    publishedAt: '2024-01-11T08:00:00.000Z',
  },

  // ═══════════════════════════════════════════════════════════════
  // OUT OF STOCK PRODUCT
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'prod-007',
    sku: 'KSP-CD-115',
    name: 'Klingspor Cutting Disc 115mm x 1mm',
    slug: 'klingspor-cutting-disc-115mm',
    shortDescription: 'Ultra-thin metal cutting disc for clean, burr-free cuts.',
    description: `Klingspor 115mm x 1mm cutting discs deliver precision cuts with minimal material loss. The thin profile reduces cutting time and produces clean edges that require little to no finishing.

Suitable for cutting steel, stainless steel, and non-ferrous metals.`,
    features: [
      '1mm thickness for fast cutting',
      'Clean, burr-free cuts',
      'Minimal material loss',
      'Reinforced with fiberglass mesh',
      'For steel and stainless steel',
    ],
    categoryId: 'cat-grinding-wheels',
    subcategoryId: 'subcat-cutting-discs',
    brandId: 'brand-klingspor',
    images: [
      {
        id: 'img-007-1',
        url: '/products/klingspor-cutting-disc.jpg',
        alt: 'Klingspor Cutting Disc',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    specifications: [
      { key: 'diameter', label: 'Diameter', value: '115', unit: 'mm', group: 'Dimensions' },
      { key: 'thickness', label: 'Thickness', value: '1', unit: 'mm', group: 'Dimensions' },
      { key: 'arbor', label: 'Arbor Hole', value: '22.23', unit: 'mm', group: 'Dimensions' },
      { key: 'max_rpm', label: 'Max RPM', value: '13300', group: 'Performance' },
    ],
    variants: [],
    hasVariants: false,
    price: 1.20,
    compareAtPrice: null,
    currency: CURRENCY.USD,
    stockQuantity: 0,
    stockStatus: STOCK_STATUS.OUT_OF_STOCK,
    minStockLevel: 500,
    trackInventory: true,
    allowBackorder: false,
    isPublished: true,
    isFeatured: false,
    isNew: false,
    metaTitle: null,
    metaDescription: null,
    createdAt: '2024-01-08T10:00:00.000Z',
    updatedAt: '2024-02-24T09:00:00.000Z',
    publishedAt: '2024-01-09T08:00:00.000Z',
  },

  // ═══════════════════════════════════════════════════════════════
  // UNPUBLISHED / DRAFT PRODUCT
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'prod-008',
    sku: '3M-CB2-TRIZACT',
    name: '3M Trizact Conditioning Belt',
    slug: '3m-trizact-conditioning-belt',
    shortDescription: 'Structured abrasive belt for consistent finishing on stainless steel and aluminum.',
    description: `3M Trizact belts feature precision-shaped mineral technology that delivers a consistent, predictable finish throughout the belt life. The structured abrasive surface self-replicates as it wears, maintaining consistent cut and finish.

Ideal for high-value parts where consistency is critical.`,
    features: [
      'Precision-shaped mineral',
      'Consistent cut and finish',
      'Self-replicating abrasive',
      'Long belt life',
      'For stainless and aluminum',
    ],
    categoryId: 'cat-abrasive-belts',
    subcategoryId: 'subcat-narrow-belts',
    brandId: 'brand-3m',
    images: [],
    specifications: [
      { key: 'technology', label: 'Technology', value: 'Precision Shaped Grain', group: 'Design' },
      { key: 'backing', label: 'Backing', value: 'Polyester', group: 'Material' },
    ],
    variants: [],
    hasVariants: false,
    price: 45.00,
    compareAtPrice: null,
    currency: CURRENCY.USD,
    stockQuantity: 25,
    stockStatus: STOCK_STATUS.IN_STOCK,
    minStockLevel: 10,
    trackInventory: true,
    allowBackorder: true,
    isPublished: false, // DRAFT
    isFeatured: false,
    isNew: true,
    metaTitle: null,
    metaDescription: null,
    createdAt: '2024-02-20T16:00:00.000Z',
    updatedAt: '2024-02-20T16:00:00.000Z',
    publishedAt: null,
  },
];

export default MOCK_PRODUCTS;
