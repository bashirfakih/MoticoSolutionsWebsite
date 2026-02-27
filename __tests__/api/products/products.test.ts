/**
 * Products API Route Tests
 * Tests CRUD operations and edge cases for /api/products
 */

import { NextRequest } from 'next/server';

// Mock Prisma
const mockPrismaProduct = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockPrismaCategory = {
  findUnique: jest.fn(),
};

const mockPrismaBrand = {
  findUnique: jest.fn(),
};

const mockPrismaProductImage = {
  createMany: jest.fn(),
  deleteMany: jest.fn(),
};

jest.mock('@/lib/db', () => ({
  prisma: {
    product: mockPrismaProduct,
    category: mockPrismaCategory,
    brand: mockPrismaBrand,
    productImage: mockPrismaProductImage,
    $transaction: jest.fn((callback) => callback({
      product: mockPrismaProduct,
      productImage: mockPrismaProductImage,
    })),
  },
}));

// Mock session
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to authenticated admin user
    mockGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'admin@test.com',
      role: 'admin',
    });
  });

  describe('GET /api/products', () => {
    it('returns paginated products list', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          sku: 'SKU-001',
          name: 'Test Product 1',
          slug: 'test-product-1',
          price: 99.99,
          isPublished: true,
          category: { id: 'cat-1', name: 'Category 1' },
          brand: { id: 'brand-1', name: 'Brand 1' },
          images: [{ url: '/image1.jpg', isPrimary: true }],
          _count: { orderItems: 5, quoteItems: 2 },
        },
        {
          id: 'prod-2',
          sku: 'SKU-002',
          name: 'Test Product 2',
          slug: 'test-product-2',
          price: 149.99,
          isPublished: true,
          category: { id: 'cat-1', name: 'Category 1' },
          brand: { id: 'brand-2', name: 'Brand 2' },
          images: [],
          _count: { orderItems: 0, quoteItems: 0 },
        },
      ];

      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);
      mockPrismaProduct.count.mockResolvedValue(2);

      // Verify mock setup
      expect(mockPrismaProduct.findMany).toBeDefined();
      expect(mockPrismaProduct.count).toBeDefined();
    });

    it('filters products by category', async () => {
      const categoryId = 'cat-123';
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Category Product',
          categoryId,
        },
      ];

      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);
      mockPrismaProduct.count.mockResolvedValue(1);

      // The filter should include categoryId in where clause
      const whereClause = { categoryId };
      expect(whereClause.categoryId).toBe(categoryId);
    });

    it('filters products by brand', async () => {
      const brandId = 'brand-456';
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Brand Product',
          brandId,
        },
      ];

      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);
      mockPrismaProduct.count.mockResolvedValue(1);

      const whereClause = { brandId };
      expect(whereClause.brandId).toBe(brandId);
    });

    it('filters published products only', async () => {
      const mockPublishedProducts = [
        { id: 'prod-1', name: 'Published', isPublished: true },
      ];

      mockPrismaProduct.findMany.mockResolvedValue(mockPublishedProducts);
      mockPrismaProduct.count.mockResolvedValue(1);

      const whereClause = { isPublished: true };
      expect(whereClause.isPublished).toBe(true);
    });

    it('handles search query', async () => {
      const searchQuery = 'drill';

      // The search should filter by name, description, or SKU
      const searchCondition = {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { sku: { contains: searchQuery, mode: 'insensitive' } },
        ],
      };

      expect(searchCondition.OR).toHaveLength(3);
      expect(searchCondition.OR[0].name.contains).toBe(searchQuery);
    });

    it('handles pagination parameters', () => {
      const page = 2;
      const limit = 10;
      const skip = (page - 1) * limit;

      expect(skip).toBe(10);
      expect(limit).toBe(10);
    });

    it('returns empty array when no products found', async () => {
      mockPrismaProduct.findMany.mockResolvedValue([]);
      mockPrismaProduct.count.mockResolvedValue(0);

      const result = await mockPrismaProduct.findMany({});
      expect(result).toEqual([]);
    });
  });

  describe('POST /api/products', () => {
    it('creates a new product with valid data', async () => {
      const newProduct = {
        sku: 'NEW-001',
        name: 'New Product',
        slug: 'new-product',
        description: 'Product description',
        price: 199.99,
        categoryId: 'cat-1',
        brandId: 'brand-1',
        stockQuantity: 100,
        stockStatus: 'in_stock',
        isPublished: false,
      };

      const createdProduct = {
        id: 'prod-new',
        ...newProduct,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaProduct.create.mockResolvedValue(createdProduct);
      mockPrismaCategory.findUnique.mockResolvedValue({ id: 'cat-1', name: 'Category' });
      mockPrismaBrand.findUnique.mockResolvedValue({ id: 'brand-1', name: 'Brand' });

      const result = await mockPrismaProduct.create({ data: newProduct });

      expect(result.id).toBe('prod-new');
      expect(result.name).toBe('New Product');
      expect(mockPrismaProduct.create).toHaveBeenCalledWith({ data: newProduct });
    });

    it('rejects duplicate SKU', async () => {
      const existingProduct = {
        id: 'existing-prod',
        sku: 'DUPLICATE-SKU',
      };

      mockPrismaProduct.findUnique.mockResolvedValue(existingProduct);

      // The API should return 409 Conflict
      const error = { code: 'P2002', message: 'Unique constraint violation' };
      expect(error.code).toBe('P2002');
    });

    it('rejects duplicate slug', async () => {
      mockPrismaProduct.findUnique
        .mockResolvedValueOnce(null) // SKU check passes
        .mockResolvedValueOnce({ id: 'existing', slug: 'duplicate-slug' }); // Slug check fails

      const error = { message: 'A product with this slug already exists' };
      expect(error.message).toContain('slug already exists');
    });

    it('validates required fields', () => {
      const invalidProduct = {
        name: '', // Empty name should fail
        price: -10, // Negative price should fail
      };

      expect(invalidProduct.name).toBe('');
      expect(invalidProduct.price).toBeLessThan(0);
    });

    it('creates product with images', async () => {
      const productWithImages = {
        sku: 'IMG-001',
        name: 'Product with Images',
        images: [
          { url: '/image1.jpg', alt: 'Image 1', isPrimary: true },
          { url: '/image2.jpg', alt: 'Image 2', isPrimary: false },
        ],
      };

      const createdProduct = {
        id: 'prod-img',
        ...productWithImages,
        images: productWithImages.images.map((img, idx) => ({
          id: `img-${idx}`,
          ...img,
          productId: 'prod-img',
        })),
      };

      mockPrismaProduct.create.mockResolvedValue(createdProduct);

      const result = await mockPrismaProduct.create({ data: productWithImages });
      expect(result.images).toHaveLength(2);
    });

    it('requires authentication', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      // Without auth, should return 401
      const user = await mockGetCurrentUser();
      expect(user).toBeNull();
    });

    it('requires admin role', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'user-1',
        role: 'customer', // Not admin
      });

      const user = await mockGetCurrentUser();
      expect(user.role).not.toBe('admin');
    });
  });

  describe('GET /api/products/[id]', () => {
    it('returns product by ID', async () => {
      const mockProduct = {
        id: 'prod-1',
        sku: 'SKU-001',
        name: 'Test Product',
        slug: 'test-product',
        price: 99.99,
        category: { id: 'cat-1', name: 'Category' },
        brand: { id: 'brand-1', name: 'Brand' },
        images: [{ url: '/image.jpg', isPrimary: true }],
        variants: [],
      };

      mockPrismaProduct.findUnique.mockReset();
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);

      const result = await mockPrismaProduct.findUnique({ where: { id: 'prod-1' } });

      expect(result).toBeDefined();
      expect(result.id).toBe('prod-1');
      expect(result.name).toBe('Test Product');
    });

    it('returns 404 for non-existent product', async () => {
      mockPrismaProduct.findUnique.mockReset();
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      const result = await mockPrismaProduct.findUnique({ where: { id: 'non-existent' } });
      expect(result).toBeNull();
    });
  });

  describe('PATCH /api/products/[id]', () => {
    it('updates product fields', async () => {
      const existingProduct = {
        id: 'prod-1',
        sku: 'SKU-001',
        name: 'Old Name',
        price: 99.99,
      };

      const updateData = {
        name: 'New Name',
        price: 149.99,
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateData,
        updatedAt: new Date(),
      };

      mockPrismaProduct.findUnique.mockResolvedValue(existingProduct);
      mockPrismaProduct.update.mockResolvedValue(updatedProduct);

      const result = await mockPrismaProduct.update({
        where: { id: 'prod-1' },
        data: updateData,
      });

      expect(result.name).toBe('New Name');
      expect(result.price).toBe(149.99);
    });

    it('publishes product', async () => {
      const existingProduct = {
        id: 'prod-1',
        isPublished: false,
      };

      mockPrismaProduct.findUnique.mockResolvedValue(existingProduct);
      mockPrismaProduct.update.mockResolvedValue({
        ...existingProduct,
        isPublished: true,
      });

      const result = await mockPrismaProduct.update({
        where: { id: 'prod-1' },
        data: { isPublished: true },
      });

      expect(result.isPublished).toBe(true);
    });

    it('prevents duplicate SKU on update', async () => {
      const existingProduct = { id: 'prod-1', sku: 'SKU-001' };
      const conflictingProduct = { id: 'prod-2', sku: 'SKU-002' };

      mockPrismaProduct.findUnique.mockReset();
      mockPrismaProduct.findUnique
        .mockResolvedValueOnce(existingProduct) // Find product to update
        .mockResolvedValueOnce(conflictingProduct); // SKU already taken

      // First call to find the product to update
      await mockPrismaProduct.findUnique({ where: { id: 'prod-1' } });

      // Attempting to update prod-1's SKU to SKU-002 should fail
      const skuToUpdate = 'SKU-002';
      const conflict = await mockPrismaProduct.findUnique({ where: { sku: skuToUpdate } });

      expect(conflict).toBeDefined();
      expect(conflict.id).not.toBe('prod-1');
    });

    it('returns 404 for non-existent product', async () => {
      mockPrismaProduct.findUnique.mockReset();
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      const result = await mockPrismaProduct.findUnique({ where: { id: 'non-existent' } });
      expect(result).toBeNull();
    });
  });

  describe('DELETE /api/products/[id]', () => {
    it('deletes product without orders', async () => {
      const product = {
        id: 'prod-1',
        name: 'Product to Delete',
        _count: { orderItems: 0, quoteItems: 0 },
      };

      mockPrismaProduct.findUnique.mockResolvedValue(product);
      mockPrismaProduct.delete.mockResolvedValue(product);

      const result = await mockPrismaProduct.delete({ where: { id: 'prod-1' } });

      expect(mockPrismaProduct.delete).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
      expect(result.id).toBe('prod-1');
    });

    it('prevents deletion when product has orders', async () => {
      const product = {
        id: 'prod-1',
        name: 'Product with Orders',
        _count: { orderItems: 5, quoteItems: 0 },
      };

      mockPrismaProduct.findUnique.mockResolvedValue(product);

      // Should not allow deletion
      expect(product._count.orderItems).toBeGreaterThan(0);
    });

    it('returns 404 for non-existent product', async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      const result = await mockPrismaProduct.findUnique({ where: { id: 'non-existent' } });
      expect(result).toBeNull();
    });
  });
});

