/**
 * Order Tracking API Route
 *
 * GET /api/orders/track - Track order by order number (public)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required' },
        { status: 400 }
      );
    }

    // Find order by order number and email
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.toUpperCase(),
        customerEmail: email.toLowerCase(),
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        status: true,
        paymentStatus: true,
        itemCount: true,
        subtotal: true,
        shippingCost: true,
        tax: true,
        discount: true,
        total: true,
        currency: true,
        shippingAddress: true,
        createdAt: true,
        paidAt: true,
        shippedAt: true,
        deliveredAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            productSku: true,
            variantName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please check your order number and email.' },
        { status: 404 }
      );
    }

    // Build tracking timeline
    const timeline = buildTimeline(order);

    return NextResponse.json({
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
        items: order.items.map(item => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
      },
      timeline,
    });
  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    );
  }
}

interface OrderData {
  status: string;
  paymentStatus: string;
  createdAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
}

interface TimelineEvent {
  status: string;
  label: string;
  description: string;
  date: Date | null;
  completed: boolean;
  current: boolean;
}

function buildTimeline(order: OrderData): TimelineEvent[] {
  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);

  const timeline: TimelineEvent[] = [
    {
      status: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received',
      date: order.createdAt,
      completed: currentIndex >= 0,
      current: order.status === 'pending',
    },
    {
      status: 'confirmed',
      label: 'Order Confirmed',
      description: 'Your order has been confirmed and is being prepared',
      date: currentIndex >= 1 ? order.createdAt : null,
      completed: currentIndex >= 1,
      current: order.status === 'confirmed',
    },
    {
      status: 'processing',
      label: 'Processing',
      description: 'Your order is being packed and prepared for shipping',
      date: currentIndex >= 2 ? order.createdAt : null,
      completed: currentIndex >= 2,
      current: order.status === 'processing',
    },
    {
      status: 'shipped',
      label: 'Shipped',
      description: 'Your order has been shipped',
      date: order.shippedAt,
      completed: currentIndex >= 3,
      current: order.status === 'shipped',
    },
    {
      status: 'delivered',
      label: 'Delivered',
      description: 'Your order has been delivered',
      date: order.deliveredAt,
      completed: currentIndex >= 4,
      current: order.status === 'delivered',
    },
  ];

  // Handle cancelled/refunded orders
  if (order.status === 'cancelled' || order.status === 'refunded') {
    timeline.push({
      status: order.status,
      label: order.status === 'cancelled' ? 'Cancelled' : 'Refunded',
      description: order.status === 'cancelled'
        ? 'This order has been cancelled'
        : 'This order has been refunded',
      date: null,
      completed: true,
      current: true,
    });
  }

  return timeline;
}
