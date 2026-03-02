/**
 * Categories API Route Tests
 *
 * Tests for /api/categories and /api/categories/[id] endpoints
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockCategoryFindMany = jest.fn();
const mockCategoryFindUnique = jest.fn();
const mockCategoryCreate = jest.fn();
const mockCategoryUpdate = jest.fn();
const mockCategoryDelete = jest.fn();
const mockCategoryCount = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    category: {
      findMany: (...args: unknown[]) => mockCategoryFindMany(...args),
      findUnique: (...args: unknown[]) => mockCategoryFindUnique(...args),
      create: (...args: unknown[]) => mockCategoryCreate(...args),
      update: (...args: unknown[]) => mockCategoryUpdate(...args),
      delete: (...args: unknown[]) => mockCategoryDelete(...args),
      count: (...args: unknown[]) => mockCategoryCount(...args),
    },
  },
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/categories/route';
import {
  GET as GET_BY_ID,
  PATCH,
  PUT,
  DELETE,
} from '@/app/api/categories/[id]/route';

describe('Categories API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    describe('Success (200)', () => {
      it('returns paginated categories list', async () => {
        const mockCategories = [
          { id: 'cat-1', name: 'Category A', slug: 'category-a', parent: null, _count: { children: 0, products: 5 } },
          { id: 'cat-2', name: 'Category B', slug: 'category-b', parent: null, _count: { children: 2, products: 10 } },
        ];
        mockCategoryFindMany.mockResolvedValue(mockCategories);
        mockCategoryCount.mockResolvedValue(2);

        const request = createMockRequest('http://localhost/api/categories');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: unknown[]; total: number };

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(2);
        expect(data.total).toBe(2);
      });

      it('returns tree structure when tree=true', async () => {
        const mockTree = [
          {
            id: 'cat-1',
            name: 'Parent',
            slug: 'parent',
            children: [
              { id: 'cat-1-1', name: 'Child', slug: 'child', children: [] },
            ],
          },
        ];
        mockCategoryFindMany.mockResolvedValue(mockTree);

        const request = createMockRequest('http://localhost/api/categories?tree=true');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: { children: unknown[] }[] };

        expect(response.status).toBe(200);
        expect(data.data[0].children).toHaveLength(1);
      });

      it('filters by active status', async () => {
        mockCategoryFindMany.mockResolvedValue([]);
        mockCategoryCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/categories?active=true');
        await GET(request);

        expect(mockCategoryFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isActive: true }),
          })
        );
      });

      it('filters by parentId', async () => {
        mockCategoryFindMany.mockResolvedValue([]);
        mockCategoryCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/categories?parentId=parent-1');
        await GET(request);

        expect(mockCategoryFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ parentId: 'parent-1' }),
          })
        );
      });

      it('filters by parentId=null for root categories', async () => {
        mockCategoryFindMany.mockResolvedValue([]);
        mockCategoryCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/categories?parentId=null');
        await GET(request);

        expect(mockCategoryFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ parentId: null }),
          })
        );
      });

      it('searches by name, slug, and description', async () => {
        mockCategoryFindMany.mockResolvedValue([]);
        mockCategoryCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/categories?search=power+tools');
        await GET(request);

        expect(mockCategoryFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                { name: { contains: 'power tools', mode: 'insensitive' } },
                { slug: { contains: 'power tools', mode: 'insensitive' } },
                { description: { contains: 'power tools', mode: 'insensitive' } },
              ]),
            }),
          })
        );
      });

      it('supports pagination', async () => {
        mockCategoryFindMany.mockResolvedValue([]);
        mockCategoryCount.mockResolvedValue(100);

        const request = createMockRequest('http://localhost/api/categories?page=3&limit=20');
        const response = await GET(request);
        const data = await getResponseJson(response) as { page: number; limit: number; totalPages: number };

        expect(data.page).toBe(3);
        expect(data.limit).toBe(20);
        expect(data.totalPages).toBe(5);
      });

      it('supports sorting', async () => {
        mockCategoryFindMany.mockResolvedValue([]);
        mockCategoryCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/categories?sortBy=name&sortOrder=desc');
        await GET(request);

        expect(mockCategoryFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { name: 'desc' },
          })
        );
      });

      it('transforms _count to named properties', async () => {
        mockCategoryFindMany.mockResolvedValue([
          { id: 'cat-1', name: 'Cat', parent: null, _count: { children: 3, products: 15 } },
        ]);
        mockCategoryCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/categories');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: { childrenCount: number; productCount: number; _count?: unknown }[] };

        expect(data.data[0].childrenCount).toBe(3);
        expect(data.data[0].productCount).toBe(15);
        expect(data.data[0]._count).toBeUndefined();
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockCategoryFindMany.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/categories');
        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch categories' });
      });
    });
  });

  describe('POST /api/categories', () => {
    describe('Success (201)', () => {
      it('creates a new root category', async () => {
        const newCategory = {
          id: 'cat-new',
          name: 'New Category',
          slug: 'new-category',
          parentId: null,
          isActive: true,
        };
        mockCategoryFindUnique.mockResolvedValue(null); // No duplicate slug
        mockCategoryCreate.mockResolvedValue(newCategory);

        const request = createMockRequest('http://localhost/api/categories', {
          method: 'POST',
          body: { name: 'New Category', slug: 'new-category' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response) as { id: string };

        expect(response.status).toBe(201);
        expect(data.id).toBe('cat-new');
      });

      it('creates a subcategory with parent', async () => {
        const parentCategory = { id: 'parent-1', name: 'Parent' };
        mockCategoryFindUnique
          .mockResolvedValueOnce(null) // No duplicate slug
          .mockResolvedValueOnce(parentCategory); // Parent exists
        mockCategoryCreate.mockResolvedValue({
          id: 'cat-child',
          name: 'Child Category',
          slug: 'child-category',
          parentId: 'parent-1',
          parent: parentCategory,
        });

        const request = createMockRequest('http://localhost/api/categories', {
          method: 'POST',
          body: { name: 'Child Category', slug: 'child-category', parentId: 'parent-1' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response) as { parentId: string };

        expect(response.status).toBe(201);
        expect(data.parentId).toBe('parent-1');
      });

      it('creates category with all fields', async () => {
        mockCategoryFindUnique.mockResolvedValue(null);
        mockCategoryCreate.mockResolvedValue({
          id: 'cat-full',
          name: 'Full Category',
          slug: 'full-category',
          description: 'Description here',
          image: '/image.jpg',
          parentId: null,
          sortOrder: 5,
          isActive: false,
        });

        const request = createMockRequest('http://localhost/api/categories', {
          method: 'POST',
          body: {
            name: 'Full Category',
            slug: 'full-category',
            description: 'Description here',
            image: '/image.jpg',
            sortOrder: 5,
            isActive: false,
          },
        });
        const response = await POST(request);

        expect(response.status).toBe(201);
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when name is missing', async () => {
        const request = createMockRequest('http://localhost/api/categories', {
          method: 'POST',
          body: { slug: 'test-category' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name and slug are required' });
      });

      it('returns 400 when slug is missing', async () => {
        const request = createMockRequest('http://localhost/api/categories', {
          method: 'POST',
          body: { name: 'Test Category' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name and slug are required' });
      });

      it('returns 400 when parent does not exist', async () => {
        mockCategoryFindUnique
          .mockResolvedValueOnce(null) // No duplicate slug
          .mockResolvedValueOnce(null); // Parent not found

        const request = createMockRequest('http://localhost/api/categories', {
          method: 'POST',
          body: { name: 'Test', slug: 'test', parentId: 'non-existent' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Parent category not found' });
      });
    });

    describe('Conflict (409)', () => {
      it('returns 409 when slug already exists', async () => {
        mockCategoryFindUnique.mockResolvedValue({ id: 'existing', slug: 'test-slug' });

        const request = createMockRequest('http://localhost/api/categories', {
          method: 'POST',
          body: { name: 'Test', slug: 'test-slug' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(409);
        expect(data).toEqual({ error: 'A category with this slug already exists' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on creation failure', async () => {
        mockCategoryFindUnique.mockResolvedValue(null);
        mockCategoryCreate.mockRejectedValue(new Error('Create failed'));

        const request = createMockRequest('http://localhost/api/categories', {
          method: 'POST',
          body: { name: 'Test', slug: 'test' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to create category' });
      });
    });
  });

  describe('GET /api/categories/[id]', () => {
    describe('Success (200)', () => {
      it('returns category by ID with children', async () => {
        const mockCategory = {
          id: 'cat-1',
          name: 'Parent Category',
          slug: 'parent-category',
          parent: null,
          children: [
            { id: 'cat-1-1', name: 'Child 1', slug: 'child-1', isActive: true },
            { id: 'cat-1-2', name: 'Child 2', slug: 'child-2', isActive: true },
          ],
          _count: { products: 10 },
        };
        mockCategoryFindUnique.mockResolvedValue(mockCategory);

        const request = createMockRequest('http://localhost/api/categories/cat-1');
        const response = await GET_BY_ID(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response) as { id: string; children: unknown[]; productCount: number };

        expect(response.status).toBe(200);
        expect(data.id).toBe('cat-1');
        expect(data.children).toHaveLength(2);
        expect(data.productCount).toBe(10);
      });

      it('returns category with parent reference', async () => {
        const mockCategory = {
          id: 'cat-child',
          name: 'Child Category',
          slug: 'child-category',
          parent: { id: 'cat-parent', name: 'Parent', slug: 'parent' },
          children: [],
          _count: { products: 0 },
        };
        mockCategoryFindUnique.mockResolvedValue(mockCategory);

        const request = createMockRequest('http://localhost/api/categories/cat-child');
        const response = await GET_BY_ID(request, createRouteParams({ id: 'cat-child' }));
        const data = await getResponseJson(response) as { parent: { id: string } };

        expect(response.status).toBe(200);
        expect(data.parent.id).toBe('cat-parent');
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when category not found', async () => {
        mockCategoryFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/categories/non-existent');
        const response = await GET_BY_ID(request, createRouteParams({ id: 'non-existent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Category not found' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockCategoryFindUnique.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/categories/cat-1');
        const response = await GET_BY_ID(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch category' });
      });
    });
  });

  describe('PATCH /api/categories/[id]', () => {
    describe('Success (200)', () => {
      it('updates category name', async () => {
        const existingCategory = { id: 'cat-1', name: 'Old Name', slug: 'old-name' };
        mockCategoryFindUnique
          .mockResolvedValueOnce(existingCategory);
        mockCategoryUpdate.mockResolvedValue({ ...existingCategory, name: 'New Name' });

        const request = createMockRequest('http://localhost/api/categories/cat-1', {
          method: 'PATCH',
          body: { name: 'New Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response) as { name: string };

        expect(response.status).toBe(200);
        expect(data.name).toBe('New Name');
      });

      it('updates parent reference', async () => {
        const existingCategory = { id: 'cat-1', name: 'Cat', slug: 'cat', parentId: null };
        const newParent = { id: 'parent-new', name: 'New Parent' };
        mockCategoryFindUnique
          .mockResolvedValueOnce(existingCategory)
          .mockResolvedValueOnce(newParent);
        mockCategoryFindMany.mockResolvedValue([]); // No descendants
        mockCategoryUpdate.mockResolvedValue({ ...existingCategory, parentId: 'parent-new' });

        const request = createMockRequest('http://localhost/api/categories/cat-1', {
          method: 'PATCH',
          body: { parentId: 'parent-new' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cat-1' }));

        expect(response.status).toBe(200);
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when category not found', async () => {
        mockCategoryFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/categories/non-existent', {
          method: 'PATCH',
          body: { name: 'New Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'non-existent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Category not found' });
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when setting self as parent', async () => {
        const existingCategory = { id: 'cat-1', name: 'Cat', slug: 'cat' };
        mockCategoryFindUnique.mockResolvedValue(existingCategory);

        const request = createMockRequest('http://localhost/api/categories/cat-1', {
          method: 'PATCH',
          body: { parentId: 'cat-1' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Category cannot be its own parent' });
      });

      it('returns 400 when setting descendant as parent', async () => {
        const existingCategory = { id: 'cat-1', name: 'Cat', slug: 'cat' };
        const descendant = { id: 'cat-1-1' };
        mockCategoryFindUnique.mockResolvedValue(existingCategory);
        mockCategoryFindMany.mockResolvedValue([descendant]); // Returns descendants

        const request = createMockRequest('http://localhost/api/categories/cat-1', {
          method: 'PATCH',
          body: { parentId: 'cat-1-1' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Cannot set a descendant as parent' });
      });

      it('returns 400 when parent not found', async () => {
        const existingCategory = { id: 'cat-1', name: 'Cat', slug: 'cat' };
        mockCategoryFindUnique
          .mockResolvedValueOnce(existingCategory)
          .mockResolvedValueOnce(null); // Parent not found
        mockCategoryFindMany.mockResolvedValue([]); // No descendants

        const request = createMockRequest('http://localhost/api/categories/cat-1', {
          method: 'PATCH',
          body: { parentId: 'non-existent-parent' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Parent category not found' });
      });
    });

    describe('Conflict (409)', () => {
      it('returns 409 when slug already exists', async () => {
        const existingCategory = { id: 'cat-1', name: 'Cat', slug: 'cat' };
        const conflictingCategory = { id: 'cat-2', slug: 'other-cat' };
        mockCategoryFindUnique
          .mockResolvedValueOnce(existingCategory)
          .mockResolvedValueOnce(conflictingCategory);

        const request = createMockRequest('http://localhost/api/categories/cat-1', {
          method: 'PATCH',
          body: { slug: 'other-cat' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(409);
        expect(data).toEqual({ error: 'A category with this slug already exists' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on update failure', async () => {
        mockCategoryFindUnique.mockResolvedValue({ id: 'cat-1', slug: 'cat' });
        mockCategoryUpdate.mockRejectedValue(new Error('Update failed'));

        const request = createMockRequest('http://localhost/api/categories/cat-1', {
          method: 'PATCH',
          body: { isActive: false },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to update category' });
      });
    });
  });

  describe('PUT /api/categories/[id]', () => {
    it('updates category (same as PATCH)', async () => {
      const existingCategory = { id: 'cat-1', name: 'Old', slug: 'old' };
      mockCategoryFindUnique.mockResolvedValue(existingCategory);
      mockCategoryUpdate.mockResolvedValue({ ...existingCategory, name: 'New' });

      const request = createMockRequest('http://localhost/api/categories/cat-1', {
        method: 'PUT',
        body: { name: 'New' },
      });
      const response = await PUT(request, createRouteParams({ id: 'cat-1' }));

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/categories/[id]', () => {
    describe('Success (200)', () => {
      it('deletes empty category', async () => {
        mockCategoryFindUnique.mockResolvedValue({
          id: 'cat-1',
          name: 'Category',
          _count: { children: 0, products: 0 },
        });
        mockCategoryDelete.mockResolvedValue({ id: 'cat-1' });

        const request = createMockRequest('http://localhost/api/categories/cat-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data).toEqual({ success: true });
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when category not found', async () => {
        mockCategoryFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/categories/non-existent', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'non-existent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Category not found' });
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when category has children', async () => {
        mockCategoryFindUnique.mockResolvedValue({
          id: 'cat-1',
          name: 'Category',
          _count: { children: 3, products: 0 },
        });

        const request = createMockRequest('http://localhost/api/categories/cat-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({
          error: 'Cannot delete category with subcategories. Move or delete children first.',
        });
      });

      it('returns 400 when category has products', async () => {
        mockCategoryFindUnique.mockResolvedValue({
          id: 'cat-1',
          name: 'Category',
          _count: { children: 0, products: 10 },
        });

        const request = createMockRequest('http://localhost/api/categories/cat-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({
          error: 'Cannot delete category with products. Move products first.',
        });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on deletion failure', async () => {
        mockCategoryFindUnique.mockResolvedValue({
          id: 'cat-1',
          _count: { children: 0, products: 0 },
        });
        mockCategoryDelete.mockRejectedValue(new Error('Delete failed'));

        const request = createMockRequest('http://localhost/api/categories/cat-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'cat-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to delete category' });
      });
    });
  });
});
