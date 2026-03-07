/**
 * Dashboard Stats Cache
 *
 * Client-side singleton for /api/dashboard/stats.
 * - ONE polling timer shared across all consumers (layout badges, dashboard page, etc.)
 * - Deduplicates concurrent requests (only one in-flight fetch at a time)
 * - Subscribers are notified when data changes
 *
 * @module lib/api/dashboardCache
 */

import type { DashboardStats } from './dashboardApi';

const STALE_MS = 120_000; // 2 minutes — matches poll interval
const POLL_MS = 120_000;  // 2 minutes

let cachedData: DashboardStats | null = null;
let cachedAt = 0;
let inflightRequest: Promise<DashboardStats> | null = null;
let listeners: Array<() => void> = [];

// Singleton polling state
let pollTimer: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

function isFresh(): boolean {
  return cachedData !== null && Date.now() - cachedAt < STALE_MS;
}

async function fetchFromApi(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats', {
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || 'Failed to fetch dashboard stats');
  }
  return res.json();
}

/**
 * Get dashboard stats with deduplication.
 * - Returns cached data if fresh (< 2min old)
 * - Deduplicates concurrent calls (only one in-flight request at a time)
 * - Notifies subscribers when data changes
 */
export async function getDashboardStatsCached(
  options: { forceRefresh?: boolean } = {}
): Promise<DashboardStats> {
  // Return cached if fresh and not forcing
  if (!options.forceRefresh && isFresh() && cachedData) {
    return cachedData;
  }

  // Deduplicate: if a request is already in-flight, await it
  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = fetchFromApi()
    .then((data) => {
      cachedData = data;
      cachedAt = Date.now();
      notifyListeners();
      return data;
    })
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
}

/**
 * Get the currently cached data without triggering a fetch.
 */
export function getCachedStats(): DashboardStats | null {
  return cachedData;
}

/**
 * Invalidate the cache (e.g., after a mutation like reading a message).
 */
export function invalidateDashboardCache(): void {
  cachedAt = 0;
}

function notifyListeners() {
  for (const fn of listeners) {
    fn();
  }
}

/**
 * Subscribe to cache updates AND start the singleton poll timer.
 * The timer only runs while at least one subscriber exists.
 * Returns an unsubscribe function.
 */
export function subscribeToDashboardStats(callback: () => void): () => void {
  listeners.push(callback);
  subscriberCount++;

  // Start the singleton poll timer on first subscriber
  if (subscriberCount === 1 && !pollTimer) {
    pollTimer = setInterval(() => {
      getDashboardStatsCached({ forceRefresh: true }).catch(() => {});
    }, POLL_MS);
  }

  return () => {
    listeners = listeners.filter((fn) => fn !== callback);
    subscriberCount--;

    // Stop polling when no subscribers remain
    if (subscriberCount <= 0 && pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
      subscriberCount = 0;
    }
  };
}
