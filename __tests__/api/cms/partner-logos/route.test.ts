/**
 * Partner Logos API Tests
 *
 * Tests for GET and POST /api/cms/partner-logos
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../../helpers/testHelpers';

// Mock Prisma
const mockPartnerLogoFindMany = jest.fn();
const mockPartnerLogoCreate = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    partnerLogo: {
      findMany: (...args: unknown[]) => mockPartnerLogoFindMany(...args),
      create: (...args: unknown[]) => mockPartnerLogoCreate(...args),
    },
  },
}));

// Mock auth
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Mock image optimizer
jest.mock('@/lib/utils/imageOptimizer', () => ({
  toUrlPath: (path: string) => path ? `/images/logos/brands${path}` : path,
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/cms/partner-logos/route';

describe('Partner Logos API - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all active partner logos ordered by sortOrder', async () => {
    const mockLogos = [
      {
        id: 'logo-1',
        name: 'Hermes',
        logo: '/logo-hermes.png',
        website: 'https://hermes.com',
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockPartnerLogoFindMany.mockResolvedValueOnce(mockLogos);

    const request = createMockRequest('http://localhost:3000/api/cms/partner-logos');
    const response = await GET(request as any);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    // API transforms logo paths with toUrlPath
    expect(data).toEqual([
      {
        ...mockLogos[0],
        logo: '/images/logos/brands/logo-hermes.png',
      },
    ]);
    expect(mockPartnerLogoFindMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  });

  it('should return 500 on database error', async () => {
    mockPartnerLogoFindMany.mockRejectedValueOnce(new Error('Database error'));

    const request = createMockRequest('http://localhost:3000/api/cms/partner-logos');
    const response = await GET(request as any);
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch partner logos');
  });
});

describe('Partner Logos API - POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new partner logo when admin authenticated', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };
    const logoData = {
      name: '3M',
      logo: '/logo-3m.png',
      website: 'https://3m.com',
    };

    const createdLogo = {
      id: 'logo-new',
      ...logoData,
      sortOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetCurrentUser.mockResolvedValueOnce(mockUser);
    mockPartnerLogoCreate.mockResolvedValueOnce(createdLogo);

    const request = createMockRequest('http://localhost:3000/api/cms/partner-logos', {
      method: 'POST',
      body: logoData,
    });

    const response = await POST(request as any);
    const data = await getResponseJson(response);

    expect(response.status).toBe(201);
    expect(data).toEqual(createdLogo);
  });

  it('should return 401 when user is not admin', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const request = createMockRequest('http://localhost:3000/api/cms/partner-logos', {
      method: 'POST',
      body: { name: 'Test', logo: '/test.png' },
    });

    const response = await POST(request as any);
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 when required fields are missing', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };
    mockGetCurrentUser.mockResolvedValueOnce(mockUser);

    const request = createMockRequest('http://localhost:3000/api/cms/partner-logos', {
      method: 'POST',
      body: { name: 'Test Brand' },
    });

    const response = await POST(request as any);
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Name and logo are required');
  });
});
