/**
 * Single User API Route
 *
 * GET /api/users/[id] - Get user by ID (admin only)
 * PATCH /api/users/[id] - Update user (admin only)
 * DELETE /api/users/[id] - Delete user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, deleteAllUserSessions } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Get user by ID
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Check authentication and admin role
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        company: true,
        phone: true,
        avatar: true,
        isActive: true,
        country: true,
        industry: true,
        position: true,
        address: true,
        city: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH - Update user
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Check authentication and admin role
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent editing own role (to avoid locking yourself out)
    const body = await request.json();
    if (id === currentUser.id && body.role && body.role !== currentUser.role) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    // Prevent deactivating yourself
    if (id === currentUser.id && body.isActive === false) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Check for duplicate email if email is being changed
    if (body.email && body.email.toLowerCase() !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email.toLowerCase();
    if (body.role !== undefined) updateData.role = body.role;
    if (body.company !== undefined) updateData.company = body.company || null;
    if (body.phone !== undefined) updateData.phone = body.phone || null;
    if (body.country !== undefined) updateData.country = body.country || null;
    if (body.industry !== undefined) updateData.industry = body.industry || null;
    if (body.position !== undefined) updateData.position = body.position || null;
    if (body.address !== undefined) updateData.address = body.address || null;
    if (body.city !== undefined) updateData.city = body.city || null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Hash new password if provided
    if (body.password && body.password.length >= 8) {
      updateData.passwordHash = await hashPassword(body.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        company: true,
        phone: true,
        isActive: true,
        country: true,
        industry: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    // If user was deactivated, delete all their sessions
    if (body.isActive === false) {
      await deleteAllUserSessions(id);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Check authentication and admin role
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Prevent deleting yourself
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all user sessions first
    await deleteAllUserSessions(id);

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
