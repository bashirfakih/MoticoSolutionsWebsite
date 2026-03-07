/**
 * Testimonial by ID API
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { sanitizeInput } from '@/lib/security/sanitize';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // SECURITY: Whitelist allowed fields — never pass raw body to Prisma
    const data: Record<string, unknown> = {};
    if (body.customerName !== undefined) data.customerName = sanitizeInput(body.customerName);
    if (body.role !== undefined) data.role = sanitizeInput(body.role);
    if (body.company !== undefined) data.company = sanitizeInput(body.company);
    if (body.quote !== undefined) data.quote = sanitizeInput(body.quote);
    if (body.image !== undefined) data.image = body.image;
    if (body.rating !== undefined) data.rating = Number(body.rating);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data,
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
