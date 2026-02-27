/**
 * Site Settings API Route
 *
 * GET /api/settings - Get site settings
 * PATCH /api/settings - Update site settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET - Fetch site settings
export async function GET() {
  try {
    // Get or create default settings
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 'default' },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH - Update site settings
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin access
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate and sanitize update data
    const allowedFields = [
      'siteName',
      'siteDescription',
      'contactEmail',
      'contactPhone',
      'address',
      'currency',
      'taxRate',
      'shippingFee',
      'freeShippingThreshold',
      'orderNotificationEmail',
      'lowStockAlertThreshold',
      'enableEmailNotifications',
      'socialFacebook',
      'socialInstagram',
      'socialLinkedIn',
      'socialYouTube',
    ];

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Upsert settings (create if doesn't exist)
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
