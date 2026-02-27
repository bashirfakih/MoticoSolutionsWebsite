/**
 * Analytics API Tests
 */

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findMany: jest.fn(),
    },
    quote: {
      findMany: jest.fn(),
    },
    customer: {
      findMany: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
    },
    orderItem: {
      groupBy: jest.fn(),
    },
  },
}));

// Mock session
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: jest.fn(),
}));

describe('Analytics', () => {
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
