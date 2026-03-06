/**
 * Single User API Route Tests
 *
 * Tests for GET /api/users/[id], PATCH /api/users/[id], and DELETE /api/users/[id]
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockUserFindUnique = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserDelete = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
      delete: (...args: unknown[]) => mockUserDelete(...args),
    },
  },
}));

// Mock auth functions
const mockGetCurrentUser = jest.fn();
const mockDeleteAllUserSessions = jest.fn();
const mockHashPassword = jest.fn();

jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  deleteAllUserSessions: (userId: string) => mockDeleteAllUserSessions(userId),
}));

jest.mock('@/lib/auth/password', () => ({
  hashPassword: (password: string) => mockHashPassword(password),
}));

// Import route handlers after mocks
import { GET, PATCH, DELETE } from '@/app/api/users/[id]/route';

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

describe('Single User API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/[id]', () => {
    describe('Authentication (401)', () => {
      it('returns 401 when not authenticated', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/users/user-1');
        const response = await GET(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });

      it('returns 401 when user is not admin', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'customer' });

        const request = createMockRequest('http://localhost/api/users/user-1');
        const response = await GET(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });
    });

    describe('Not Found (404)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns 404 when user does not exist', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/users/nonexistent');
        const response = await GET(request, createRouteParams({ id: 'nonexistent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'User not found' });
      });
    });

    describe('Success (200)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns user by id', async () => {
        const mockUser = {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          company: 'Test Company',
          phone: '+1234567890',
          avatar: null,
          isActive: true,
          country: 'Lebanon',
          industry: 'Manufacturing',
          position: 'Manager',
          address: '123 Main St',
          city: 'Beirut',
          discountPercentage: mockDecimal(15),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          lastLogin: new Date('2024-01-15'),
        };
        mockUserFindUnique.mockResolvedValue(mockUser);

        const request = createMockRequest('http://localhost/api/users/user-1');
        const response = await GET(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response) as { discountPercentage: number };

        expect(response.status).toBe(200);
        // discountPercentage is converted from Decimal to number in response
        expect(data.discountPercentage).toBe(15);
        expect(mockUserFindUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'user-1' },
          })
        );
      });
    });

    describe('Server Error (500)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns 500 on database error', async () => {
        mockUserFindUnique.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/users/user-1');
        const response = await GET(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch user' });
      });
    });
  });

  describe('PATCH /api/users/[id]', () => {
    describe('Authentication (401)', () => {
      it('returns 401 when not authenticated', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { name: 'Updated Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });

      it('returns 401 when user is not admin', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'customer' });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { name: 'Updated Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });
    });

    describe('Not Found (404)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns 404 when user does not exist', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/users/nonexistent', {
          method: 'PATCH',
          body: { name: 'Updated Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'nonexistent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'User not found' });
      });
    });

    describe('Self-Protection (400)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('prevents admin from changing their own role', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin',
        });

        const request = createMockRequest('http://localhost/api/users/admin-1', {
          method: 'PATCH',
          body: { role: 'customer' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'admin-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'You cannot change your own role' });
      });

      it('prevents admin from deactivating their own account', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin',
          isActive: true,
        });

        const request = createMockRequest('http://localhost/api/users/admin-1', {
          method: 'PATCH',
          body: { isActive: false },
        });
        const response = await PATCH(request, createRouteParams({ id: 'admin-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'You cannot deactivate your own account' });
      });

      it('allows admin to update their own name', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin',
        });
        mockUserUpdate.mockResolvedValue({
          id: 'admin-1',
          name: 'Updated Admin',
          email: 'admin@example.com',
        });

        const request = createMockRequest('http://localhost/api/users/admin-1', {
          method: 'PATCH',
          body: { name: 'Updated Admin' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'admin-1' }));

        expect(response.status).toBe(200);
        expect(mockUserUpdate).toHaveBeenCalled();
      });
    });

    describe('Duplicate Email (409)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns 409 when changing to existing email', async () => {
        mockUserFindUnique
          .mockResolvedValueOnce({
            id: 'user-1',
            email: 'old@example.com',
          })
          .mockResolvedValueOnce({
            id: 'user-2',
            email: 'existing@example.com',
          });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { email: 'existing@example.com' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(409);
        expect(data).toEqual({ error: 'A user with this email already exists' });
      });

      it('allows keeping the same email', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'user-1',
          email: 'same@example.com',
        });
        mockUserUpdate.mockResolvedValue({
          id: 'user-1',
          email: 'same@example.com',
          name: 'Updated Name',
        });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { email: 'same@example.com', name: 'Updated Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'user-1' }));

        expect(response.status).toBe(200);
        expect(mockUserUpdate).toHaveBeenCalled();
      });
    });

    describe('Success (200)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('updates user name', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
        });
        mockUserUpdate.mockResolvedValue({
          id: 'user-1',
          name: 'Updated Name',
          email: 'user@example.com',
        });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { name: 'Updated Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('name', 'Updated Name');
        expect(mockUserUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'user-1' },
            data: expect.objectContaining({ name: 'Updated Name' }),
          })
        );
      });

      it('updates user email in lowercase', async () => {
        mockUserFindUnique
          .mockResolvedValueOnce({
            id: 'user-1',
            email: 'old@example.com',
          })
          .mockResolvedValueOnce(null); // Email check for duplicate
        mockUserUpdate.mockResolvedValue({
          id: 'user-1',
          email: 'new@example.com',
        });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { email: 'New@Example.COM' },
        });
        await PATCH(request, createRouteParams({ id: 'user-1' }));

        expect(mockUserUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ email: 'new@example.com' }),
          })
        );
      });

      it('updates user role', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
          role: 'customer',
        });
        mockUserUpdate.mockResolvedValue({
          id: 'user-1',
          role: 'admin',
        });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { role: 'admin' },
        });
        await PATCH(request, createRouteParams({ id: 'user-1' }));

        expect(mockUserUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ role: 'admin' }),
          })
        );
      });

      it('updates user password', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
        });
        mockHashPassword.mockResolvedValue('new_hashed_password');
        mockUserUpdate.mockResolvedValue({ id: 'user-1' });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { password: 'newpassword123' },
        });
        await PATCH(request, createRouteParams({ id: 'user-1' }));

        expect(mockHashPassword).toHaveBeenCalledWith('newpassword123');
        expect(mockUserUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ passwordHash: 'new_hashed_password' }),
          })
        );
      });

      it('ignores password if too short', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
        });
        mockUserUpdate.mockResolvedValue({ id: 'user-1' });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { password: 'short', name: 'Updated' },
        });
        await PATCH(request, createRouteParams({ id: 'user-1' }));

        expect(mockHashPassword).not.toHaveBeenCalled();
        expect(mockUserUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.not.objectContaining({ passwordHash: expect.anything() }),
          })
        );
      });

      it('updates all user fields', async () => {
        mockUserFindUnique
          .mockResolvedValueOnce({
            id: 'user-1',
            email: 'old@example.com',
          })
          .mockResolvedValueOnce(null); // Email check for duplicate
        mockUserUpdate.mockResolvedValue({ id: 'user-1' });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: {
            name: 'Updated User',
            email: 'new@example.com',
            role: 'admin',
            company: 'New Company',
            phone: '+9876543210',
            country: 'USA',
            industry: 'Tech',
            position: 'CTO',
            address: '456 New St',
            city: 'New York',
            isActive: true,
          },
        });
        await PATCH(request, createRouteParams({ id: 'user-1' }));

        expect(mockUserUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              name: 'Updated User',
              email: 'new@example.com',
              role: 'admin',
              company: 'New Company',
              phone: '+9876543210',
              country: 'USA',
              industry: 'Tech',
              position: 'CTO',
              address: '456 New St',
              city: 'New York',
              isActive: true,
            }),
          })
        );
      });

      it('deactivates user and deletes sessions', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
          isActive: true,
        });
        mockUserUpdate.mockResolvedValue({
          id: 'user-1',
          isActive: false,
        });
        mockDeleteAllUserSessions.mockResolvedValue(undefined);

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { isActive: false },
        });
        await PATCH(request, createRouteParams({ id: 'user-1' }));

        expect(mockUserUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ isActive: false }),
          })
        );
        expect(mockDeleteAllUserSessions).toHaveBeenCalledWith('user-1');
      });

      it('does not delete sessions when activating user', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
          isActive: false,
        });
        mockUserUpdate.mockResolvedValue({
          id: 'user-1',
          isActive: true,
        });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { isActive: true },
        });
        await PATCH(request, createRouteParams({ id: 'user-1' }));

        expect(mockDeleteAllUserSessions).not.toHaveBeenCalled();
      });
    });

    describe('Server Error (500)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns 500 on database error', async () => {
        mockUserFindUnique.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'PATCH',
          body: { name: 'Updated Name' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to update user' });
      });
    });
  });

  describe('DELETE /api/users/[id]', () => {
    describe('Authentication (401)', () => {
      it('returns 401 when not authenticated', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });

      it('returns 401 when user is not admin', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'customer' });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });
    });

    describe('Self-Protection (400)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('prevents admin from deleting their own account', async () => {
        const request = createMockRequest('http://localhost/api/users/admin-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'admin-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'You cannot delete your own account' });
      });
    });

    describe('Not Found (404)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns 404 when user does not exist', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/users/nonexistent', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'nonexistent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'User not found' });
      });
    });

    describe('Success (200)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('deletes user and their sessions', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
        });
        mockDeleteAllUserSessions.mockResolvedValue(undefined);
        mockUserDelete.mockResolvedValue({ id: 'user-1' });

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data).toEqual({ success: true });
        expect(mockDeleteAllUserSessions).toHaveBeenCalledWith('user-1');
        expect(mockUserDelete).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'user-1' },
          })
        );
      });
    });

    describe('Server Error (500)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns 500 on database error', async () => {
        mockUserFindUnique.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/users/user-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'user-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to delete user' });
      });
    });
  });
});
