'use client';

/**
 * Admin New Product Page
 *
 * Create a new product with all fields.
 *
 * @module app/admin/products/new/page
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';
import { useToast } from '@/components/ui/Toast';
import {
  ProductImage,
  ProductSpecification,
  Brand,
  Category,
  CURRENCY,
  generateSlug,
} from '@/lib/data/types';
import {
  ArrowLeft,
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

interface FormData {
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

export default function AdminNewProductPage() {
  const router = useRouter();
  const toast = useToast();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'pricing' | 'inventory' | 'seo'>('general');

  // Load brands and categories
  useEffect(() => {
    async function loadData() {
      setIsLoadingData(true);
      setLoadError(null);
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          fetch('/api/brands?limit=100'),
          fetch('/api/categories?limit=500'),
        ]);

        if (!brandsRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to load required data');
        }

        const brandsData = await brandsRes.json();
        const categoriesData = await categoriesRes.json();

        setBrands(brandsData.data || []);
        setCategories(categoriesData.data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoadError('Failed to load brands and categories. Please try again.');
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'name') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  }, [errors]);

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSpecChange = (index: number, field: keyof ProductSpecification, value: string) => {
    setFormData(prev => {
      const specs = [...prev.specifications];
      specs[index] = { ...specs[index], [field]: value };
      return { ...prev, specifications: specs };
    });
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        { key: '', label: '', value: '', unit: '', group: '' },
      ],
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleImagesChange = (images: ProductImage[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.brandId) newErrors.brandId = 'Brand is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (publish = false) => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsSaving(true);

    try {
      const productData = {
        sku: formData.sku,
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        shortDescription: formData.shortDescription || null,
        description: formData.description,
        features: formData.features.filter(f => f.trim()),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || null,
        brandId: formData.brandId,
        images: formData.images,
        specifications: formData.specifications.filter(s => s.key && s.value),
        price: formData.price ? parseFloat(formData.price) : null,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        currency: formData.currency,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 10,
        trackInventory: formData.trackInventory,
        allowBackorder: formData.allowBackorder,
        isPublished: publish,
        isFeatured: formData.isFeatured,
        isNew: formData.isNew,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      const product = await response.json();
      toast.success('Product created');
      router.push(`/admin/products/${product.id}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setIsSaving(false);
    }
  };

  const subcategories = categories.filter(c => c.parentId === formData.categoryId);
  const rootCategories = categories.filter(c => c.parentId === null);

  // Show loading state while fetching brands and categories
  if (isLoadingData) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#004D8B] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#004D8B] mb-4" />
            <p className="text-gray-600">Loading product form...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if loading failed
  if (loadError) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#004D8B] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load</h2>
            <p className="text-gray-600 mb-4">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#004D8B] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {[
            { id: 'general', label: 'General', icon: Package },
            { id: 'media', label: 'Media', icon: ImageIcon },
            { id: 'pricing', label: 'Pricing', icon: DollarSign },
            { id: 'inventory', label: 'Inventory', icon: Layers },
            { id: 'seo', label: 'SEO', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-[#004D8B] text-[#004D8B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}
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
                {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
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
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                {errors.brandId && <p className="mt-1 text-sm text-red-600">{errors.brandId}</p>}
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
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="auto-generated-from-name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
              <p className="mt-1 text-xs text-gray-500">URL: /products/{formData.slug || 'product-slug'}</p>
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
                  {rootCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
              </div>

              {subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <select
                    name="subcategoryId"
                    value={formData.subcategoryId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                  >
                    <option value="">Select subcategory (optional)</option>
                    {subcategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
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
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
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
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => handleSpecChange(index, 'label', e.target.value)}
                      placeholder="Label"
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] text-sm"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] text-sm"
                    />
                    <input
                      type="text"
                      value={spec.unit || ''}
                      onChange={(e) => handleSpecChange(index, 'unit', e.target.value)}
                      placeholder="Unit"
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] text-sm"
                    />
                    <input
                      type="text"
                      value={spec.group || ''}
                      onChange={(e) => handleSpecChange(index, 'group', e.target.value)}
                      placeholder="Group"
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] text-sm"
                    />
                    <button
                      onClick={() => removeSpecification(index)}
                      className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
            <ImageUploader
              images={formData.images}
              onChange={handleImagesChange}
              maxImages={10}
            />
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Compare at Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
                <p className="mt-1 text-xs text-gray-500">Original price for showing discounts</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  name="minStockLevel"
                  value={formData.minStockLevel}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                />
                <p className="mt-1 text-xs text-gray-500">Alert when stock falls below this level</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle || ''}
                onChange={handleChange}
                placeholder={formData.name || 'Product name'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
              <p className={`mt-1 text-xs ${(formData.metaTitle?.length || 0) > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.metaTitle?.length || 0}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription || ''}
                onChange={handleChange}
                rows={3}
                placeholder={formData.shortDescription || 'Product description for search engines'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
              <p className={`mt-1 text-xs ${(formData.metaDescription?.length || 0) > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.metaDescription?.length || 0}/160 characters
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Search Preview</h4>
              <div className="bg-white rounded border border-gray-200 p-3">
                <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {formData.metaTitle || formData.name || 'Product Title'} | Motico Solutions
                </p>
                <p className="text-green-700 text-sm">
                  moticosolutions.com/products/{formData.slug || 'product-slug'}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {formData.metaDescription || formData.shortDescription || 'Product description will appear here...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
