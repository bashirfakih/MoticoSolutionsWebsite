/**
 * Categories API Route
 *
 * GET /api/categories - List all categories with pagination/filtering
 * POST /api/categories - Create new category
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

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - List categories with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filtering
    const search = searchParams.get('search') || undefined;
    const active = searchParams.get('active');
    const parentId = searchParams.get('parentId');
    const tree = searchParams.get('tree') === 'true';

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'sortOrder';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== null && active !== undefined) {
      where.isActive = active === 'true';
    }

    if (parentId !== null) {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    // If tree view requested, return hierarchical structure
    if (tree) {
      const categories = await prisma.category.findMany({
        where: { ...where, parentId: null },
        include: {
          children: {
            include: {
              children: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      // Helper function to convert category image paths recursively
      const convertCategoryPaths = (cat: any): any => {
        let image = cat.image;
        if (image) {
          // Check if we have a mapped image for legacy paths
          if (categoryImageMap[image]) {
            image = categoryImageMap[image];
          } else {
            image = toUrlPath(image);
            // If image starts with /categories/, convert to proper path
            if (image.startsWith('/categories/')) {
              image = `/images/products${image}`;
            }
            // If image is just a filename, prepend categories path
            else if (image.match(/^\/[^\/]+\.(png|jpg|jpeg|webp|svg)$/i)) {
              image = `/images/products/categories${image}`;
            }
          }
        }
        return {
          ...cat,
          image,
          children: cat.children?.map(convertCategoryPaths),
        };
      };

      return NextResponse.json({
        data: categories.map(convertCategoryPaths),
        total: categories.length,
      });
    }

    // Get total count
    const total = await prisma.category.count({ where });

    // Get paginated results with published product count
    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { children: true },
        },
        // Include published products to count them
        products: {
          where: { isPublished: true },
          select: { id: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: categories.map(cat => {
        let image = cat.image;
        if (image) {
          // Check if we have a mapped image for legacy paths
          if (categoryImageMap[image]) {
            image = categoryImageMap[image];
          } else {
            // Convert to URL path
            image = toUrlPath(image);
            // If image starts with /categories/, convert to proper path
            if (image.startsWith('/categories/')) {
              image = `/images/products${image}`;
            }
            // If image is just a filename, prepend categories path
            else if (image.match(/^\/[^\/]+\.(png|jpg|jpeg|webp|svg)$/i)) {
              image = `/images/products/categories${image}`;
            }
          }
        }
        return {
          ...cat,
          image,
          childrenCount: cat._count.children,
          // Count only published products
          productCount: cat.products.length,
          products: undefined, // Don't send the full products array
          _count: undefined,
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await prisma.category.findUnique({
      where: { slug: body.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 409 }
      );
    }

    // Validate parent exists if provided
    if (body.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: body.parentId },
      });
      if (!parent) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        image: body.image || null,
        icon: body.icon || null,
        color: body.color || null,
        featuredBrand: body.featuredBrand || null,
        parentId: body.parentId || null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
