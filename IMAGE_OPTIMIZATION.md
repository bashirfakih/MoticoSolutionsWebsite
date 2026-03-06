# Image Optimization System

## Overview

The Motico Solutions website now includes a comprehensive image optimization system that automatically handles image uploads, validation, resizing, compression, and format conversion. This ensures optimal performance and user experience regardless of the uploaded image size.

## Features

### 1. Automatic Image Processing
- **Smart Resizing**: Automatically resizes large images to appropriate dimensions based on image type
- **Compression**: Optimizes file size while maintaining quality using Sharp
- **Format Conversion**: Generates WebP versions for modern browsers with fallback support
- **Multiple Sizes**: Creates responsive image variants (thumbnail, small, medium, large)
- **Validation**: Checks dimensions, format, and file size before processing

### 2. Image Type Configurations

Different image types have optimized settings:

| Type | Max Size | Quality | Sizes Generated | Use Case |
|------|----------|---------|-----------------|----------|
| **brand-logo** | 500×500px | 90% | thumbnail, small | Brand/manufacturer logos |
| **product-image** | 2000×2000px | 85% | thumbnail, small, medium, large | Product photos |
| **category-image** | 1920×1080px | 85% | medium, large | Category hero images |
| **hero-slide** | 1920×1080px | 85% | large, hero | Homepage carousel |
| **partner-logo** | 400×400px | 90% | thumbnail, small | Partner/client logos |
| **logo** | 500×500px | 90% | - | Company logo |
| **favicon** | 256×256px | 90% | - | Favicon |

### 3. Size Variants

Generated sizes for responsive display:

- **Thumbnail**: 150×150px
- **Small**: 400×400px
- **Medium**: 800×800px
- **Large**: 1200×1200px
- **Hero**: 1920×1080px

## Usage

### Admin Upload Interface

The `ImageUpload` component provides a modern upload experience:

```tsx
import { ImageUpload } from '@/components/admin/ImageUpload';

<ImageUpload
  type="product-image"
  currentImage={imageUrl}
  onUploadComplete={(url, data) => {
    setImageUrl(url);
    console.log('Optimization savings:', data.savings + '%');
  }}
  onRemove={() => setImageUrl('')}
  label="Product Image"
  maxSize={10} // MB
/>
```

**Features:**
- Drag-and-drop support
- Live preview
- Upload progress indicator
- Optimization statistics (file size reduction, WebP conversion)
- Error handling
- Image removal

### Display Optimized Images

Use specialized components for different image types:

#### OptimizedImage (General Purpose)
```tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage';

<OptimizedImage
  src="/images/products/items/product-123.jpg"
  webpSrc="/images/products/items/product-123.webp"
  alt="Product Name"
  width={800}
  height={800}
/>
```

#### LogoImage (Logos)
```tsx
import { LogoImage } from '@/components/ui/OptimizedImage';

<LogoImage
  src="/images/logos/brands/logo-hermes.png"
  alt="Hermes"
  size="medium" // small | medium | large
/>
```

#### ProductImage (Product Photos with Zoom)
```tsx
import { ProductImage } from '@/components/ui/OptimizedImage';

<ProductImage
  src="/images/products/items/product-main.jpg"
  alt="Product Name"
  sizes={{
    thumb: "/images/products/items/product-thumb.jpg",
    medium: "/images/products/items/product-medium.jpg",
    large: "/images/products/items/product-large.jpg",
  }}
  showZoom={true}
  className="rounded-lg"
/>
```

#### HeroImage (Hero/Banner Images)
```tsx
import { HeroImage } from '@/components/ui/OptimizedImage';

<HeroImage
  src="/images/slides/slide-1.png"
  alt="Hero Banner"
  priority={true}
  className="rounded-lg"
/>
```

## API Endpoint

### POST /api/upload/image

Upload and optimize an image.

**Request:**
```typescript
FormData {
  file: File,           // Image file
  type: ImageType       // One of the supported types
}
```

