/**
 * Analytics API Route
 *
 * GET /api/analytics - Get analytics data for dashboard charts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get orders data for charts
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        total: true,
        status: true,
        paymentStatus: true,
        itemCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get quotes data
    const quotes = await prisma.quote.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
      },
    });

    // Get customer data
    const customers = await prisma.customer.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    // Get messages data
    const messages = await prisma.message.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        status: true,
        type: true,
        createdAt: true,
      },
    });

    // Calculate daily revenue
    const dailyRevenue = generateDailyData(days, orders, (order) => ({
      date: order.createdAt,
      value: Number(order.total),
    }));

    // Calculate daily orders
    const dailyOrders = generateDailyData(days, orders, (order) => ({
      date: order.createdAt,
      value: 1,
    }));

    // Calculate daily customers
    const dailyCustomers = generateDailyData(days, customers, (customer) => ({
      date: customer.createdAt,
      value: 1,
    }));

    // Order status distribution
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Payment status distribution
    const ordersByPayment = orders.reduce((acc, order) => {
      acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Quote status distribution
    const quotesByStatus = quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Message type distribution
    const messagesByType = messages.reduce((acc, message) => {
      acc[message.type] = (acc[message.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = orders.length;
    const totalQuotes = quotes.length;
    const totalCustomers = customers.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products (from order items)
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: {
        order: {
          createdAt: { gte: startDate },
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
      take: 10,
    });

    const topProducts = topProductsRaw.map(item => ({
      productId: item.productId,
      name: item.productName,
      quantity: item._sum.quantity || 0,
      revenue: Number(item._sum.totalPrice || 0),
    }));

    // Category performance - aggregate order items by category
    const orderItemsWithCategory = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
        },
      },
      select: {
        quantity: true,
        totalPrice: true,
        product: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const categoryPerformanceMap = new Map<string, { name: string; orders: number; revenue: number; quantity: number }>();
    for (const item of orderItemsWithCategory) {
      const categoryId = item.product.category.id;
      const categoryName = item.product.category.name;
      const existing = categoryPerformanceMap.get(categoryId) || { name: categoryName, orders: 0, revenue: 0, quantity: 0 };
      existing.orders += 1;
      existing.revenue += Number(item.totalPrice);
      existing.quantity += item.quantity;
      categoryPerformanceMap.set(categoryId, existing);
    }

    const categoryPerformance = Array.from(categoryPerformanceMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        orders: data.orders,
        revenue: Math.round(data.revenue * 100) / 100,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Brand performance - aggregate order items by brand
    const orderItemsWithBrand = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
        },
      },
      select: {
        quantity: true,
        totalPrice: true,
        product: {
          select: {
            brand: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const brandPerformanceMap = new Map<string, { name: string; orders: number; revenue: number; quantity: number }>();
    for (const item of orderItemsWithBrand) {
      const brandId = item.product.brand.id;
      const brandName = item.product.brand.name;
      const existing = brandPerformanceMap.get(brandId) || { name: brandName, orders: 0, revenue: 0, quantity: 0 };
      existing.orders += 1;
      existing.revenue += Number(item.totalPrice);
      existing.quantity += item.quantity;
      brandPerformanceMap.set(brandId, existing);
    }

    const brandPerformance = Array.from(brandPerformanceMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        orders: data.orders,
        revenue: Math.round(data.revenue * 100) / 100,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate comparison with previous period
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      select: {
        total: true,
      },
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const revenueChange = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    const ordersChange = previousOrders.length > 0
      ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100
      : 0;

    return NextResponse.json({
      period: days,
      summary: {
        totalRevenue,
        totalOrders,
        totalQuotes,
        totalCustomers,
        averageOrderValue,
        revenueChange,
        ordersChange,
      },
      charts: {
        dailyRevenue,
        dailyOrders,
        dailyCustomers,
        ordersByStatus: Object.entries(ordersByStatus).map(([name, value]) => ({ name, value })),
        ordersByPayment: Object.entries(ordersByPayment).map(([name, value]) => ({ name, value })),
        quotesByStatus: Object.entries(quotesByStatus).map(([name, value]) => ({ name, value })),
        messagesByType: Object.entries(messagesByType).map(([name, value]) => ({ name, value })),
        topProducts,
        categoryPerformance,
        brandPerformance,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Helper function to generate daily data
function generateDailyData<T>(
  days: number,
  items: T[],
  extractor: (item: T) => { date: Date; value: number }
): Array<{ date: string; value: number }> {
  const data: Record<string, number> = {};

  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const key = date.toISOString().split('T')[0];
    data[key] = 0;
  }

  // Sum up values for each day
  items.forEach(item => {
    const { date, value } = extractor(item);
    const key = date.toISOString().split('T')[0];
    if (data[key] !== undefined) {
      data[key] += value;
    }
  });

  return Object.entries(data).map(([date, value]) => ({
    date,
    value: Math.round(value * 100) / 100,
  }));
}
