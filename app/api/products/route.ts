/**
 * Products API Route
 *
 * GET /api/products - List all products with pagination/filtering
 * POST /api/products - Create new product
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
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

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - List products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filtering
    const search = searchParams.get('search') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const categorySlug = searchParams.get('categorySlug') || undefined;
    const brandId = searchParams.get('brandId') || undefined;
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const stockStatus = searchParams.get('stockStatus') || undefined;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (categorySlug) where.category = { slug: categorySlug };
    if (brandId) where.brandId = brandId;
    if (published !== null && published !== undefined) {
      where.isPublished = published === 'true';
    }
    if (featured !== null && featured !== undefined) {
      where.isFeatured = featured === 'true';
    }
    if (stockStatus) {
      where.stockStatus = stockStatus as 'in_stock' | 'low_stock' | 'out_of_stock';
    }
    if (minPrice) {
      where.price = { ...where.price as Prisma.DecimalNullableFilter, gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      where.price = { ...where.price as Prisma.DecimalNullableFilter, lte: parseFloat(maxPrice) };
    }

    // Get total count
    const total = await prisma.product.count({ where });

    // Get paginated results
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 5,
        },
        _count: {
          select: { variants: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: products.map(prod => ({
        ...prod,
        price: prod.price ? Number(prod.price) : null,
        compareAtPrice: prod.compareAtPrice ? Number(prod.compareAtPrice) : null,
        // Convert image paths
        images: prod.images.map(img => ({
          ...img,
          url: convertProductImage(img.url) || img.url,
        })),
        variantCount: prod._count.variants,
        _count: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.sku || !body.slug || !body.categoryId || !body.brandId) {
      return NextResponse.json(
        { error: 'Name, SKU, slug, category, and brand are required' },
        { status: 400 }
      );
    }

    // Check for duplicate SKU
    const existingSku = await prisma.product.findUnique({
      where: { sku: body.sku },
    });
    if (existingSku) {
      return NextResponse.json(
        { error: 'A product with this SKU already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate slug
    const existingSlug = await prisma.product.findUnique({
      where: { slug: body.slug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 409 }
      );
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }

    // Validate brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: body.brandId },
    });
    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 400 }
      );
    }

    // Validate price and stock quantity are non-negative
    if (body.price !== undefined && body.price !== null && body.price < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 400 }
      );
    }
    if (body.stockQuantity !== undefined && body.stockQuantity < 0) {
      return NextResponse.json(
        { error: 'Stock quantity cannot be negative' },
        { status: 400 }
      );
    }

    // Create product with related data
    const product = await prisma.product.create({
      data: {
        sku: body.sku,
        name: body.name,
        slug: body.slug,
        shortDescription: body.shortDescription || null,
        description: body.description || '',
        features: body.features || [],
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
        brandId: body.brandId,
        hasVariants: body.hasVariants ?? false,
        price: body.price || null,
        compareAtPrice: body.compareAtPrice || null,
        currency: body.currency || 'USD',
        stockQuantity: body.stockQuantity ?? 0,
        stockStatus: body.stockStatus || 'out_of_stock',
        minStockLevel: body.minStockLevel ?? 10,
        trackInventory: body.trackInventory ?? true,
        allowBackorder: body.allowBackorder ?? false,
        isPublished: body.isPublished ?? false,
        isFeatured: body.isFeatured ?? false,
        isNew: body.isNew ?? true,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        publishedAt: body.isPublished ? new Date() : null,
        // Quick Specs
        showDimensions: body.showDimensions ?? false,
        dimensions: body.showDimensions ? (body.dimensions || null) : null,
        showSizes: body.showSizes ?? false,
        sizes: body.showSizes ? (body.sizes || null) : null,
        showGrits: body.showGrits ?? false,
        grits: body.showGrits ? (body.grits || null) : null,
        // Packaging
        showPackaging: body.showPackaging ?? false,
        packagingUnit: body.showPackaging ? (body.packagingUnit || null) : null,
        packagingOptions: body.showPackaging ? (body.packagingOptions || null) : null,
        // Create related images
        images: body.images?.length > 0 ? {
          create: body.images.map((img: { url: string; alt: string; sortOrder?: number; isPrimary?: boolean }, index: number) => ({
            url: img.url,
            alt: img.alt || body.name,
            sortOrder: img.sortOrder ?? index,
            isPrimary: img.isPrimary ?? index === 0,
          })),
        } : undefined,
        // Create specifications
        specifications: body.specifications?.length > 0 ? {
          create: body.specifications.map((spec: { key: string; label: string; value: string; unit?: string; group?: string }) => ({
            key: spec.key,
            label: spec.label,
            value: spec.value,
            unit: spec.unit || null,
            group: spec.group || null,
          })),
        } : undefined,
        // Create variants
        variants: body.variants?.length > 0 ? {
          create: body.variants.map((variant: { sku: string; name: string; price?: number; stockQuantity?: number; attributes: Record<string, string>; isActive?: boolean }) => ({
            sku: variant.sku,
            name: variant.name,
            price: variant.price || null,
            stockQuantity: variant.stockQuantity ?? 0,
            attributes: variant.attributes || {},
            isActive: variant.isActive ?? true,
          })),
        } : undefined,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        specifications: true,
        variants: true,
      },
    });

    return NextResponse.json({
      ...product,
      price: product.price ? Number(product.price) : null,
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    }, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
