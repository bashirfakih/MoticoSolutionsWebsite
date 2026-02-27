/**
 * Customers API Route
 *
 * GET /api/customers - List all customers with pagination/filtering
 * POST /api/customers - Create new customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - List customers with optional filtering
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
    const country = searchParams.get('country') || undefined;
    const verified = searchParams.get('verified');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status as 'active' | 'inactive' | 'blocked';
    }
    if (country) where.country = country;
    if (verified !== null && verified !== undefined) {
      where.isVerified = verified === 'true';
    }

    // Get total count
    const total = await prisma.customer.count({ where });

    // Get paginated results
    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: { orders: true, quotes: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: customers.map(cust => ({
        ...cust,
        totalSpent: Number(cust.totalSpent),
        orderCount: cust._count.orders,
        quoteCount: cust._count.quotes,
        _count: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = await prisma.customer.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      );
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        email: body.email.toLowerCase(),
        name: body.name,
        company: body.company || null,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        region: body.region || null,
        postalCode: body.postalCode || null,
        country: body.country || 'Lebanon',
        status: body.status || 'active',
        isVerified: body.isVerified ?? false,
        notes: body.notes || null,
        tags: body.tags || [],
      },
    });

    return NextResponse.json({
      ...customer,
      totalSpent: Number(customer.totalSpent),
    }, { status: 201 });
  } catch (error) {
    console.error('Customers POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
