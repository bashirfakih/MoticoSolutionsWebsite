/**
 * Single Brand API Routes
 *
 * GET /api/brands/[id] - Get brand by ID
 * PATCH /api/brands/[id] - Update brand
 * DELETE /api/brands/[id] - Delete brand
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSlug } from '@/lib/data/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if brand exists
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // If updating name, update slug too (unless slug is explicitly provided)
    let slug = body.slug;
    if (body.name && !body.slug) {
      slug = generateSlug(body.name);
    }

    // Check for duplicate slug if changing
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.brand.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: `A brand with slug "${slug}" already exists` },
          { status: 400 }
        );
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(slug && { slug }),
        ...(body.logo !== undefined && { logo: body.logo }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.countryOfOrigin !== undefined && { countryOfOrigin: body.countryOfOrigin }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if brand exists
    const existing = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if brand has products
    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete brand with ${existing._count.products} products. Remove or reassign products first.` },
        { status: 400 }
      );
    }

    await prisma.brand.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
