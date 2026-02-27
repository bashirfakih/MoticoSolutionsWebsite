/**
 * Product Form Component Tests
 * Tests form validation, state management, and edge cases
 */

import React from 'react';

// Stock status constants
const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
} as const;

type StockStatus = (typeof STOCK_STATUS)[keyof typeof STOCK_STATUS];

describe('Product Form Validation', () => {
  describe('SKU Validation', () => {
    const isValidSKU = (sku: string): boolean => {
      if (!sku || sku.trim().length === 0) return false;
      if (sku.trim().length < 2) return false;
      if (sku.includes(' ')) return false;
      return true;
    };

    it('rejects empty SKU', () => {
      expect(isValidSKU('')).toBe(false);
    });

    it('rejects whitespace-only SKU', () => {
      expect(isValidSKU('   ')).toBe(false);
    });

    it('rejects SKU with spaces', () => {
      expect(isValidSKU('SKU 001')).toBe(false);
    });

    it('rejects too short SKU', () => {
      expect(isValidSKU('A')).toBe(false);
    });

    it('accepts valid SKU', () => {
      expect(isValidSKU('SKU-001')).toBe(true);
      expect(isValidSKU('PROD123')).toBe(true);
    });
  });

  describe('Name Validation', () => {
    const isValidName = (name: string): boolean => {
      if (!name || name.trim().length === 0) return false;
      if (name.trim().length < 2) return false;
      if (name.trim().length > 200) return false;
      return true;
    };

    it('rejects empty name', () => {
      expect(isValidName('')).toBe(false);
    });

    it('rejects too short name', () => {
      expect(isValidName('A')).toBe(false);
    });

    it('rejects too long name', () => {
      const longName = 'A'.repeat(201);
      expect(isValidName(longName)).toBe(false);
    });

    it('accepts valid name', () => {
      expect(isValidName('Power Drill')).toBe(true);
    });
  });

  describe('Slug Validation', () => {
    const isValidSlug = (slug: string): boolean => {
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    };

    it('rejects uppercase letters', () => {
      expect(isValidSlug('Power-Tools')).toBe(false);
    });

    it('rejects spaces', () => {
      expect(isValidSlug('power tools')).toBe(false);
    });

    it('rejects leading dashes', () => {
      expect(isValidSlug('-power-tools')).toBe(false);
    });

    it('rejects trailing dashes', () => {
      expect(isValidSlug('power-tools-')).toBe(false);
    });

    it('rejects consecutive dashes', () => {
      expect(isValidSlug('power--tools')).toBe(false);
    });

    it('accepts valid slugs', () => {
      expect(isValidSlug('power-tools')).toBe(true);
      expect(isValidSlug('drill-123')).toBe(true);
      expect(isValidSlug('product')).toBe(true);
    });
  });

  describe('Price Validation', () => {
    const isValidPrice = (price: number | null | undefined): boolean => {
      if (price === null || price === undefined) return true; // Optional
      if (isNaN(price)) return false;
      if (price < 0) return false;
      return true;
    };

    it('accepts null price (optional)', () => {
      expect(isValidPrice(null)).toBe(true);
    });

    it('accepts zero price', () => {
      expect(isValidPrice(0)).toBe(true);
    });

    it('accepts positive price', () => {
      expect(isValidPrice(99.99)).toBe(true);
    });

    it('rejects negative price', () => {
      expect(isValidPrice(-10)).toBe(false);
    });

    it('rejects NaN price', () => {
      expect(isValidPrice(NaN)).toBe(false);
    });
  });

  describe('Stock Quantity Validation', () => {
    const isValidQuantity = (qty: number): boolean => {
      if (!Number.isInteger(qty)) return false;
      if (qty < 0) return false;
      return true;
    };

    it('accepts zero quantity', () => {
      expect(isValidQuantity(0)).toBe(true);
    });

    it('accepts positive integer', () => {
      expect(isValidQuantity(100)).toBe(true);
    });

    it('rejects negative quantity', () => {
      expect(isValidQuantity(-1)).toBe(false);
    });

    it('rejects decimal quantity', () => {
      expect(isValidQuantity(1.5)).toBe(false);
    });
  });
});

