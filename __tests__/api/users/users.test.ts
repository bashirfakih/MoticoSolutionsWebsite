/**
 * Users API Route Tests
 *
 * Tests for GET /api/users and POST /api/users endpoints
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockUserFindMany = jest.fn();
const mockUserFindUnique = jest.fn();
const mockUserCreate = jest.fn();
const mockUserCount = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findMany: (...args: unknown[]) => mockUserFindMany(...args),
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      create: (...args: unknown[]) => mockUserCreate(...args),
      count: (...args: unknown[]) => mockUserCount(...args),
    },
  },
}));

// Mock auth functions
const mockGetCurrentUser = jest.fn();
const mockHashPassword = jest.fn();

jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

jest.mock('@/lib/auth/password', () => ({
  hashPassword: (password: string) => mockHashPassword(password),
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/users/route';

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    describe('Authentication (401)', () => {
      it('returns 401 when not authenticated', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/users');
        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });

      it('returns 401 when user is not admin', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'customer' });

        const request = createMockRequest('http://localhost/api/users');
        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });
    });

    describe('Success (200)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns paginated users list', async () => {
        const mockUsers = [
          {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'customer',
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            lastLogin: new Date('2024-01-15'),
          },
          {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'admin',
            isActive: true,
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
            lastLogin: null,
          },
        ];
        mockUserFindMany.mockResolvedValue(mockUsers);
        mockUserCount.mockResolvedValue(2);

        const request = createMockRequest('http://localhost/api/users');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: unknown[]; total: number; page: number; limit: number; totalPages: number };

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(2);
        expect(data.total).toBe(2);
        expect(data.page).toBe(1);
        expect(data.limit).toBe(20);
        expect(data.totalPages).toBe(1);
      });

      it('filters by search query', async () => {
        mockUserFindMany.mockResolvedValue([]);
        mockUserCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/users?search=john');
        await GET(request);

        expect(mockUserFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                { name: { contains: 'john', mode: 'insensitive' } },
                { email: { contains: 'john', mode: 'insensitive' } },
                { company: { contains: 'john', mode: 'insensitive' } },
              ]),
            }),
          })
        );
      });

      it('filters by role', async () => {
        mockUserFindMany.mockResolvedValue([]);
        mockUserCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/users?role=admin');
        await GET(request);

        expect(mockUserFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ role: 'admin' }),
          })
        );
      });

      it('filters by active status', async () => {
        mockUserFindMany.mockResolvedValue([]);
        mockUserCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/users?isActive=true');
        await GET(request);

        expect(mockUserFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isActive: true }),
          })
        );
      });

      it('filters by inactive status', async () => {
        mockUserFindMany.mockResolvedValue([]);
        mockUserCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/users?isActive=false');
        await GET(request);

        expect(mockUserFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isActive: false }),
          })
        );
      });

      it('supports pagination', async () => {
        mockUserFindMany.mockResolvedValue([]);
        mockUserCount.mockResolvedValue(100);

        const request = createMockRequest('http://localhost/api/users?page=3&limit=10');
        const response = await GET(request);
        const data = await getResponseJson(response) as { page: number; limit: number; totalPages: number };

        expect(data.page).toBe(3);
        expect(data.limit).toBe(10);
        expect(data.totalPages).toBe(10);
        expect(mockUserFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 20, // (page 3 - 1) * 10
            take: 10,
          })
        );
      });

      it('supports sorting by name', async () => {
        mockUserFindMany.mockResolvedValue([]);
        mockUserCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/users?sortBy=name&sortOrder=asc');
        await GET(request);

        expect(mockUserFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { name: 'asc' },
          })
        );
      });

      it('supports sorting by createdAt desc', async () => {
        mockUserFindMany.mockResolvedValue([]);
        mockUserCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/users?sortBy=createdAt&sortOrder=desc');
        await GET(request);

        expect(mockUserFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { createdAt: 'desc' },
          })
        );
      });

      it('uses default sorting when not specified', async () => {
        mockUserFindMany.mockResolvedValue([]);
        mockUserCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/users');
        await GET(request);

        expect(mockUserFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { createdAt: 'desc' },
          })
        );
      });

      it('combines multiple filters', async () => {
        mockUserFindMany.mockResolvedValue([]);
        mockUserCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/users?search=john&role=customer&isActive=true');
        await GET(request);

        expect(mockUserFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.anything(),
              role: 'customer',
              isActive: true,
            }),
          })
        );
      });
    });

    describe('Server Error (500)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns 500 on database error', async () => {
        mockUserCount.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/users');
        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch users' });
      });
    });
  });

  describe('POST /api/users', () => {
    describe('Authentication (401)', () => {
      it('returns 401 when not authenticated', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { name: 'Test User', email: 'test@example.com', password: 'password123' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });

      it('returns 401 when user is not admin', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'customer' });

        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { name: 'Test User', email: 'test@example.com', password: 'password123' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });
    });

    describe('Validation (400)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns 400 when name is missing', async () => {
        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { email: 'test@example.com', password: 'password123' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name, email, and password are required' });
      });

      it('returns 400 when email is missing', async () => {
        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { name: 'Test User', password: 'password123' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name, email, and password are required' });
      });

      it('returns 400 when password is missing', async () => {
        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { name: 'Test User', email: 'test@example.com' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name, email, and password are required' });
      });

      it('returns 400 when password is too short', async () => {
        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { name: 'Test User', email: 'test@example.com', password: 'short' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Password must be at least 8 characters long' });
      });
    });

    describe('Duplicate Email (409)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('returns 409 when email already exists', async () => {
        mockUserFindUnique.mockResolvedValue({
          id: 'existing-user',
          email: 'existing@example.com',
        });

        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { name: 'Test User', email: 'existing@example.com', password: 'password123' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(409);
        expect(data).toEqual({ error: 'A user with this email already exists' });
      });

      it('checks email in lowercase', async () => {
        mockUserFindUnique.mockResolvedValue(null);
        mockHashPassword.mockResolvedValue('hashed_password');
        mockUserCreate.mockResolvedValue({
          id: 'new-user',
          email: 'test@example.com',
          name: 'Test User',
        });

        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { name: 'Test User', email: 'Test@Example.COM', password: 'password123' },
        });
        await POST(request);

        expect(mockUserFindUnique).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
        });
      });
    });

    describe('Success (201)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      });

      it('creates a new customer user with minimal data', async () => {
        const newUser = {
          id: 'new-user',
          name: 'Test User',
          email: 'test@example.com',
          role: 'customer',
          isActive: true,
          discountPercentage: 0,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        };
        mockUserFindUnique.mockResolvedValue(null);
        mockHashPassword.mockResolvedValue('hashed_password123');
        mockUserCreate.mockResolvedValue(newUser);

        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { name: 'Test User', email: 'test@example.com', password: 'password123' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response) as { id: string; email: string };

        expect(response.status).toBe(201);
        expect(data.id).toBe('new-user');
        expect(data.email).toBe('test@example.com');
        expect(mockHashPassword).toHaveBeenCalledWith('password123');
        expect(mockUserCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              email: 'test@example.com',
              passwordHash: 'hashed_password123',
              name: 'Test User',
              role: 'customer',
              isActive: true,
            }),
          })
        );
      });

      it('creates an admin user when role is specified', async () => {
        mockUserFindUnique.mockResolvedValue(null);
        mockHashPassword.mockResolvedValue('hashed_password123');
        mockUserCreate.mockResolvedValue({ id: 'new-admin' });

        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
          },
        });
        await POST(request);

        expect(mockUserCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              role: 'admin',
            }),
          })
        );
      });

      it('creates user with all optional fields', async () => {
        mockUserFindUnique.mockResolvedValue(null);
        mockHashPassword.mockResolvedValue('hashed_password123');
        mockUserCreate.mockResolvedValue({ id: 'new-user' });

        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'customer',
            company: 'Test Company',
            phone: '+1234567890',
            country: 'Lebanon',
            industry: 'Manufacturing',
            position: 'Manager',
            address: '123 Main St',
            city: 'Beirut',
            isActive: false,
          },
        });
        await POST(request);

        expect(mockUserCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              company: 'Test Company',
              phone: '+1234567890',
              country: 'Lebanon',
              industry: 'Manufacturing',
              position: 'Manager',
              address: '123 Main St',
              city: 'Beirut',
              isActive: false,
            }),
          })
        );
      });

      it('converts email to lowercase when creating', async () => {
        mockUserFindUnique.mockResolvedValue(null);
        mockHashPassword.mockResolvedValue('hashed_password123');
        mockUserCreate.mockResolvedValue({ id: 'new-user' });

        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { name: 'Test User', email: 'Test@Example.COM', password: 'password123' },
        });
        await POST(request);

        expect(mockUserCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              email: 'test@example.com',
            }),
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

        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { name: 'Test User', email: 'test@example.com', password: 'password123' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to create user' });
      });

      it('returns 500 on password hashing error', async () => {
        mockUserFindUnique.mockResolvedValue(null);
        mockHashPassword.mockRejectedValue(new Error('Hashing error'));

        const request = createMockRequest('http://localhost/api/users', {
          method: 'POST',
          body: { name: 'Test User', email: 'test@example.com', password: 'password123' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to create user' });
      });
    });
  });
});
