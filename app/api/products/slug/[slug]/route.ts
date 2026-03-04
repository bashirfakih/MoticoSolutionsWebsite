/**
 * Product by Slug API Route
 *
 * GET /api/products/slug/[slug] - Get product by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { toUrlPath } from '@/lib/utils/imageOptimizer';

// Convert product image path
function convertProductImage(url: string | null): string | null {
  if (!url) return null;
  let converted = toUrlPath(url);
  // Already has full path with /images/
  if (converted.startsWith('/images/')) {
    return converted;
  }
  // Paths starting with /products/ are served from /public/products/ - keep as-is
  if (converted.startsWith('/products/')) {
    return converted;
  }
  // Extract just the filename for analysis
  const filename = converted.split('/').pop() || converted;
  // Files starting with "product-" are category images
  const isCategoryImage = filename.startsWith('product-');

  // If image is just a filename (starts with / but no directory)
  if (converted.match(/^\/[^\/]+\.(png|jpg|jpeg|webp|svg)$/i)) {
    converted = isCategoryImage
      ? `/images/products/categories${converted}`
      : `/images/products/items${converted}`;
  }
  return converted;
}

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
      // Convert image paths
      images: product.images.map(img => ({
        ...img,
        url: convertProductImage(img.url) || img.url,
      })),
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
