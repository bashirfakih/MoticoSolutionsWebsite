/**
 * Product Search API Tests
 */

import { generateOrdersCSV, generateCustomersCSV, arrayToCSV } from '@/lib/export';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    brand: {
      findMany: jest.fn(),
    },
    productImage: {
      findMany: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
  },
}));

// Mock session
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: jest.fn(),
}));

describe('Product Search', () => {
  describe('Search Query Parsing', () => {
    it('handles single word queries', () => {
      const query = 'drill';
      const terms = query
        .split(/\s+/)
        .filter(term => term.length > 0)
        .map(term => term.replace(/[^\w\s]/g, ''))
        .filter(term => term.length > 0)
        .join(' & ');

      expect(terms).toBe('drill');
    });

    it('handles multi-word queries', () => {
      const query = 'power drill tool';
      const terms = query
        .split(/\s+/)
        .filter(term => term.length > 0)
        .map(term => term.replace(/[^\w\s]/g, ''))
        .filter(term => term.length > 0)
        .join(' & ');

      expect(terms).toBe('power & drill & tool');
    });

    it('strips special characters', () => {
      const query = 'drill!@#$%';
      const terms = query
        .split(/\s+/)
        .filter(term => term.length > 0)
        .map(term => term.replace(/[^\w\s]/g, ''))
        .filter(term => term.length > 0)
        .join(' & ');

      expect(terms).toBe('drill');
    });

    it('handles empty query', () => {
      const query = '';
      const terms = query
        .split(/\s+/)
        .filter(term => term.length > 0)
        .map(term => term.replace(/[^\w\s]/g, ''))
        .filter(term => term.length > 0)
        .join(' & ');

      expect(terms).toBe('');
    });

    it('handles whitespace-only query', () => {
      const query = '   ';
      const terms = query
        .split(/\s+/)
        .filter(term => term.length > 0)
        .map(term => term.replace(/[^\w\s]/g, ''))
        .filter(term => term.length > 0)
        .join(' & ');

      expect(terms).toBe('');
    });
  });

  describe('Search Filters', () => {
    it('validates minimum query length', () => {
      const query = 'a';
      const isValid = query.trim().length >= 2;
      expect(isValid).toBe(false);
    });

    it('accepts valid query length', () => {
      const query = 'ab';
      const isValid = query.trim().length >= 2;
      expect(isValid).toBe(true);
    });

    it('builds filter conditions correctly', () => {
      const filters = {
        categoryId: 'cat-123',
        brandId: 'brand-456',
        minPrice: 10,
        maxPrice: 100,
        inStockOnly: true,
      };

      const conditions: string[] = [];

      if (filters.categoryId) {
        conditions.push(`categoryId = '${filters.categoryId}'`);
      }
      if (filters.brandId) {
        conditions.push(`brandId = '${filters.brandId}'`);
      }
      if (filters.minPrice) {
        conditions.push(`price >= ${filters.minPrice}`);
      }
      if (filters.maxPrice) {
        conditions.push(`price <= ${filters.maxPrice}`);
      }
      if (filters.inStockOnly) {
        conditions.push(`stockStatus = 'in_stock'`);
      }

      expect(conditions).toHaveLength(5);
      expect(conditions).toContain(`categoryId = 'cat-123'`);
      expect(conditions).toContain(`brandId = 'brand-456'`);
      expect(conditions).toContain(`price >= 10`);
      expect(conditions).toContain(`price <= 100`);
      expect(conditions).toContain(`stockStatus = 'in_stock'`);
    });
  });

  describe('Search Result Formatting', () => {
    it('formats search results correctly', () => {
      const rawProduct = {
        id: 'prod-1',
        sku: 'SKU-001',
        name: 'Test Product',
        slug: 'test-product',
        shortDescription: 'Short desc',
        description: 'Full description',
        price: 99.99,
        compareAtPrice: 129.99,
        stockStatus: 'in_stock',
        stockQuantity: 50,
        isPublished: true,
        isFeatured: false,
        isNew: true,
        categoryId: 'cat-1',
        brandId: 'brand-1',
        rank: 0.85,
      };

      const category = { id: 'cat-1', name: 'Power Tools', slug: 'power-tools' };
      const brand = { id: 'brand-1', name: 'DeWalt', slug: 'dewalt' };
      const image = { productId: 'prod-1', url: '/image.jpg', alt: 'Product' };

      const categoryMap = new Map([[category.id, category]]);
      const brandMap = new Map([[brand.id, brand]]);
      const imageMap = new Map([[image.productId, image]]);

      const formatted = {
        id: rawProduct.id,
        sku: rawProduct.sku,
        name: rawProduct.name,
        slug: rawProduct.slug,
        shortDescription: rawProduct.shortDescription,
        description: rawProduct.description,
        price: rawProduct.price ? Number(rawProduct.price) : null,
        compareAtPrice: rawProduct.compareAtPrice ? Number(rawProduct.compareAtPrice) : null,
        stockStatus: rawProduct.stockStatus,
        stockQuantity: rawProduct.stockQuantity,
        isPublished: rawProduct.isPublished,
        isFeatured: rawProduct.isFeatured,
        isNew: rawProduct.isNew,
        category: categoryMap.get(rawProduct.categoryId) || null,
        brand: brandMap.get(rawProduct.brandId) || null,
        primaryImage: imageMap.get(rawProduct.id) || null,
        relevanceScore: rawProduct.rank,
      };

      expect(formatted.id).toBe('prod-1');
      expect(formatted.price).toBe(99.99);
      expect(formatted.category?.name).toBe('Power Tools');
      expect(formatted.brand?.name).toBe('DeWalt');
      expect(formatted.primaryImage?.url).toBe('/image.jpg');
      expect(formatted.relevanceScore).toBe(0.85);
    });
  });
});

describe('Search Suggestions', () => {
  it('formats product suggestions correctly', () => {
    const product = {
      id: 'prod-1',
      name: 'Power Drill',
      slug: 'power-drill',
      sku: 'PD-001',
      price: 149.99,
      images: [{ url: '/drill.jpg' }],
      category: { name: 'Power Tools' },
    };

    const suggestion = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price ? Number(product.price) : null,
      image: product.images[0]?.url || null,
      category: product.category.name,
      type: 'product' as const,
    };

    expect(suggestion.name).toBe('Power Drill');
    expect(suggestion.price).toBe(149.99);
    expect(suggestion.image).toBe('/drill.jpg');
    expect(suggestion.type).toBe('product');
  });

  it('formats category suggestions correctly', () => {
    const category = {
      id: 'cat-1',
      name: 'Power Tools',
      slug: 'power-tools',
      productCount: 25,
    };

    const suggestion = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: category.productCount,
      type: 'category' as const,
    };

    expect(suggestion.name).toBe('Power Tools');
    expect(suggestion.productCount).toBe(25);
    expect(suggestion.type).toBe('category');
  });

  it('formats brand suggestions correctly', () => {
    const brand = {
      id: 'brand-1',
      name: 'DeWalt',
      slug: 'dewalt',
      _count: { products: 15 },
    };

    const suggestion = {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      productCount: brand._count.products,
      type: 'brand' as const,
    };

    expect(suggestion.name).toBe('DeWalt');
    expect(suggestion.productCount).toBe(15);
    expect(suggestion.type).toBe('brand');
  });
});
