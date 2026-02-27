/**
 * Quotes API Route
 *
 * GET /api/quotes - List all quotes with pagination/filtering
 * POST /api/quotes - Create new quote request
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Generate unique quote number
function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `QT-${year}-${random}`;
}

// GET - List quotes with optional filtering
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
    const customerId = searchParams.get('customerId') || undefined;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: Prisma.QuoteWhereInput = {};

    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status as 'pending' | 'reviewed' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
    }
    if (customerId) where.customerId = customerId;

    // Get total count
    const total = await prisma.quote.count({ where });

    // Get paginated results
    const quotes = await prisma.quote.findMany({
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
      data: quotes.map(quote => ({
        ...quote,
        subtotal: quote.subtotal ? Number(quote.subtotal) : null,
        discount: Number(quote.discount),
        total: quote.total ? Number(quote.total) : null,
        itemCount: quote._count.items,
        _count: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Quotes GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

// POST - Create new quote request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.customerName || !body.customerEmail || !body.items?.length) {
      return NextResponse.json(
        { error: 'Customer name, email, and items are required' },
        { status: 400 }
      );
    }

    // Create quote with items
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        customerId: body.customerId || null,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone || null,
        company: body.company || null,
        currency: body.currency || 'USD',
        status: 'pending',
        customerMessage: body.customerMessage || null,
        items: {
          create: body.items.map((item: {
            productId?: string;
            productName: string;
            sku?: string;
            description?: string;
            quantity: number;
          }) => ({
            productId: item.productId || null,
            productName: item.productName,
            sku: item.sku || null,
            description: item.description || null,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      ...quote,
      subtotal: quote.subtotal ? Number(quote.subtotal) : null,
      discount: Number(quote.discount),
      total: quote.total ? Number(quote.total) : null,
    }, { status: 201 });
  } catch (error) {
    console.error('Quotes POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}
