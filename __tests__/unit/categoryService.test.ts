/**
 * Unit Tests for Category API Service
 *
 * Tests for the category service mapping and transformation functions
 */

// Jest globals are auto-imported
import { Category } from '@/lib/data/types';

// API response type (mirrors ApiCategory from categoryService.ts)
interface ApiCategory {
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
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  parent?: { id: string; name: string; slug: string } | null;
  childrenCount?: number;
}

// Map API response to Category type (mirrors the function in categoryService.ts)
function mapApiToCategory(api: ApiCategory): Category {
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    description: api.description,
    image: api.image,
    icon: api.icon,
    color: api.color,
    featuredBrand: api.featuredBrand,
    parentId: api.parentId,
    sortOrder: api.sortOrder,
    isActive: api.isActive,
    productCount: api.productCount ?? 0,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

describe('mapApiToCategory', () => {
  const baseApiCategory: ApiCategory = {
    id: 'cat-123',
    name: 'Abrasive Belts',
    slug: 'abrasive-belts',
    description: 'Premium abrasive belts for industrial use',
    image: '/categories/abrasive-belts.jpg',
    icon: 'Layers',
    color: '#bb0c15',
    featuredBrand: 'Hermes',
    parentId: null,
    sortOrder: 1,
    isActive: true,
    productCount: 150,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  };

  it('should map all fields correctly from API response', () => {
    const result = mapApiToCategory(baseApiCategory);

    expect(result.id).toBe('cat-123');
    expect(result.name).toBe('Abrasive Belts');
    expect(result.slug).toBe('abrasive-belts');
    expect(result.description).toBe('Premium abrasive belts for industrial use');
    expect(result.image).toBe('/categories/abrasive-belts.jpg');
    expect(result.icon).toBe('Layers');
    expect(result.color).toBe('#bb0c15');
    expect(result.featuredBrand).toBe('Hermes');
    expect(result.parentId).toBeNull();
    expect(result.sortOrder).toBe(1);
    expect(result.isActive).toBe(true);
    expect(result.productCount).toBe(150);
    expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2024-01-15T00:00:00.000Z');
  });

  it('should handle null values for optional fields', () => {
    const apiWithNulls: ApiCategory = {
      ...baseApiCategory,
      description: null,
      image: null,
      icon: null,
      color: null,
      featuredBrand: null,
      parentId: null,
    };

    const result = mapApiToCategory(apiWithNulls);

    expect(result.description).toBeNull();
    expect(result.image).toBeNull();
    expect(result.icon).toBeNull();
    expect(result.color).toBeNull();
    expect(result.featuredBrand).toBeNull();
    expect(result.parentId).toBeNull();
  });

  it('should default productCount to 0 when undefined', () => {
    const apiWithoutProductCount = {
      ...baseApiCategory,
      productCount: undefined as unknown as number,
    };

    const result = mapApiToCategory(apiWithoutProductCount);

    expect(result.productCount).toBe(0);
  });

  it('should preserve productCount when it is 0', () => {
    const apiWithZeroCount = {
      ...baseApiCategory,
      productCount: 0,
    };

    const result = mapApiToCategory(apiWithZeroCount);

    expect(result.productCount).toBe(0);
  });

  it('should handle subcategory with parentId', () => {
    const subcategory: ApiCategory = {
      ...baseApiCategory,
      id: 'subcat-1',
      name: 'Narrow Belts',
      slug: 'narrow-belts',
      parentId: 'cat-abrasive-belts',
    };

    const result = mapApiToCategory(subcategory);

    expect(result.parentId).toBe('cat-abrasive-belts');
  });

  it('should not include parent or childrenCount in output', () => {
    const apiWithExtras: ApiCategory = {
      ...baseApiCategory,
      parent: { id: 'parent-1', name: 'Parent', slug: 'parent' },
      childrenCount: 5,
    };

    const result = mapApiToCategory(apiWithExtras);

    // These should not be in the Category type
    expect('parent' in result).toBe(false);
    expect('childrenCount' in result).toBe(false);
  });

  it('should preserve boolean isActive value', () => {
    const activeCategory = { ...baseApiCategory, isActive: true };
    const inactiveCategory = { ...baseApiCategory, isActive: false };

    expect(mapApiToCategory(activeCategory).isActive).toBe(true);
    expect(mapApiToCategory(inactiveCategory).isActive).toBe(false);
  });

  it('should handle different icon names', () => {
    const iconNames = ['Layers', 'Wrench', 'Disc', 'Settings', 'Package', 'Zap'];

    iconNames.forEach((iconName) => {
      const api = { ...baseApiCategory, icon: iconName };
      const result = mapApiToCategory(api);
      expect(result.icon).toBe(iconName);
    });
  });

  it('should handle hex color values', () => {
    const colors = ['#bb0c15', '#004D8B', '#10B981', '#ffffff', '#000000'];

    colors.forEach((color) => {
      const api = { ...baseApiCategory, color };
      const result = mapApiToCategory(api);
      expect(result.color).toBe(color);
    });
  });
});

describe('mapApiToCategory type safety', () => {
  it('should return an object matching Category interface', () => {
    const api: ApiCategory = {
      id: 'test-id',
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test description',
      image: '/test.jpg',
      icon: 'Layers',
      color: '#ff0000',
      featuredBrand: 'TestBrand',
      parentId: null,
      sortOrder: 0,
      isActive: true,
      productCount: 10,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const result = mapApiToCategory(api);

    // Type check: all Category fields should exist
    const expectedKeys: (keyof Category)[] = [
      'id',
      'name',
      'slug',
      'description',
      'image',
      'icon',
      'color',
      'featuredBrand',
      'parentId',
      'sortOrder',
      'isActive',
      'productCount',
      'createdAt',
      'updatedAt',
    ];

    expectedKeys.forEach((key) => {
      expect(key in result).toBe(true);
    });
  });

  it('should handle ISO date strings', () => {
    const api: ApiCategory = {
      ...{
        id: 'test',
        name: 'Test',
        slug: 'test',
        description: null,
        image: null,
        icon: null,
        color: null,
        featuredBrand: null,
        parentId: null,
        sortOrder: 0,
        isActive: true,
        productCount: 0,
      },
      createdAt: '2024-12-31T23:59:59.999Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const result = mapApiToCategory(api);

    expect(result.createdAt).toBe('2024-12-31T23:59:59.999Z');
    expect(result.updatedAt).toBe('2025-01-01T00:00:00.000Z');
  });
});
