/**
 * Dashboard Stats API Route
 *
 * GET /api/dashboard/stats - Get dashboard statistics
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  try {
    // Verify admin access
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Calculate dates for 7-day revenue
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Run all queries in parallel
    const [
      // Total counts
      totalOrders,
      totalCustomers,
      totalProducts,
      totalBrands,
      totalCategories,

      // Messages
      unreadMessages,
      totalMessages,

      // Quotes
      pendingQuotes,
      totalQuotes,

      // Orders this month
      ordersThisMonth,
      ordersLastMonth,

      // Revenue this month
      revenueThisMonth,
      revenueLastMonth,

      // Recent orders
      recentOrders,

      // Order status breakdown
      ordersByStatus,

      // Low stock products
      lowStockProducts,

      // New stats
      ordersLast24Hours,
      outOfStockProducts,
      ordersForDailyRevenue,
    ] = await Promise.all([
      // Counts
      prisma.order.count(),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.brand.count(),
      prisma.category.count(),

      // Messages
      prisma.message.count({ where: { status: 'unread' } }),
      prisma.message.count(),

      // Quotes
      prisma.quote.count({ where: { status: 'pending' } }),
      prisma.quote.count(),

      // Orders this month
      prisma.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),

      // Revenue this month
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfMonth },
          paymentStatus: 'paid',
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          paymentStatus: 'paid',
        },
      }),

      // Recent orders (last 10)
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Low stock products (using raw query for field comparison)
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint as count
        FROM products
        WHERE "trackInventory" = true
        AND "stockQuantity" <= "minStockLevel"
      `,

      // Orders in last 24 hours
      prisma.order.count({
        where: { createdAt: { gte: last24Hours } },
      }),

      // Out of stock products
      prisma.product.count({
        where: {
          trackInventory: true,
          stockQuantity: 0,
        },
      }),

      // 7-day daily revenue (orders with payment status 'paid')
      prisma.order.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          paymentStatus: 'paid',
        },
        select: {
          createdAt: true,
          total: true,
        },
      }),
    ]);

    // Calculate month-over-month changes
    const revenueThisMonthValue = Number(revenueThisMonth._sum.total || 0);
    const revenueLastMonthValue = Number(revenueLastMonth._sum.total || 0);
    const revenueChange = revenueLastMonthValue > 0
      ? ((revenueThisMonthValue - revenueLastMonthValue) / revenueLastMonthValue) * 100
      : 0;

    const ordersChange = ordersLastMonth > 0
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100
      : 0;

    // Format order status breakdown
    const statusBreakdown = ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Extract low stock count from raw query result
    const lowStockCount = Number(lowStockProducts[0]?.count || 0);

    // Calculate daily revenue for the last 7 days
    const dailyRevenueMap = new Map<string, number>();

    // Initialize all 7 days with 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyRevenueMap.set(dateStr, 0);
    }

    // Aggregate orders by date
    for (const order of ordersForDailyRevenue) {
      const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
      const current = dailyRevenueMap.get(dateStr) || 0;
      dailyRevenueMap.set(dateStr, current + Number(order.total));
    }

    // Convert to sorted array (oldest first)
    const dailyRevenue = Array.from(dailyRevenueMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      overview: {
        totalOrders,
        ordersThisMonth,
        ordersChange: Math.round(ordersChange * 10) / 10,
        totalRevenue: revenueThisMonthValue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        totalCustomers,
        totalProducts,
        totalBrands,
        totalCategories,
      },
      alerts: {
        unreadMessages,
        pendingQuotes,
        lowStockProducts: lowStockCount,
      },
      orders: {
        byStatus: statusBreakdown,
        recent: recentOrders.map(order => ({
          ...order,
          total: Number(order.total),
        })),
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages,
      },
      quotes: {
        total: totalQuotes,
        pending: pendingQuotes,
      },
      // New actionable widget stats
      ordersLast24Hours,
      outOfStockProducts,
      dailyRevenue,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
