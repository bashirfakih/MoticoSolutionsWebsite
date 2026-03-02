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
const mockSettingsUpsert = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    siteSettings: {
      findUnique: (...args: unknown[]) => mockSettingsFindUnique(...args),
      create: (...args: unknown[]) => mockSettingsCreate(...args),
      upsert: (...args: unknown[]) => mockSettingsUpsert(...args),
    },
  },
}));

// Import route handlers after mocks
import { GET, PATCH } from '@/app/api/settings/route';

describe('Settings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/settings', () => {
    describe('Success (200)', () => {
      it('returns existing settings', async () => {
        const mockSettings = {
          id: 'default',
          siteName: 'Motico Solutions',
          contactEmail: 'info@motico.com',
          currency: 'USD',
        };
        mockSettingsFindUnique.mockResolvedValue(mockSettings);

        const response = await GET();
        const data = await getResponseJson(response) as { id: string; siteName: string };

        expect(response.status).toBe(200);
        expect(data.id).toBe('default');
        expect(data.siteName).toBe('Motico Solutions');
      });

      it('creates default settings if not exist', async () => {
        mockSettingsFindUnique.mockResolvedValue(null);
        mockSettingsCreate.mockResolvedValue({
          id: 'default',
          siteName: null,
          currency: 'USD',
        });

        const response = await GET();
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
      });

      it('updates settings', async () => {
        mockSettingsUpsert.mockResolvedValue({
          id: 'default',
          siteName: 'Updated Site Name',
          contactEmail: 'new@email.com',
        });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: { siteName: 'Updated Site Name', contactEmail: 'new@email.com' },
        });
        const response = await PATCH(request);
        const data = await getResponseJson(response) as { siteName: string };

        expect(response.status).toBe(200);
        expect(data.siteName).toBe('Updated Site Name');
      });

      it('only allows whitelisted fields', async () => {
        mockSettingsUpsert.mockResolvedValue({ id: 'default' });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: {
            siteName: 'Valid',
            dangerousField: 'should be ignored',
            id: 'trying to change id',
          },
        });
        await PATCH(request);

        expect(mockSettingsUpsert).toHaveBeenCalledWith({
          where: { id: 'default' },
          update: { siteName: 'Valid' },
          create: expect.objectContaining({
            id: 'default',
            siteName: 'Valid',
          }),
        });
      });

      it('updates social media links', async () => {
        mockSettingsUpsert.mockResolvedValue({ id: 'default' });

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

        expect(mockSettingsUpsert).toHaveBeenCalledWith({
          where: { id: 'default' },
          update: expect.objectContaining({
            socialFacebook: 'https://facebook.com/motico',
            socialInstagram: 'https://instagram.com/motico',
          }),
          create: expect.any(Object),
        });
      });

      it('updates numeric fields', async () => {
        mockSettingsUpsert.mockResolvedValue({ id: 'default' });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: {
            taxRate: 11.5,
            shippingFee: 15,
            freeShippingThreshold: 100,
            lowStockAlertThreshold: 5,
          },
        });
        await PATCH(request);

        expect(mockSettingsUpsert).toHaveBeenCalledWith({
          where: { id: 'default' },
          update: expect.objectContaining({
            taxRate: 11.5,
            shippingFee: 15,
            freeShippingThreshold: 100,
            lowStockAlertThreshold: 5,
          }),
          create: expect.any(Object),
        });
      });

      it('updates boolean fields', async () => {
        mockSettingsUpsert.mockResolvedValue({ id: 'default' });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: {
            enableEmailNotifications: false,
          },
        });
        await PATCH(request);

        expect(mockSettingsUpsert).toHaveBeenCalledWith({
          where: { id: 'default' },
          update: expect.objectContaining({
            enableEmailNotifications: false,
          }),
          create: expect.any(Object),
        });
      });

      it('upserts settings if they do not exist', async () => {
        mockSettingsUpsert.mockResolvedValue({
          id: 'default',
          siteName: 'New Site',
        });

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: { siteName: 'New Site' },
        });
        await PATCH(request);

        expect(mockSettingsUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'default' },
            create: expect.objectContaining({ id: 'default' }),
          })
        );
      });
    });

    describe('Server Error (500)', () => {
      beforeEach(() => {
        mockGetCurrentUser.mockResolvedValue({
          id: 'admin-1',
          role: 'admin',
        });
      });

      it('returns 500 on update failure', async () => {
        mockSettingsUpsert.mockRejectedValue(new Error('Update failed'));

        const request = createMockRequest('http://localhost/api/settings', {
          method: 'PATCH',
          body: { siteName: 'Test' },
        });
        const response = await PATCH(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to update settings' });
      });
    });
  });
});
