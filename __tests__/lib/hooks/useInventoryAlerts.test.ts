/**
 * useInventoryAlerts Hook Tests
 *
 * Tests initial state, fetching alerts, filtering, notifications, and error handling
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useInventoryAlerts } from '@/lib/hooks/useInventoryAlerts';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useInventoryAlerts', () => {
  const mockAlertsResponse = {
    alerts: [
      {
        id: '1',
        sku: 'SKU-001',
        name: 'Low Stock Product',
        slug: 'low-stock-product',
        stockQuantity: 5,
        minStockLevel: 10,
        stockStatus: 'low_stock',
        severity: 'warning',
        category: { id: 'cat-1', name: 'Tools' },
        brand: { id: 'brand-1', name: 'TestBrand' },
        primaryImage: '/product.jpg',
        lastRestocked: '2024-01-15T00:00:00Z',
        daysSinceRestock: 30,
      },
      {
        id: '2',
        sku: 'SKU-002',
        name: 'Out of Stock Product',
        slug: 'out-of-stock-product',
        stockQuantity: 0,
        minStockLevel: 10,
        stockStatus: 'out_of_stock',
        severity: 'critical',
        category: { id: 'cat-2', name: 'Safety' },
        brand: null,
        primaryImage: null,
        lastRestocked: null,
        daysSinceRestock: null,
      },
    ],
    summary: {
      critical: 1,
      warning: 1,
      total: 2,
    },
    threshold: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('has correct initial state with autoFetch=false', () => {
      const { result } = renderHook(() => useInventoryAlerts(false));

      expect(result.current.alerts).toEqual([]);
      expect(result.current.summary).toEqual({ critical: 0, warning: 0, total: 0 });
      expect(result.current.threshold).toBe(10);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.filters).toEqual({});
    });

    it('exposes all expected actions', () => {
      const { result } = renderHook(() => useInventoryAlerts(false));

      expect(typeof result.current.fetchAlerts).toBe('function');
      expect(typeof result.current.updateFilters).toBe('function');
      expect(typeof result.current.sendNotification).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
    });

    it('auto-fetches alerts when autoFetch=true (default)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      renderHook(() => useInventoryAlerts());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/inventory/alerts')
        );
      });
    });

    it('does not auto-fetch when autoFetch=false', () => {
      renderHook(() => useInventoryAlerts(false));

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('fetchAlerts', () => {
    it('fetches alerts and updates state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts();
      });

      expect(result.current.alerts).toEqual(mockAlertsResponse.alerts);
      expect(result.current.summary).toEqual(mockAlertsResponse.summary);
      expect(result.current.threshold).toBe(10);
    });

    it('sets isLoading to true during fetch', async () => {
      let resolvePromise: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockImplementationOnce(() => fetchPromise);

      const { result } = renderHook(() => useInventoryAlerts(false));

      act(() => {
        result.current.fetchAlerts();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => mockAlertsResponse,
        });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('includes severity filter in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts({ severity: 'critical' });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('severity=critical')
      );
    });

    it('includes categoryId filter in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts({ categoryId: 'cat-123' });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('categoryId=cat-123')
      );
    });

    it('includes brandId filter in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts({ brandId: 'brand-456' });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('brandId=brand-456')
      );
    });

    it('does not include severity=all in request params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts({ severity: 'all' });
      });

      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('severity=all')
      );
    });

    it('handles fetch error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts();
      });

      expect(result.current.error).toBe('Server error');
      expect(result.current.alerts).toEqual([]);
    });

    it('handles network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts();
      });

      expect(result.current.error).toBe('Network failure');
      expect(result.current.alerts).toEqual([]);
    });

    it('handles missing alerts in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts();
      });

      expect(result.current.alerts).toEqual([]);
      expect(result.current.summary).toEqual({ critical: 0, warning: 0, total: 0 });
    });

    it('clears error on successful fetch', async () => {
      // First fetch fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed' }),
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts();
      });

      expect(result.current.error).toBe('Failed');

      // Second fetch succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      await act(async () => {
        await result.current.fetchAlerts();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('updateFilters', () => {
    it('updates filters and fetches alerts', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        result.current.updateFilters({ severity: 'critical' });
      });

      expect(result.current.filters.severity).toBe('critical');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('severity=critical')
      );
    });

    it('merges new filters with existing', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        result.current.updateFilters({ severity: 'warning' });
      });

      await act(async () => {
        result.current.updateFilters({ categoryId: 'cat-1' });
      });

      expect(result.current.filters).toEqual({
        severity: 'warning',
        categoryId: 'cat-1',
      });
    });

    it('triggers fetch with merged filters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        result.current.updateFilters({ severity: 'critical' });
      });

      await act(async () => {
        result.current.updateFilters({ brandId: 'brand-1' });
      });

      // Last call should include both filters
      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0];
      expect(lastCall).toContain('severity=critical');
      expect(lastCall).toContain('brandId=brand-1');
    });
  });

  describe('sendNotification', () => {
    it('sends notification successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, emailsSent: 1 }),
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      let response;
      await act(async () => {
        response = await result.current.sendNotification();
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/inventory/alerts/notify', {
        method: 'POST',
      });
      expect(response).toEqual({ success: true, emailsSent: 1 });
    });

    it('throws error on notification failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email service unavailable' }),
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await expect(
        act(async () => {
          await result.current.sendNotification();
        })
      ).rejects.toThrow('Email service unavailable');
    });

    it('throws error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useInventoryAlerts(false));

      await expect(
        act(async () => {
          await result.current.sendNotification();
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('refresh', () => {
    it('re-fetches with current filters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      // Set some filters first
      await act(async () => {
        result.current.updateFilters({ severity: 'critical', categoryId: 'cat-1' });
      });

      mockFetch.mockClear();

      await act(async () => {
        result.current.refresh();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('severity=critical');
      expect(url).toContain('categoryId=cat-1');
    });

    it('refreshes with empty filters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        result.current.refresh();
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/inventory/alerts?');
    });
  });

  describe('Alert Data Structure', () => {
    it('correctly maps alert severity levels', async () => {
      const alertsWithSeverities = {
        alerts: [
          { ...mockAlertsResponse.alerts[0], severity: 'critical' },
          { ...mockAlertsResponse.alerts[1], severity: 'warning' },
          { ...mockAlertsResponse.alerts[0], id: '3', severity: 'info' },
        ],
        summary: { critical: 1, warning: 1, total: 3 },
        threshold: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => alertsWithSeverities,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts();
      });

      expect(result.current.alerts[0].severity).toBe('critical');
      expect(result.current.alerts[1].severity).toBe('warning');
      expect(result.current.alerts[2].severity).toBe('info');
    });

    it('handles alerts with null optional fields', async () => {
      const alertsWithNulls = {
        alerts: [
          {
            id: '1',
            sku: 'SKU-001',
            name: 'Product',
            slug: 'product',
            stockQuantity: 0,
            minStockLevel: 10,
            stockStatus: 'out_of_stock',
            severity: 'critical',
            category: null,
            brand: null,
            primaryImage: null,
            lastRestocked: null,
            daysSinceRestock: null,
          },
        ],
        summary: { critical: 1, warning: 0, total: 1 },
        threshold: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => alertsWithNulls,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts();
      });

      const alert = result.current.alerts[0];
      expect(alert.category).toBeNull();
      expect(alert.brand).toBeNull();
      expect(alert.primaryImage).toBeNull();
      expect(alert.lastRestocked).toBeNull();
      expect(alert.daysSinceRestock).toBeNull();
    });
  });

  describe('Summary Calculations', () => {
    it('correctly updates summary counts', async () => {
      const summaryResponse = {
        alerts: [],
        summary: {
          critical: 5,
          warning: 10,
          total: 15,
        },
        threshold: 15,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => summaryResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts();
      });

      expect(result.current.summary.critical).toBe(5);
      expect(result.current.summary.warning).toBe(10);
      expect(result.current.summary.total).toBe(15);
    });

    it('updates threshold from response', async () => {
      const responseWithThreshold = {
        alerts: [],
        summary: { critical: 0, warning: 0, total: 0 },
        threshold: 25,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithThreshold,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts();
      });

      expect(result.current.threshold).toBe(25);
    });
  });

  describe('Loading State Management', () => {
    it('tracks loading state across multiple fetches', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAlertsResponse,
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      // First fetch
      const promise1 = act(async () => {
        await result.current.fetchAlerts();
      });

      await promise1;
      expect(result.current.isLoading).toBe(false);

      // Second fetch
      const promise2 = act(async () => {
        await result.current.fetchAlerts();
      });

      await promise2;
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty alerts array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          alerts: [],
          summary: { critical: 0, warning: 0, total: 0 },
          threshold: 10,
        }),
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts();
      });

      expect(result.current.alerts).toEqual([]);
      expect(result.current.summary.total).toBe(0);
    });

    it('handles malformed response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ random: 'data' }),
      });

      const { result } = renderHook(() => useInventoryAlerts(false));

      await act(async () => {
        await result.current.fetchAlerts();
      });

      // Should fall back to defaults
      expect(result.current.alerts).toEqual([]);
      expect(result.current.summary).toEqual({ critical: 0, warning: 0, total: 0 });
      expect(result.current.threshold).toBe(10);
    });
  });
});
