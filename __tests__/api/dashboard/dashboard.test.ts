/**
 * Dashboard Stats API Route Tests
 *
 * Tests for /api/dashboard/stats endpoint
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { getResponseJson } from '../helpers/testHelpers';

// Mock session
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Mock Prisma
const mockOrderCount = jest.fn();
const mockCustomerCount = jest.fn();
const mockProductCount = jest.fn();
const mockBrandCount = jest.fn();
const mockCategoryCount = jest.fn();
const mockMessageCount = jest.fn();
const mockQuoteCount = jest.fn();
const mockOrderAggregate = jest.fn();
const mockOrderFindMany = jest.fn();
const mockOrderGroupBy = jest.fn();
const mockQueryRaw = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    order: {
      count: (...args: unknown[]) => mockOrderCount(...args),
      aggregate: (...args: unknown[]) => mockOrderAggregate(...args),
      findMany: (...args: unknown[]) => mockOrderFindMany(...args),
      groupBy: (...args: unknown[]) => mockOrderGroupBy(...args),
    },
    customer: {
      count: (...args: unknown[]) => mockCustomerCount(...args),
    },
    product: {
      count: (...args: unknown[]) => mockProductCount(...args),
    },
    brand: {
      count: (...args: unknown[]) => mockBrandCount(...args),
    },
    category: {
      count: (...args: unknown[]) => mockCategoryCount(...args),
    },
    message: {
      count: (...args: unknown[]) => mockMessageCount(...args),
    },
    quote: {
      count: (...args: unknown[]) => mockQuoteCount(...args),
    },
    $queryRaw: (...args: unknown[]) => mockQueryRaw(...args),
  },
}));

// Import route handler after mocks
import { GET } from '@/app/api/dashboard/stats/route';

describe('Dashboard Stats API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to admin user
    mockGetCurrentUser.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'admin',
    });
  });

  describe('GET /api/dashboard/stats', () => {
    describe('Unauthorized (401)', () => {
      it('returns 401 when user is not authenticated', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const response = await GET();
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });

      it('returns 401 when user is not admin', async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: 'user-1',
          role: 'customer',
        });

        const response = await GET();
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });

      it('returns 401 for staff role', async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: 'user-1',
          role: 'staff',
        });

        const response = await GET();
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      });
    });

    describe('Success (200)', () => {
      beforeEach(() => {
        // Setup default mock responses
        mockOrderCount.mockResolvedValue(100);
        mockCustomerCount.mockResolvedValue(50);
        mockProductCount.mockResolvedValue(200);
        mockBrandCount.mockResolvedValue(10);
        mockCategoryCount.mockResolvedValue(25);
        mockMessageCount.mockResolvedValue(30);
        mockQuoteCount.mockResolvedValue(15);
        mockOrderAggregate.mockResolvedValue({ _sum: { total: 15000 } });
        mockOrderFindMany.mockResolvedValue([
          { id: 'order-1', orderNumber: 'ORD-001', customerName: 'John', total: 100, status: 'pending', createdAt: new Date() },
        ]);
        mockOrderGroupBy.mockResolvedValue([
          { status: 'pending', _count: { status: 20 } },
          { status: 'delivered', _count: { status: 80 } },
        ]);
        mockQueryRaw.mockResolvedValue([{ count: BigInt(5) }]);
      });

      it('returns dashboard statistics for admin', async () => {
        const response = await GET();
        const data = await getResponseJson(response) as {
          overview: { totalOrders: number; totalCustomers: number };
          alerts: { unreadMessages: number };
        };

        expect(response.status).toBe(200);
        expect(data.overview).toBeDefined();
        expect(data.alerts).toBeDefined();
        expect(data.overview.totalOrders).toBe(100);
        expect(data.overview.totalCustomers).toBe(50);
      });

      it('returns overview stats', async () => {
        const response = await GET();
        const data = await getResponseJson(response) as {
          overview: {
            totalOrders: number;
            totalProducts: number;
            totalBrands: number;
            totalCategories: number;
          };
        };

        expect(data.overview.totalOrders).toBe(100);
        expect(data.overview.totalProducts).toBe(200);
        expect(data.overview.totalBrands).toBe(10);
        expect(data.overview.totalCategories).toBe(25);
      });

      it('returns alerts counts', async () => {
        mockMessageCount.mockResolvedValueOnce(5); // unread
        mockMessageCount.mockResolvedValueOnce(30); // total
        mockQuoteCount.mockResolvedValueOnce(3); // pending
        mockQuoteCount.mockResolvedValueOnce(15); // total

        const response = await GET();
        const data = await getResponseJson(response) as {
          alerts: { unreadMessages: number; pendingQuotes: number; lowStockProducts: number };
        };

        expect(data.alerts.unreadMessages).toBeDefined();
        expect(data.alerts.pendingQuotes).toBeDefined();
        expect(data.alerts.lowStockProducts).toBeDefined();
      });

      it('returns recent orders', async () => {
        const response = await GET();
        const data = await getResponseJson(response) as {
          orders: { recent: { orderNumber: string }[] };
        };

        expect(data.orders.recent).toBeDefined();
        expect(Array.isArray(data.orders.recent)).toBe(true);
      });

      it('returns orders by status breakdown', async () => {
        const response = await GET();
        const data = await getResponseJson(response) as {
          orders: { byStatus: Record<string, number> };
        };

        expect(data.orders.byStatus).toBeDefined();
      });

      it('calculates month-over-month changes', async () => {
        mockOrderAggregate
          .mockResolvedValueOnce({ _sum: { total: 10000 } })  // This month
          .mockResolvedValueOnce({ _sum: { total: 8000 } });   // Last month

        const response = await GET();
        const data = await getResponseJson(response) as {
          overview: { revenueChange: number };
        };

        expect(data.overview.revenueChange).toBeDefined();
        expect(typeof data.overview.revenueChange).toBe('number');
      });

      it('converts BigInt from raw query to number', async () => {
        mockQueryRaw.mockResolvedValue([{ count: BigInt(15) }]);

        const response = await GET();
        const data = await getResponseJson(response) as {
          alerts: { lowStockProducts: number };
        };

        expect(data.alerts.lowStockProducts).toBe(15);
        expect(typeof data.alerts.lowStockProducts).toBe('number');
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockOrderCount.mockRejectedValue(new Error('Database error'));

        const response = await GET();
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch dashboard stats' });
      });
    });
  });
});
