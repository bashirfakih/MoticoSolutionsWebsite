/**
 * Image Optimization Utility
 *
 * Handles image validation, resizing, compression, and format conversion
 * using Sharp for optimal web performance.
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export interface ImageSize {
  width: number;
  height: number;
  suffix: string;
}

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  generateWebP?: boolean;
  generateSizes?: ImageSize[];
  preserveOriginal?: boolean;
}

export interface OptimizedImageResult {
  original: string;
  optimized: string;
  webp?: string;
  sizes?: Record<string, { url: string; webp?: string }>;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

// Predefined size configurations
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150, suffix: '-thumb' },
  small: { width: 400, height: 400, suffix: '-small' },
  medium: { width: 800, height: 800, suffix: '-medium' },
  large: { width: 1200, height: 1200, suffix: '-large' },
  hero: { width: 1920, height: 1080, suffix: '-hero' },
};

// Image type configurations
export const IMAGE_CONFIGS = {
  'brand-logo': {
    maxWidth: 500,
    maxHeight: 500,
    quality: 90,
    generateWebP: true,
    generateSizes: [IMAGE_SIZES.thumbnail, IMAGE_SIZES.small],
  },
  'product-image': {
    maxWidth: 2000,
    maxHeight: 2000,
    quality: 85,
    generateWebP: true,
    generateSizes: [IMAGE_SIZES.thumbnail, IMAGE_SIZES.small, IMAGE_SIZES.medium, IMAGE_SIZES.large],
  },
  'category-image': {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    generateWebP: true,
    generateSizes: [IMAGE_SIZES.medium, IMAGE_SIZES.large],
  },
  'hero-slide': {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    generateWebP: true,
    generateSizes: [IMAGE_SIZES.large, IMAGE_SIZES.hero],
  },
  'partner-logo': {
    maxWidth: 400,
    maxHeight: 400,
    quality: 90,
    generateWebP: true,
    generateSizes: [IMAGE_SIZES.thumbnail, IMAGE_SIZES.small],
  },
};

/**
 * Validates image file before processing
 */
export async function validateImage(buffer: Buffer): Promise<{ valid: boolean; error?: string; metadata?: any }> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Check if it's a valid image format
    const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'svg'];
    if (!metadata.format || !validFormats.includes(metadata.format)) {
      return { valid: false, error: `Invalid format. Supported: ${validFormats.join(', ')}` };
    }

    // Check dimensions - minimum size
    if (metadata.width && metadata.width < 50) {
      return { valid: false, error: 'Image width too small (minimum 50px)' };
    }
    if (metadata.height && metadata.height < 50) {
      return { valid: false, error: 'Image height too small (minimum 50px)' };
    }

    // Check dimensions - maximum size (very large images)
    if (metadata.width && metadata.width > 10000) {
      return { valid: false, error: 'Image width too large (maximum 10000px)' };
    }
    if (metadata.height && metadata.height > 10000) {
      return { valid: false, error: 'Image height too large (maximum 10000px)' };
    }

    return { valid: true, metadata };
  } catch (error) {
    return { valid: false, error: 'Invalid image file or corrupted data' };
  }
}

/**
 * Optimizes a single image with specified options
 */
