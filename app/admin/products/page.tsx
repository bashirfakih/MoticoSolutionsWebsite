'use client';

/**
 * Admin Products List Page
 *
 * Displays all products with filtering, sorting, and bulk actions.
 *
 * @module app/admin/products/page
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductImage from '@/components/ui/ProductImage';
import DataTable, { Column } from '@/components/admin/DataTable';
import InlineStockEditor from '@/components/admin/InlineStockEditor';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { STOCK_STATUS, StockStatus } from '@/lib/data/types';
import { pluralize } from '@/lib/utils/formatting';

// Types for API responses
interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number | null;
  stockQuantity: number;
  stockStatus: StockStatus;
  minStockLevel: number;
  isPublished: boolean;
  isFeatured: boolean;
  categoryId: string;
  brandId: string;
  category?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string };
  images: Array<{ url: string; alt: string }>;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface ProductFilter {
  search?: string;
  categoryId?: string;
  brandId?: string;
  stockStatus?: string;
  isPublished?: boolean;
}
import {
  Plus,
  Search,
  Filter,
  X,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Star,
  StarOff,
  RefreshCw,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AdminProductsPage() {
  const router = useRouter();
  const toast = useToast();

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Filter state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ProductFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  // Sort state
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Action state
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isBulkActioning, setIsBulkActioning] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      if (search) params.set('search', search);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.brandId) params.set('brandId', filters.brandId);
      if (filters.stockStatus) params.set('stockStatus', filters.stockStatus);
      if (filters.isPublished !== undefined) params.set('published', String(filters.isPublished));

      // Load products from API
      const productRes = await fetch(`/api/products?${params}`);
      if (productRes.ok) {
        const data = await productRes.json();
        setProducts(data.data || []);
        setTotal(data.total || 0);
      }

      // Load brands and categories from API
      const [brandsRes, categoriesRes] = await Promise.all([
        fetch('/api/brands'),
        fetch('/api/categories'),
      ]);

      if (brandsRes.ok) {
        const data = await brandsRes.json();
        setBrands(data.data || []);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, filters, search, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Handle sort
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof ProductFilter, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
    setPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearch('');
    setPage(1);
  };

  // Update stock quantity (inline editing)
  const handleUpdateStock = async (productId: string, newQuantity: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, stockQuantity: newQuantity } : p
      ));

      toast.success('Stock updated');
    } catch {
      toast.error('Failed to update stock');
      throw new Error('Failed to update stock');
    }
  };

  // Bulk publish
  const handleBulkPublish = async () => {
    setShowBulkMenu(false);
    setIsBulkActioning(true);
    try {
      const updatePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublished: true }),
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;

      // Update local state
      setProducts(prev => prev.map(p =>
        selectedIds.has(p.id) ? { ...p, isPublished: true } : p
      ));

      toast.success(`${pluralize(successCount, 'product')} published`);
      setSelectedIds(new Set());
    } catch {
      toast.error('Failed to publish products');
    }
    setIsBulkActioning(false);
  };

  // Bulk unpublish
  const handleBulkUnpublish = async () => {
    setShowBulkMenu(false);
    setIsBulkActioning(true);
    try {
      const updatePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublished: false }),
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;

      // Update local state
      setProducts(prev => prev.map(p =>
        selectedIds.has(p.id) ? { ...p, isPublished: false } : p
      ));

      toast.success(`${pluralize(successCount, 'product')} unpublished`);
      setSelectedIds(new Set());
    } catch {
      toast.error('Failed to unpublish products');
    }
    setIsBulkActioning(false);
  };

  // Toggle publish status
  const handleTogglePublish = async (product: Product) => {
    setActionMenuId(null);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !product.isPublished }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      // Update local state immediately for instant feedback
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, isPublished: !p.isPublished } : p
      ));

      toast.success(
        product.isPublished ? 'Product unpublished' : 'Product published'
      );
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (product: Product) => {
    setActionMenuId(null);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !product.isFeatured }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      // Update local state immediately for instant feedback
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p
      ));

      toast.success(
        product.isFeatured ? 'Removed from featured' : 'Added to featured'
      );
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  // Duplicate product
  const handleDuplicate = async (product: Product) => {
    setActionMenuId(null);
    try {
      // Fetch full product data
      const getRes = await fetch(`/api/products/${product.id}`);
      if (!getRes.ok) throw new Error('Failed to fetch product');

      const original = await getRes.json();

      // Generate unique SKU and slug
      const timestamp = Date.now().toString().slice(-4);
      const newSku = `${original.sku}-COPY-${timestamp}`;
      const newSlug = `${original.slug}-copy-${timestamp}`;

      // Create duplicate
      const createRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...original,
          id: undefined,
          sku: newSku,
          slug: newSlug,
          name: `${original.name} (Copy)`,
          isPublished: false,
          createdAt: undefined,
          updatedAt: undefined,
          publishedAt: undefined,
        }),
      });

      if (!createRes.ok) {
        const error = await createRes.json();
        throw new Error(error.error || 'Failed to duplicate product');
      }

      const newProduct = await createRes.json();
      toast.success('Product duplicated');
      router.push(`/admin/products/${newProduct.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to duplicate product');
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }

      toast.success('Product deleted');
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setTotal(prev => prev - 1);
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productToDelete.id);
        return newSet;
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    setIsBulkActioning(true);
    try {
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/products/${id}`, { method: 'DELETE' })
      );

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;

      toast.success(`${pluralize(successCount, 'product')} deleted`);
      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
      setTotal(prev => prev - successCount);
      setSelectedIds(new Set());
    } catch {
      toast.error('Failed to delete products');
    }
    setIsBulkActioning(false);
    setDeleteDialogOpen(false);
  };

  // Table columns
  const columns: Column<Product>[] = useMemo(() => [
    {
      key: 'image',
      header: '',
      width: '60px',
      render: (product) => (
        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden relative">
          <ProductImage
            src={product.images[0]?.url || ''}
            alt={product.name}
            width={40}
            height={40}
          />
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (product) => (
        <div className="min-w-[200px]">
          <Link
            href={`/admin/products/${product.id}`}
            className="font-medium text-gray-900 hover:text-[#004D8B]"
          >
            {product.name}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">{product.sku}</p>
        </div>
      ),
    },
    {
      key: 'categoryId',
      header: 'Category',
      sortable: true,
      render: (product) => (
        <span className="text-sm text-gray-600">
          {product.category?.name || '-'}
        </span>
      ),
    },
    {
      key: 'brandId',
      header: 'Brand',
      sortable: true,
      render: (product) => (
        <span className="text-sm text-gray-600">
          {product.brand?.name || '-'}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      align: 'right',
      render: (product) => (
        <span className="text-sm font-medium">
          {product.price ? `$${product.price.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      key: 'stockQuantity',
      header: 'Stock',
      sortable: true,
      align: 'center',
      render: (product) => (
        <InlineStockEditor
          productId={product.id}
          quantity={product.stockQuantity}
          minLevel={product.minStockLevel}
          onSave={handleUpdateStock}
        />
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      sortable: true,
      align: 'center',
      render: (product) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            product.isPublished
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {product.isPublished ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '50px',
      render: (product) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActionMenuId(actionMenuId === product.id ? null : product.id);
            }}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          {/* Action Menu */}
          {actionMenuId === product.id && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setActionMenuId(null)}
              />
              <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleTogglePublish(product)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {product.isPublished ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Publish
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleToggleFeatured(product)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {product.isFeatured ? (
                    <>
                      <StarOff className="w-4 h-4" />
                      Remove Featured
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      Set Featured
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDuplicate(product)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => {
                    setProductToDelete(product);
                    setDeleteDialogOpen(true);
                    setActionMenuId(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ], [actionMenuId]);

  const totalPages = Math.ceil(total / limit);
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined) || search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">
            Manage your product catalog ({pluralize(total, 'product')})
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white font-medium rounded-lg hover:bg-[#003a6a] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-[#004D8B] text-[#004D8B] bg-blue-50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-[#004D8B] rounded-full" />
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={loadData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                >
                  <option value="">All Categories</option>
                  {categories
                    .filter(c => c.parentId === null)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  value={filters.brandId || ''}
                  onChange={(e) => handleFilterChange('brandId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Status
                </label>
                <select
                  value={filters.stockStatus || ''}
                  onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                >
                  <option value="">All Status</option>
                  <option value={STOCK_STATUS.IN_STOCK}>In Stock</option>
                  <option value={STOCK_STATUS.LOW_STOCK}>Low Stock</option>
                  <option value={STOCK_STATUS.OUT_OF_STOCK}>Out of Stock</option>
                </select>
              </div>

              {/* Published Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.isPublished === undefined ? '' : String(filters.isPublished)}
                  onChange={(e) =>
                    handleFilterChange(
                      'isPublished',
                      e.target.value === '' ? undefined : e.target.value === 'true'
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                >
                  <option value="">All</option>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-4">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-sm text-[#004D8B] hover:underline"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-blue-800">
            {pluralize(selectedIds.size, 'product')} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-white rounded transition-colors"
            >
              Clear selection
            </button>

            {/* Bulk Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                disabled={isBulkActioning}
                className="px-3 py-1.5 text-sm text-[#004D8B] bg-white border border-[#004D8B] rounded hover:bg-blue-50 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
              >
                {isBulkActioning ? 'Processing...' : 'Bulk Actions'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showBulkMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowBulkMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <button
                      onClick={handleBulkPublish}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                      Publish
                    </button>
                    <button
                      onClick={handleBulkUnpublish}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <EyeOff className="w-4 h-4" />
                      Unpublish
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => {
                        setShowBulkMenu(false);
                        setProductToDelete(null);
                        setDeleteDialogOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={products}
        columns={columns}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="No products found"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(product) => router.push(`/admin/products/${product.id}`)}
        pagination={{
          page,
          limit,
          total,
          totalPages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={productToDelete ? handleDelete : handleBulkDelete}
        title={productToDelete ? 'Delete Product' : `Delete ${selectedIds.size} Products`}
        message={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedIds.size} selected products? This action cannot be undone.`
        }
        confirmText="Delete"
        variant="danger"
        isLoading={isBulkActioning}
      />
    </div>
  );
}