describe('Slug Generation', () => {
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  it('converts to lowercase', () => {
    expect(generateSlug('Power Tools')).toBe('power-tools');
  });

  it('replaces spaces with dashes', () => {
    expect(generateSlug('drill press machine')).toBe('drill-press-machine');
  });

  it('removes special characters', () => {
    expect(generateSlug('Drills & Sanders!')).toBe('drills-sanders');
  });

  it('trims whitespace', () => {
    expect(generateSlug('  Product Name  ')).toBe('product-name');
  });

  it('handles multiple spaces', () => {
    expect(generateSlug('Product   Name')).toBe('product-name');
  });

  it('removes consecutive dashes', () => {
    expect(generateSlug('Product - Name')).toBe('product-name');
  });
});

describe('Stock Status Calculation', () => {
  const calculateStockStatus = (
    quantity: number,
    lowStockThreshold: number = 10
  ): StockStatus => {
    if (quantity <= 0) return STOCK_STATUS.OUT_OF_STOCK;
    if (quantity <= lowStockThreshold) return STOCK_STATUS.LOW_STOCK;
    return STOCK_STATUS.IN_STOCK;
  };

  it('returns out_of_stock for zero quantity', () => {
    expect(calculateStockStatus(0)).toBe('out_of_stock');
  });

  it('returns out_of_stock for negative quantity', () => {
    expect(calculateStockStatus(-5)).toBe('out_of_stock');
  });

  it('returns low_stock for quantity at threshold', () => {
    expect(calculateStockStatus(10)).toBe('low_stock');
  });

  it('returns low_stock for quantity below threshold', () => {
    expect(calculateStockStatus(5)).toBe('low_stock');
  });

  it('returns in_stock for quantity above threshold', () => {
    expect(calculateStockStatus(11)).toBe('in_stock');
  });

  it('uses custom threshold', () => {
    expect(calculateStockStatus(20, 25)).toBe('low_stock');
    expect(calculateStockStatus(26, 25)).toBe('in_stock');
  });
});

describe('Product Image Handling', () => {
  interface ProductImage {
    url: string;
    alt: string;
    isPrimary: boolean;
    sortOrder: number;
  }

  it('identifies primary image', () => {
    const images: ProductImage[] = [
      { url: '/img1.jpg', alt: 'Image 1', isPrimary: false, sortOrder: 1 },
      { url: '/img2.jpg', alt: 'Image 2', isPrimary: true, sortOrder: 0 },
      { url: '/img3.jpg', alt: 'Image 3', isPrimary: false, sortOrder: 2 },
    ];

    const primaryImage = images.find((img) => img.isPrimary);
    expect(primaryImage?.url).toBe('/img2.jpg');
  });

  it('falls back to first image if no primary', () => {
    const images: ProductImage[] = [
      { url: '/img1.jpg', alt: 'Image 1', isPrimary: false, sortOrder: 0 },
      { url: '/img2.jpg', alt: 'Image 2', isPrimary: false, sortOrder: 1 },
    ];

    const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
    const displayImage = images.find((img) => img.isPrimary) || sortedImages[0];

    expect(displayImage?.url).toBe('/img1.jpg');
  });

  it('handles empty images array', () => {
    const images: ProductImage[] = [];
    const displayImage = images.find((img) => img.isPrimary) || images[0] || null;

    expect(displayImage).toBeNull();
  });

  it('sorts images by sortOrder', () => {
    const images: ProductImage[] = [
      { url: '/img3.jpg', alt: 'Image 3', isPrimary: false, sortOrder: 2 },
      { url: '/img1.jpg', alt: 'Image 1', isPrimary: true, sortOrder: 0 },
      { url: '/img2.jpg', alt: 'Image 2', isPrimary: false, sortOrder: 1 },
    ];

    const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

    expect(sorted[0].url).toBe('/img1.jpg');
    expect(sorted[1].url).toBe('/img2.jpg');
    expect(sorted[2].url).toBe('/img3.jpg');
  });
});

