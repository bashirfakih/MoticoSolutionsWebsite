/**
 * Unit Tests for Category Helper Functions
 *
 * Tests for category data transformation and mapping functions
 */

// Jest globals are auto-imported

// Icon mapping (mirrors the one in page.tsx)
const ICON_MAP: Record<string, string> = {
  Layers: 'Layers',
  Wrench: 'Wrench',
  Disc: 'Disc',
  Cog: 'Cog',
  Settings: 'Settings',
  Package: 'Package',
  Box: 'Box',
  Hammer: 'Hammer',
  Zap: 'Zap',
  Wind: 'Wind',
  Droplets: 'Droplets',
  Ruler: 'Ruler',
  Scissors: 'Scissors',
  Shield: 'Shield',
  Star: 'Star',
  ShieldCheck: 'ShieldCheck',
};

// Category type from database
interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  color: string | null;
  featuredBrand: string | null;
  parentId: string | null;
  sortOrder: number;
  productCount: number;
  isActive: boolean;
}

// Transform database category to UI format (mirrors the function in page.tsx)
function mapCategoryToUI(cat: CategoryData, index: number) {
  const iconName = cat.icon || 'Layers';
  const resolvedIcon = ICON_MAP[iconName] || 'Layers';
  return {
    id: cat.slug,
    title: cat.name,
    icon: resolvedIcon,
    color: cat.color || (index % 2 === 0 ? '#bb0c15' : '#004D8B'),
    bg: cat.image || `/product-${cat.slug}.png`,
    brand: cat.featuredBrand || 'Premium',
    productCount: cat.productCount > 0 ? `${cat.productCount}+` : '0',
  };
}

describe('mapCategoryToUI', () => {
  const baseCategoryData: CategoryData = {
    id: 'cat-123',
    name: 'Abrasive Belts',
    slug: 'abrasive-belts',
    description: 'Premium abrasive belts',
    image: '/product-abrasive-belts.jpg',
    icon: 'Layers',
    color: '#bb0c15',
    featuredBrand: 'Hermes',
    parentId: null,
    sortOrder: 1,
    productCount: 150,
    isActive: true,
  };

  it('should map all fields correctly with full data', () => {
    const result = mapCategoryToUI(baseCategoryData, 0);

    expect(result.id).toBe('abrasive-belts');
    expect(result.title).toBe('Abrasive Belts');
    expect(result.icon).toBe('Layers');
    expect(result.color).toBe('#bb0c15');
    expect(result.bg).toBe('/product-abrasive-belts.jpg');
    expect(result.brand).toBe('Hermes');
    expect(result.productCount).toBe('150+');
  });

  it('should use default icon when icon is null', () => {
    const catWithoutIcon = { ...baseCategoryData, icon: null };
    const result = mapCategoryToUI(catWithoutIcon, 0);

    expect(result.icon).toBe('Layers');
  });

  it('should use default icon when icon is not in map', () => {
    const catWithUnknownIcon = { ...baseCategoryData, icon: 'UnknownIcon' };
    const result = mapCategoryToUI(catWithUnknownIcon, 0);

    expect(result.icon).toBe('Layers');
  });

  it('should alternate colors based on index when color is null', () => {
    const catWithoutColor = { ...baseCategoryData, color: null };

    const result0 = mapCategoryToUI(catWithoutColor, 0);
    const result1 = mapCategoryToUI(catWithoutColor, 1);
    const result2 = mapCategoryToUI(catWithoutColor, 2);

    expect(result0.color).toBe('#bb0c15'); // Even index = red
    expect(result1.color).toBe('#004D8B'); // Odd index = blue
    expect(result2.color).toBe('#bb0c15'); // Even index = red
  });

  it('should generate default image path when image is null', () => {
    const catWithoutImage = { ...baseCategoryData, image: null };
    const result = mapCategoryToUI(catWithoutImage, 0);

    expect(result.bg).toBe('/product-abrasive-belts.png');
  });

  it('should use "Premium" as default brand when featuredBrand is null', () => {
    const catWithoutBrand = { ...baseCategoryData, featuredBrand: null };
    const result = mapCategoryToUI(catWithoutBrand, 0);

    expect(result.brand).toBe('Premium');
  });

  it('should format product count correctly when count > 0', () => {
    const catWith100 = { ...baseCategoryData, productCount: 100 };
    const catWith1 = { ...baseCategoryData, productCount: 1 };

    expect(mapCategoryToUI(catWith100, 0).productCount).toBe('100+');
    expect(mapCategoryToUI(catWith1, 0).productCount).toBe('1+');
  });

  it('should return "0" when product count is 0', () => {
    const catWithZero = { ...baseCategoryData, productCount: 0 };
    const result = mapCategoryToUI(catWithZero, 0);

    expect(result.productCount).toBe('0');
  });

  it('should handle all known icon names', () => {
    const iconNames = Object.keys(ICON_MAP);

    iconNames.forEach((iconName) => {
      const cat = { ...baseCategoryData, icon: iconName };
      const result = mapCategoryToUI(cat, 0);
      expect(result.icon).toBe(iconName);
    });
  });

  it('should use slug as id', () => {
    const catWithDifferentSlug = {
      ...baseCategoryData,
      id: 'database-id-123',
      slug: 'custom-slug',
    };
    const result = mapCategoryToUI(catWithDifferentSlug, 0);

    expect(result.id).toBe('custom-slug');
  });
});

