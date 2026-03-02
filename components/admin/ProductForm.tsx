'use client';

/**
 * Product Form Component
 *
 * Reusable form for creating and editing products with SKU, name, slug,
 * price, stock, category/brand selectors, image uploader, and publish toggle.
 *
 * @module components/admin/ProductForm
 */

import React, { useState, useCallback } from 'react';
import {
  ProductImage,
  ProductSpecification,
  Brand,
  Category,
  CURRENCY,
  STOCK_STATUS,
  StockStatus,
  generateSlug,
} from '@/lib/data/types';
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Package,
  DollarSign,
  Layers,
  FileText,
  ImageIcon,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ProductFormData {
  sku: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  features: string[];
  categoryId: string;
  subcategoryId: string;
  brandId: string;
  images: ProductImage[];
  specifications: ProductSpecification[];
  price: string;
  compareAtPrice: string;
  currency: string;
  stockQuantity: string;
  minStockLevel: string;
  trackInventory: boolean;
  allowBackorder: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  isNew: boolean;
  metaTitle: string;
  metaDescription: string;
}

export interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  brands: Brand[];
  categories: Category[];
  onSubmit: (data: ProductFormData, publish: boolean) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════

export function isValidSKU(sku: string): boolean {
  if (!sku || sku.trim().length === 0) return false;
  if (sku.trim().length < 2) return false;
  if (sku.includes(' ')) return false;
  return true;
}

export function isValidName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  if (name.trim().length < 2) return false;
  if (name.trim().length > 200) return false;
  return true;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function isValidPrice(price: number | null | undefined): boolean {
  if (price === null || price === undefined) return true;
  if (isNaN(price)) return false;
  if (price < 0) return false;
  return true;
}

export function isValidQuantity(qty: number): boolean {
  if (!Number.isInteger(qty)) return false;
  if (qty < 0) return false;
  return true;
}

export function calculateStockStatus(
  quantity: number,
  lowStockThreshold: number = 10
): StockStatus {
  if (quantity <= 0) return STOCK_STATUS.OUT_OF_STOCK;
  if (quantity <= lowStockThreshold) return STOCK_STATUS.LOW_STOCK;
  return STOCK_STATUS.IN_STOCK;
}

export function createSlug(name: string): string {
  return generateSlug(name);
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════

export const defaultFormData: ProductFormData = {
  sku: '',
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  features: [''],
  categoryId: '',
  subcategoryId: '',
  brandId: '',
  images: [],
  specifications: [],
  price: '',
  compareAtPrice: '',
  currency: CURRENCY.USD,
  stockQuantity: '0',
  minStockLevel: '10',
  trackInventory: true,
  allowBackorder: false,
  isPublished: false,
  isFeatured: false,
  isNew: true,
  metaTitle: '',
  metaDescription: '',
};

// ═══════════════════════════════════════════════════════════════
// FORM VALIDATION
// ═══════════════════════════════════════════════════════════════

export interface ValidationErrors {
  sku?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  price?: string;
  stockQuantity?: string;
}

export function validateProductForm(data: ProductFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.sku.trim()) {
    errors.sku = 'SKU is required';
  } else if (!isValidSKU(data.sku)) {
    errors.sku = 'SKU must be at least 2 characters and contain no spaces';
  }

  if (!data.name.trim()) {
    errors.name = 'Name is required';
  } else if (!isValidName(data.name)) {
    errors.name = 'Name must be between 2 and 200 characters';
  }

  if (!data.description.trim()) {
    errors.description = 'Description is required';
  }

  if (!data.categoryId) {
    errors.categoryId = 'Category is required';
  }

  if (!data.brandId) {
    errors.brandId = 'Brand is required';
  }

  if (data.price && isNaN(parseFloat(data.price))) {
    errors.price = 'Price must be a valid number';
  }

  if (data.stockQuantity && isNaN(parseInt(data.stockQuantity))) {
    errors.stockQuantity = 'Stock quantity must be a valid number';
  }

  return errors;
}

export function canPublish(data: ProductFormData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name) errors.push('Name is required');
  if (!data.sku) errors.push('SKU is required');
  if (!data.categoryId) errors.push('Category is required');
  if (!data.price || parseFloat(data.price) <= 0) {
    errors.push('Valid price is required');
  }
  if (!data.stockQuantity || parseInt(data.stockQuantity) <= 0) {
    errors.push('Product must be in stock');
  }
  if (!data.images || data.images.length === 0) {
    errors.push('At least one image is required');
  }

  return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

type TabId = 'general' | 'media' | 'pricing' | 'inventory' | 'seo';

