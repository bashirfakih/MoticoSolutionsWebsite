/**
 * Settings API Route
 *
 * GET /api/settings - Get site settings (public)
 * PATCH /api/settings - Update site settings (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { toUrlPath } from '@/lib/utils/imageOptimizer';

// GET - Get site settings (public for some fields, all for admin)
export async function GET(request: NextRequest) {
  try {
    // Get or create default settings
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    // If no settings exist, create default
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'default',
        },
      });
    }

    // Check if user is admin
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === 'admin';

    // Convert image paths to URL paths
    const convertedSettings = {
      ...settings,
      logo: settings.logo ? toUrlPath(settings.logo) : settings.logo,
      favicon: settings.favicon ? toUrlPath(settings.favicon) : settings.favicon,
    };

    // If not admin, only return public settings
    if (!isAdmin) {
      return NextResponse.json({
        companyName: convertedSettings.companyName,
        companyEmail: convertedSettings.companyEmail,
        companyPhone: convertedSettings.companyPhone,
        companyAddress: convertedSettings.companyAddress,
        companyCity: convertedSettings.companyCity,
        companyCountry: convertedSettings.companyCountry,
        companyWebsite: convertedSettings.companyWebsite,
        companyDescription: convertedSettings.companyDescription,
        logo: convertedSettings.logo,
        favicon: convertedSettings.favicon,
        primaryColor: convertedSettings.primaryColor,
        secondaryColor: convertedSettings.secondaryColor,
        currency: convertedSettings.currency,
        currencySymbol: convertedSettings.currencySymbol,
        socialFacebook: convertedSettings.socialFacebook,
        socialInstagram: convertedSettings.socialInstagram,
        socialLinkedIn: convertedSettings.socialLinkedIn,
        socialYouTube: convertedSettings.socialYouTube,
        socialTwitter: convertedSettings.socialTwitter,
        socialTikTok: convertedSettings.socialTikTok,
        enableQuotes: convertedSettings.enableQuotes,
        enableReviews: convertedSettings.enableReviews,
        enableWishlist: convertedSettings.enableWishlist,
        showTooltipHelp: convertedSettings.showTooltipHelp,
        maintenanceMode: convertedSettings.maintenanceMode,
        maintenanceMessage: convertedSettings.maintenanceMessage,
      });
    }

    // Return all settings for admin
    return NextResponse.json(convertedSettings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH - Update site settings (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication and admin role
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Get or create settings
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'default',
          ...body,
        },
      });
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: 'default' },
        data: body,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
