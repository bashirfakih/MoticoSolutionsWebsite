/**
 * Hero Slide by ID API Tests
 *
 * Tests for PATCH and DELETE /api/cms/hero-slides/[id]
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../../../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../../../helpers/testHelpers';

// Mock Prisma
const mockHeroSlideUpdate = jest.fn();
const mockHeroSlideDelete = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    heroSlide: {
      update: (...args: unknown[]) => mockHeroSlideUpdate(...args),
      delete: (...args: unknown[]) => mockHeroSlideDelete(...args),
    },
  },
}));

// Mock auth
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Import route handlers after mocks
import { PATCH, DELETE } from '@/app/api/cms/hero-slides/[id]/route';

describe('Hero Slide by ID API - PATCH', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a hero slide when admin authenticated', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };
    const updateData = { title: 'Updated Title', accentColor: '#004D8B' };

    const updatedSlide = {
      id: 'slide-1',
      ...updateData,
      subtitle: null,
      tag: 'TAG',
      image: '/slide.png',
      ctaText: null,
      ctaLink: null,
      sortOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetCurrentUser.mockResolvedValueOnce(mockUser);
    mockHeroSlideUpdate.mockResolvedValueOnce(updatedSlide);

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides/slide-1', {
      method: 'PATCH',
      body: updateData,
    });

    const response = await PATCH(request as any, createRouteParams({ id: 'slide-1' }));
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data).toEqual(updatedSlide);
  });

  it('should return 401 when user is not admin', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides/slide-1', {
      method: 'PATCH',
      body: { title: 'Updated' },
    });

    const response = await PATCH(request as any, createRouteParams({ id: 'slide-1' }));
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});

describe('Hero Slide by ID API - DELETE', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a hero slide when admin authenticated', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };

    mockGetCurrentUser.mockResolvedValueOnce(mockUser);
    mockHeroSlideDelete.mockResolvedValueOnce({});

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides/slide-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request as any, createRouteParams({ id: 'slide-1' }));
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 401 when user is not admin', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides/slide-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request as any, createRouteParams({ id: 'slide-1' }));
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
