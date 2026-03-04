/**
 * Image Upload Component
 *
 * Modern image upload with drag-and-drop, preview, progress, cropping, and optimization info
 */

'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, Check, Image as ImageIcon, Crop } from 'lucide-react';
import { ImageCropper } from './ImageCropper';

// Aspect ratio mapping for different image types
const ASPECT_RATIOS: Record<string, number> = {
  'brand-logo': 1,
  'product-image': 1,
  'category-image': 16 / 9,
  'hero-slide': 16 / 9,
  'partner-logo': 1,
  'logo': 1,
  'favicon': 1,
};

interface ImageUploadProps {
  type: 'brand-logo' | 'product-image' | 'category-image' | 'hero-slide' | 'partner-logo' | 'logo' | 'favicon';
  currentImage?: string;
  onUploadComplete: (url: string, data?: any) => void;
  onRemove?: () => void;
  label?: string;
  maxSize?: number; // in MB
  aspectRatio?: string;
  className?: string;
  enableCrop?: boolean; // Enable crop functionality
}

interface UploadResult {
  url: string;
  webp?: string;
  sizes?: Record<string, { url: string; webp?: string }>;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  width: number;
  height: number;
}

export function ImageUpload({
  type,
  currentImage,
  onUploadComplete,
  onRemove,
  label,
  maxSize = 10,
  aspectRatio,
  className = '',
  enableCrop = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');

  // Get aspect ratio for cropper
  const cropAspectRatio = ASPECT_RATIOS[type] || 1;

  // Check if image type supports cropping (not SVG or GIF)
  const canCrop = (fileType: string) => {
    return enableCrop && ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(fileType);
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploadResult(null);

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PNG, JPEG, WebP, SVG, or GIF.');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    // If image can be cropped, show cropper first
    if (canCrop(file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setOriginalFileName(file.name);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      return;
    }

    // For SVG/GIF, upload directly without cropping
    await uploadFile(file);
  };

  // Handle cropped image
  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setImageToCrop(null);

    // Create file from blob
    const fileName = originalFileName.replace(/\.[^/.]+$/, '.jpg'); // Convert to jpg
    const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });

    // Set preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(croppedBlob);

    // Upload cropped file
    await uploadFile(croppedFile);
  };

  // Cancel cropping
  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setOriginalFileName('');
  };

  // Upload file to server
  const uploadFile = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Simulate progress (actual progress not available with fetch)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadResult(data);
      onUploadComplete(data.url, data);

      // Show success for 2 seconds
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      setProgress(0);
      setPreview(currentImage || null);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : preview
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-contain rounded-lg"
              style={aspectRatio ? { aspectRatio } : undefined}
            />
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <div className="mb-2">
                    {progress < 100 ? (
                      <Upload className="w-8 h-8 mx-auto animate-bounce" />
                    ) : (
                      <Check className="w-8 h-8 mx-auto" />
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {progress < 100 ? `Uploading... ${progress}%` : 'Upload Complete!'}
                  </div>
                  <div className="w-48 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="p-8 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold text-blue-600 hover:text-blue-700">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP, SVG up to {maxSize}MB
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {enableCrop ? 'Crop & position before upload' : 'Images will be optimized'}
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {uploadResult && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
          <p className="text-sm font-medium text-green-800">
            ✓ Image optimized successfully!
          </p>
          <div className="text-xs text-green-700 space-y-1">
            <p>
              Size: {uploadResult.width} × {uploadResult.height}px
            </p>
            <p>
              File size reduced by {uploadResult.savings}% (
              {(uploadResult.originalSize / 1024).toFixed(1)}KB →{' '}
              {(uploadResult.optimizedSize / 1024).toFixed(1)}KB)
            </p>
            {uploadResult.webp && (
              <p>✓ WebP version created for faster loading</p>
            )}
            {uploadResult.sizes && (
              <p>
                ✓ Generated {Object.keys(uploadResult.sizes).length} responsive sizes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          aspectRatio={cropAspectRatio}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
