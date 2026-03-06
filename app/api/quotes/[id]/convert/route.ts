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
  validateStockInTransaction,
  getInventorySettings,
  StockValidationError,
} from '@/lib/services/inventoryService';

// Custom error for stock validation failures
class StockValidationException extends Error {
  constructor(public errors: StockValidationError[]) {
    super('Insufficient stock');
    this.name = 'StockValidationException';
  }
}

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

    // Get inventory settings
    const inventorySettings = await getInventorySettings();

    // Create the order in a transaction
    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        // Validate stock INSIDE transaction to prevent race conditions
        if (inventorySettings.trackInventory && !inventorySettings.allowBackorders) {
          const validation = await validateStockInTransaction(
            tx,
            quote.items.map((item) => ({
              productId: item.productId || '',
              variantId: null,
              quantity: item.quantity,
              productName: item.productName,
            }))
          );

          if (!validation.valid) {
            throw new StockValidationException(validation.errors);
          }
        }

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
    } catch (error) {
      // Handle stock validation errors specifically
      if (error instanceof StockValidationException) {
        return NextResponse.json(
          {
            error: 'Insufficient stock for one or more items',
            details: error.errors,
          },
          { status: 400 }
        );
      }
      throw error; // Re-throw other errors to be caught by outer try-catch
    }

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