describe('mapCategoryToUI edge cases', () => {
  it('should handle empty string values', () => {
    const catWithEmptyStrings: CategoryData = {
      id: 'cat-1',
      name: '',
      slug: '',
      description: '',
      image: '',
      icon: '',
      color: '',
      featuredBrand: '',
      parentId: null,
      sortOrder: 0,
      productCount: 0,
      isActive: true,
    };

    const result = mapCategoryToUI(catWithEmptyStrings, 0);

    // Empty strings are falsy, so defaults should be used
    expect(result.icon).toBe('Layers'); // Empty string falls back to default
    expect(result.color).toBe('#bb0c15'); // Empty string falls back to default
    expect(result.bg).toBe('/product-.png'); // Empty slug results in this path
    expect(result.brand).toBe('Premium'); // Empty string falls back to default
  });

  it('should handle special characters in slug', () => {
    const catWithSpecialSlug: CategoryData = {
      id: 'cat-1',
      name: 'Air & Power Tools',
      slug: 'air-power-tools',
      description: null,
      image: null,
      icon: 'Wrench',
      color: '#004D8B',
      featuredBrand: 'DCA',
      parentId: null,
      sortOrder: 1,
      productCount: 80,
      isActive: true,
    };

    const result = mapCategoryToUI(catWithSpecialSlug, 0);

    expect(result.id).toBe('air-power-tools');
    expect(result.title).toBe('Air & Power Tools');
    expect(result.bg).toBe('/product-air-power-tools.png');
  });

  it('should handle very large product counts', () => {
    const catWithLargeCount: CategoryData = {
      ...{
        id: 'cat-1',
        name: 'Test',
        slug: 'test',
        description: null,
        image: null,
        icon: null,
        color: null,
        featuredBrand: null,
        parentId: null,
        sortOrder: 0,
        productCount: 999999,
        isActive: true,
      },
    };

    const result = mapCategoryToUI(catWithLargeCount, 0);

    expect(result.productCount).toBe('999999+');
  });

  it('should handle negative product counts as 0', () => {
    const catWithNegativeCount: CategoryData = {
      id: 'cat-1',
      name: 'Test',
      slug: 'test',
      description: null,
      image: null,
      icon: null,
      color: null,
      featuredBrand: null,
      parentId: null,
      sortOrder: 0,
      productCount: -5,
      isActive: true,
    };

    const result = mapCategoryToUI(catWithNegativeCount, 0);

    // Negative numbers are still > 0 check fails, so returns '0'
    expect(result.productCount).toBe('0');
  });
});
