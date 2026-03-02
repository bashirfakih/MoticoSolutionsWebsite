/**
 * Product Search Suggestions API Route
 *
 * GET /api/products/search/suggestions - Get search autocomplete suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Search for matching products (name-based suggestions)
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
      take: limit,
      orderBy: [
        { isFeatured: 'desc' },
        { name: 'asc' },
      ],
    });

    // Search for matching categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        name: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        productCount: true,
      },
      take: 3,
    });

    // Search for matching brands
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
        name: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { products: true },
        },
      },
      take: 3,
    });

    return NextResponse.json({
      suggestions: {
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          price: p.price ? Number(p.price) : null,
          image: p.images[0]?.url || null,
          category: p.category.name,
          type: 'product' as const,
        })),
        categories: categories.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          productCount: c.productCount,
          type: 'category' as const,
        })),
        brands: brands.map(b => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          productCount: b._count.products,
          type: 'brand' as const,
        })),
      },
      query,
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}
