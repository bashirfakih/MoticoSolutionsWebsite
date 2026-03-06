/**
 * Settings API Route Tests
 *
 * Tests for /api/settings endpoint
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../helpers/testHelpers';

// Mock session
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Mock Prisma
const mockSettingsFindUnique = jest.fn();
const mockSettingsCreate = jest.fn();
const mockSettingsUpdate = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    siteSettings: {
      findUnique: (...args: unknown[]) => mockSettingsFindUnique(...args),
      create: (...args: unknown[]) => mockSettingsCreate(...args),
      update: (...args: unknown[]) => mockSettingsUpdate(...args),
    },
  },
}));

// Mock image optimizer
jest.mock('@/lib/utils/imageOptimizer', () => ({
  toUrlPath: (path: string) => path,
}));

// Import route handlers after mocks
import { GET, PATCH } from '@/app/api/settings/route';

describe('Settings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/settings', () => {
    describe('Success (200)', () => {
      it('returns existing settings for admin', async () => {
        const mockSettings = {
          id: 'default',
          companyName: 'Motico Solutions',
          companyEmail: 'info@motico.com',
          currency: 'USD',
        };
        mockSettingsFindUnique.mockResolvedValue(mockSettings);
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });

        const request = createMockRequest('http://localhost/api/settings');
        const response = await GET(request);
        const data = await getResponseJson(response) as { id: string; companyName: string };

        expect(response.status).toBe(200);
        expect(data.id).toBe('default');
        expect(data.companyName).toBe('Motico Solutions');
      });

      it('returns public settings for non-admin', async () => {
        const mockSettings = {
          id: 'default',
          companyName: 'Motico Solutions',
          companyEmail: 'info@motico.com',
          currency: 'USD',
          taxRate: 10, // Admin-only field
        };
        mockSettingsFindUnique.mockResolvedValue(mockSettings);
        mockGetCurrentUser.mockResolvedValue(null); // Not logged in

        const request = createMockRequest('http://localhost/api/settings');
        const response = await GET(request);
        const data = await getResponseJson(response) as Record<string, unknown>;

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('companyName');
        expect(data).not.toHaveProperty('id'); // Full settings not returned
      });

      it('creates default settings if not exist', async () => {
        mockSettingsFindUnique.mockResolvedValue(null);
        mockSettingsCreate.mockResolvedValue({
          id: 'default',
          companyName: null,
          currency: 'USD',
        });
        mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });

        const request = createMockRequest('http://localhost/api/settings');
        const response = await GET(request);
        const data = await getResponseJson(response) as { id: string };

        expect(response.status).toBe(200);
        expect(data.id).toBe('default');
        expect(mockSettingsCreate).toHaveBeenCalledWith({
          data: { id: 'default' },
        });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockSettingsFindUnique.mockRejectedValue(new Error('Database error'));

        const response = await GET();
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch settings' });
      });
    });
  });

  describe('PATCH /api/settings', () => {
    describe('Unauthorized (401)', () => {
      it('returns 401 when user is not authenticated', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: { siteName: 'New Name' },
        });
        const response = await PATCH(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });

      it('returns 401 when user is not admin', async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: 'user-1',
          role: 'customer',
        });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: { siteName: 'New Name' },
        });
        const response = await PATCH(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });

      it('returns 401 for staff role', async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: 'user-1',
          role: 'staff',
        });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: { siteName: 'New Name' },
        });
        const response = await PATCH(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });
    });

    describe('Success (200)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({
          id: 'admin-1',
          role: 'admin',
        });
        // Default: settings exist
        mockSettingsFindUnique.mockResolvedValue({ id: 'default' });
      });

      it('updates settings when they exist', async () => {
        mockSettingsUpdate.mockResolvedValue({
          id: 'default',
          companyName: 'Updated Site Name',
          companyEmail: 'new@email.com',
        });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: { companyName: 'Updated Site Name', companyEmail: 'new@email.com' },
        });
        const response = await PATCH(request);
        const data = await getResponseJson(response) as { companyName: string };

        expect(response.status).toBe(200);
        expect(data.companyName).toBe('Updated Site Name');
        expect(mockSettingsUpdate).toHaveBeenCalled();
      });

      it('updates social media links', async () => {
        mockSettingsUpdate.mockResolvedValue({ id: 'default' });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: {
            socialFacebook: 'https://facebook.com/motico',
            socialInstagram: 'https://instagram.com/motico',
            socialLinkedIn: 'https://linkedin.com/motico',
            socialYouTube: 'https://youtube.com/motico',
          },
        });
        await PATCH(request);

        expect(mockSettingsUpdate).toHaveBeenCalledWith({
          where: { id: 'default' },
          data: expect.objectContaining({
            socialFacebook: 'https://facebook.com/motico',
            socialInstagram: 'https://instagram.com/motico',
          }),
        });
      });

      it('updates numeric fields', async () => {
        mockSettingsUpdate.mockResolvedValue({ id: 'default' });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: {
            taxRate: 11.5,
            shippingFee: 15,
            freeShippingThreshold: 100,
            lowStockThreshold: 5,
          },
        });
        await PATCH(request);

        expect(mockSettingsUpdate).toHaveBeenCalledWith({
          where: { id: 'default' },
          data: expect.objectContaining({
            taxRate: 11.5,
            shippingFee: 15,
            freeShippingThreshold: 100,
            lowStockThreshold: 5,
          }),
        });
      });

      it('updates boolean fields', async () => {
        mockSettingsUpdate.mockResolvedValue({ id: 'default' });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: {
            enableEmailNotifications: false,
          },
        });
        await PATCH(request);

        expect(mockSettingsUpdate).toHaveBeenCalledWith({
          where: { id: 'default' },
          data: expect.objectContaining({
            enableEmailNotifications: false,
          }),
        });
      });

      it('creates settings if they do not exist', async () => {
        mockSettingsFindUnique.mockResolvedValue(null); // No existing settings
        mockSettingsCreate.mockResolvedValue({
          id: 'default',
          companyName: 'New Site',
        });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: { companyName: 'New Site' },
        });
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockSettingsCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            id: 'default',
            companyName: 'New Site',
          }),
        });
      });
    });

    describe('Server Error (500)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({
          id: 'admin-1',
          role: 'admin',
        });
        mockSettingsFindUnique.mockResolvedValue({ id: 'default' });
      });

      it('returns 500 on update failure', async () => {
        mockSettingsUpdate.mockRejectedValue(new Error('Update failed'));

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: { companyName: 'Test' },
        });
        const response = await PATCH(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to update settings' });
      });
    });
  });
});
