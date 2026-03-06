/**
 * Products API Route Tests
 *
 * Tests for /api/products and /api/products/[id] endpoints
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockProductFindMany = jest.fn();
const mockProductFindUnique = jest.fn();
const mockProductCreate = jest.fn();
const mockProductUpdate = jest.fn();
const mockProductDelete = jest.fn();
const mockProductCount = jest.fn();
const mockCategoryFindUnique = jest.fn();
const mockBrandFindUnique = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    product: {
      findMany: (...args: unknown[]) => mockProductFindMany(...args),
      findUnique: (...args: unknown[]) => mockProductFindUnique(...args),
      create: (...args: unknown[]) => mockProductCreate(...args),
      update: (...args: unknown[]) => mockProductUpdate(...args),
      delete: (...args: unknown[]) => mockProductDelete(...args),
      count: (...args: unknown[]) => mockProductCount(...args),
    },
    category: {
      findUnique: (...args: unknown[]) => mockCategoryFindUnique(...args),
    },
    brand: {
      findUnique: (...args: unknown[]) => mockBrandFindUnique(...args),
    },
  },
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/products/route';
import {
  GET as GET_BY_ID,
  PATCH,
  DELETE,
} from '@/app/api/products/[id]/route';

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    describe('Success (200)', () => {
      it('returns paginated products list', async () => {
        const mockProducts = [
          {
            id: 'prod-1',
            sku: 'SKU-001',
            name: 'Product A',
            price: 99.99,
            category: { id: 'cat-1', name: 'Category', slug: 'category' },
            brand: { id: 'brand-1', name: 'Brand', slug: 'brand' },
            images: [],
            _count: { variants: 0 },
          },
        ];
        mockProductFindMany.mockResolvedValue(mockProducts);
        mockProductCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/products');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: unknown[]; total: number };

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(1);
        expect(data.total).toBe(1);
      });

      it('converts Decimal fields to numbers', async () => {
        mockProductFindMany.mockResolvedValue([
          {
            id: 'prod-1',
            sku: 'SKU-001',
            name: 'Product A',
            price: 99.99,
            compareAtPrice: 129.99,
            category: { id: 'cat-1', name: 'Category', slug: 'category' },
            brand: { id: 'brand-1', name: 'Brand', slug: 'brand' },
            images: [],
            _count: { variants: 0 },
          },
        ]);
        mockProductCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/products');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: { price: number; compareAtPrice: number }[] };

        expect(typeof data.data[0].price).toBe('number');
        expect(typeof data.data[0].compareAtPrice).toBe('number');
      });

      it('filters by categoryId', async () => {
        mockProductFindMany.mockResolvedValue([]);
        mockProductCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/products?categoryId=cat-1');
        await GET(request);

        expect(mockProductFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ categoryId: 'cat-1' }),
          })
        );
      });

      it('filters by brandId', async () => {
        mockProductFindMany.mockResolvedValue([]);
        mockProductCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/products?brandId=brand-1');
        await GET(request);

        expect(mockProductFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ brandId: 'brand-1' }),
          })
        );
      });

      it('filters by published status', async () => {
        mockProductFindMany.mockResolvedValue([]);
        mockProductCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/products?published=true');
        await GET(request);

        expect(mockProductFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isPublished: true }),
          })
        );
      });

      it('filters by featured status', async () => {
        mockProductFindMany.mockResolvedValue([]);
        mockProductCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/products?featured=true');
        await GET(request);

        expect(mockProductFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isFeatured: true }),
          })
        );
      });

      it('filters by stock status', async () => {
        mockProductFindMany.mockResolvedValue([]);
        mockProductCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/products?stockStatus=in_stock');
        await GET(request);

        expect(mockProductFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ stockStatus: 'in_stock' }),
          })
        );
      });

      it('filters by price range', async () => {
        mockProductFindMany.mockResolvedValue([]);
        mockProductCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/products?minPrice=50&maxPrice=100');
        await GET(request);

        expect(mockProductFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              price: expect.objectContaining({
                gte: 50,
                lte: 100,
              }),
            }),
          })
        );
      });

      it('searches by name, SKU, and description', async () => {
        mockProductFindMany.mockResolvedValue([]);
        mockProductCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/products?search=drill');
        await GET(request);

        expect(mockProductFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                { name: { contains: 'drill', mode: 'insensitive' } },
                { sku: { contains: 'drill', mode: 'insensitive' } },
                { description: { contains: 'drill', mode: 'insensitive' } },
              ]),
            }),
          })
        );
      });

      it('supports pagination', async () => {
        mockProductFindMany.mockResolvedValue([]);
        mockProductCount.mockResolvedValue(100);

        const request = createMockRequest('http://localhost/api/products?page=3&limit=10');
        const response = await GET(request);
        const data = await getResponseJson(response) as { page: number; limit: number; totalPages: number };

        expect(data.page).toBe(3);
        expect(data.limit).toBe(10);
        expect(data.totalPages).toBe(10);
      });

      it('supports sorting', async () => {
        mockProductFindMany.mockResolvedValue([]);
        mockProductCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/products?sortBy=price&sortOrder=asc');
        await GET(request);

        expect(mockProductFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { price: 'asc' },
          })
        );
      });

      it('transforms variant count', async () => {
        mockProductFindMany.mockResolvedValue([
          {
            id: 'prod-1',
            sku: 'SKU-001',
            name: 'Product A',
            price: 99.99,
            category: { id: 'cat-1', name: 'Category', slug: 'category' },
            brand: { id: 'brand-1', name: 'Brand', slug: 'brand' },
            images: [],
            _count: { variants: 5 },
          },
        ]);
        mockProductCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/products');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: { variantCount: number; _count?: unknown }[] };

        expect(data.data[0].variantCount).toBe(5);
        expect(data.data[0]._count).toBeUndefined();
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockProductCount.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/products');
        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch products' });
      });
    });
  });

  describe('POST /api/products', () => {
    describe('Success (201)', () => {
      it('creates a new product', async () => {
        const newProduct = {
          id: 'prod-new',
          sku: 'SKU-NEW',
          name: 'New Product',
          slug: 'new-product',
          categoryId: 'cat-1',
          brandId: 'brand-1',
          price: 99.99,
          category: { id: 'cat-1', name: 'Category', slug: 'category' },
          brand: { id: 'brand-1', name: 'Brand', slug: 'brand' },
          images: [],
          specifications: [],
          variants: [],
        };
        mockProductFindUnique.mockResolvedValue(null); // No duplicates
        mockCategoryFindUnique.mockResolvedValue({ id: 'cat-1' });
        mockBrandFindUnique.mockResolvedValue({ id: 'brand-1' });
        mockProductCreate.mockResolvedValue(newProduct);

        const request = createMockRequest('http://localhost/api/products', {
          method: 'POST',
          body: {
            name: 'New Product',
            sku: 'SKU-NEW',
            slug: 'new-product',
            categoryId: 'cat-1',
            brandId: 'brand-1',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response) as { id: string };

        expect(response.status).toBe(201);
        expect(data.id).toBe('prod-new');
      });

      it('creates product with images', async () => {
        mockProductFindUnique.mockResolvedValue(null);
        mockCategoryFindUnique.mockResolvedValue({ id: 'cat-1' });
        mockBrandFindUnique.mockResolvedValue({ id: 'brand-1' });
        mockProductCreate.mockResolvedValue({
          id: 'prod-1',
          images: [{ url: '/img1.jpg', isPrimary: true }],
        });

        const request = createMockRequest('http://localhost/api/products', {
          method: 'POST',
          body: {
            name: 'Product',
            sku: 'SKU-1',
            slug: 'product',
            categoryId: 'cat-1',
            brandId: 'brand-1',
            images: [{ url: '/img1.jpg', alt: 'Image 1' }],
          },
        });
        const response = await POST(request);

        expect(response.status).toBe(201);
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when required fields are missing', async () => {
        const request = createMockRequest('http://localhost/api/products', {
          method: 'POST',
          body: { name: 'Product' }, // Missing SKU, slug, categoryId, brandId
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name, SKU, slug, category, and brand are required' });
      });

      it('returns 400 when category not found', async () => {
        mockProductFindUnique.mockResolvedValue(null);
        mockCategoryFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/products', {
          method: 'POST',
          body: {
            name: 'Product',
            sku: 'SKU-1',
            slug: 'product',
            categoryId: 'non-existent',
            brandId: 'brand-1',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Category not found' });
      });

      it('returns 400 when brand not found', async () => {
        mockProductFindUnique.mockResolvedValue(null);
        mockCategoryFindUnique.mockResolvedValue({ id: 'cat-1' });
        mockBrandFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/products', {
          method: 'POST',
          body: {
            name: 'Product',
            sku: 'SKU-1',
            slug: 'product',
            categoryId: 'cat-1',
            brandId: 'non-existent',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Brand not found' });
      });
    });

    describe('Conflict (409)', () => {
      it('returns 409 when SKU already exists', async () => {
        mockProductFindUnique.mockResolvedValue({ id: 'existing', sku: 'DUPLICATE' });

        const request = createMockRequest('http://localhost/api/products', {
          method: 'POST',
          body: {
            name: 'Product',
            sku: 'DUPLICATE',
            slug: 'product',
            categoryId: 'cat-1',
            brandId: 'brand-1',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(409);
        expect(data).toEqual({ error: 'A product with this SKU already exists' });
      });

      it('returns 409 when slug already exists', async () => {
        mockProductFindUnique
          .mockResolvedValueOnce(null) // SKU check passes
          .mockResolvedValueOnce({ id: 'existing', slug: 'duplicate-slug' });

        const request = createMockRequest('http://localhost/api/products', {
          method: 'POST',
          body: {
            name: 'Product',
            sku: 'UNIQUE-SKU',
            slug: 'duplicate-slug',
            categoryId: 'cat-1',
            brandId: 'brand-1',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(409);
        expect(data).toEqual({ error: 'A product with this slug already exists' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on creation failure', async () => {
        mockProductFindUnique.mockResolvedValue(null);
        mockCategoryFindUnique.mockResolvedValue({ id: 'cat-1' });
        mockBrandFindUnique.mockResolvedValue({ id: 'brand-1' });
        mockProductCreate.mockRejectedValue(new Error('Create failed'));

        const request = createMockRequest('http://localhost/api/products', {
          method: 'POST',
          body: {
            name: 'Product',
            sku: 'SKU-1',
            slug: 'product',
            categoryId: 'cat-1',
            brandId: 'brand-1',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to create product' });
      });
    });
  });

  describe('GET /api/products/[id]', () => {
    describe('Success (200)', () => {
      it('returns product by ID with relations', async () => {
        const mockProduct = {
          id: 'prod-1',
          sku: 'SKU-001',
          name: 'Test Product',
          price: 99.99,
          compareAtPrice: 129.99,
          category: { id: 'cat-1', name: 'Category', slug: 'category' },
          subcategory: null,
          brand: { id: 'brand-1', name: 'Brand', slug: 'brand', logo: null },
          images: [{ url: '/img.jpg', isPrimary: true }],
          specifications: [{ key: 'weight', label: 'Weight', value: '5kg' }],
          variants: [{ id: 'var-1', name: 'Size L', price: 109.99 }],
        };
        mockProductFindUnique.mockResolvedValue(mockProduct);

        const request = createMockRequest('http://localhost/api/products/prod-1');
        const response = await GET_BY_ID(request, createRouteParams({ id: 'prod-1' }));
        const data = await getResponseJson(response) as { id: string; images: unknown[]; specifications: unknown[] };

        expect(response.status).toBe(200);
        expect(data.id).toBe('prod-1');
        expect(data.images).toHaveLength(1);
        expect(data.specifications).toHaveLength(1);
      });

      it('converts Decimal prices to numbers', async () => {
        mockProductFindUnique.mockResolvedValue({
          id: 'prod-1',
          price: 99.99,
          compareAtPrice: 129.99,
          variants: [{ price: 109.99 }],
        });

        const request = createMockRequest('http://localhost/api/products/prod-1');
        const response = await GET_BY_ID(request, createRouteParams({ id: 'prod-1' }));
        const data = await getResponseJson(response) as { price: number; compareAtPrice: number; variants: { price: number }[] };

        expect(typeof data.price).toBe('number');
        expect(typeof data.compareAtPrice).toBe('number');
        expect(typeof data.variants[0].price).toBe('number');
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when product not found', async () => {
        mockProductFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/products/non-existent');
        const response = await GET_BY_ID(request, createRouteParams({ id: 'non-existent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Product not found' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockProductFindUnique.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/products/prod-1');
        const response = await GET_BY_ID(request, createRouteParams({ id: 'prod-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch product' });
      });
    });
  });

  describe('PATCH /api/products/[id]', () => {
    describe('Success (200)', () => {
      it('updates product fields', async () => {
        const existingProduct = {
          id: 'prod-1',
          sku: 'SKU-001',
          name: 'Old Name',
          slug: 'old-name',
          isPublished: false,
        };
        mockProductFindUnique.mockResolvedValue(existingProduct);
        mockProductUpdate.mockResolvedValue({
          ...existingProduct,
          name: 'New Name',
          price: 149.99,
          variants: [],
        });

        const request = createMockRequest('http://localhost/api/products/prod-1', {
          method: 'PATCH',
          body: { name: 'New Name', price: 149.99 },
        });
        const response = await PATCH(request, createRouteParams({ id: 'prod-1' }));
        const data = await getResponseJson(response) as { name: string };

        expect(response.status).toBe(200);
        expect(data.name).toBe('New Name');
      });

      it('sets publishedAt when publishing', async () => {
        const existingProduct = { id: 'prod-1', isPublished: false };
        mockProductFindUnique.mockResolvedValue(existingProduct);
        mockProductUpdate.mockResolvedValue({
          ...existingProduct,
          isPublished: true,
          publishedAt: new Date(),
          variants: [],
        });

        const request = createMockRequest('http://localhost/api/products/prod-1', {
          method: 'PATCH',
          body: { isPublished: true },
        });
        await PATCH(request, createRouteParams({ id: 'prod-1' }));

        expect(mockProductUpdate).toHaveBeenCalledWith({
          where: { id: 'prod-1' },
          data: expect.objectContaining({
            isPublished: true,
            publishedAt: expect.any(Date),
          }),
          include: expect.any(Object),
        });
      });

      it('clears publishedAt when unpublishing', async () => {
        const existingProduct = { id: 'prod-1', isPublished: true };
        mockProductFindUnique.mockResolvedValue(existingProduct);
        mockProductUpdate.mockResolvedValue({
          ...existingProduct,
          isPublished: false,
          publishedAt: null,
          variants: [],
        });

        const request = createMockRequest('http://localhost/api/products/prod-1', {
          method: 'PATCH',
          body: { isPublished: false },
        });
        await PATCH(request, createRouteParams({ id: 'prod-1' }));

        expect(mockProductUpdate).toHaveBeenCalledWith({
          where: { id: 'prod-1' },
          data: expect.objectContaining({
            isPublished: false,
            publishedAt: null,
          }),
          include: expect.any(Object),
        });
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when product not found', async () => {
        mockProductFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/products/non-existent', {
          method: 'PATCH',
          body: { name: 'New Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'non-existent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Product not found' });
      });
    });

    describe('Conflict (409)', () => {
      it('returns 409 when SKU already exists', async () => {
        const existingProduct = { id: 'prod-1', sku: 'SKU-001' };
        const conflictingProduct = { id: 'prod-2', sku: 'DUPLICATE' };
        mockProductFindUnique
          .mockResolvedValueOnce(existingProduct)
          .mockResolvedValueOnce(conflictingProduct);

        const request = createMockRequest('http://localhost/api/products/prod-1', {
          method: 'PATCH',
          body: { sku: 'DUPLICATE' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'prod-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(409);
        expect(data).toEqual({ error: 'A product with this SKU already exists' });
      });

      it('returns 409 when slug already exists', async () => {
        const existingProduct = { id: 'prod-1', slug: 'product-1' };
        mockProductFindUnique
          .mockResolvedValueOnce(existingProduct) // Find existing product
          .mockResolvedValueOnce({ id: 'prod-2', slug: 'duplicate' }); // Slug duplicate check

        const request = createMockRequest('http://localhost/api/products/prod-1', {
          method: 'PATCH',
          body: { slug: 'duplicate' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'prod-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(409);
        expect(data).toEqual({ error: 'A product with this slug already exists' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on update failure', async () => {
        mockProductFindUnique.mockResolvedValue({ id: 'prod-1' });
        mockProductUpdate.mockRejectedValue(new Error('Update failed'));

        const request = createMockRequest('http://localhost/api/products/prod-1', {
          method: 'PATCH',
          body: { name: 'New Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'prod-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to update product' });
      });
    });
  });

  describe('DELETE /api/products/[id]', () => {
    describe('Success (200)', () => {
      it('deletes product without orders', async () => {
        mockProductFindUnique.mockResolvedValue({
          id: 'prod-1',
          _count: { orderItems: 0, quoteItems: 0 },
        });
        mockProductDelete.mockResolvedValue({ id: 'prod-1' });

        const request = createMockRequest('http://localhost/api/products/prod-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'prod-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data).toEqual({ success: true });
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when product not found', async () => {
        mockProductFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/products/non-existent', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'non-existent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Product not found' });
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when product has orders', async () => {
        mockProductFindUnique.mockResolvedValue({
          id: 'prod-1',
          _count: { orderItems: 5, quoteItems: 0 },
        });

        const request = createMockRequest('http://localhost/api/products/prod-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'prod-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({
          error: 'Cannot delete product that has been ordered. Consider unpublishing instead.',
        });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on deletion failure', async () => {
        mockProductFindUnique.mockResolvedValue({
          id: 'prod-1',
          _count: { orderItems: 0, quoteItems: 0 },
        });
        mockProductDelete.mockRejectedValue(new Error('Delete failed'));

        const request = createMockRequest('http://localhost/api/products/prod-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'prod-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to delete product' });
      });
    });
  });
});
