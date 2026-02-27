/**
 * Single Quote API Route
 *
 * GET /api/quotes/[id] - Get quote by ID
 * PATCH /api/quotes/[id] - Update quote (add pricing, respond)
 * DELETE /api/quotes/[id] - Delete quote
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single quote by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true, phone: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true },
            },
          },
        },
        order: {
          select: { id: true, orderNumber: true, status: true },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...quote,
      subtotal: quote.subtotal ? Number(quote.subtotal) : null,
      discount: Number(quote.discount),
      total: quote.total ? Number(quote.total) : null,
      items: quote.items.map(item => ({
        ...item,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : null,
        product: item.product ? {
          ...item.product,
          price: item.product.price ? Number(item.product.price) : null,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Quote GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

// PATCH - Update quote
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if quote exists
    const existing = await prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Status updates with timestamps
    if (body.status !== undefined) {
      updateData.status = body.status;

      if (body.status === 'reviewed' && !existing.reviewedAt) {
        updateData.reviewedAt = new Date();
      } else if (body.status === 'sent' && !existing.sentAt) {
        updateData.sentAt = new Date();
      } else if (['accepted', 'rejected'].includes(body.status) && !existing.respondedAt) {
        updateData.respondedAt = new Date();
      }
    }

    // Response/notes
    if (body.responseMessage !== undefined) updateData.responseMessage = body.responseMessage;
    if (body.internalNotes !== undefined) updateData.internalNotes = body.internalNotes;
    if (body.validUntil !== undefined) updateData.validUntil = body.validUntil ? new Date(body.validUntil) : null;
    if (body.discount !== undefined) updateData.discount = body.discount;

    // If pricing items, update totals
    if (body.items) {
      // Update each item with pricing
      for (const item of body.items) {
        if (item.id) {
          await prisma.quoteItem.update({
            where: { id: item.id },
            data: {
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice ? item.unitPrice * item.quantity : null,
            },
          });
        }
      }

      // Calculate totals
      const updatedItems = await prisma.quoteItem.findMany({
        where: { quoteId: id },
      });

      const subtotal = updatedItems.reduce((sum, item) =>
        sum + (item.totalPrice ? Number(item.totalPrice) : 0), 0
      );
      const discount = body.discount !== undefined ? body.discount : Number(existing.discount);
      updateData.subtotal = subtotal;
      updateData.total = subtotal - discount;
    }

    // Update quote
    const quote = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    return NextResponse.json({
      ...quote,
      subtotal: quote.subtotal ? Number(quote.subtotal) : null,
      discount: Number(quote.discount),
      total: quote.total ? Number(quote.total) : null,
      items: quote.items.map(item => ({
        ...item,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : null,
      })),
    });
  } catch (error) {
    console.error('Quote PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

// DELETE - Delete quote
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if quote exists
    const quote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Don't delete if converted to order
    if (quote.orderId) {
      return NextResponse.json(
        { error: 'Cannot delete quote that has been converted to an order' },
        { status: 400 }
      );
    }

    // Delete quote (cascades to items)
    await prisma.quote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quote DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}
