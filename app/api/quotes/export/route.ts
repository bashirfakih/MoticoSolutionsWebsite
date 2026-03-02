/**
 * Quotes Export API Route
 *
 * GET /api/quotes/export - Export quotes as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { generateQuotesCSV } from '@/lib/export';
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: Prisma.QuoteWhereInput = {};

    if (status) {
      where.status = status as 'pending' | 'reviewed' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt as Prisma.DateTimeFilter, gte: new Date(startDate) };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { ...where.createdAt as Prisma.DateTimeFilter, lte: end };
    }

    // Fetch quotes
    const quotes = await prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const quotesData = quotes.map(quote => ({
      quoteNumber: quote.quoteNumber,
      customerName: quote.customerName,
      customerEmail: quote.customerEmail,
      company: quote.company,
      status: quote.status,
      subtotal: quote.subtotal ? Number(quote.subtotal) : null,
      discount: Number(quote.discount),
      total: quote.total ? Number(quote.total) : null,
      currency: quote.currency,
      validUntil: quote.validUntil,
      createdAt: quote.createdAt,
    }));

    const csvContent = generateQuotesCSV(quotesData);
    const filename = `quotes-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Quotes export error:', error);
    return NextResponse.json(
      { error: 'Failed to export quotes' },
      { status: 500 }
    );
  }
}
