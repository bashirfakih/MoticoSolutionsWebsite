/**
 * Image Upload API Route
 *
 * POST /api/upload/image - Upload and optimize images
 * Supports: brand-logo, product-image, category-image, hero-slide, partner-logo, logo, favicon
 */

import { NextRequest, NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getCurrentUser } from '@/lib/auth/session';
import {
  validateImage,
  optimizeImageByType,
  optimizeImage,
  IMAGE_CONFIGS,
  toUrlPath,
} from '@/lib/utils/imageOptimizer';

const VALID_IMAGE_TYPES = [
  'brand-logo',
  'product-image',
  'category-image',
  'hero-slide',
  'partner-logo',
  'logo',
  'favicon',
] as const;

type ImageType = typeof VALID_IMAGE_TYPES[number];

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as ImageType | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || !VALID_IMAGE_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_IMAGE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPEG, WebP, SVG, GIF' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for raw upload, will be optimized)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // SECURITY: Sanitize SVG files — they can contain <script> tags and event handlers
    if (file.type === 'image/svg+xml') {
      let svgContent = buffer.toString('utf-8');
      svgContent = svgContent.replace(/<script[\s\S]*?<\/script>/gi, '');
      svgContent = svgContent.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
      svgContent = svgContent.replace(/javascript\s*:/gi, '');
      svgContent = svgContent.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');
      buffer = Buffer.from(svgContent, 'utf-8');
    }

    // Validate image with Sharp
    const validation = await validateImage(buffer);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Determine upload directory based on type
    let uploadSubDir = 'uploads';
    if (type === 'brand-logo' || type === 'partner-logo') {
      uploadSubDir = 'images/logos/brands';
    } else if (type === 'logo' || type === 'favicon') {
      uploadSubDir = 'images/logos/company';
    } else if (type === 'product-image') {
      uploadSubDir = 'images/products/items';
    } else if (type === 'category-image') {
      uploadSubDir = 'images/products/categories';
    } else if (type === 'hero-slide') {
      uploadSubDir = 'images/slides';
    }

    // Create directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', uploadSubDir);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'png';
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-z0-9-_]/gi, '-') // Replace invalid chars
      .toLowerCase()
      .slice(0, 50); // Limit length
    const fileName = `${sanitizedName}-${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Optimize image based on type
    let result;
    if (type in IMAGE_CONFIGS) {
      result = await optimizeImageByType(
        buffer,
        filePath,
        type as keyof typeof IMAGE_CONFIGS
      );
    } else {
      // For logo and favicon, use basic optimization
      result = await optimizeImage(buffer, filePath, {
        maxWidth: type === 'logo' ? 500 : 256,
        maxHeight: type === 'logo' ? 500 : 256,
        quality: 90,
        generateWebP: true,
      });
    }

    // Convert file paths to URL paths
    const response: any = {
      success: true,
      url: toUrlPath(result.optimized),
      fileName,
      type,
      originalSize: file.size,
      optimizedSize: result.metadata.size,
      savings: Math.round(((file.size - result.metadata.size) / file.size) * 100),
      width: result.metadata.width,
      height: result.metadata.height,
      format: result.metadata.format,
    };

    // Add WebP URL if generated
    if (result.webp) {
      response.webp = toUrlPath(result.webp);
    }

    // Add size variants if generated
    if (result.sizes) {
      response.sizes = {};
      for (const [sizeKey, sizeData] of Object.entries(result.sizes)) {
        response.sizes[sizeKey] = {
          url: toUrlPath(sizeData.url),
          webp: sizeData.webp ? toUrlPath(sizeData.webp) : undefined,
        };
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload and optimize image' },
      { status: 500 }
    );
  }
}
