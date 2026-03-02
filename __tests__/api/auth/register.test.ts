/**
 * Register API Route Tests
 *
 * Tests POST /api/auth/register
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../helpers/testHelpers';

// Mock password module
const mockHashPassword = jest.fn();
jest.mock('@/lib/auth/password', () => ({
  hashPassword: (password: string) => mockHashPassword(password),
}));

// Mock session module
const mockCreateSession = jest.fn();
const mockSetSessionCookie = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  createSession: (userId: string) => mockCreateSession(userId),
  setSessionCookie: (token: string) => mockSetSessionCookie(token),
}));

// Mock Prisma
const mockUserFindUnique = jest.fn();
const mockUserCreate = jest.fn();
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      create: (...args: unknown[]) => mockUserCreate(...args),
    },
  },
}));

// Import route handler after mocks are set up
import { POST } from '@/app/api/auth/register/route';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHashPassword.mockResolvedValue('hashed_password');
    mockCreateSession.mockResolvedValue('mock-session-token');
    mockSetSessionCookie.mockResolvedValue(undefined);
  });

  describe('Validation Errors (400)', () => {
    it('returns 400 when email is missing', async () => {
      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { password: 'password123', name: 'Test User' },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Email, password, and name are required' });
    });

    it('returns 400 when password is missing', async () => {
      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', name: 'Test User' },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Email, password, and name are required' });
    });

    it('returns 400 when name is missing', async () => {
      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123' },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Email, password, and name are required' });
    });

    it('returns 400 when email format is invalid', async () => {
      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'invalid-email', password: 'password123', name: 'Test User' },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid email format' });
    });

    it('returns 400 when email is missing @', async () => {
      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'notanemail.com', password: 'password123', name: 'Test User' },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid email format' });
    });

    it('returns 400 when password is too short', async () => {
      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'short', name: 'Test User' },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Password must be at least 8 characters' });
    });

    it('returns 400 when password is exactly 7 characters', async () => {
      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: '1234567', name: 'Test User' },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Password must be at least 8 characters' });
    });
  });

  describe('Conflict (409)', () => {
    it('returns 409 when email already exists', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      });

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123', name: 'Test User' },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(409);
      expect(data).toEqual({ error: 'An account with this email already exists' });
    });

    it('normalizes email case when checking duplicates', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      });

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'TEST@EXAMPLE.COM', password: 'password123', name: 'Test User' },
      });

      await POST(request);

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('Success (201)', () => {
    it('creates user and returns user data', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      const createdUser = {
        id: 'new-user-1',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'customer',
        company: null,
      };
      mockUserCreate.mockResolvedValue(createdUser);

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'newuser@example.com', password: 'password123', name: 'New User' },
      });

      const response = await POST(request);
      const data = (await getResponseJson(response)) as { user: { id: string; email: string; name: string; role: string; company: string | null } };

      expect(response.status).toBe(201);
      expect(data.user).toEqual({
        id: 'new-user-1',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'customer',
        company: null,
      });
    });

    it('creates user with company field', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      const createdUser = {
        id: 'new-user-1',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'customer',
        company: 'Test Company',
      };
      mockUserCreate.mockResolvedValue(createdUser);

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          company: 'Test Company',
        },
      });

      const response = await POST(request);
      const data = (await getResponseJson(response)) as { user: { company: string } };

      expect(response.status).toBe(201);
      expect(data.user.company).toBe('Test Company');
    });

    it('hashes password before storing', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({
        id: 'new-user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        company: null,
      });

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123', name: 'Test User' },
      });

      await POST(request);

      expect(mockHashPassword).toHaveBeenCalledWith('password123');
      expect(mockUserCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          passwordHash: 'hashed_password',
        }),
      });
    });

    it('stores email in lowercase', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({
        id: 'new-user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        company: null,
      });

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'TEST@EXAMPLE.COM', password: 'password123', name: 'Test User' },
      });

      await POST(request);

      expect(mockUserCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
        }),
      });
    });

    it('sets role to customer by default', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({
        id: 'new-user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        company: null,
      });

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123', name: 'Test User' },
      });

      await POST(request);

      expect(mockUserCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: 'customer',
        }),
      });
    });

    it('creates session after registration', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({
        id: 'new-user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        company: null,
      });

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123', name: 'Test User' },
      });

      await POST(request);

      expect(mockCreateSession).toHaveBeenCalledWith('new-user-1');
      expect(mockSetSessionCookie).toHaveBeenCalledWith('mock-session-token');
    });

    it('accepts exactly 8 character password', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({
        id: 'new-user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        company: null,
      });

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: '12345678', name: 'Test User' },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });

  describe('Server Error (500)', () => {
    it('returns 500 when database error occurs', async () => {
      mockUserFindUnique.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123', name: 'Test User' },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'An error occurred during registration' });
    });

    it('returns 500 when user creation fails', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockRejectedValue(new Error('Create failed'));

      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123', name: 'Test User' },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'An error occurred during registration' });
    });
  });
});
