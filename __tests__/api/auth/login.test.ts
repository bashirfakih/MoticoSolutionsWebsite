/**
 * Login API Route Tests
 *
 * Tests POST /api/auth/login
 */

// Mock NextResponse before importing anything that uses it
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url: typeof url === 'string' ? url : url.toString(),
    method: init?.method || 'GET',
    json: async () => {
      if (init?.body) {
        return JSON.parse(init.body);
      }
      return {};
    },
  })),
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: async () => data,
    }),
  },
}));

// Helper to create mock requests
function createMockRequest(
  _url: string,
  options: { method?: string; body?: unknown } = {}
) {
  const { body } = options;
  return {
    json: async () => body || {},
  };
}

// Mock password module
const mockVerifyPassword = jest.fn();
jest.mock('@/lib/auth/password', () => ({
  verifyPassword: (password: string, hash: string) => mockVerifyPassword(password, hash),
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
const mockUserUpdate = jest.fn();
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
  },
}));

// Import route handler after mocks are set up
import { POST } from '@/app/api/auth/login/route';

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSession.mockResolvedValue('mock-session-token');
    mockSetSessionCookie.mockResolvedValue(undefined);
    mockUserUpdate.mockResolvedValue({});
  });

  describe('Validation Errors (400)', () => {
    it('returns 400 when email is missing', async () => {
      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: { password: 'password123' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Email and password are required' });
    });

    it('returns 400 when password is missing', async () => {
      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Email and password are required' });
    });

    it('returns 400 when both email and password are missing', async () => {
      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: {},
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Email and password are required' });
    });

    it('returns 400 when email is empty string', async () => {
      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: { email: '', password: 'password123' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Email and password are required' });
    });
  });

  describe('Unauthorized (401)', () => {
    it('returns 401 when user is not found', async () => {
      mockUserFindUnique.mockResolvedValue(null);

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: { email: 'nonexistent@example.com', password: 'password123' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Invalid email or password' });
      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('returns 401 when password is incorrect', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password',
        role: 'customer',
        isActive: true,
      };
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(false);

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'wrongpassword' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Invalid email or password' });
      expect(mockVerifyPassword).toHaveBeenCalledWith('wrongpassword', 'hashed_password');
    });
  });

  describe('Forbidden (403)', () => {
    it('returns 403 when user account is disabled', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password',
        role: 'customer',
        isActive: false,
      };
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(true);

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Account is disabled. Please contact support.' });
    });
  });

  describe('Success (200)', () => {
    it('returns user data on successful login', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password',
        role: 'customer',
        company: 'Test Company',
        avatar: '/avatar.jpg',
        isActive: true,
      };
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(true);

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123' },
      });

      const response = await POST(request);
      const data = (await response.json()) as { user: { id: string; email: string; name: string; role: string; company: string; avatar: string } };

      expect(response.status).toBe(200);
      expect(data.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        company: 'Test Company',
        avatar: '/avatar.jpg',
      });
      expect(mockCreateSession).toHaveBeenCalledWith('user-1');
      expect(mockSetSessionCookie).toHaveBeenCalledWith('mock-session-token');
    });

    it('normalizes email to lowercase', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password',
        role: 'customer',
        company: null,
        avatar: null,
        isActive: true,
      };
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(true);

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: { email: 'Test@Example.COM', password: 'password123' },
      });

      await POST(request);

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('updates lastLogin timestamp on successful login', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password',
        role: 'admin',
        company: null,
        avatar: null,
        isActive: true,
      };
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(true);

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123' },
      });

      await POST(request);

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { lastLogin: expect.any(Date) },
      });
    });
  });

  describe('Server Error (500)', () => {
    it('returns 500 when database error occurs', async () => {
      mockUserFindUnique.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'An error occurred during login' });
    });

    it('returns 500 when session creation fails', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password',
        role: 'customer',
        isActive: true,
      };
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(true);
      mockCreateSession.mockRejectedValue(new Error('Session creation failed'));

      const request = createMockRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'An error occurred during login' });
    });
  });
});
