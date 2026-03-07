'use server';

/**
 * Dashboard Server Actions
 *
 * Additional KPI queries for the admin dashboard.
 *
 * @module lib/actions/dashboard
 */

import { prisma } from '@/lib/db';

export interface DashboardKPIs {
  aov: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    productSku: string;
    totalRevenue: number;
  }>;
}

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const [totalOrders, totalRevenue, totalQuotes, convertedQuotes, topProductItems] =
    await Promise.all([
      prisma.order.count({ where: { status: { not: 'cancelled' } } }),
      prisma.order.aggregate({
        where: { status: { not: 'cancelled' } },
        _sum: { total: true },
      }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: 'converted' } }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 5,
      }),
    ]);

  const aov = totalOrders > 0
    ? Number(totalRevenue._sum.total ?? 0) / totalOrders
    : 0;

  const conversionRate = totalQuotes > 0
    ? Math.round((convertedQuotes / totalQuotes) * 100)
    : 0;

  // Enrich top products with names
  const productIds = topProductItems.map(p => p.productId);
  const products = productIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      })
    : [];

  const topProducts = topProductItems.map(tp => {
    const product = products.find(p => p.id === tp.productId);
    return {
      productId: tp.productId,
      productName: product?.name ?? 'Unknown Product',
      productSku: product?.sku ?? '',
      totalRevenue: Number(tp._sum.totalPrice ?? 0),
    };
  });

  return { aov, conversionRate, topProducts };
}
