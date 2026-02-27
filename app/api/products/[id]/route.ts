/**
 * Single Product API Route
 *
 * GET /api/products/[id] - Get product by ID
 * PATCH /api/products/[id] - Update product
 * DELETE /api/products/[id] - Delete product
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single product by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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
    console.error('Product GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH - Update product
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // If SKU is being changed, check for duplicates
    if (body.sku && body.sku !== existing.sku) {
      const duplicate = await prisma.product.findUnique({
        where: { sku: body.sku },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: 'A product with this SKU already exists' },
          { status: 409 }
        );
      }
    }

    // If slug is being changed, check for duplicates
    if (body.slug && body.slug !== existing.slug) {
      const duplicate = await prisma.product.findUnique({
        where: { slug: body.slug },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Simple fields
    const simpleFields = [
      'sku', 'name', 'slug', 'shortDescription', 'description', 'features',
      'categoryId', 'subcategoryId', 'brandId', 'hasVariants', 'price',
      'compareAtPrice', 'currency', 'stockQuantity', 'stockStatus',
      'minStockLevel', 'trackInventory', 'allowBackorder', 'isPublished',
      'isFeatured', 'isNew', 'metaTitle', 'metaDescription'
    ];

    for (const field of simpleFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle publishedAt when publishing
    if (body.isPublished === true && !existing.isPublished) {
      updateData.publishedAt = new Date();
    } else if (body.isPublished === false) {
      updateData.publishedAt = null;
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
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
      variants: product.variants.map(v => ({
        ...v,
        price: v.price ? Number(v.price) : null,
      })),
    });
  } catch (error) {
    console.error('Product PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true, quoteItems: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is in any orders
    if (product._count.orderItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product that has been ordered. Consider unpublishing instead.' },
        { status: 400 }
      );
    }

    // Delete product (cascades to images, specs, variants)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
