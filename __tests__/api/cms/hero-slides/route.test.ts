/**
 * Hero Slides API Tests
 *
 * Tests for GET and POST /api/cms/hero-slides
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../../helpers/testHelpers';

// Mock Prisma
const mockHeroSlideFindMany = jest.fn();
const mockHeroSlideCreate = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    heroSlide: {
      findMany: (...args: unknown[]) => mockHeroSlideFindMany(...args),
      create: (...args: unknown[]) => mockHeroSlideCreate(...args),
    },
  },
}));

// Mock auth
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Mock image optimizer - return path as-is for simpler testing
jest.mock('@/lib/utils/imageOptimizer', () => ({
  toUrlPath: (path: string) => path,
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/cms/hero-slides/route';

describe('Hero Slides API - GET /api/cms/hero-slides', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all active hero slides ordered by sortOrder', async () => {
    const mockSlides = [
      {
        id: 'slide-1',
        title: 'Test Slide 1',
        subtitle: 'Subtitle 1',
        tag: 'TAG1',
        image: '/slide-1.png',
        ctaText: 'Learn More',
        ctaLink: '/products',
        accentColor: '#bb0c15',
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockHeroSlideFindMany.mockResolvedValueOnce(mockSlides);

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides');
    const response = await GET(request as any);
    const data = await getResponseJson(response) as Array<{ id: string; title: string; image: string }>;

    expect(response.status).toBe(200);
    expect(data[0].id).toBe('slide-1');
    expect(data[0].title).toBe('Test Slide 1');
    // Image path gets transformed - simple filenames get /images/slides/ prefix
    expect(data[0].image).toBe('/images/slides/slide-1.png');
    expect(mockHeroSlideFindMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  });

  it('should return empty array when no active slides exist', async () => {
    mockHeroSlideFindMany.mockResolvedValueOnce([]);

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides');
    const response = await GET(request as any);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('should return 500 on database error', async () => {
    mockHeroSlideFindMany.mockRejectedValueOnce(new Error('Database connection failed'));

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides');
    const response = await GET(request as any);
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch hero slides');
  });
});

describe('Hero Slides API - POST /api/cms/hero-slides', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new hero slide when admin authenticated', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };
    const slideData = {
      title: 'New Slide',
      image: '/new-slide.png',
      accentColor: '#bb0c15',
      sortOrder: 5,
    };

    const createdSlide = {
      id: 'slide-new',
      ...slideData,
      subtitle: null,
      tag: null,
      ctaText: null,
      ctaLink: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetCurrentUser.mockResolvedValueOnce(mockUser);
    mockHeroSlideCreate.mockResolvedValueOnce(createdSlide);

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides', {
      method: 'POST',
      body: slideData,
    });

    const response = await POST(request as any);
    const data = await getResponseJson(response);

    expect(response.status).toBe(201);
    expect(data).toEqual(createdSlide);
  });

  it('should return 401 when user is not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides', {
      method: 'POST',
      body: { title: 'Test', image: '/test.png' },
    });

    const response = await POST(request as any);
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockHeroSlideCreate).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not admin', async () => {
    const mockUser = { id: '1', email: 'user@test.com', role: 'customer' };
    mockGetCurrentUser.mockResolvedValueOnce(mockUser);

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides', {
      method: 'POST',
      body: { title: 'Test', image: '/test.png' },
    });

    const response = await POST(request as any);
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 when title is missing', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };
    mockGetCurrentUser.mockResolvedValueOnce(mockUser);

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides', {
      method: 'POST',
      body: { image: '/test.png' },
    });

    const response = await POST(request as any);
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Title and image are required');
  });

  it('should return 400 when image is missing', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };
    mockGetCurrentUser.mockResolvedValueOnce(mockUser);

    const request = createMockRequest('http://localhost:3000/api/cms/hero-slides', {
      method: 'POST',
      body: { title: 'Test Slide' },
    });

    const response = await POST(request as any);
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Title and image are required');
  });
});
