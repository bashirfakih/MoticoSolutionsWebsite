/**
 * Partner Logo by ID API
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
    if (body.name !== undefined) data.name = sanitizeInput(body.name);
    if (body.logo !== undefined) data.logo = body.logo;
    if (body.website !== undefined) data.website = sanitizeInput(body.website);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);

    const logo = await prisma.partnerLogo.update({
      where: { id },
      data,
    });

    return NextResponse.json(logo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update partner logo' },
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

    await prisma.partnerLogo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete partner logo' },
      { status: 500 }
    );
  }
}
