/**
 * Logout API Route Tests
 *
 * Tests POST /api/auth/logout
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

// Mock cookies module
const mockCookiesGet = jest.fn();
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({
    get: mockCookiesGet,
  })),
}));

// Mock session module
const mockDeleteSession = jest.fn();
const mockClearSessionCookie = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  deleteSession: (token: string) => mockDeleteSession(token),
  clearSessionCookie: () => mockClearSessionCookie(),
  SESSION_COOKIE: 'motico_session',
}));

// Import route handler after mocks are set up
import { POST } from '@/app/api/auth/logout/route';

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteSession.mockResolvedValue(undefined);
    mockClearSessionCookie.mockResolvedValue(undefined);
  });

  describe('Success (200)', () => {
    it('returns success when user has session cookie', async () => {
      mockCookiesGet.mockReturnValue({ value: 'valid-session-token' });

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockDeleteSession).toHaveBeenCalledWith('valid-session-token');
      expect(mockClearSessionCookie).toHaveBeenCalled();
    });

    it('returns success when user has no session cookie', async () => {
      mockCookiesGet.mockReturnValue(undefined);

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockDeleteSession).not.toHaveBeenCalled();
      expect(mockClearSessionCookie).toHaveBeenCalled();
    });

    it('clears cookie even when session deletion fails silently', async () => {
      mockCookiesGet.mockReturnValue({ value: 'valid-session-token' });
      mockDeleteSession.mockResolvedValue(undefined); // No error, just returns

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockClearSessionCookie).toHaveBeenCalled();
    });
  });

  describe('Server Error (500)', () => {
    it('returns 500 when session deletion throws', async () => {
      mockCookiesGet.mockReturnValue({ value: 'valid-session-token' });
      mockDeleteSession.mockRejectedValue(new Error('Session deletion failed'));

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'An error occurred during logout' });
    });

    it('returns 500 when cookie clearing throws', async () => {
      mockCookiesGet.mockReturnValue(undefined);
      mockClearSessionCookie.mockRejectedValue(new Error('Cookie clear failed'));

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'An error occurred during logout' });
    });
  });
});
