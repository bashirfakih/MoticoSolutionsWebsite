/**
 * Testimonial by ID API Tests
 *
 * Tests for PATCH and DELETE /api/cms/testimonials/[id]
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../../../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../../../helpers/testHelpers';

// Mock Prisma
const mockTestimonialUpdate = jest.fn();
const mockTestimonialDelete = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    testimonial: {
      update: (...args: unknown[]) => mockTestimonialUpdate(...args),
      delete: (...args: unknown[]) => mockTestimonialDelete(...args),
    },
  },
}));

// Mock auth
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Import route handlers after mocks
import { PATCH, DELETE } from '@/app/api/cms/testimonials/[id]/route';

describe('Testimonial by ID API - PATCH', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a testimonial when admin authenticated', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };
    const updateData = { quote: 'Updated quote text', rating: 4 };

    const updatedTestimonial = {
      id: 'testimonial-1',
      customerName: 'John Doe',
      role: 'CEO',
      company: 'Tech Corp',
      quote: 'Updated quote text',
      image: null,
      rating: 4,
      sortOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetCurrentUser.mockResolvedValueOnce(mockUser);
    mockTestimonialUpdate.mockResolvedValueOnce(updatedTestimonial);

    const request = createMockRequest('http://localhost:3000/api/cms/testimonials/testimonial-1', {
      method: 'PATCH',
      body: updateData,
    });

    const response = await PATCH(request as any, createRouteParams({ id: 'testimonial-1' }));
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data).toEqual(updatedTestimonial);
  });

  it('should return 401 when user is not admin', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const request = createMockRequest('http://localhost:3000/api/cms/testimonials/testimonial-1', {
      method: 'PATCH',
      body: { rating: 5 },
    });

    const response = await PATCH(request as any, createRouteParams({ id: 'testimonial-1' }));
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});

describe('Testimonial by ID API - DELETE', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a testimonial when admin authenticated', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };

    mockGetCurrentUser.mockResolvedValueOnce(mockUser);
    mockTestimonialDelete.mockResolvedValueOnce({});

    const request = createMockRequest('http://localhost:3000/api/cms/testimonials/testimonial-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request as any, createRouteParams({ id: 'testimonial-1' }));
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 401 when user is not admin', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const request = createMockRequest('http://localhost:3000/api/cms/testimonials/testimonial-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request as any, createRouteParams({ id: 'testimonial-1' }));
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
