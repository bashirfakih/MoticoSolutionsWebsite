/**
 * Category by Slug API Route
 *
 * GET /api/categories/slug/[slug] - Get category by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET - Fetch category by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, image: true, description: true },
          orderBy: { sortOrder: 'asc' },
        },
        // Count only published products
        products: {
          where: { isPublished: true },
          select: { id: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...category,
      productCount: category.products.length,
      products: undefined,
    });
  } catch (error) {
    console.error('Category by slug GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
