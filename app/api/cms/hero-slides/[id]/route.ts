/**
 * Hero Slide by ID API
 *
 * PATCH - Update slide
 * DELETE - Delete slide
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { sanitizeInput } from '@/lib/security/sanitize';

// PATCH /api/cms/hero-slides/[id] - Update hero slide
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // SECURITY: Whitelist allowed fields — never pass raw body to Prisma
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = sanitizeInput(body.title);
    if (body.subtitle !== undefined) data.subtitle = sanitizeInput(body.subtitle);
    if (body.tag !== undefined) data.tag = sanitizeInput(body.tag);
    if (body.ctaText !== undefined) data.ctaText = sanitizeInput(body.ctaText);
    if (body.ctaLink !== undefined) data.ctaLink = sanitizeInput(body.ctaLink);
    if (body.image !== undefined) data.image = body.image;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);

    const slide = await prisma.heroSlide.update({
      where: { id },
      data,
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Hero slide update error:', error);
    return NextResponse.json(
      { error: 'Failed to update hero slide' },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/hero-slides/[id] - Delete hero slide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.heroSlide.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hero slide deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete hero slide' },
      { status: 500 }
    );
  }
}
