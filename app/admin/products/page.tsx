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
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/admin/DataTable';
import StockBadge, { StockIndicator } from '@/components/admin/StockBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { productService } from '@/lib/data/productService';
import { brandService } from '@/lib/data/brandService';
import { categoryService } from '@/lib/data/categoryService';
import {
  Product,
  Brand,
  Category,
  ProductFilter,
  STOCK_STATUS,
} from '@/lib/data/types';
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
  Package,
  Download,
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
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Load data
  const loadData = useCallback(() => {
    setIsLoading(true);

    // Load products with pagination and filters
    const result = productService.getPaginated(
      { page, limit, sortBy, sortOrder },
      { ...filters, search: search || undefined }
    );

    setProducts(result.data);
    setTotal(result.total);

    // Load brands and categories for filters
    setBrands(brandService.getAll());
    setCategories(categoryService.getAll());

    setIsLoading(false);
  }, [page, limit, sortBy, sortOrder, filters, search]);

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

  // Toggle publish status
  const handleTogglePublish = async (product: Product) => {
    try {
      productService.togglePublished(product.id);
      toast.success(
        product.isPublished ? 'Product unpublished' : 'Product published'
      );
      loadData();
    } catch (error) {
      toast.error('Failed to update product');
    }
    setActionMenuId(null);
  };

  // Toggle featured status
  const handleToggleFeatured = async (product: Product) => {
    try {
      productService.toggleFeatured(product.id);
      toast.success(
        product.isFeatured ? 'Removed from featured' : 'Added to featured'
      );
      loadData();
    } catch (error) {
      toast.error('Failed to update product');
    }
    setActionMenuId(null);
  };

  // Duplicate product
  const handleDuplicate = async (product: Product) => {
    try {
      const newProduct = productService.duplicate(product.id);
      toast.success('Product duplicated');
      router.push(`/admin/products/${newProduct.id}`);
    } catch (error) {
      toast.error('Failed to duplicate product');
    }
    setActionMenuId(null);
  };

  // Delete product
  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      productService.delete(productToDelete.id);
      toast.success('Product deleted');
      loadData();
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productToDelete.id);
        return newSet;
      });
    } catch (error) {
      toast.error('Failed to delete product');
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const count = productService.deleteMany(Array.from(selectedIds));
      toast.success(`${count} products deleted`);
      setSelectedIds(new Set());
      loadData();
    } catch (error) {
      toast.error('Failed to delete products');
    }
    setIsBulkDeleting(false);
    setDeleteDialogOpen(false);
  };

  // Table columns
  const columns: Column<Product>[] = useMemo(() => [
    {
      key: 'image',
      header: '',
      width: '60px',
      render: (product) => (
        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-300" />
            </div>
          )}
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
      render: (product) => {
        const category = categories.find(c => c.id === product.categoryId);
        return (
          <span className="text-sm text-gray-600">
            {category?.name || '-'}
          </span>
        );
      },
    },
    {
      key: 'brandId',
      header: 'Brand',
      sortable: true,
      render: (product) => {
        const brand = brands.find(b => b.id === product.brandId);
        return (
          <span className="text-sm text-gray-600">
            {brand?.name || '-'}
          </span>
        );
      },
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
        <StockIndicator
          quantity={product.stockQuantity}
          minLevel={product.minStockLevel}
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
  ], [categories, brands, actionMenuId]);

  const totalPages = Math.ceil(total / limit);
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined) || search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">
            Manage your product catalog ({total} products)
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
            {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-white rounded transition-colors"
            >
              Clear selection
            </button>
            <button
              onClick={() => {
                setProductToDelete(null);
                setDeleteDialogOpen(true);
              }}
              className="px-3 py-1.5 text-sm text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 transition-colors"
            >
              Delete selected
            </button>
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
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
