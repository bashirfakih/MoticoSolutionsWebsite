/**
 * User Discount API Tests
 *
 * Tests for discount percentage functionality in user management:
 * - GET /api/users (discountPercentage in response)
 * - POST /api/users (create with discountPercentage)
 * - PATCH /api/users/[id] (update discountPercentage)
 * - GET /api/auth/me (discountPercentage in session)
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockUserFindMany = jest.fn();
const mockUserFindUnique = jest.fn();
const mockUserCreate = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserCount = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findMany: (...args: unknown[]) => mockUserFindMany(...args),
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      create: (...args: unknown[]) => mockUserCreate(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
      count: (...args: unknown[]) => mockUserCount(...args),
    },
  },
}));

// Mock auth functions
const mockGetCurrentUser = jest.fn();
const mockHashPassword = jest.fn();
const mockDeleteAllUserSessions = jest.fn();

jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  deleteAllUserSessions: (userId: string) => mockDeleteAllUserSessions(userId),
}));

jest.mock('@/lib/auth/password', () => ({
  hashPassword: (password: string) => mockHashPassword(password),
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/users/route';
import { PATCH } from '@/app/api/users/[id]/route';

describe('User Discount API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
  });

  describe('GET /api/users - Discount in Response', () => {
    // Helper to create a mock Prisma Decimal that works with Number()
    const mockDecimal = (value: number) => {
      const decimal = {
        toNumber: () => value,
        valueOf: () => value,
        toString: () => String(value),
      };
      // Make Number(decimal) work
      Object.defineProperty(decimal, Symbol.toPrimitive, {
        value: () => value,
      });
      return decimal;
    };

    it('returns discountPercentage converted from Decimal to number', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          isActive: true,
          discountPercentage: mockDecimal(15.5),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'customer',
          isActive: true,
          discountPercentage: mockDecimal(0),
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];
      mockUserFindMany.mockResolvedValue(mockUsers);
      mockUserCount.mockResolvedValue(2);

      const request = createMockRequest('http://localhost/api/users');
      const response = await GET(request);
      const data = await getResponseJson(response) as { data: Array<{ discountPercentage: number }> };

      expect(response.status).toBe(200);
      expect(data.data[0].discountPercentage).toBe(15.5);
      expect(data.data[1].discountPercentage).toBe(0);
      expect(typeof data.data[0].discountPercentage).toBe('number');
    });

    it('handles null/undefined discountPercentage gracefully', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          isActive: true,
          discountPercentage: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];
      mockUserFindMany.mockResolvedValue(mockUsers);
      mockUserCount.mockResolvedValue(1);

      const request = createMockRequest('http://localhost/api/users');
      const response = await GET(request);
      const data = await getResponseJson(response) as { data: Array<{ discountPercentage: number }> };

      expect(response.status).toBe(200);
      // Should handle null gracefully (NaN or 0 depending on implementation)
      expect(data.data[0]).toHaveProperty('discountPercentage');
    });
  });

  describe('POST /api/users - Create with Discount', () => {
    beforeEach(() => {
      mockUserFindUnique.mockResolvedValue(null); // No duplicate email
      mockHashPassword.mockResolvedValue('hashed_password');
    });

    it('creates user with valid discount percentage', async () => {
      const newUser = {
        id: 'new-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        discountPercentage: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserCreate.mockResolvedValue(newUser);

      const request = createMockRequest('http://localhost/api/users', {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          discountPercentage: 15,
        },
      });
      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(201);
      expect(mockUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            discountPercentage: 15,
          }),
        })
      );
      expect(data).toHaveProperty('discountPercentage');
    });

    it('creates user with 0% discount by default', async () => {
      mockUserCreate.mockResolvedValue({
        id: 'new-user',
        discountPercentage: 0,
      });

      const request = createMockRequest('http://localhost/api/users', {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          // No discountPercentage specified
        },
      });
      await POST(request);

      expect(mockUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            discountPercentage: 0,
          }),
        })
      );
    });

    it('creates user with maximum 100% discount', async () => {
      mockUserCreate.mockResolvedValue({
        id: 'new-user',
        discountPercentage: 100,
      });

      const request = createMockRequest('http://localhost/api/users', {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          discountPercentage: 100,
        },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            discountPercentage: 100,
          }),
        })
      );
    });

    it('creates user with decimal discount (e.g., 12.5%)', async () => {
      mockUserCreate.mockResolvedValue({
        id: 'new-user',
        discountPercentage: 12.5,
      });

      const request = createMockRequest('http://localhost/api/users', {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          discountPercentage: 12.5,
        },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            discountPercentage: 12.5,
          }),
        })
      );
    });

    it('returns 400 for discount below 0', async () => {
      const request = createMockRequest('http://localhost/api/users', {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          discountPercentage: -5,
        },
      });
      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Discount percentage must be between 0 and 100' });
    });

    it('returns 400 for discount above 100', async () => {
      const request = createMockRequest('http://localhost/api/users', {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          discountPercentage: 150,
        },
      });
      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Discount percentage must be between 0 and 100' });
    });

    it('returns 400 for non-numeric discount', async () => {
      const request = createMockRequest('http://localhost/api/users', {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          discountPercentage: 'invalid',
        },
      });
      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Discount percentage must be between 0 and 100' });
    });
  });

  describe('PATCH /api/users/[id] - Update Discount', () => {
    it('updates user discount percentage', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        discountPercentage: 10,
      });
      mockUserUpdate.mockResolvedValue({
        id: 'user-1',
        discountPercentage: 25,
      });

      const request = createMockRequest('http://localhost/api/users/user-1', {
        method: 'PATCH',
        body: { discountPercentage: 25 },
      });
      const response = await PATCH(request, createRouteParams({ id: 'user-1' }));

      expect(response.status).toBe(200);
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            discountPercentage: 25,
          }),
        })
      );
    });

    it('updates discount to 0', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        discountPercentage: 15,
      });
      mockUserUpdate.mockResolvedValue({
        id: 'user-1',
        discountPercentage: 0,
      });

      const request = createMockRequest('http://localhost/api/users/user-1', {
        method: 'PATCH',
        body: { discountPercentage: 0 },
      });
      const response = await PATCH(request, createRouteParams({ id: 'user-1' }));

      expect(response.status).toBe(200);
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            discountPercentage: 0,
          }),
        })
      );
    });

    it('updates discount to 100', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      });
      mockUserUpdate.mockResolvedValue({
        id: 'user-1',
        discountPercentage: 100,
      });

      const request = createMockRequest('http://localhost/api/users/user-1', {
        method: 'PATCH',
        body: { discountPercentage: 100 },
      });
      const response = await PATCH(request, createRouteParams({ id: 'user-1' }));

      expect(response.status).toBe(200);
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            discountPercentage: 100,
          }),
        })
      );
    });

    it('returns 400 for negative discount', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      });

      const request = createMockRequest('http://localhost/api/users/user-1', {
        method: 'PATCH',
        body: { discountPercentage: -10 },
      });
      const response = await PATCH(request, createRouteParams({ id: 'user-1' }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Discount percentage must be between 0 and 100' });
    });

    it('returns 400 for discount over 100', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      });

      const request = createMockRequest('http://localhost/api/users/user-1', {
        method: 'PATCH',
        body: { discountPercentage: 101 },
      });
      const response = await PATCH(request, createRouteParams({ id: 'user-1' }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Discount percentage must be between 0 and 100' });
    });

    it('updates discount with other fields simultaneously', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      });
      mockUserUpdate.mockResolvedValue({
        id: 'user-1',
        name: 'Updated Name',
        discountPercentage: 20,
      });

      const request = createMockRequest('http://localhost/api/users/user-1', {
        method: 'PATCH',
        body: {
          name: 'Updated Name',
          discountPercentage: 20,
        },
      });
      const response = await PATCH(request, createRouteParams({ id: 'user-1' }));

      expect(response.status).toBe(200);
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Updated Name',
            discountPercentage: 20,
          }),
        })
      );
    });

    it('does not update discount when not provided', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      });
      mockUserUpdate.mockResolvedValue({
        id: 'user-1',
        name: 'Updated Name',
      });

      const request = createMockRequest('http://localhost/api/users/user-1', {
        method: 'PATCH',
        body: { name: 'Updated Name' },
      });
      await PATCH(request, createRouteParams({ id: 'user-1' }));

      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            discountPercentage: expect.anything(),
          }),
        })
      );
    });
  });

  describe('GET /api/users/[id] - Discount in Single User Response', () => {
    // Helper to create a mock Prisma Decimal that works with Number()
    const mockDecimal = (value: number) => {
      const decimal = {
        toNumber: () => value,
        valueOf: () => value,
        toString: () => String(value),
      };
      Object.defineProperty(decimal, Symbol.toPrimitive, {
        value: () => value,
      });
      return decimal;
    };

    // Import single user GET after setting up mocks
    const getUserById = async () => {
      const { GET: getSingleUser } = await import('@/app/api/users/[id]/route');
      return getSingleUser;
    };

    it('returns discountPercentage for single user', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
        discountPercentage: mockDecimal(15),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const getSingleUser = await getUserById();
      const request = createMockRequest('http://localhost/api/users/user-1');
      const response = await getSingleUser(request, createRouteParams({ id: 'user-1' }));
      const data = await getResponseJson(response) as { discountPercentage: number };

      expect(response.status).toBe(200);
      expect(data.discountPercentage).toBe(15);
      expect(typeof data.discountPercentage).toBe('number');
    });
  });
});
