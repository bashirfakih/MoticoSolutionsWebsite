/**
 * Single Customer API Route
 *
 * GET /api/customers/[id] - Get customer by ID
 * PATCH /api/customers/[id] - Update customer
 * DELETE /api/customers/[id] - Delete customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single customer by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            quoteNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: { orders: true, quotes: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...customer,
      totalSpent: Number(customer.totalSpent),
      orders: customer.orders.map(o => ({
        ...o,
        total: Number(o.total),
      })),
      quotes: customer.quotes.map(q => ({
        ...q,
        total: q.total ? Number(q.total) : null,
      })),
      orderCount: customer._count.orders,
      quoteCount: customer._count.quotes,
      _count: undefined,
    });
  } catch (error) {
    console.error('Customer GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PATCH - Update customer
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if customer exists
    const existing = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // If email is being changed, check for duplicates
    if (body.email && body.email.toLowerCase() !== existing.email) {
      const duplicate = await prisma.customer.findUnique({
        where: { email: body.email.toLowerCase() },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: 'A customer with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        email: body.email?.toLowerCase(),
        name: body.name,
        company: body.company,
        phone: body.phone,
        address: body.address,
        city: body.city,
        region: body.region,
        postalCode: body.postalCode,
        country: body.country,
        status: body.status,
        isVerified: body.isVerified,
        notes: body.notes,
        tags: body.tags,
      },
    });

    return NextResponse.json({
      ...customer,
      totalSpent: Number(customer.totalSpent),
    });
  } catch (error) {
    console.error('Customer PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE - Delete customer
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check for orders
    if (customer._count.orders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with orders. Consider blocking instead.' },
        { status: 400 }
      );
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
