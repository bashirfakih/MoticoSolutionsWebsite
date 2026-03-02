'use client';

/**
 * Product Image Component
 *
 * Displays product images with fallback for missing/broken images.
 *
 * @module components/ui/ProductImage
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackClassName?: string;
}

export default function ProductImage({
  src,
  alt,
  width = 40,
  height = 40,
  className = 'w-full h-full object-cover',
  fallbackClassName = 'w-5 h-5 text-gray-400',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Package className={fallbackClassName} />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        unoptimized={src.startsWith('/products/')}
      />
    </>
  );
}
