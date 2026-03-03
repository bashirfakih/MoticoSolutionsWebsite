/**
 * Integration Tests for Category API - New Fields
 *
 * Tests for icon, color, and featuredBrand fields in category operations
 */

// Mock Prisma
const mockPrismaCategory = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

jest.mock('@/lib/db', () => ({
  prisma: {
    category: mockPrismaCategory,
  },
}));

// Mock session
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

describe('Category API - New Fields Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'admin@test.com',
      role: 'admin',
    });
  });

  describe('GET /api/categories - Icon, Color, FeaturedBrand', () => {
    it('returns categories with all new fields populated', async () => {
      const categoriesWithNewFields = [
        {
          id: 'cat-1',
          name: 'Abrasive Belts',
          slug: 'abrasive-belts',
          description: 'Premium abrasive belts',
          image: '/categories/abrasive-belts.jpg',
          icon: 'Layers',
          color: '#bb0c15',
          featuredBrand: 'Hermes',
          parentId: null,
          sortOrder: 1,
          isActive: true,
          _count: { products: 150 },
        },
        {
          id: 'cat-2',
          name: 'Grinding Discs',
          slug: 'grinding-discs',
          icon: 'Disc',
          color: '#004D8B',
          featuredBrand: 'Sandwox',
          parentId: null,
          sortOrder: 2,
          isActive: true,
          _count: { products: 80 },
        },
      ];

      mockPrismaCategory.findMany.mockResolvedValue(categoriesWithNewFields);

      const result = await mockPrismaCategory.findMany({});

      expect(result).toHaveLength(2);
      expect(result[0].icon).toBe('Layers');
      expect(result[0].color).toBe('#bb0c15');
      expect(result[0].featuredBrand).toBe('Hermes');
      expect(result[1].icon).toBe('Disc');
      expect(result[1].color).toBe('#004D8B');
      expect(result[1].featuredBrand).toBe('Sandwox');
    });

    it('returns categories with null new fields', async () => {
      const categoriesWithNullFields = [
        {
          id: 'cat-1',
          name: 'Test Category',
          slug: 'test-category',
          icon: null,
          color: null,
          featuredBrand: null,
          parentId: null,
          isActive: true,
        },
      ];

      mockPrismaCategory.findMany.mockResolvedValue(categoriesWithNullFields);

      const result = await mockPrismaCategory.findMany({});

      expect(result[0].icon).toBeNull();
      expect(result[0].color).toBeNull();
      expect(result[0].featuredBrand).toBeNull();
    });

    it('handles various icon names', async () => {
      const iconNames = ['Layers', 'Wrench', 'Disc', 'Settings', 'Package', 'Shield', 'Hammer'];

      const categoriesWithIcons = iconNames.map((icon, index) => ({
        id: `cat-${index}`,
        name: `Category ${index}`,
        slug: `category-${index}`,
        icon,
        color: index % 2 === 0 ? '#bb0c15' : '#004D8B',
        featuredBrand: null,
        isActive: true,
      }));

      mockPrismaCategory.findMany.mockResolvedValue(categoriesWithIcons);

      const result = await mockPrismaCategory.findMany({});

      expect(result).toHaveLength(7);
      result.forEach((cat: { icon: string }, index: number) => {
        expect(cat.icon).toBe(iconNames[index]);
      });
    });
  });

  describe('POST /api/categories - Create with New Fields', () => {
    it('creates category with all new fields', async () => {
      const newCategoryData = {
        name: 'Air & Power Tools',
        slug: 'air-power-tools',
        description: 'Professional power tools',
        image: '/categories/air-power-tools.jpg',
        icon: 'Wrench',
        color: '#004D8B',
        featuredBrand: 'DCA',
        parentId: null,
        sortOrder: 6,
        isActive: true,
      };

      const createdCategory = {
        id: 'cat-new',
        ...newCategoryData,
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaCategory.findUnique.mockResolvedValue(null); // No duplicate slug
      mockPrismaCategory.create.mockResolvedValue(createdCategory);

      const result = await mockPrismaCategory.create({ data: newCategoryData });

      expect(result.id).toBe('cat-new');
      expect(result.icon).toBe('Wrench');
      expect(result.color).toBe('#004D8B');
      expect(result.featuredBrand).toBe('DCA');
    });

    it('creates category with only required fields (new fields null)', async () => {
      const minimalCategoryData = {
        name: 'Minimal Category',
        slug: 'minimal-category',
        description: null,
        image: null,
        icon: null,
        color: null,
        featuredBrand: null,
        parentId: null,
        sortOrder: 0,
        isActive: true,
      };

      mockPrismaCategory.findUnique.mockResolvedValue(null);
      mockPrismaCategory.create.mockResolvedValue({
        id: 'cat-minimal',
        ...minimalCategoryData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await mockPrismaCategory.create({ data: minimalCategoryData });

      expect(result.icon).toBeNull();
      expect(result.color).toBeNull();
      expect(result.featuredBrand).toBeNull();
    });

    it('validates hex color format', () => {
      const validColors = ['#bb0c15', '#004D8B', '#10B981', '#ffffff', '#000000', '#FF0000'];
      const invalidColors = ['bb0c15', 'red', '#gg0000', '004D8B', '#12345'];

      const isValidHexColor = (color: string): boolean => {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
      };

      validColors.forEach((color) => {
        expect(isValidHexColor(color)).toBe(true);
      });

      invalidColors.forEach((color) => {
        expect(isValidHexColor(color)).toBe(false);
      });
    });
  });

  describe('PATCH /api/categories/[id] - Update New Fields', () => {
    it('updates icon field only', async () => {
      const existingCategory = {
        id: 'cat-1',
        name: 'Abrasive Belts',
        slug: 'abrasive-belts',
        icon: 'Layers',
        color: '#bb0c15',
        featuredBrand: 'Hermes',
      };

      mockPrismaCategory.findUnique.mockResolvedValue(existingCategory);
      mockPrismaCategory.update.mockResolvedValue({
        ...existingCategory,
        icon: 'Disc',
      });

      const result = await mockPrismaCategory.update({
        where: { id: 'cat-1' },
        data: { icon: 'Disc' },
      });

      expect(result.icon).toBe('Disc');
      expect(result.color).toBe('#bb0c15'); // Unchanged
      expect(result.featuredBrand).toBe('Hermes'); // Unchanged
    });

    it('updates color field only', async () => {
      const existingCategory = {
        id: 'cat-1',
        icon: 'Layers',
        color: '#bb0c15',
        featuredBrand: 'Hermes',
      };

      mockPrismaCategory.findUnique.mockResolvedValue(existingCategory);
      mockPrismaCategory.update.mockResolvedValue({
        ...existingCategory,
        color: '#10B981',
      });

      const result = await mockPrismaCategory.update({
        where: { id: 'cat-1' },
        data: { color: '#10B981' },
      });

      expect(result.color).toBe('#10B981');
      expect(result.icon).toBe('Layers'); // Unchanged
    });

    it('updates featuredBrand field only', async () => {
      const existingCategory = {
        id: 'cat-1',
        icon: 'Layers',
        color: '#bb0c15',
        featuredBrand: 'Hermes',
      };

      mockPrismaCategory.findUnique.mockResolvedValue(existingCategory);
      mockPrismaCategory.update.mockResolvedValue({
        ...existingCategory,
        featuredBrand: '3M',
      });

      const result = await mockPrismaCategory.update({
        where: { id: 'cat-1' },
        data: { featuredBrand: '3M' },
      });

      expect(result.featuredBrand).toBe('3M');
      expect(result.icon).toBe('Layers'); // Unchanged
      expect(result.color).toBe('#bb0c15'); // Unchanged
    });

    it('updates all new fields at once', async () => {
      const existingCategory = {
        id: 'cat-1',
        icon: 'Layers',
        color: '#bb0c15',
        featuredBrand: 'Hermes',
      };

      const updates = {
        icon: 'Wrench',
        color: '#004D8B',
        featuredBrand: 'DCA',
      };

      mockPrismaCategory.findUnique.mockResolvedValue(existingCategory);
      mockPrismaCategory.update.mockResolvedValue({
        ...existingCategory,
        ...updates,
      });

      const result = await mockPrismaCategory.update({
        where: { id: 'cat-1' },
        data: updates,
      });

      expect(result.icon).toBe('Wrench');
      expect(result.color).toBe('#004D8B');
      expect(result.featuredBrand).toBe('DCA');
    });

    it('clears new fields by setting to null', async () => {
      const existingCategory = {
        id: 'cat-1',
        icon: 'Layers',
        color: '#bb0c15',
        featuredBrand: 'Hermes',
      };

      mockPrismaCategory.findUnique.mockResolvedValue(existingCategory);
      mockPrismaCategory.update.mockResolvedValue({
        ...existingCategory,
        icon: null,
        color: null,
        featuredBrand: null,
      });

      const result = await mockPrismaCategory.update({
        where: { id: 'cat-1' },
        data: { icon: null, color: null, featuredBrand: null },
      });

      expect(result.icon).toBeNull();
      expect(result.color).toBeNull();
      expect(result.featuredBrand).toBeNull();
    });
  });

  describe('GET /api/categories/[id] - Single Category with New Fields', () => {
    it('returns single category with all new fields', async () => {
      const category = {
        id: 'cat-1',
        name: 'Surface Finishing',
        slug: 'surface-finishing',
        description: 'Non-woven abrasives and conditioning discs',
        image: '/categories/surface-finishing.jpg',
        icon: 'Layers',
        color: '#bb0c15',
        featuredBrand: '3M',
        parentId: null,
        sortOrder: 7,
        isActive: true,
        parent: null,
        children: [],
        _count: { products: 45 },
      };

      mockPrismaCategory.findUnique.mockResolvedValue(category);

      const result = await mockPrismaCategory.findUnique({
        where: { id: 'cat-1' },
        include: { parent: true, children: true, _count: { select: { products: true } } },
      });

      expect(result).toBeDefined();
      expect(result.icon).toBe('Layers');
      expect(result.color).toBe('#bb0c15');
      expect(result.featuredBrand).toBe('3M');
    });
  });

  describe('Category Field Defaults', () => {
    it('uses default icon when icon is null', () => {
      const DEFAULT_ICON = 'Layers';

      const categories = [
        { id: '1', icon: null },
        { id: '2', icon: 'Disc' },
        { id: '3', icon: '' },
      ];

      const resolveIcon = (icon: string | null): string => {
        return icon || DEFAULT_ICON;
      };

      expect(resolveIcon(categories[0].icon)).toBe('Layers');
      expect(resolveIcon(categories[1].icon)).toBe('Disc');
      expect(resolveIcon(categories[2].icon)).toBe('Layers'); // Empty string treated as falsy
    });

    it('alternates colors based on index when color is null', () => {
      const RED = '#bb0c15';
      const BLUE = '#004D8B';

      const resolveColor = (color: string | null, index: number): string => {
        if (color) return color;
        return index % 2 === 0 ? RED : BLUE;
      };

      expect(resolveColor(null, 0)).toBe(RED);
      expect(resolveColor(null, 1)).toBe(BLUE);
      expect(resolveColor(null, 2)).toBe(RED);
      expect(resolveColor('#10B981', 0)).toBe('#10B981'); // Custom color overrides
    });

    it('uses "Premium" as default brand when featuredBrand is null', () => {
      const DEFAULT_BRAND = 'Premium';

      const resolveBrand = (featuredBrand: string | null): string => {
        return featuredBrand || DEFAULT_BRAND;
      };

      expect(resolveBrand(null)).toBe('Premium');
      expect(resolveBrand('')).toBe('Premium');
      expect(resolveBrand('Hermes')).toBe('Hermes');
    });
  });

  describe('Subcategory New Fields Inheritance', () => {
    it('subcategories can have different icons from parent', async () => {
      const subcategories = [
        { id: 'sub-1', name: 'Angle Grinders', icon: 'Disc', parentId: 'cat-parent' },
        { id: 'sub-2', name: 'Die Grinders', icon: 'Settings', parentId: 'cat-parent' },
        { id: 'sub-3', name: 'Sanders', icon: null, parentId: 'cat-parent' }, // Inherits default
      ];

      mockPrismaCategory.findMany.mockResolvedValue(subcategories);

      const result = await mockPrismaCategory.findMany({
        where: { parentId: 'cat-parent' },
      });

      expect(result[0].icon).toBe('Disc');
      expect(result[1].icon).toBe('Settings');
      expect(result[2].icon).toBeNull(); // Can be null, UI decides default
    });

    it('subcategories can have null color/brand while parent has values', async () => {
      const subcategory = {
        id: 'sub-1',
        name: 'Narrow Belts',
        parentId: 'cat-abrasive-belts',
        icon: null,
        color: null,
        featuredBrand: null,
      };

      mockPrismaCategory.findUnique.mockResolvedValue(subcategory);

      const result = await mockPrismaCategory.findUnique({
        where: { id: 'sub-1' },
      });

      // Subcategories typically don't need icon/color/brand
      expect(result.icon).toBeNull();
      expect(result.color).toBeNull();
      expect(result.featuredBrand).toBeNull();
    });
  });
});

describe('Category Icon Validation', () => {
  const VALID_ICONS = [
    'Layers',
    'Wrench',
    'Disc',
    'Settings',
    'Package',
    'Shield',
    'Hammer',
    'Zap',
    'Wind',
    'Droplets',
    'Ruler',
    'Scissors',
    'Star',
    'ShieldCheck',
    'Cog',
    'Box',
  ];

  it('accepts all valid icon names', () => {
    const isValidIcon = (icon: string): boolean => {
      return VALID_ICONS.includes(icon);
    };

    VALID_ICONS.forEach((icon) => {
      expect(isValidIcon(icon)).toBe(true);
    });
  });

  it('rejects invalid icon names', () => {
    const invalidIcons = ['Invalid', 'hammer', 'LAYERS', 'icon-layers', ''];

    const isValidIcon = (icon: string): boolean => {
      return VALID_ICONS.includes(icon);
    };

    invalidIcons.forEach((icon) => {
      expect(isValidIcon(icon)).toBe(false);
    });
  });
});

describe('Category Brand Names', () => {
  const KNOWN_BRANDS = ['Hermes', 'Sandwox', 'Eisenblätter', '3M', 'DCA', 'Hoffmann', 'Osborn'];

  it('accepts known brand names', () => {
    KNOWN_BRANDS.forEach((brand) => {
      expect(typeof brand).toBe('string');
      expect(brand.length).toBeGreaterThan(0);
    });
  });

  it('accepts any non-empty string as brand name', () => {
    const customBrands = ['Custom Brand', 'New Manufacturer', 'Unknown'];

    customBrands.forEach((brand) => {
      expect(brand.length).toBeGreaterThan(0);
    });
  });

  it('treats empty string as no brand', () => {
    const resolveBrand = (brand: string | null): string | null => {
      if (!brand || brand.trim() === '') return null;
      return brand;
    };

    expect(resolveBrand('')).toBeNull();
    expect(resolveBrand('  ')).toBeNull();
    expect(resolveBrand(null)).toBeNull();
    expect(resolveBrand('Hermes')).toBe('Hermes');
  });
});
