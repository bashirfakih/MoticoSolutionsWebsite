/**
 * Brands API Route Tests
 *
 * Tests for /api/brands and /api/brands/[id] endpoints
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockBrandFindMany = jest.fn();
const mockBrandFindUnique = jest.fn();
const mockBrandCreate = jest.fn();
const mockBrandUpdate = jest.fn();
const mockBrandDelete = jest.fn();
const mockBrandCount = jest.fn();
const mockBrandAggregate = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    brand: {
      findMany: (...args: unknown[]) => mockBrandFindMany(...args),
      findUnique: (...args: unknown[]) => mockBrandFindUnique(...args),
      create: (...args: unknown[]) => mockBrandCreate(...args),
      update: (...args: unknown[]) => mockBrandUpdate(...args),
      delete: (...args: unknown[]) => mockBrandDelete(...args),
      count: (...args: unknown[]) => mockBrandCount(...args),
      aggregate: (...args: unknown[]) => mockBrandAggregate(...args),
    },
  },
}));

// Mock generateSlug
jest.mock('@/lib/data/types', () => ({
  generateSlug: (name: string) => name.toLowerCase().replace(/\s+/g, '-'),
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/brands/route';
import {
  GET as GET_BY_ID,
  PATCH,
  DELETE,
} from '@/app/api/brands/[id]/route';

describe('Brands API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBrandAggregate.mockResolvedValue({ _max: { sortOrder: 0 } });
  });

  describe('GET /api/brands', () => {
    describe('Success (200)', () => {
      it('returns paginated brands list', async () => {
        const mockBrands = [
          { id: 'brand-1', name: 'Brand A', slug: 'brand-a', isActive: true, sortOrder: 1 },
          { id: 'brand-2', name: 'Brand B', slug: 'brand-b', isActive: true, sortOrder: 2 },
        ];
        mockBrandFindMany.mockResolvedValue(mockBrands);
        mockBrandCount.mockResolvedValue(2);

        const request = createMockRequest('http://localhost/api/brands');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: unknown[]; total: number };

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(2);
        expect(data.total).toBe(2);
      });

      it('supports pagination parameters', async () => {
        mockBrandFindMany.mockResolvedValue([]);
        mockBrandCount.mockResolvedValue(50);

        const request = createMockRequest('http://localhost/api/brands?page=2&limit=10');
        const response = await GET(request);
        const data = await getResponseJson(response) as { page: number; limit: number; totalPages: number };

        expect(response.status).toBe(200);
        expect(data.page).toBe(2);
        expect(data.limit).toBe(10);
        expect(data.totalPages).toBe(5);
      });

      it('filters by active status', async () => {
        mockBrandFindMany.mockResolvedValue([{ id: 'brand-1', name: 'Active Brand', isActive: true }]);
        mockBrandCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/brands?active=true');
        await GET(request);

        expect(mockBrandFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isActive: true }),
          })
        );
      });

      it('filters by search query', async () => {
        mockBrandFindMany.mockResolvedValue([]);
        mockBrandCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/brands?search=test');
        await GET(request);

        expect(mockBrandFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                { name: { contains: 'test', mode: 'insensitive' } },
                { description: { contains: 'test', mode: 'insensitive' } },
              ]),
            }),
          })
        );
      });

      it('supports sorting', async () => {
        mockBrandFindMany.mockResolvedValue([]);
        mockBrandCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/brands?sortBy=name&sortOrder=desc');
        await GET(request);

        expect(mockBrandFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { name: 'desc' },
          })
        );
      });

      it('returns hasMore indicator', async () => {
        mockBrandFindMany.mockResolvedValue([{ id: 'brand-1' }]);
        mockBrandCount.mockResolvedValue(25);

        const request = createMockRequest('http://localhost/api/brands?page=1&limit=10');
        const response = await GET(request);
        const data = await getResponseJson(response) as { hasMore: boolean };

        expect(data.hasMore).toBe(true);
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockBrandFindMany.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/brands');
        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch brands' });
      });
    });
  });

  describe('POST /api/brands', () => {
    describe('Success (201)', () => {
      it('creates a new brand', async () => {
        const newBrand = {
          id: 'brand-new',
          name: 'New Brand',
          slug: 'new-brand',
          isActive: true,
          sortOrder: 1,
        };
        mockBrandFindUnique.mockResolvedValue(null);
        mockBrandCreate.mockResolvedValue(newBrand);

        const request = createMockRequest('http://localhost/api/brands', {
          method: 'POST',
          body: { name: 'New Brand' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response) as { id: string };

        expect(response.status).toBe(201);
        expect(data.id).toBe('brand-new');
      });

      it('generates slug from name if not provided', async () => {
        mockBrandFindUnique.mockResolvedValue(null);
        mockBrandCreate.mockResolvedValue({ id: 'brand-1', name: 'Test Brand', slug: 'test-brand' });

        const request = createMockRequest('http://localhost/api/brands', {
          method: 'POST',
          body: { name: 'Test Brand' },
        });
        await POST(request);

        expect(mockBrandCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({ slug: 'test-brand' }),
        });
      });

      it('uses provided slug if given', async () => {
        mockBrandFindUnique.mockResolvedValue(null);
        mockBrandCreate.mockResolvedValue({ id: 'brand-1', name: 'Test', slug: 'custom-slug' });

        const request = createMockRequest('http://localhost/api/brands', {
          method: 'POST',
          body: { name: 'Test', slug: 'custom-slug' },
        });
        await POST(request);

        expect(mockBrandCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({ slug: 'custom-slug' }),
        });
      });

      it('auto-increments sort order', async () => {
        mockBrandFindUnique.mockResolvedValue(null);
        mockBrandAggregate.mockResolvedValue({ _max: { sortOrder: 5 } });
        mockBrandCreate.mockResolvedValue({ id: 'brand-1', sortOrder: 6 });

        const request = createMockRequest('http://localhost/api/brands', {
          method: 'POST',
          body: { name: 'New Brand' },
        });
        await POST(request);

        expect(mockBrandCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({ sortOrder: 6 }),
        });
      });

      it('creates brand with all optional fields', async () => {
        mockBrandFindUnique.mockResolvedValue(null);
        mockBrandCreate.mockResolvedValue({
          id: 'brand-1',
          name: 'Full Brand',
          slug: 'full-brand',
          logo: '/logo.png',
          description: 'Brand description',
          website: 'https://brand.com',
          countryOfOrigin: 'USA',
          isActive: false,
          sortOrder: 10,
        });

        const request = createMockRequest('http://localhost/api/brands', {
          method: 'POST',
          body: {
            name: 'Full Brand',
            logo: '/logo.png',
            description: 'Brand description',
            website: 'https://brand.com',
            countryOfOrigin: 'USA',
            isActive: false,
            sortOrder: 10,
          },
        });
        const response = await POST(request);

        expect(response.status).toBe(201);
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 for duplicate slug', async () => {
        mockBrandFindUnique.mockResolvedValue({ id: 'existing', slug: 'test-brand' });

        const request = createMockRequest('http://localhost/api/brands', {
          method: 'POST',
          body: { name: 'Test Brand' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'A brand with slug "test-brand" already exists' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on creation failure', async () => {
        mockBrandFindUnique.mockResolvedValue(null);
        mockBrandCreate.mockRejectedValue(new Error('Create failed'));

        const request = createMockRequest('http://localhost/api/brands', {
          method: 'POST',
          body: { name: 'Test Brand' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to create brand' });
      });
    });
  });

  describe('GET /api/brands/[id]', () => {
    describe('Success (200)', () => {
      it('returns brand by ID', async () => {
        const mockBrand = {
          id: 'brand-1',
          name: 'Test Brand',
          slug: 'test-brand',
          _count: { products: 5 },
        };
        mockBrandFindUnique.mockResolvedValue(mockBrand);

        const request = createMockRequest('http://localhost/api/brands/brand-1');
        const response = await GET_BY_ID(request, createRouteParams({ id: 'brand-1' }));
        const data = await getResponseJson(response) as { id: string; name: string };

        expect(response.status).toBe(200);
        expect(data.id).toBe('brand-1');
        expect(data.name).toBe('Test Brand');
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when brand not found', async () => {
        mockBrandFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/brands/non-existent');
        const response = await GET_BY_ID(request, createRouteParams({ id: 'non-existent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Brand not found' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockBrandFindUnique.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/brands/brand-1');
        const response = await GET_BY_ID(request, createRouteParams({ id: 'brand-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch brand' });
      });
    });
  });

  describe('PATCH /api/brands/[id]', () => {
    describe('Success (200)', () => {
      it('updates brand name', async () => {
        const existingBrand = { id: 'brand-1', name: 'Old Name', slug: 'old-name' };
        const updatedBrand = { ...existingBrand, name: 'New Name', slug: 'new-name' };
        mockBrandFindUnique
          .mockResolvedValueOnce(existingBrand)
          .mockResolvedValueOnce(null); // slug check
        mockBrandUpdate.mockResolvedValue(updatedBrand);

        const request = createMockRequest('http://localhost/api/brands/brand-1', {
          method: 'PATCH',
          body: { name: 'New Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'brand-1' }));
        const data = await getResponseJson(response) as { name: string };

        expect(response.status).toBe(200);
        expect(data.name).toBe('New Name');
      });

      it('updates slug automatically when name changes', async () => {
        const existingBrand = { id: 'brand-1', name: 'Old', slug: 'old' };
        mockBrandFindUnique
          .mockResolvedValueOnce(existingBrand)
          .mockResolvedValueOnce(null);
        mockBrandUpdate.mockResolvedValue({ ...existingBrand, name: 'New Name', slug: 'new-name' });

        const request = createMockRequest('http://localhost/api/brands/brand-1', {
          method: 'PATCH',
          body: { name: 'New Name' },
        });
        await PATCH(request, createRouteParams({ id: 'brand-1' }));

        expect(mockBrandUpdate).toHaveBeenCalledWith({
          where: { id: 'brand-1' },
          data: expect.objectContaining({ slug: 'new-name' }),
        });
      });

      it('updates only specified fields', async () => {
        const existingBrand = { id: 'brand-1', name: 'Brand', slug: 'brand', isActive: true };
        mockBrandFindUnique.mockResolvedValue(existingBrand);
        mockBrandUpdate.mockResolvedValue({ ...existingBrand, isActive: false });

        const request = createMockRequest('http://localhost/api/brands/brand-1', {
          method: 'PATCH',
          body: { isActive: false },
        });
        const response = await PATCH(request, createRouteParams({ id: 'brand-1' }));

        expect(response.status).toBe(200);
        expect(mockBrandUpdate).toHaveBeenCalledWith({
          where: { id: 'brand-1' },
          data: expect.objectContaining({ isActive: false }),
        });
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when brand not found', async () => {
        mockBrandFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/brands/non-existent', {
          method: 'PATCH',
          body: { name: 'New Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'non-existent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Brand not found' });
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when slug already exists', async () => {
        const existingBrand = { id: 'brand-1', name: 'Brand A', slug: 'brand-a' };
        const conflictingBrand = { id: 'brand-2', name: 'Brand B', slug: 'brand-b' };
        mockBrandFindUnique
          .mockResolvedValueOnce(existingBrand)
          .mockResolvedValueOnce(conflictingBrand);

        const request = createMockRequest('http://localhost/api/brands/brand-1', {
          method: 'PATCH',
          body: { name: 'Brand B' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'brand-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'A brand with slug "brand-b" already exists' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on update failure', async () => {
        mockBrandFindUnique.mockResolvedValue({ id: 'brand-1', slug: 'brand' });
        mockBrandUpdate.mockRejectedValue(new Error('Update failed'));

        const request = createMockRequest('http://localhost/api/brands/brand-1', {
          method: 'PATCH',
          body: { isActive: false },
        });
        const response = await PATCH(request, createRouteParams({ id: 'brand-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to update brand' });
      });
    });
  });

  describe('DELETE /api/brands/[id]', () => {
    describe('Success (200)', () => {
      it('deletes brand without products', async () => {
        mockBrandFindUnique.mockResolvedValue({
          id: 'brand-1',
          name: 'Brand',
          _count: { products: 0 },
        });
        mockBrandDelete.mockResolvedValue({ id: 'brand-1' });

        const request = createMockRequest('http://localhost/api/brands/brand-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'brand-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data).toEqual({ success: true });
        expect(mockBrandDelete).toHaveBeenCalledWith({ where: { id: 'brand-1' } });
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when brand not found', async () => {
        mockBrandFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/brands/non-existent', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'non-existent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Brand not found' });
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when brand has products', async () => {
        mockBrandFindUnique.mockResolvedValue({
          id: 'brand-1',
          name: 'Brand',
          _count: { products: 5 },
        });

        const request = createMockRequest('http://localhost/api/brands/brand-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'brand-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({
          error: 'Cannot delete brand with 5 products. Remove or reassign products first.',
        });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on deletion failure', async () => {
        mockBrandFindUnique.mockResolvedValue({
          id: 'brand-1',
          _count: { products: 0 },
        });
        mockBrandDelete.mockRejectedValue(new Error('Delete failed'));

        const request = createMockRequest('http://localhost/api/brands/brand-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'brand-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to delete brand' });
      });
    });
  });
});
