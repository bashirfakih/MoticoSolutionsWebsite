/**
 * Partner Logos API
 *
 * Manages homepage partner/brand logos
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { toUrlPath } from '@/lib/utils/imageOptimizer';

// GET /api/cms/partner-logos - Get all active partner logos
export async function GET(request: NextRequest) {
  try {
    const logos = await prisma.partnerLogo.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    // Convert logo paths to URL paths
    const logosWithConvertedPaths = logos.map(logoItem => {
      let logo = logoItem.logo;
      if (logo) {
        logo = toUrlPath(logo);
        // If logo is just a filename, prepend brands path
        if (logo.startsWith('/logo-') || logo.match(/^\/[^\/]+\.(png|jpg|jpeg|webp|svg)$/i)) {
          logo = `/images/logos/brands${logo}`;
        }
      }
      return { ...logoItem, logo };
    });

    return NextResponse.json(logosWithConvertedPaths);
  } catch (error) {
    console.error('Partner logos fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner logos' },
      { status: 500 }
    );
  }
}

// POST /api/cms/partner-logos - Create new partner logo (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, logo, website, sortOrder } = body;

    if (!name || !logo) {
      return NextResponse.json(
        { error: 'Name and logo are required' },
        { status: 400 }
      );
    }

    const partnerLogo = await prisma.partnerLogo.create({
      data: {
        name,
        logo,
        website,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(partnerLogo, { status: 201 });
  } catch (error) {
    console.error('Partner logo creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create partner logo' },
      { status: 500 }
    );
  }
}
