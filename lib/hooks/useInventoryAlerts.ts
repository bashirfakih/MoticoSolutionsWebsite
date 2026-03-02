/**
 * Inventory Alerts Hook
 *
 * Fetches and manages inventory alerts for admin dashboard
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface InventoryAlert {
  id: string;
  sku: string;
  name: string;
  slug: string;
  stockQuantity: number;
  minStockLevel: number;
  stockStatus: string;
  severity: 'critical' | 'warning' | 'info';
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  primaryImage: string | null;
  lastRestocked: string | null;
  daysSinceRestock: number | null;
}

interface AlertsSummary {
  critical: number;
  warning: number;
  total: number;
}

interface AlertsFilters {
  severity?: 'critical' | 'warning' | 'all';
  categoryId?: string;
  brandId?: string;
}

export function useInventoryAlerts(autoFetch = true) {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [summary, setSummary] = useState<AlertsSummary>({ critical: 0, warning: 0, total: 0 });
  const [threshold, setThreshold] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AlertsFilters>({});

  const fetchAlerts = useCallback(async (alertFilters: AlertsFilters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (alertFilters.severity && alertFilters.severity !== 'all') {
        params.set('severity', alertFilters.severity);
      }
      if (alertFilters.categoryId) params.set('categoryId', alertFilters.categoryId);
      if (alertFilters.brandId) params.set('brandId', alertFilters.brandId);

      const response = await fetch(`/api/inventory/alerts?${params}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
      setSummary(data.summary || { critical: 0, warning: 0, total: 0 });
      setThreshold(data.threshold || 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendNotification = useCallback(async () => {
    try {
      const response = await fetch('/api/inventory/alerts/notify', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send notification');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<AlertsFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchAlerts(updatedFilters);
  }, [filters, fetchAlerts]);

  const refresh = useCallback(() => {
    fetchAlerts(filters);
  }, [filters, fetchAlerts]);

  useEffect(() => {
    if (autoFetch) {
      fetchAlerts(filters);
    }
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    alerts,
    summary,
    threshold,
    isLoading,
    error,
    filters,
    fetchAlerts,
    updateFilters,
    sendNotification,
    refresh,
  };
}
