/**
 * Me API Route Tests
 *
 * Tests GET /api/auth/me
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

// Mock session module
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Import route handler after mocks are set up
import { GET } from '@/app/api/auth/me/route';

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unauthenticated (200 with null user)', () => {
    it('returns 200 with null user when not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ user: null });
    });

    it('returns 200 with null user when session is invalid', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ user: null });
    });
  });

  describe('Success (200)', () => {
    it('returns user data when authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        company: 'Test Company',
        avatar: '/avatar.jpg',
        discountPercentage: 15,
      };
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.id).toBe('user-1');
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.discountPercentage).toBe(15);
    });

    it('returns admin user data', async () => {
      const mockUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        company: null,
        avatar: null,
      };
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.role).toBe('admin');
    });

    it('returns staff user data', async () => {
      const mockUser = {
        id: 'staff-1',
        email: 'staff@example.com',
        name: 'Staff User',
        role: 'staff',
        company: 'Company',
        avatar: null,
      };
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.role).toBe('staff');
    });
  });

  describe('Server Error (500)', () => {
    it('returns 500 when session check throws', async () => {
      mockGetCurrentUser.mockRejectedValue(new Error('Session check failed'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'An error occurred' });
    });

    it('returns 500 when database error occurs', async () => {
      mockGetCurrentUser.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'An error occurred' });
    });
  });
});
