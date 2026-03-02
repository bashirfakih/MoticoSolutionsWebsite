/**
 * Product Search API Route
 *
 * GET /api/products/search - Full-text search with PostgreSQL
 * Uses tsvector/tsquery for efficient text search
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const categoryId = searchParams.get('categoryId') || undefined;
    const brandId = searchParams.get('brandId') || undefined;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStockOnly = searchParams.get('inStockOnly') === 'true';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Build the search query for PostgreSQL full-text search
    // Convert user query to tsquery format (e.g., "air tool" -> "air & tool")
    const searchTerms = query
      .split(/\s+/)
      .filter(term => term.length > 0)
      .map(term => term.replace(/[^\w\s]/g, ''))
      .filter(term => term.length > 0)
      .join(' & ');

    if (!searchTerms) {
      return NextResponse.json({
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        query,
      });
    }

    // Build WHERE clause conditions
    const conditions: string[] = [
      `"isPublished" = true`,
      `(
        to_tsvector('english', COALESCE(name, '')) ||
        to_tsvector('english', COALESCE(sku, '')) ||
        to_tsvector('english', COALESCE(description, '')) ||
        to_tsvector('english', COALESCE("shortDescription", ''))
      ) @@ to_tsquery('english', $1)`,
    ];

    const params: (string | number | boolean)[] = [searchTerms];
    let paramIndex = 2;

    if (categoryId) {
      conditions.push(`"categoryId" = $${paramIndex}`);
      params.push(categoryId);
      paramIndex++;
    }

    if (brandId) {
      conditions.push(`"brandId" = $${paramIndex}`);
      params.push(brandId);
      paramIndex++;
    }

    if (minPrice) {
      conditions.push(`price >= $${paramIndex}`);
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      conditions.push(`price <= $${paramIndex}`);
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (inStockOnly) {
      conditions.push(`"stockStatus" = 'in_stock'`);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*) as count FROM products WHERE ${whereClause}`,
      ...params
    );
    const total = Number(countResult[0]?.count || 0);

    // Get search results with ranking
    const products = await prisma.$queryRawUnsafe<Array<{
      id: string;
      sku: string;
      name: string;
      slug: string;
      shortDescription: string | null;
      description: string;
      price: number | null;
      compareAtPrice: number | null;
      stockStatus: string;
      stockQuantity: number;
      isPublished: boolean;
      isFeatured: boolean;
      isNew: boolean;
      categoryId: string;
      brandId: string;
      createdAt: Date;
      rank: number;
    }>>(
      `SELECT
        id, sku, name, slug, "shortDescription", description,
        price::numeric, "compareAtPrice"::numeric, "stockStatus", "stockQuantity",
        "isPublished", "isFeatured", "isNew", "categoryId", "brandId", "createdAt",
        ts_rank(
          to_tsvector('english', COALESCE(name, '')) ||
          to_tsvector('english', COALESCE(sku, '')) ||
          to_tsvector('english', COALESCE(description, '')) ||
          to_tsvector('english', COALESCE("shortDescription", '')),
          to_tsquery('english', $1)
        ) as rank
      FROM products
      WHERE ${whereClause}
      ORDER BY rank DESC, "createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      ...params,
      limit,
      offset
    );

    // Get category and brand details for the results
    const productIds = products.map(p => p.id);

    if (productIds.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        query,
      });
    }

    // Fetch related data
    const [categories, brands, images] = await Promise.all([
      prisma.category.findMany({
        where: { id: { in: products.map(p => p.categoryId) } },
        select: { id: true, name: true, slug: true },
      }),
      prisma.brand.findMany({
        where: { id: { in: products.map(p => p.brandId) } },
        select: { id: true, name: true, slug: true },
      }),
      prisma.productImage.findMany({
        where: { productId: { in: productIds }, isPrimary: true },
        select: { productId: true, url: true, alt: true },
      }),
    ]);

    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const brandMap = new Map(brands.map(b => [b.id, b]));
    const imageMap = new Map(images.map(i => [i.productId, i]));

    // Format results
    const formattedProducts = products.map(product => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price ? Number(product.price) : null,
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      stockStatus: product.stockStatus,
      stockQuantity: product.stockQuantity,
      isPublished: product.isPublished,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      category: categoryMap.get(product.categoryId) || null,
      brand: brandMap.get(product.brandId) || null,
      primaryImage: imageMap.get(product.id) || null,
      relevanceScore: product.rank,
    }));

    return NextResponse.json({
      data: formattedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      query,
    });
  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
