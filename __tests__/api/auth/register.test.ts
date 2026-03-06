/**
 * Register API Route Tests
 *
 * Tests POST /api/auth/register
 *
 * Note: Self-registration is disabled. All requests return 403.
 * Users must be created by administrators through /api/users endpoint.
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../helpers/testHelpers';

// Import route handler after mocks are set up
import { POST } from '@/app/api/auth/register/route';

describe('POST /api/auth/register', () => {
  describe('Self-registration Disabled (403)', () => {
    it('returns 403 for any registration attempt', async () => {
      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User'
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(403);
      expect(data).toEqual({
        error: 'Self-registration is disabled. Please contact an administrator to create an account.'
      });
    });

    it('returns 403 even with valid registration data', async () => {
      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: {
          email: 'valid@example.com',
          password: 'validpassword123',
          name: 'Valid User',
          company: 'Test Company'
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(403);
    });

    it('returns 403 for empty request body', async () => {
      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: {},
      });

      const response = await POST(request);

      expect(response.status).toBe(403);
    });

    it('returns 403 for partial registration data', async () => {
      const request = createMockRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com' },
      });

      const response = await POST(request);

      expect(response.status).toBe(403);
    });
  });
});
