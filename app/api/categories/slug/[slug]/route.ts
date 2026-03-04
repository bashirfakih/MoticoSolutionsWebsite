/**
 * Category by Slug API Route
 *
 * GET /api/categories/slug/[slug] - Get category by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { toUrlPath } from '@/lib/utils/imageOptimizer';

// Category image mapping for legacy seed data paths
const categoryImageMap: Record<string, string> = {
  '/categories/abrasive-belts.jpg': '/images/products/categories/product-abrasive-belts.png',
  '/categories/grinding-wheels.jpg': '/images/products/categories/product-abrasive-discs.png',
  '/categories/grinding-sleeves.jpg': '/images/products/categories/product-grinding-sleeve-wheels.png',
  '/categories/sanding-sheets.jpg': '/images/products/categories/product-hand-finishing-products.png',
  '/categories/flap-discs.jpg': '/images/products/categories/product-abrasive-discs.png',
  '/categories/air-power-tools.jpg': '/images/products/categories/product-air-power-tools.png',
  '/categories/surface-finishing.jpg': '/images/products/categories/product-hand-finishing-products.png',
  '/categories/polishing.jpg': '/images/products/categories/product-polish-care-products.png',
  '/categories/safety.jpg': '/images/products/categories/product-accessories.png',
  '/categories/machines.jpg': '/images/products/categories/product-stationery-machines.png',
  '/categories/accessories.jpg': '/images/products/categories/product-accessories.png',
  '/categories/hand-tools.jpg': '/images/products/categories/product-hand-finishing-products.png',
};

// Convert category image path
function convertCategoryImage(image: string | null): string | null {
  if (!image) return null;
  // Check if we have a mapped image for legacy paths
  if (categoryImageMap[image]) {
    return categoryImageMap[image];
  }
  // Convert to URL path
  let converted = toUrlPath(image);
  // If image starts with /categories/, convert to proper path
  if (converted.startsWith('/categories/')) {
    converted = `/images/products${converted}`;
  }
  // If image is just a filename, prepend categories path
  else if (converted.match(/^\/[^\/]+\.(png|jpg|jpeg|webp|svg)$/i)) {
    converted = `/images/products/categories${converted}`;
  }
  return converted;
}

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

    // Convert image paths for category and children
    return NextResponse.json({
      ...category,
      image: convertCategoryImage(category.image),
      children: category.children?.map(child => ({
        ...child,
        image: convertCategoryImage(child.image),
      })),
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
