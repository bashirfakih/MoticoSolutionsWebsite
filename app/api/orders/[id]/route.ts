/**
 * Single Order API Route
 *
 * GET /api/orders/[id] - Get order by ID
 * PATCH /api/orders/[id] - Update order
 * DELETE /api/orders/[id] - Delete order (admin only, for draft orders)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single order by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true, phone: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        quote: {
          select: { id: true, quoteNumber: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH - Update order
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if order exists
    const existing = await prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Status updates
    if (body.status !== undefined) {
      updateData.status = body.status;

      // Set timestamps based on status
      if (body.status === 'shipped' && !existing.shippedAt) {
        updateData.shippedAt = new Date();
      } else if (body.status === 'delivered' && !existing.deliveredAt) {
        updateData.deliveredAt = new Date();
      }
    }

    // Payment status
    if (body.paymentStatus !== undefined) {
      updateData.paymentStatus = body.paymentStatus;

      if (body.paymentStatus === 'paid' && !existing.paidAt) {
        updateData.paidAt = new Date();
      }
    }

    // Other fields
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
    if (body.shippingAddress !== undefined) updateData.shippingAddress = body.shippingAddress;
    if (body.customerNote !== undefined) updateData.customerNote = body.customerNote;
    if (body.internalNote !== undefined) updateData.internalNote = body.internalNote;
    if (body.shippingCost !== undefined) {
      updateData.shippingCost = body.shippingCost;
      // Recalculate total
      const subtotal = Number(existing.subtotal);
      const tax = Number(existing.tax);
      const discount = Number(existing.discount);
      updateData.total = subtotal + body.shippingCost + tax - discount;
    }
    if (body.discount !== undefined) {
      updateData.discount = body.discount;
      // Recalculate total
      const subtotal = Number(existing.subtotal);
      const shippingCost = body.shippingCost !== undefined ? body.shippingCost : Number(existing.shippingCost);
      const tax = Number(existing.tax);
      updateData.total = subtotal + shippingCost + tax - body.discount;
    }

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Order PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE - Delete order (only pending/cancelled orders)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only allow deleting pending or cancelled orders
    if (!['pending', 'cancelled'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Can only delete pending or cancelled orders' },
        { status: 400 }
      );
    }

    // Update customer stats if needed
    if (order.paymentStatus === 'paid') {
      await prisma.customer.update({
        where: { id: order.customerId },
        data: {
          totalOrders: { decrement: 1 },
          totalSpent: { decrement: Number(order.total) },
        },
      });
    }

    // Delete order (cascades to items)
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
