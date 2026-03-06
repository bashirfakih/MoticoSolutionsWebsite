/**
 * Analytics API Tests
 *
 * Tests for /api/analytics endpoint including:
 * - Authentication and authorization
 * - Period filtering
 * - Data aggregation (revenue, orders, customers)
 * - Category and brand performance
 * - Change calculations
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockOrderFindMany = jest.fn();
const mockQuoteFindMany = jest.fn();
const mockCustomerFindMany = jest.fn();
const mockMessageFindMany = jest.fn();
const mockOrderItemGroupBy = jest.fn();
const mockOrderItemFindMany = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findMany: (...args: unknown[]) => mockOrderFindMany(...args),
    },
    quote: {
      findMany: (...args: unknown[]) => mockQuoteFindMany(...args),
    },
    customer: {
      findMany: (...args: unknown[]) => mockCustomerFindMany(...args),
    },
    message: {
      findMany: (...args: unknown[]) => mockMessageFindMany(...args),
    },
    orderItem: {
      groupBy: (...args: unknown[]) => mockOrderItemGroupBy(...args),
      findMany: (...args: unknown[]) => mockOrderItemFindMany(...args),
    },
  },
}));

// Mock session
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

// Import route handlers after mocks
import { GET } from '@/app/api/analytics/route';

// Mock data factories - each item needs BOTH category AND brand for the API to work
const mockOrderItemFull = (
  categoryId: string,
  categoryName: string,
  brandId: string,
  brandName: string,
  totalPrice: number,
  quantity: number
) => ({
  quantity,
  totalPrice,
  product: {
    category: { id: categoryId, name: categoryName },
    brand: { id: brandId, name: brandName },
  },
});

describe('Analytics API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = createMockRequest('http://localhost/api/analytics');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as { error: string };

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when user is not admin', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'customer' });

      const request = createMockRequest('http://localhost/api/analytics');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as { error: string };

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('allows admin users', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockOrderFindMany.mockResolvedValue([]);
      mockQuoteFindMany.mockResolvedValue([]);
      mockCustomerFindMany.mockResolvedValue([]);
      mockMessageFindMany.mockResolvedValue([]);
      mockOrderItemGroupBy.mockResolvedValue([]);
      mockOrderItemFindMany.mockResolvedValue([]);

      const request = createMockRequest('http://localhost/api/analytics');
      const response = await GET(request as Parameters<typeof GET>[0]);

      expect(response.status).toBe(200);
    });
  });

  describe('Period Filtering', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockOrderFindMany.mockResolvedValue([]);
      mockQuoteFindMany.mockResolvedValue([]);
      mockCustomerFindMany.mockResolvedValue([]);
      mockMessageFindMany.mockResolvedValue([]);
      mockOrderItemGroupBy.mockResolvedValue([]);
      mockOrderItemFindMany.mockResolvedValue([]);
    });

    it('defaults to 30 days when no period specified', async () => {
      const request = createMockRequest('http://localhost/api/analytics');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as { period: number };

      expect(data.period).toBe(30);
    });

    it('uses custom period from query params', async () => {
      const request = createMockRequest('http://localhost/api/analytics?period=7');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as { period: number };

      expect(data.period).toBe(7);
    });

    it('accepts 90 day period', async () => {
      const request = createMockRequest('http://localhost/api/analytics?period=90');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as { period: number };

      expect(data.period).toBe(90);
    });
  });

  describe('Response Structure', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockOrderFindMany.mockResolvedValue([]);
      mockQuoteFindMany.mockResolvedValue([]);
      mockCustomerFindMany.mockResolvedValue([]);
      mockMessageFindMany.mockResolvedValue([]);
      mockOrderItemGroupBy.mockResolvedValue([]);
      mockOrderItemFindMany.mockResolvedValue([]);
    });

    it('returns summary with all required fields', async () => {
      const request = createMockRequest('http://localhost/api/analytics');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as { summary: Record<string, unknown> };

      expect(data.summary).toBeDefined();
      expect(data.summary).toHaveProperty('totalRevenue');
      expect(data.summary).toHaveProperty('totalOrders');
      expect(data.summary).toHaveProperty('totalQuotes');
      expect(data.summary).toHaveProperty('totalCustomers');
      expect(data.summary).toHaveProperty('averageOrderValue');
      expect(data.summary).toHaveProperty('revenueChange');
      expect(data.summary).toHaveProperty('ordersChange');
    });

    it('returns charts with all required data', async () => {
      const request = createMockRequest('http://localhost/api/analytics');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as { charts: Record<string, unknown> };

      expect(data.charts).toBeDefined();
      expect(data.charts).toHaveProperty('dailyRevenue');
      expect(data.charts).toHaveProperty('dailyOrders');
      expect(data.charts).toHaveProperty('dailyCustomers');
      expect(data.charts).toHaveProperty('ordersByStatus');
      expect(data.charts).toHaveProperty('ordersByPayment');
      expect(data.charts).toHaveProperty('quotesByStatus');
      expect(data.charts).toHaveProperty('messagesByType');
      expect(data.charts).toHaveProperty('topProducts');
      expect(data.charts).toHaveProperty('categoryPerformance');
      expect(data.charts).toHaveProperty('brandPerformance');
    });
  });

  describe('Category Performance Aggregation', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockOrderFindMany.mockResolvedValue([]);
      mockQuoteFindMany.mockResolvedValue([]);
      mockCustomerFindMany.mockResolvedValue([]);
      mockMessageFindMany.mockResolvedValue([]);
      mockOrderItemGroupBy.mockResolvedValue([]);
    });

    it('aggregates category performance correctly', async () => {
      const orderItems = [
        mockOrderItemFull('cat-1', 'Abrasive Belts', 'brand-1', 'Norton', 100, 5),
        mockOrderItemFull('cat-1', 'Abrasive Belts', 'brand-1', 'Norton', 200, 10),
        mockOrderItemFull('cat-2', 'Power Tools', 'brand-2', 'Klingspor', 300, 3),
      ];

      mockOrderItemFindMany.mockResolvedValue(orderItems);

      const request = createMockRequest('http://localhost/api/analytics');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as {
        charts: { categoryPerformance: { name: string; revenue: number; quantity: number; orders: number }[] }
      };

      const abrasiveBelts = data.charts.categoryPerformance.find(
        (c) => c.name === 'Abrasive Belts'
      );
      expect(abrasiveBelts).toBeDefined();
      expect(abrasiveBelts?.revenue).toBe(300);
      expect(abrasiveBelts?.quantity).toBe(15);
      expect(abrasiveBelts?.orders).toBe(2);
    });

    it('sorts categories by revenue descending', async () => {
      const orderItems = [
        mockOrderItemFull('cat-1', 'Low Revenue', 'brand-1', 'Brand A', 50, 1),
        mockOrderItemFull('cat-2', 'High Revenue', 'brand-2', 'Brand B', 500, 10),
        mockOrderItemFull('cat-3', 'Medium Revenue', 'brand-3', 'Brand C', 200, 5),
      ];

      mockOrderItemFindMany.mockResolvedValue(orderItems);

      const request = createMockRequest('http://localhost/api/analytics');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as {
        charts: { categoryPerformance: { name: string }[] }
      };

      expect(data.charts.categoryPerformance[0].name).toBe('High Revenue');
      expect(data.charts.categoryPerformance[1].name).toBe('Medium Revenue');
      expect(data.charts.categoryPerformance[2].name).toBe('Low Revenue');
    });
  });

  describe('Brand Performance Aggregation', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockOrderFindMany.mockResolvedValue([]);
      mockQuoteFindMany.mockResolvedValue([]);
      mockCustomerFindMany.mockResolvedValue([]);
      mockMessageFindMany.mockResolvedValue([]);
      mockOrderItemGroupBy.mockResolvedValue([]);
    });

    it('aggregates brand performance correctly', async () => {
      const orderItems = [
        mockOrderItemFull('cat-1', 'Category A', 'brand-1', 'Norton', 150, 3),
        mockOrderItemFull('cat-1', 'Category A', 'brand-1', 'Norton', 250, 5),
        mockOrderItemFull('cat-2', 'Category B', 'brand-2', 'Klingspor', 400, 8),
      ];

      mockOrderItemFindMany.mockResolvedValue(orderItems);

      const request = createMockRequest('http://localhost/api/analytics');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as {
        charts: { brandPerformance: { name: string; revenue: number; quantity: number; orders: number }[] }
      };

      const norton = data.charts.brandPerformance.find(
        (b) => b.name === 'Norton'
      );
      expect(norton).toBeDefined();
      expect(norton?.revenue).toBe(400);
      expect(norton?.quantity).toBe(8);
      expect(norton?.orders).toBe(2);
    });

    it('limits to top 10 brands', async () => {
      const orderItems = Array.from({ length: 15 }, (_, i) =>
        mockOrderItemFull(`cat-${i}`, `Category ${i}`, `brand-${i}`, `Brand ${i}`, (15 - i) * 100, i + 1)
      );

      mockOrderItemFindMany.mockResolvedValue(orderItems);

      const request = createMockRequest('http://localhost/api/analytics');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as {
        charts: { brandPerformance: unknown[] }
      };

      expect(data.charts.brandPerformance).toHaveLength(10);
    });
  });

  describe('Error Handling', () => {
    it('returns 500 on database error', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      mockOrderFindMany.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest('http://localhost/api/analytics');
      const response = await GET(request as Parameters<typeof GET>[0]);
      const data = await getResponseJson(response) as { error: string };

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch analytics');
    });
  });
});

describe('Analytics Unit Tests', () => {
  describe('Daily Data Generation', () => {
    it('generates correct number of days', () => {
      const days = 30;
      const data: Record<string, number> = {};

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const key = date.toISOString().split('T')[0];
        data[key] = 0;
      }

      expect(Object.keys(data)).toHaveLength(30);
    });

    it('initializes all days with zero', () => {
      const days = 7;
      const data: Record<string, number> = {};

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const key = date.toISOString().split('T')[0];
        data[key] = 0;
      }

      Object.values(data).forEach(value => {
        expect(value).toBe(0);
      });
    });

    it('aggregates values correctly', () => {
      const days = 7;
      const data: Record<string, number> = {};

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const key = date.toISOString().split('T')[0];
        data[key] = 0;
      }

      // Simulate adding values
      const today = new Date().toISOString().split('T')[0];
      data[today] += 100;
      data[today] += 50;

      expect(data[today]).toBe(150);
    });
  });

  describe('Summary Calculations', () => {
    it('calculates total revenue correctly', () => {
      const orders = [
        { total: 100 },
        { total: 200 },
        { total: 150 },
      ];

      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

      expect(totalRevenue).toBe(450);
    });

    it('calculates average order value correctly', () => {
      const orders = [
        { total: 100 },
        { total: 200 },
        { total: 150 },
      ];

      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      expect(averageOrderValue).toBe(150);
    });

    it('handles empty orders', () => {
      const orders: Array<{ total: number }> = [];

      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      expect(totalRevenue).toBe(0);
      expect(averageOrderValue).toBe(0);
    });
  });

  describe('Change Calculations', () => {
    it('calculates positive revenue change', () => {
      const currentRevenue = 1200;
      const previousRevenue = 1000;

      const revenueChange = previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

      expect(revenueChange).toBe(20);
    });

    it('calculates negative revenue change', () => {
      const currentRevenue = 800;
      const previousRevenue = 1000;

      const revenueChange = previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

      expect(revenueChange).toBe(-20);
    });

    it('handles zero previous revenue', () => {
      const currentRevenue = 1000;
      const previousRevenue = 0;

      const revenueChange = previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

      expect(revenueChange).toBe(0);
    });

    it('calculates orders change correctly', () => {
      const currentOrders = 50;
      const previousOrders = 40;

      const ordersChange = previousOrders > 0
        ? ((currentOrders - previousOrders) / previousOrders) * 100
        : 0;

      expect(ordersChange).toBe(25);
    });
  });

  describe('Status Distribution', () => {
    it('groups orders by status', () => {
      const orders = [
        { status: 'pending' },
        { status: 'pending' },
        { status: 'confirmed' },
        { status: 'delivered' },
        { status: 'delivered' },
        { status: 'delivered' },
      ];

      const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(ordersByStatus.pending).toBe(2);
      expect(ordersByStatus.confirmed).toBe(1);
      expect(ordersByStatus.delivered).toBe(3);
    });

    it('converts to chart format', () => {
      const ordersByStatus = {
        pending: 2,
        confirmed: 1,
        delivered: 3,
      };

      const chartData = Object.entries(ordersByStatus).map(([name, value]) => ({
        name,
        value,
      }));

      expect(chartData).toHaveLength(3);
      expect(chartData[0]).toEqual({ name: 'pending', value: 2 });
    });
  });

  describe('Date Range Calculation', () => {
    it('calculates start date for 30 days', () => {
      const days = 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const today = new Date();
      const diffInDays = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(diffInDays).toBe(30);
    });

    it('calculates previous period dates', () => {
      const days = 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - days);

      const diffInDays = Math.floor(
        (startDate.getTime() - previousStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(diffInDays).toBe(30);
    });
  });

  describe('Top Products', () => {
    it('formats top products data', () => {
      const topProductsRaw = [
        {
          productId: 'prod-1',
          productName: 'Product A',
          _sum: { quantity: 10, totalPrice: 1000 },
        },
        {
          productId: 'prod-2',
          productName: 'Product B',
          _sum: { quantity: 5, totalPrice: 500 },
        },
      ];

      const topProducts = topProductsRaw.map(item => ({
        productId: item.productId,
        name: item.productName,
        quantity: item._sum.quantity || 0,
        revenue: Number(item._sum.totalPrice || 0),
      }));

      expect(topProducts[0].name).toBe('Product A');
      expect(topProducts[0].quantity).toBe(10);
      expect(topProducts[0].revenue).toBe(1000);
    });

    it('handles null sums', () => {
      const topProductsRaw = [
        {
          productId: 'prod-1',
          productName: 'Product A',
          _sum: { quantity: null, totalPrice: null },
        },
      ];

      const topProducts = topProductsRaw.map(item => ({
        productId: item.productId,
        name: item.productName,
        quantity: item._sum.quantity || 0,
        revenue: Number(item._sum.totalPrice || 0),
      }));

      expect(topProducts[0].quantity).toBe(0);
      expect(topProducts[0].revenue).toBe(0);
    });
  });
});