**Response:**
```json
{
  "success": true,
  "url": "/images/products/items/product-123.jpg",
  "webp": "/images/products/items/product-123.webp",
  "sizes": {
    "-thumb": {
      "url": "/images/products/items/product-123-thumb.jpg",
      "webp": "/images/products/items/product-123-thumb.webp"
    },
    "-small": {
      "url": "/images/products/items/product-123-small.jpg",
      "webp": "/images/products/items/product-123-small.webp"
    }
  },
  "fileName": "product-123-1234567890.jpg",
  "type": "product-image",
  "originalSize": 5242880,
  "optimizedSize": 1048576,
  "savings": 80,
  "width": 1200,
  "height": 1200,
  "format": "jpeg"
}
```

## Image Utilities

### Validation

```typescript
import { validateImage } from '@/lib/utils/imageOptimizer';

const buffer = await file.arrayBuffer();
const validation = await validateImage(Buffer.from(buffer));

if (!validation.valid) {
  console.error(validation.error);
}
```

### Manual Optimization

```typescript
import { optimizeImage, optimizeImageByType } from '@/lib/utils/imageOptimizer';

// With predefined configuration
const result = await optimizeImageByType(
  buffer,
  'public/images/products/product-123.jpg',
  'product-image'
);

// With custom options
const result = await optimizeImage(buffer, outputPath, {
  maxWidth: 1500,
  maxHeight: 1500,
  quality: 80,
  generateWebP: true,
  generateSizes: [
    { width: 400, height: 400, suffix: '-small' },
    { width: 800, height: 800, suffix: '-medium' }
  ],
});
```

### Delete Optimized Images

```typescript
import { deleteOptimizedImage } from '@/lib/utils/imageOptimizer';

// Deletes original, WebP version, and all size variants
await deleteOptimizedImage('/images/products/items/product-123.jpg');
```

## File Structure

Images are organized in logical folders:

```
public/
└── images/
    ├── logos/
    │   ├── brands/          # Brand/manufacturer logos
    │   └── company/         # Company logos (Motico)
    ├── products/
    │   ├── categories/      # Category hero images
    │   └── items/           # Product photos and variants
    └── slides/              # Homepage carousel images
```

## Performance Benefits

### Before Optimization
- Large file sizes (2-10MB)
- Single format (usually JPEG/PNG)
- No responsive variants
- Slow page loads

### After Optimization
- **80-95% smaller files** through compression
- **WebP format** for 25-35% additional savings
- **Responsive variants** for optimal loading on any device
- **Lazy loading** built into Next.js Image component
- **Fast page loads** and improved Core Web Vitals

## Best Practices

1. **Always use ImageUpload component** for admin uploads
2. **Use appropriate image type** for each use case
3. **Provide alt text** for accessibility
4. **Use OptimizedImage components** for display
5. **Don't bypass the optimization** - all images should go through the system
6. **Monitor file sizes** - the system shows savings after upload

## Technical Details

- **Library**: Sharp (high-performance Node.js image processing)
- **Formats**: Input: JPEG, PNG, WebP, SVG, GIF | Output: Same + WebP
- **Max Upload**: 10MB (raw files, optimized down)
- **Min Dimensions**: 50×50px
- **Max Dimensions**: 10000×10000px
- **Compression**: Adaptive quality based on image type
- **WebP Quality**: +5% over original format for equivalent visual quality

## Troubleshooting

### Upload fails with "Image too small"
- Minimum dimensions are 50×50px
- Use higher resolution source images

### Upload fails with "Image too large"
- Current limit is 10MB raw upload
- Pre-compress very large images or increase limit in API route

### Images not loading after upload
- Check that file paths are correct
- Verify public folder permissions
- Check browser console for 404 errors

### WebP not being served
- Ensure browser supports WebP (all modern browsers do)
- Check that generateWebP option is enabled
- Verify .webp files are being generated

## Migration from Old System

Old uploads in `/public/uploads/` are not automatically optimized. To migrate:

1. Download existing images
2. Re-upload through the new ImageUpload component
3. Update database references to new paths
4. Delete old files from `/public/uploads/`

## Future Enhancements

- [ ] AVIF format support (even better compression than WebP)
- [ ] Cloud storage integration (S3, Cloudinary)
- [ ] Batch upload and optimization
- [ ] Image editing (crop, rotate, filters)
- [ ] AI-powered image enhancement
- [ ] Automatic alt text generation
- [ ] CDN integration

---

**Last Updated**: March 2026
**Maintained By**: Motico Solutions Development Team
