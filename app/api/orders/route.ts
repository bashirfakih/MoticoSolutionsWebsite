/**
 * Orders API Route
 *
 * GET /api/orders - List all orders with pagination/filtering
 * POST /api/orders - Create new order
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Generate unique order number
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}-${random}`;
}

// GET - List orders with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filtering
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: Prisma.OrderWhereInput = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded';
    }
    if (customerId) where.customerId = customerId;
    if (fromDate) {
      where.createdAt = { ...where.createdAt as Prisma.DateTimeFilter, gte: new Date(fromDate) };
    }
    if (toDate) {
      where.createdAt = { ...where.createdAt as Prisma.DateTimeFilter, lte: new Date(toDate) };
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Get paginated results
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: orders.map(order => ({
        ...order,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
        itemCount: order._count.items,
        _count: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.customerId || !body.items?.length) {
      return NextResponse.json(
        { error: 'Customer and items are required' },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: body.customerId },
    });
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 400 }
      );
    }

    // Calculate totals
    const itemCount = body.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
    const subtotal = body.items.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0);
    const shippingCost = body.shippingCost || 0;
    const tax = body.tax || 0;
    const discount = body.discount || 0;
    const total = subtotal + shippingCost + tax - discount;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: body.customerId,
        customerName: body.customerName || customer.name,
        customerEmail: body.customerEmail || customer.email,
        customerPhone: body.customerPhone || customer.phone,
        itemCount,
        subtotal,
        shippingCost,
        tax,
        discount,
        total,
        currency: body.currency || 'USD',
        status: body.status || 'pending',
        paymentStatus: body.paymentStatus || 'pending',
        paymentMethod: body.paymentMethod || null,
        shippingAddress: body.shippingAddress || {},
        customerNote: body.customerNote || null,
        internalNote: body.internalNote || null,
        items: {
          create: body.items.map((item: {
            productId: string;
            productName: string;
            productSku: string;
            variantId?: string;
            variantName?: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
          }) => ({
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            variantId: item.variantId || null,
            variantName: item.variantName || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    // Update customer stats
    await prisma.customer.update({
      where: { id: body.customerId },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: total },
        lastOrderAt: new Date(),
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
    }, { status: 201 });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
