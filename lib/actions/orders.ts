'use server';

/**
 * Order Server Actions
 *
 * Bulk operations for orders management.
 *
 * @module lib/actions/orders
 */

import { prisma } from '@/lib/db';

export async function bulkUpdateOrderStatus(ids: string[], status: string) {
  await prisma.order.updateMany({
    where: { id: { in: ids } },
    data: { status: status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' },
  });
}

export async function exportOrdersByIds(ids: string[]) {
  const orders = await prisma.order.findMany({
    where: { id: { in: ids } },
    include: { customer: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(o => ({
    'Order #': o.orderNumber,
    'Customer': o.customerName,
    'Email': o.customerEmail,
    'Status': o.status,
    'Payment': o.paymentStatus,
    'Total': Number(o.total),
    'Date': o.createdAt.toISOString(),
  }));
}
