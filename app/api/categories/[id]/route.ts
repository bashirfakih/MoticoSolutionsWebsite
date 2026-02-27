/**
 * Single Category API Route
 *
 * GET /api/categories/[id] - Get category by ID
 * PATCH /api/categories/[id] - Update category
 * DELETE /api/categories/[id] - Delete category
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single category by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true, isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { products: true },
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
      productCount: category._count.products,
      _count: undefined,
    });
  } catch (error) {
    console.error('Category GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PATCH - Update category
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check for duplicates
    if (body.slug && body.slug !== existing.slug) {
      const duplicate = await prisma.category.findUnique({
        where: { slug: body.slug },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Prevent circular parent reference
    if (body.parentId) {
      if (body.parentId === id) {
        return NextResponse.json(
          { error: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }

      // Check if parentId is a descendant of this category
      const descendants = await getDescendantIds(id);
      if (descendants.includes(body.parentId)) {
        return NextResponse.json(
          { error: 'Cannot set a descendant as parent' },
          { status: 400 }
        );
      }

      // Verify parent exists
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

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
        parentId: body.parentId,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Category PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { children: true, products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check for children
    if (category._count.children > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories. Move or delete children first.' },
        { status: 400 }
      );
    }

    // Check for products
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with products. Move products first.' },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Category DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

// Helper function to get all descendant IDs
async function getDescendantIds(categoryId: string): Promise<string[]> {
  const descendants: string[] = [];

  async function collectDescendants(parentId: string) {
    const children = await prisma.category.findMany({
      where: { parentId },
      select: { id: true },
    });

    for (const child of children) {
      descendants.push(child.id);
      await collectDescendants(child.id);
    }
  }

  await collectDescendants(categoryId);
  return descendants;
}
