/**
 * Quote to Order Conversion API
 *
 * POST /api/quotes/[id]/convert - Convert an accepted quote to an order
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import {
  processOrderStockDecrement,
  getInventorySettings,
} from '@/lib/services/inventoryService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${year}${month}-${random}`;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin access
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Get the quote with items
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Verify quote is in accepted status
    if (quote.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Only accepted quotes can be converted to orders' },
        { status: 400 }
      );
    }

    // Verify quote has items with prices
    if (!quote.items.length || !quote.total) {
      return NextResponse.json(
        { error: 'Quote must have items with prices to convert' },
        { status: 400 }
      );
    }

    // Create the order in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: quote.customerId || '',
          customerName: quote.customerName,
          customerEmail: quote.customerEmail,
          customerPhone: quote.customerPhone,
          itemCount: quote.items.length,
          subtotal: quote.subtotal || 0,
          discount: quote.discount,
          total: quote.total || 0,
          currency: quote.currency,
          status: 'pending',
          paymentStatus: 'pending',
          shippingAddress: body.shippingAddress || {
            name: quote.customerName,
            email: quote.customerEmail,
            phone: quote.customerPhone,
            company: quote.company,
          },
          customerNote: body.customerNote,
          internalNote: `Converted from quote ${quote.quoteNumber}`,
          items: {
            create: quote.items.map((item) => ({
              productId: item.productId || '',
              productName: item.productName,
              productSku: item.sku || '',
              quantity: item.quantity,
              unitPrice: item.unitPrice || 0,
              totalPrice: item.totalPrice || 0,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Decrement stock for all items if inventory tracking is enabled
      const inventorySettings = await getInventorySettings();
      if (inventorySettings.trackInventory) {
        await processOrderStockDecrement(
          tx,
          order.id,
          quote.items.map((item) => ({
            productId: item.productId || '',
            variantId: null,
            quantity: item.quantity,
          })),
          user.id
        );
      }

      // Update quote status to converted and link to order
      await tx.quote.update({
        where: { id },
        data: {
          status: 'converted',
          orderId: order.id,
        },
      });

      // Update customer stats if customer exists
      if (quote.customerId) {
        await tx.customer.update({
          where: { id: quote.customerId },
          data: {
            totalOrders: { increment: 1 },
            lastOrderAt: new Date(),
          },
        });
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      order: result,
      message: `Quote ${quote.quoteNumber} converted to order ${result.orderNumber}`,
    });
  } catch (error) {
    console.error('Quote conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert quote to order' },
      { status: 500 }
    );
  }
}