export default function ProductForm({
  initialData,
  brands,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save',
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      const newValue =
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value;

      setFormData((prev) => ({ ...prev, [name]: newValue }));

      if (errors[name as keyof ValidationErrors]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }

      if (name === 'name') {
        setFormData((prev) => ({ ...prev, slug: createSlug(value) }));
      }
    },
    [errors]
  );

  const handleFeatureChange = (index: number, value: string) => {
    setFormData((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSpecChange = (
    index: number,
    field: keyof ProductSpecification,
    value: string
  ) => {
    setFormData((prev) => {
      const specs = [...prev.specifications];
      specs[index] = { ...specs[index], [field]: value };
      return { ...prev, specifications: specs };
    });
  };

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        { key: '', label: '', value: '', unit: '', group: '' },
      ],
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (publish: boolean = false) => {
    const validationErrors = validateProductForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await onSubmit(formData, publish);
  };

  const subcategories = categories.filter(
    (c) => c.parentId === formData.categoryId
  );
  const rootCategories = categories.filter((c) => c.parentId === null);

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Package },
    { id: 'media' as const, label: 'Media', icon: ImageIcon },
    { id: 'pricing' as const, label: 'Pricing', icon: DollarSign },
    { id: 'inventory' as const, label: 'Inventory', icon: Layers },
    { id: 'seo' as const, label: 'SEO', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors disabled:opacity-50"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-[#004D8B] text-[#004D8B]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. HRM-RB346-100x915"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] ${
                    errors.sku ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] ${
                    errors.brandId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors.brandId && (
                  <p className="mt-1 text-sm text-red-600">{errors.brandId}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Hermes RB 346 MX Abrasive Belt"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="auto-generated-from-name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL: /products/{formData.slug || 'product-slug'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] ${
                    errors.categoryId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {rootCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.categoryId}
                  </p>
                )}
              </div>

              {subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory
                  </label>
                  <select
                    name="subcategoryId"
                    value={formData.subcategoryId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                  >
                    <option value="">Select subcategory (optional)</option>
                    {subcategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Brief product summary for listings"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Full product description..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="inline-flex items-center gap-2 text-sm text-[#004D8B] hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>
            </div>

            {/* Specifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specifications
              </label>
              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) =>
                        handleSpecChange(index, 'label', e.target.value)
                      }
                      placeholder="Label"
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] text-sm"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) =>
                        handleSpecChange(index, 'value', e.target.value)
                      }
                      placeholder="Value"
                      className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] text-sm"
                    />
                    <input
                      type="text"
                      value={spec.unit || ''}
                      onChange={(e) =>
                        handleSpecChange(index, 'unit', e.target.value)
                      }
                      placeholder="Unit"
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] text-sm"
                    />
                    <input
                      type="text"
                      value={spec.group || ''}
                      onChange={(e) =>
                        handleSpecChange(index, 'group', e.target.value)
                      }
                      placeholder="Group"
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSpecification}
                  className="inline-flex items-center gap-2 text-sm text-[#004D8B] hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add Specification
                </button>
              </div>
            </div>

            {/* Status Toggles */}
            <div className="flex flex-wrap gap-6 pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#004D8B] focus:ring-[#004D8B]"
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#004D8B] focus:ring-[#004D8B]"
                />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#004D8B] focus:ring-[#004D8B]"
                />
                <span className="text-sm text-gray-700">New Arrival</span>
              </label>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Product Images
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload product images. The first image will be used as the primary image.
            </p>
            {/* ImageUploader would go here - using placeholder for now */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {formData.images.length} images uploaded
              </p>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare at Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    name="compareAtPrice"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Original price for showing discounts
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                >
                  <option value={CURRENCY.USD}>USD ($)</option>
                  <option value={CURRENCY.EUR}>EUR (€)</option>
                  <option value={CURRENCY.LBP}>LBP (ل.ل)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="minStockLevel"
                  value={formData.minStockLevel}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Alert when stock falls below this level
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="trackInventory"
                  checked={formData.trackInventory}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#004D8B] focus:ring-[#004D8B]"
                />
                <span className="text-sm text-gray-700">Track inventory</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="allowBackorder"
                  checked={formData.allowBackorder}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#004D8B] focus:ring-[#004D8B]"
                />
                <span className="text-sm text-gray-700">Allow backorders</span>
              </label>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle || ''}
                onChange={handleChange}
                placeholder="Enter meta title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
              <p className="mt-1 text-xs text-gray-500">
                The site name will be appended automatically — do not include it here.
              </p>
              <p
                className={`mt-1 text-xs ${
                  (formData.metaTitle?.length || 0) > 60
                    ? 'text-red-500'
                    : 'text-gray-500'
                }`}
              >
                {formData.metaTitle?.length || 0}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Enter meta description for search engines..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
              <p
                className={`mt-1 text-xs ${
                  (formData.metaDescription?.length || 0) > 160
                    ? 'text-red-500'
                    : 'text-gray-500'
                }`}
              >
                {formData.metaDescription?.length || 0}/160 characters
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Search Preview
              </h4>
              <div className="bg-white rounded border border-gray-200 p-3">
                <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {formData.metaTitle || formData.name || 'Product Title'}
                  {!(formData.metaTitle || '').toLowerCase().includes('motico') && ' | Motico Solutions'}
                </p>
                <p className="text-green-700 text-sm">
                  moticosolutions.com/products/
                  {formData.slug || 'product-slug'}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {formData.metaDescription ||
                    formData.shortDescription ||
                    'Product description will appear here...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
