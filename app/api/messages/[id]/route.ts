/**
 * Single Message API Route
 *
 * GET /api/messages/[id] - Get message by ID
 * PATCH /api/messages/[id] - Update message (status, reply)
 * DELETE /api/messages/[id] - Delete message
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single message by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        repliedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Mark as read if unread
    if (message.status === 'unread') {
      await prisma.message.update({
        where: { id },
        data: {
          status: 'read',
          readAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      ...message,
      status: message.status === 'unread' ? 'read' : message.status,
      readAt: message.readAt || new Date(),
    });
  } catch (error) {
    console.error('Message GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

// PATCH - Update message
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if message exists
    const existing = await prisma.message.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Status
    if (body.status !== undefined) {
      updateData.status = body.status;

      if (body.status === 'read' && !existing.readAt) {
        updateData.readAt = new Date();
      }
    }

    // Starred
    if (body.isStarred !== undefined) {
      updateData.isStarred = body.isStarred;
    }

    // Reply
    if (body.replyMessage !== undefined) {
      updateData.replyMessage = body.replyMessage;
      updateData.status = 'replied';
      updateData.repliedAt = new Date();
      // Accept both repliedBy (client type) and repliedById (Prisma field)
      const repliedById = body.repliedById || body.repliedBy;
      if (repliedById) {
        updateData.repliedById = repliedById;
      }
    }

    // Update message
    const message = await prisma.message.update({
      where: { id },
      data: updateData,
      include: {
        repliedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Message PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete message
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if message exists
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Delete message
    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Message DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
