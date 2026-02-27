/**
 * Dashboard API Client
 *
 * Client-side service for dashboard stats.
 *
 * @module lib/api/dashboardApi
 */

export interface DashboardStats {
  overview: {
    totalOrders: number;
    ordersThisMonth: number;
    ordersChange: number;
    totalRevenue: number;
    revenueChange: number;
    totalCustomers: number;
    totalProducts: number;
    totalBrands: number;
    totalCategories: number;
  };
  alerts: {
    unreadMessages: number;
    pendingQuotes: number;
    lowStockProducts: number;
  };
  orders: {
    byStatus: Record<string, number>;
    recent: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      total: number;
      status: string;
      createdAt: string;
    }>;
  };
  messages: {
    total: number;
    unread: number;
  };
  quotes: {
    total: number;
    pending: number;
  };
}

/**
 * Fetch dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats', {
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch dashboard stats');
  }

  return res.json();
}

/**
 * Dashboard API service object
 */
export const dashboardApiService = {
  getStats: getDashboardStats,
};
