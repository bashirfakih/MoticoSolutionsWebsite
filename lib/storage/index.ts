/**
 * Storage Service
 *
 * Handles file uploads with support for multiple storage backends:
 * - Local: Stores files in public/uploads (development)
 * - Cloudinary: Cloud storage (production)
 *
 * @module lib/storage
 */

import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface UploadOptions {
  folder?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  };
}

// Configure Cloudinary if credentials are available
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Generate a unique filename
 */
function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

/**
 * Upload file to local storage
 */
async function uploadLocal(
  buffer: Buffer,
  filename: string,
  folder: string
): Promise<UploadResult> {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return {
      success: true,
      url: `/uploads/${folder}/${filename}`,
      publicId: `${folder}/${filename}`,
    };
  } catch (error) {
    console.error('Local upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload file to Cloudinary
 */
async function uploadCloudinary(
  buffer: Buffer,
  filename: string,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    const folder = options.folder || 'products';

    // Convert buffer to base64 data URI
    const base64 = buffer.toString('base64');
    const ext = path.extname(filename).slice(1);
    const mimeType = ext === 'jpg' ? 'jpeg' : ext;
    const dataUri = `data:image/${mimeType};base64,${base64}`;

    const uploadOptions: Record<string, unknown> = {
      folder: `motico/${folder}`,
      resource_type: 'image',
      public_id: path.basename(filename, path.extname(filename)),
    };

    // Add transformation if specified
    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete file from Cloudinary
 */
async function deleteCloudinary(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

/**
 * Delete file from local storage
 */
async function deleteLocal(publicId: string): Promise<boolean> {
  try {
    const filepath = path.join(process.cwd(), 'public', 'uploads', publicId);
    if (existsSync(filepath)) {
      await unlink(filepath);
    }
    return true;
  } catch (error) {
    console.error('Local delete error:', error);
    return false;
  }
}

/**
 * Upload a file
 * Uses Cloudinary if configured, otherwise falls back to local storage
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = generateFilename(file.name);
  const folder = options.folder || 'products';

  if (isCloudinaryConfigured) {
    return uploadCloudinary(buffer, filename, options);
  }

  return uploadLocal(buffer, filename, folder);
}

/**
 * Upload from buffer directly
 */
export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const folder = options.folder || 'products';

  if (isCloudinaryConfigured) {
    return uploadCloudinary(buffer, filename, options);
  }

  return uploadLocal(buffer, filename, folder);
}

/**
 * Delete a file
 */
export async function deleteFile(publicId: string): Promise<boolean> {
  if (isCloudinaryConfigured) {
    return deleteCloudinary(publicId);
  }

  return deleteLocal(publicId);
}

/**
 * Get optimized image URL (Cloudinary only)
 */
export function getOptimizedUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!isCloudinaryConfigured || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 'auto' } = options;
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push('f_auto');

  const transformString = transformations.join(',');

  // Insert transformation into Cloudinary URL
  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Check if cloud storage is available
 */
export function isCloudStorageAvailable(): boolean {
  return isCloudinaryConfigured;
}