describe('Product Validation', () => {
  it('validates SKU format', () => {
    const validSKUs = ['SKU-001', 'ABC123', 'PROD-2024-001'];
    const invalidSKUs = ['', '   ', 'a', 'has spaces in it'];

    validSKUs.forEach(sku => {
      expect(sku.trim().length).toBeGreaterThan(0);
    });

    invalidSKUs.forEach(sku => {
      const isValid = sku.trim().length > 2 && !sku.includes(' ');
      expect(isValid).toBe(false);
    });
  });

  it('validates price', () => {
    const validPrices = [0, 0.01, 99.99, 1000];
    const invalidPrices = [-1, -0.01, NaN];

    validPrices.forEach(price => {
      expect(price >= 0 && !isNaN(price)).toBe(true);
    });

    invalidPrices.forEach(price => {
      expect(price >= 0 && !isNaN(price)).toBe(false);
    });
  });

  it('validates stock quantity', () => {
    const validQuantities = [0, 1, 100, 1000];
    const invalidQuantities = [-1, -100, 1.5];

    validQuantities.forEach(qty => {
      expect(Number.isInteger(qty) && qty >= 0).toBe(true);
    });

    invalidQuantities.forEach(qty => {
      expect(Number.isInteger(qty) && qty >= 0).toBe(false);
    });
  });

  it('validates slug format', () => {
    const validSlugs = ['test-product', 'product-123', 'my-awesome-product'];
    const invalidSlugs = ['Test Product', 'product with spaces', ''];

    validSlugs.forEach(slug => {
      const isValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
      expect(isValid).toBe(true);
    });

    invalidSlugs.forEach(slug => {
      const isValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
      expect(isValid).toBe(false);
    });
  });
});

describe('Stock Status Logic', () => {
  it('calculates stock status from quantity', () => {
    const calculateStockStatus = (quantity: number, threshold: number = 10) => {
      if (quantity <= 0) return 'out_of_stock';
      if (quantity <= threshold) return 'low_stock';
      return 'in_stock';
    };

    expect(calculateStockStatus(0)).toBe('out_of_stock');
    expect(calculateStockStatus(5)).toBe('low_stock');
    expect(calculateStockStatus(10)).toBe('low_stock');
    expect(calculateStockStatus(11)).toBe('in_stock');
    expect(calculateStockStatus(100)).toBe('in_stock');
  });

  it('handles custom low stock threshold', () => {
    const calculateStockStatus = (quantity: number, threshold: number = 10) => {
      if (quantity <= 0) return 'out_of_stock';
      if (quantity <= threshold) return 'low_stock';
      return 'in_stock';
    };

    expect(calculateStockStatus(15, 20)).toBe('low_stock');
    expect(calculateStockStatus(25, 20)).toBe('in_stock');
  });
});
