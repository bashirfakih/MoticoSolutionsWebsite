'use client';

/**
 * ImageUploader Component
 *
 * Drag & drop image uploader with preview.
 * Currently stores as base64/URLs - will be swapped for real upload later.
 *
 * @module components/admin/ImageUploader
 */

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
  GripVertical,
  Star,
  StarOff,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import { ProductImage, generateId } from '@/lib/data/types';

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
  acceptedTypes?: string[];
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) return;

    setIsUploading(true);

    const newImages: ProductImage[] = [];

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];

      if (!acceptedTypes.includes(file.type)) {
        console.warn(`File ${file.name} is not an accepted type`);
        continue;
      }

      // Convert to base64 (mock upload)
      // In production, this would upload to a CDN and return a URL
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newImages.push({
        id: generateId(),
        url: base64,
        alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        sortOrder: images.length + newImages.length + 1,
        isPrimary: images.length === 0 && newImages.length === 0,
      });
    }

    onChange([...images, ...newImages]);
    setIsUploading(false);
  }, [images, onChange, maxImages, acceptedTypes]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // Remove an image
  const handleRemove = useCallback((id: string) => {
    const newImages = images.filter(img => img.id !== id);

    // If we removed the primary, make the first one primary
    if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }

    // Reorder
    newImages.forEach((img, index) => {
      img.sortOrder = index + 1;
    });

    onChange(newImages);
  }, [images, onChange]);

  // Set primary image
  const handleSetPrimary = useCallback((id: string) => {
    const newImages = images.map(img => ({
      ...img,
      isPrimary: img.id === id,
    }));
    onChange(newImages);
  }, [images, onChange]);

  // Update alt text
  const handleAltChange = useCallback((id: string, alt: string) => {
    const newImages = images.map(img =>
      img.id === id ? { ...img, alt } : img
    );
    onChange(newImages);
  }, [images, onChange]);

  // Reorder images (simple move up/down for now)
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    newImages.forEach((img, i) => {
      img.sortOrder = i + 1;
    });
    onChange(newImages);
  }, [images, onChange]);

  const handleMoveDown = useCallback((index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    newImages.forEach((img, i) => {
      img.sortOrder = i + 1;
    });
    onChange(newImages);
  }, [images, onChange]);

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging
            ? 'border-[#004D8B] bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={images.length >= maxImages}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#004D8B] animate-spin" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP up to 5MB ({images.length}/{maxImages})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((image, index) => (
              <div
                key={image.id}
                className={`
                  relative group rounded-lg border-2 overflow-hidden
                  ${image.isPrimary ? 'border-[#004D8B]' : 'border-gray-200'}
                `}
              >
                {/* Image */}
                <div className="aspect-square relative bg-gray-100">
                  {image.url.startsWith('data:') || image.url.startsWith('/') ? (
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-[#004D8B] text-white text-xs font-medium px-2 py-0.5 rounded">
                    Primary
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* Set as Primary */}
                  {!image.isPrimary && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(image.id);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4 text-gray-700" />
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(image.id);
                    }}
                    className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* Reorder Handle */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveUp(index);
                    }}
                    disabled={index === 0}
                    className="p-1 bg-white rounded shadow hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <GripVertical className="w-3 h-3 text-gray-500" />
                  </button>
                </div>

                {/* Alt Text Input */}
                <div className="p-2 border-t border-gray-200">
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => handleAltChange(image.id, e.target.value)}
                    placeholder="Alt text..."
                    className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#004D8B]"
                  />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
