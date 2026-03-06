/**
 * Partner Logo by ID API Tests
 *
 * Tests for PATCH and DELETE /api/cms/partner-logos/[id]
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../../../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../../../helpers/testHelpers';

// Mock Prisma
const mockPartnerLogoUpdate = jest.fn();
const mockPartnerLogoDelete = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    partnerLogo: {
      update: (...args: unknown[]) => mockPartnerLogoUpdate(...args),
      delete: (...args: unknown[]) => mockPartnerLogoDelete(...args),
    },
  },
}));

// Mock auth
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Import route handlers after mocks
import { PATCH, DELETE } from '@/app/api/cms/partner-logos/[id]/route';

describe('Partner Logo by ID API - PATCH', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a partner logo when admin authenticated', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };
    const updateData = { name: 'Updated Brand', website: 'https://updatedbrand.com' };

    const updatedLogo = {
      id: 'logo-1',
      name: 'Updated Brand',
      logo: '/logo.png',
      website: 'https://updatedbrand.com',
      sortOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetCurrentUser.mockResolvedValueOnce(mockUser);
    mockPartnerLogoUpdate.mockResolvedValueOnce(updatedLogo);

    const request = createMockRequest('http://localhost:3000/api/cms/partner-logos/logo-1', {
      method: 'PATCH',
      body: updateData,
    });

    const response = await PATCH(request as any, createRouteParams({ id: 'logo-1' }));
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data).toEqual(updatedLogo);
  });

  it('should return 401 when user is not admin', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const request = createMockRequest('http://localhost:3000/api/cms/partner-logos/logo-1', {
      method: 'PATCH',
      body: { name: 'Updated' },
    });

    const response = await PATCH(request as any, createRouteParams({ id: 'logo-1' }));
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});

describe('Partner Logo by ID API - DELETE', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a partner logo when admin authenticated', async () => {
    const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };

    mockGetCurrentUser.mockResolvedValueOnce(mockUser);
    mockPartnerLogoDelete.mockResolvedValueOnce({});

    const request = createMockRequest('http://localhost:3000/api/cms/partner-logos/logo-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request as any, createRouteParams({ id: 'logo-1' }));
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 401 when user is not admin', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const request = createMockRequest('http://localhost:3000/api/cms/partner-logos/logo-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request as any, createRouteParams({ id: 'logo-1' }));
    const data: any = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
