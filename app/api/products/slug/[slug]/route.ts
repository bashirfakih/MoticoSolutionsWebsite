/**
 * Product by Slug API Route
 *
 * GET /api/products/slug/[slug] - Get product by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        subcategory: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        specifications: {
          orderBy: { key: 'asc' },
        },
        variants: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...product,
      price: product.price ? Number(product.price) : null,
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      variants: product.variants.map(v => ({
        ...v,
        price: v.price ? Number(v.price) : null,
      })),
    });
  } catch (error) {
    console.error('Product by slug GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
