/**
 * Optimized Image Component
 *
 * Automatically serves WebP format when available with fallback to original format.
 * Uses Next.js Image component for automatic optimization and lazy loading.
 */

'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  webpSrc?: string;
  fallbackSrc?: string;
  alt: string;
}

/**
 * Component that displays optimized images with WebP support and error fallback
 */
export function OptimizedImage({
  src,
  webpSrc,
  fallbackSrc,
  alt,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(webpSrc || src);

  const handleError = () => {
    if (webpSrc && currentSrc === webpSrc) {
      // Try original format if WebP fails
      setCurrentSrc(src);
    } else if (fallbackSrc && !error) {
      // Try fallback if provided
      setCurrentSrc(fallbackSrc);
      setError(true);
    } else {
      setError(true);
    }
  };

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  );
}

/**
 * Component for responsive images that automatically selects the right size
 */
interface ResponsiveImageProps extends Omit<ImageProps, 'src' | 'sizes'> {
  src: string;
  srcSizes?: {
    thumb?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
  alt: string;
  containerClassName?: string;
}

export function ResponsiveImage({
  src,
  srcSizes,
  alt,
  containerClassName = '',
  ...props
}: ResponsiveImageProps) {
  const [error, setError] = useState(false);

  // Build srcSet if sizes are provided
  const srcSet = srcSizes
    ? Object.entries(srcSizes)
        .filter(([_, url]) => url)
        .map(([size, url]) => {
          const widths = {
            thumb: '150w',
            small: '400w',
            medium: '800w',
            large: '1200w',
          };
          return `${url} ${widths[size as keyof typeof widths]}`;
        })
        .join(', ')
    : undefined;

  return (
    <div className={containerClassName}>
      <Image
        {...props}
        src={error ? '/placeholder-image.png' : src}
        alt={alt}
        onError={() => setError(true)}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}

/**
 * Simple wrapper for brand/partner logos with consistent sizing
 */
interface LogoImageProps {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function LogoImage({
  src,
  alt,
  size = 'medium',
  className = '',
}: LogoImageProps) {
  const dimensions = {
    small: { width: 100, height: 100 },
    medium: { width: 150, height: 150 },
    large: { width: 200, height: 200 },
  };

  const dim = dimensions[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dim.width}
      height={dim.height}
      className={`object-contain ${className}`}
    />
  );
}

/**
 * Product image with thumbnail, hover zoom support
 */
interface ProductImageProps {
  src: string;
  alt: string;
  sizes?: {
    thumb?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
  showZoom?: boolean;
  className?: string;
}

export function ProductImage({
  src,
  alt,
  sizes,
  showZoom = false,
  className = '',
}: ProductImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => showZoom && setIsZoomed(true)}
      onMouseLeave={() => showZoom && setIsZoomed(false)}
    >
      <OptimizedImage
        src={sizes?.large || sizes?.medium || src}
        alt={alt}
        width={800}
        height={800}
        className={`object-cover transition-transform duration-300 ${
          isZoomed ? 'scale-110' : 'scale-100'
        }`}
        priority={false}
      />
    </div>
  );
}

/**
 * Hero/Banner image with optimized loading
 */
interface HeroImageProps {
  src: string;
  alt: string;
  sizes?: {
    large?: string;
    hero?: string;
  };
  priority?: boolean;
  className?: string;
}

export function HeroImage({
  src,
  alt,
  sizes,
  priority = true,
  className = '',
}: HeroImageProps) {
  return (
    <OptimizedImage
      src={sizes?.hero || sizes?.large || src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      priority={priority}
      sizes="100vw"
    />
  );
}
