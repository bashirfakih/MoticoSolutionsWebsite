/**
 * Customers Export API Route
 *
 * GET /api/customers/export - Export customers as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { generateCustomersCSV } from '@/lib/export';
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
    const status = searchParams.get('status');
    const country = searchParams.get('country');

    // Build where clause
    const where: Prisma.CustomerWhereInput = {};

    if (status) {
      where.status = status as 'active' | 'inactive' | 'blocked';
    }

    if (country) {
      where.country = country;
    }

    // Fetch customers
    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const customersData = customers.map(customer => ({
      name: customer.name,
      email: customer.email,
      company: customer.company,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      region: customer.region,
      postalCode: customer.postalCode,
      country: customer.country,
      status: customer.status,
      totalOrders: customer.totalOrders,
      totalSpent: Number(customer.totalSpent),
      createdAt: customer.createdAt,
    }));

    const csvContent = generateCustomersCSV(customersData);
    const filename = `customers-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Customers export error:', error);
    return NextResponse.json(
      { error: 'Failed to export customers' },
      { status: 500 }
    );
  }
}
