/**
 * Hero Slides API
 *
 * Manages homepage hero carousel slides
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { toUrlPath } from '@/lib/utils/imageOptimizer';

// GET /api/cms/hero-slides - Get all active hero slides
export async function GET(request: NextRequest) {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    // Convert image paths to URL paths
    const slidesWithConvertedPaths = slides.map(slide => {
      let image = slide.image;
      if (image) {
        image = toUrlPath(image);
        // If image is just a filename, prepend slides path
        if (image.match(/^\/[^\/]+\.(png|jpg|jpeg|webp|svg)$/i)) {
          image = `/images/slides${image}`;
        }
      }
      return { ...slide, image };
    });

    return NextResponse.json(slidesWithConvertedPaths);
  } catch (error) {
    console.error('Hero slides fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero slides' },
      { status: 500 }
    );
  }
}

// POST /api/cms/hero-slides - Create new hero slide (admin only)
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
    const { title, subtitle, tag, image, ctaText, ctaLink, accentColor, sortOrder } = body;

    if (!title || !image) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }

    const slide = await prisma.heroSlide.create({
      data: {
        title,
        subtitle,
        tag,
        image,
        ctaText,
        ctaLink,
        accentColor: accentColor || '#bb0c15',
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error('Hero slide creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create hero slide' },
      { status: 500 }
    );
  }
}
