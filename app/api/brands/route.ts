/**
 * Brands API Routes
 *
 * GET /api/brands - List all brands (with pagination)
 * POST /api/brands - Create new brand
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSlug } from '@/lib/data/types';
import { toUrlPath } from '@/lib/utils/imageOptimizer';
import { sanitizeInput } from '@/lib/security/sanitize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const active = searchParams.get('active');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'sortOrder';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where clause
    const where: Record<string, unknown> = {};
    if (active === 'true') {
      where.isActive = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.brand.count({ where }),
    ]);

    // Convert logo paths to URL paths
    const brandsWithConvertedPaths = brands.map(brand => {
      let logo = brand.logo;
      if (logo) {
        // Convert to URL path
        logo = toUrlPath(logo);
        // If logo is just a filename (starts with / but no directory), prepend brands path
        if (logo.startsWith('/logo-') || (logo.match(/^\/[^\/]+\.(png|jpg|jpeg|webp|svg)$/i))) {
          logo = `/images/logos/brands${logo}`;
        }
      }
      return {
        ...brand,
        logo,
      };
    });

    return NextResponse.json({
      data: brandsWithConvertedPaths,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.slug || generateSlug(body.name);

    // Check for duplicate slug
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `A brand with slug "${slug}" already exists` },
        { status: 400 }
      );
    }

    // Get max sort order
    const maxSortOrder = await prisma.brand.aggregate({
      _max: { sortOrder: true },
    });

    // SECURITY: Sanitize string inputs to prevent stored XSS
    const brand = await prisma.brand.create({
      data: {
        name: sanitizeInput(body.name),
        slug,
        logo: body.logo || null,
        description: body.description ? sanitizeInput(body.description) : null,
        website: body.website ? sanitizeInput(body.website) : null,
        countryOfOrigin: body.countryOfOrigin ? sanitizeInput(body.countryOfOrigin) : null,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? (maxSortOrder._max.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