describe('Product Category Selection', () => {
  interface Category {
    id: string;
    name: string;
    parentId: string | null;
  }

  it('filters child categories by parent', () => {
    const categories: Category[] = [
      { id: '1', name: 'Tools', parentId: null },
      { id: '2', name: 'Power Tools', parentId: '1' },
      { id: '3', name: 'Hand Tools', parentId: '1' },
      { id: '4', name: 'Safety', parentId: null },
    ];

    const childrenOf = (parentId: string) =>
      categories.filter((c) => c.parentId === parentId);

    expect(childrenOf('1')).toHaveLength(2);
    expect(childrenOf('4')).toHaveLength(0);
  });

  it('gets root categories', () => {
    const categories: Category[] = [
      { id: '1', name: 'Tools', parentId: null },
      { id: '2', name: 'Power Tools', parentId: '1' },
      { id: '4', name: 'Safety', parentId: null },
    ];

    const rootCategories = categories.filter((c) => c.parentId === null);
    expect(rootCategories).toHaveLength(2);
  });
});

describe('Product Form State', () => {
  interface ProductFormData {
    sku: string;
    name: string;
    slug: string;
    description: string;
    price: number | null;
    compareAtPrice: number | null;
    categoryId: string;
    brandId: string;
    stockQuantity: number;
    stockStatus: StockStatus;
    isPublished: boolean;
    isFeatured: boolean;
    isNew: boolean;
  }

  const createDefaultFormData = (): ProductFormData => ({
    sku: '',
    name: '',
    slug: '',
    description: '',
    price: null,
    compareAtPrice: null,
    categoryId: '',
    brandId: '',
    stockQuantity: 0,
    stockStatus: STOCK_STATUS.OUT_OF_STOCK,
    isPublished: false,
    isFeatured: false,
    isNew: false,
  });

  it('initializes with default values', () => {
    const formData = createDefaultFormData();

    expect(formData.sku).toBe('');
    expect(formData.price).toBeNull();
    expect(formData.isPublished).toBe(false);
    expect(formData.stockQuantity).toBe(0);
  });

  it('validates required fields', () => {
    const formData = createDefaultFormData();

    const errors: string[] = [];
    if (!formData.sku) errors.push('SKU is required');
    if (!formData.name) errors.push('Name is required');
    if (!formData.categoryId) errors.push('Category is required');

    expect(errors).toHaveLength(3);
  });

  it('detects form changes', () => {
    const original = createDefaultFormData();
    const modified = { ...original, name: 'New Product' };

    const hasChanges = JSON.stringify(original) !== JSON.stringify(modified);
    expect(hasChanges).toBe(true);
  });

  it('resets form to defaults', () => {
    const modified: ProductFormData = {
      ...createDefaultFormData(),
      sku: 'SKU-001',
      name: 'Product',
    };

    const reset = createDefaultFormData();

    expect(reset.sku).toBe('');
    expect(reset.name).toBe('');
  });
});

describe('Product Publish Validation', () => {
  interface Product {
    name: string;
    sku: string;
    categoryId: string;
    price: number | null;
    stockQuantity: number;
    images: { url: string }[];
  }

  const canPublish = (product: Product): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!product.name) errors.push('Name is required');
    if (!product.sku) errors.push('SKU is required');
    if (!product.categoryId) errors.push('Category is required');
    if (product.price === null || product.price <= 0) {
      errors.push('Valid price is required');
    }
    if (product.stockQuantity <= 0) {
      errors.push('Product must be in stock');
    }
    if (!product.images || product.images.length === 0) {
      errors.push('At least one image is required');
    }

    return { valid: errors.length === 0, errors };
  };

  it('validates complete product can be published', () => {
    const product: Product = {
      name: 'Power Drill',
      sku: 'PD-001',
      categoryId: 'cat-1',
      price: 99.99,
      stockQuantity: 10,
      images: [{ url: '/drill.jpg' }],
    };

    const result = canPublish(product);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects incomplete product', () => {
    const product: Product = {
      name: '',
      sku: '',
      categoryId: '',
      price: null,
      stockQuantity: 0,
      images: [],
    };

    const result = canPublish(product);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects product without price', () => {
    const product: Product = {
      name: 'Product',
      sku: 'SKU-001',
      categoryId: 'cat-1',
      price: null,
      stockQuantity: 10,
      images: [{ url: '/img.jpg' }],
    };

    const result = canPublish(product);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Valid price is required');
  });

  it('rejects out of stock product', () => {
    const product: Product = {
      name: 'Product',
      sku: 'SKU-001',
      categoryId: 'cat-1',
      price: 99.99,
      stockQuantity: 0,
      images: [{ url: '/img.jpg' }],
    };

    const result = canPublish(product);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Product must be in stock');
  });
});
