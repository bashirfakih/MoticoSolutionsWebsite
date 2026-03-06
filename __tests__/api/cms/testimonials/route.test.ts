/**
 * Testimonials API Tests
 *
 * Tests for GET and POST /api/cms/testimonials
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../../helpers/testHelpers';

// Mock Prisma
const mockTestimonialFindMany = jest.fn();
const mockTestimonialCreate = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    testimonial: {
      findMany: (...args: unknown[]) => mockTestimonialFindMany(...args),
      create: (...args: unknown[]) => mockTestimonialCreate(...args),
    },
  },
}));

// Mock auth
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/cms/testimonials/route';

describe('Testimonials API - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all active testimonials ordered by sortOrder', async () => {
    const mockTestimonials = [
      {
        id: 'testimonial-1',
        customerName: 'John Doe',
        role: 'CEO',
        company: 'Tech Corp',
        quote: 'Excellent service',
        image: null,
        rating: 5,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockTestimonialFindMany.mockResolvedValueOnce(mockTestimonials);

    const request = createMockRequest('http://localhost:3000/api/cms/testimonials');
    const response = await GET(request as any);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data).toEqual(mockTestimonials);
    expect(mockTestimonialFindMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  });

  it('should return 500 on database error', async () => {
    mockTestimonialFindMany.mockRejectedValueOnce(new Error('Database error'));

    const request = createMockRequest('http://localhost:3000/api/cms/testimonials');
    const response = await GET(request as any);
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch testimonials');
  });
});

describe('Testimonials API - POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new testimonial when admin authenticated', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };
    const testimonialData = {
      customerName: 'Alice Johnson',
      role: 'Director',
      company: 'Manufacturing Co',
      quote: 'Outstanding quality!',
    };

    const createdTestimonial = {
      id: 'testimonial-new',
      ...testimonialData,
      image: null,
      rating: 5,
      sortOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetCurrentUser.mockResolvedValueOnce(mockUser);
    mockTestimonialCreate.mockResolvedValueOnce(createdTestimonial);

    const request = createMockRequest('http://localhost:3000/api/cms/testimonials', {
      method: 'POST',
      body: testimonialData,
    });

    const response = await POST(request as any);
    const data = await getResponseJson(response);

    expect(response.status).toBe(201);
    expect(data).toEqual(createdTestimonial);
  });

  it('should return 401 when user is not admin', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const request = createMockRequest('http://localhost:3000/api/cms/testimonials', {
      method: 'POST',
      body: { customerName: 'Test', role: 'Role', company: 'Company', quote: 'Quote' },
    });

    const response = await POST(request as any);
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 when required fields are missing', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };
    mockGetCurrentUser.mockResolvedValueOnce(mockUser);

    const request = createMockRequest('http://localhost:3000/api/cms/testimonials', {
      method: 'POST',
      body: { customerName: 'Test' },
    });

    const response = await POST(request as any);
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Customer name, role, company, and quote are required');
  });
});
