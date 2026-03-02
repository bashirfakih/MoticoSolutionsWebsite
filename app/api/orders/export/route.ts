/**
 * Orders Export API Route
 *
 * GET /api/orders/export - Export orders as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { generateOrdersCSV, generateOrderItemsCSV } from '@/lib/export';
import { Prisma } from '@prisma/client';

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
    const format = searchParams.get('format') || 'csv';
    const type = searchParams.get('type') || 'orders'; // orders or items
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customerId = searchParams.get('customerId');

    // Build where clause
    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded';
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt as Prisma.DateTimeFilter, gte: new Date(startDate) };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { ...where.createdAt as Prisma.DateTimeFilter, lte: end };
    }

    if (customerId) {
      where.customerId = customerId;
    }

    // Fetch orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: type === 'items',
      },
      orderBy: { createdAt: 'desc' },
    });

    let csvContent: string;
    let filename: string;

    if (type === 'items') {
      // Export order items
      const items = orders.flatMap(order =>
        order.items.map(item => ({
          orderNumber: order.orderNumber,
          productName: item.productName,
          productSku: item.productSku,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          currency: order.currency,
        }))
      );

      csvContent = generateOrderItemsCSV(items);
      filename = `order-items-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      // Export orders
      const ordersData = orders.map(order => ({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        status: order.status,
        paymentStatus: order.paymentStatus,
        itemCount: order.itemCount,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
        currency: order.currency,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
      }));

      csvContent = generateOrdersCSV(ordersData);
      filename = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Orders export error:', error);
    return NextResponse.json(
      { error: 'Failed to export orders' },
      { status: 500 }
    );
  }
}