export async function optimizeImage(
  buffer: Buffer,
  outputPath: string,
  options: OptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 2000,
    maxHeight = 2000,
    quality = 85,
    generateWebP = true,
    generateSizes = [],
    preserveOriginal = false,
  } = options;

  // Parse output path
  const ext = path.extname(outputPath);
  const nameWithoutExt = outputPath.slice(0, -ext.length);
  const dir = path.dirname(outputPath);

  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });

  // Get original metadata
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Determine if resizing is needed
  const needsResize =
    (metadata.width && metadata.width > maxWidth) ||
    (metadata.height && metadata.height > maxHeight);

  let processedImage = sharp(buffer);

  // Resize if needed (maintain aspect ratio)
  if (needsResize) {
    processedImage = processedImage.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Optimize based on format
  if (metadata.format === 'jpeg' || ext === '.jpg' || ext === '.jpeg') {
    processedImage = processedImage.jpeg({ quality, mozjpeg: true });
  } else if (metadata.format === 'png' || ext === '.png') {
    processedImage = processedImage.png({ quality, compressionLevel: 9 });
  } else if (metadata.format === 'webp' || ext === '.webp') {
    processedImage = processedImage.webp({ quality });
  }

  // Save optimized original format
  await processedImage.toFile(outputPath);

  // Get metadata of optimized image
  const optimizedMetadata = await sharp(outputPath).metadata();
  const stats = await fs.stat(outputPath);

  const result: OptimizedImageResult = {
    original: outputPath,
    optimized: outputPath,
    metadata: {
      width: optimizedMetadata.width || 0,
      height: optimizedMetadata.height || 0,
      format: optimizedMetadata.format || '',
      size: stats.size,
    },
  };

  // Generate WebP version
  if (generateWebP && metadata.format !== 'webp' && metadata.format !== 'svg') {
    const webpPath = `${nameWithoutExt}.webp`;
    await sharp(buffer)
      .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: quality + 5 }) // Slightly higher quality for WebP
      .toFile(webpPath);

    result.webp = webpPath;
  }

  // Generate additional sizes
  if (generateSizes.length > 0) {
    result.sizes = {};

    for (const size of generateSizes) {
      const sizePath = `${nameWithoutExt}${size.suffix}${ext}`;

      await sharp(buffer)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(sizePath);

      result.sizes[size.suffix] = { url: sizePath };

      // Generate WebP for this size too
      if (generateWebP && metadata.format !== 'webp' && metadata.format !== 'svg') {
        const sizeWebpPath = `${nameWithoutExt}${size.suffix}.webp`;
        await sharp(buffer)
          .resize(size.width, size.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: quality + 5 })
          .toFile(sizeWebpPath);

        result.sizes[size.suffix].webp = sizeWebpPath;
      }
    }
  }

  return result;
}

/**
 * Optimizes an image based on its type (brand-logo, product-image, etc.)
 */
export async function optimizeImageByType(
  buffer: Buffer,
  outputPath: string,
  type: keyof typeof IMAGE_CONFIGS
): Promise<OptimizedImageResult> {
  const config = IMAGE_CONFIGS[type];
  return optimizeImage(buffer, outputPath, config);
}

/**
 * Converts file paths to URL paths for client use
 */
export function toUrlPath(filePath: string): string {
  if (!filePath) return filePath;

  // Convert Windows backslashes to forward slashes
  let normalized = filePath.replace(/\\/g, '/');

  // If it's an absolute path (contains drive letter or full path), extract the relative part
  if (normalized.includes('/public/')) {
    normalized = normalized.substring(normalized.indexOf('/public/') + '/public/'.length);
  } else if (normalized.match(/^[A-Za-z]:/)) {
    // Windows absolute path - try to extract images path
    const imagesMatch = normalized.match(/\/(images\/.+)$/);
    if (imagesMatch) {
      normalized = imagesMatch[1];
    }
  }

  // Remove 'public/' prefix if present
  normalized = normalized.replace(/^public\//, '');

  // Ensure starts with /
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

/**
 * Converts URL path to file system path
 */
export function toFilePath(urlPath: string): string {
  // Remove leading slash
  const withoutSlash = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;

  // Prepend public directory
  return path.join(process.cwd(), 'public', withoutSlash);
}

/**
 * Deletes an image and all its generated sizes/formats
 */
export async function deleteOptimizedImage(urlPath: string): Promise<void> {
  const filePath = toFilePath(urlPath);
  const ext = path.extname(filePath);
  const nameWithoutExt = filePath.slice(0, -ext.length);

  // Delete main file
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore if file doesn't exist
  }

  // Delete WebP version
  try {
    await fs.unlink(`${nameWithoutExt}.webp`);
  } catch (error) {
    // Ignore if file doesn't exist
  }

  // Delete size variants
  for (const size of Object.values(IMAGE_SIZES)) {
    try {
      await fs.unlink(`${nameWithoutExt}${size.suffix}${ext}`);
      await fs.unlink(`${nameWithoutExt}${size.suffix}.webp`);
    } catch (error) {
      // Ignore if files don't exist
    }
  }
}
