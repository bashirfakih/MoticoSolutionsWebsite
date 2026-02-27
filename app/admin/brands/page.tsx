'use client';

/**
 * Admin Brands Management Page
 *
 * Manage product brands.
 *
 * @module app/admin/brands/page
 */

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { brandService } from '@/lib/data/brandService';
import { Brand, BrandInput, generateSlug } from '@/lib/data/types';
import DataTable, { Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Globe,
  Building,
  ExternalLink,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// BRAND FORM MODAL
// ═══════════════════════════════════════════════════════════════

interface BrandFormProps {
  brand?: Brand | null;
  onSave: (input: BrandInput, id?: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function BrandForm({ brand, onSave, onCancel, isSaving }: BrandFormProps) {
  const [name, setName] = useState(brand?.name || '');
  const [slug, setSlug] = useState(brand?.slug || '');
  const [description, setDescription] = useState(brand?.description || '');
  const [website, setWebsite] = useState(brand?.website || '');
  const [countryOfOrigin, setCountryOfOrigin] = useState(brand?.countryOfOrigin || '');
  const [isActive, setIsActive] = useState(brand?.isActive ?? true);

  const isEditing = !!brand;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input: BrandInput = {
      name,
      slug: slug || generateSlug(name),
      description: description || null,
      website: website || null,
      countryOfOrigin: countryOfOrigin || null,
      isActive,
    };

    onSave(input, brand?.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Brand' : 'Add Brand'}
            </h3>
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug || !isEditing) {
                    setSlug(generateSlug(e.target.value));
                  }
                }}
                placeholder="e.g. Hermes Abrasives"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brand description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country of Origin
              </label>
              <input
                type="text"
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                placeholder="e.g. Germany"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#004D8B] focus:ring-[#004D8B]"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="flex-1 px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isEditing ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function AdminBrandsPage() {
  const toast = useToast();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  // Load brands
  const loadBrands = useCallback(() => {
    setIsLoading(true);
    setBrands(brandService.getAll());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // Handle add new
  const handleAdd = () => {
    setEditingBrand(null);
    setShowForm(true);
  };

  // Handle edit
  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setShowForm(true);
  };

  // Handle save
  const handleSave = async (input: BrandInput, id?: string) => {
    setIsSaving(true);
    try {
      if (id) {
        brandService.update(id, input);
        toast.success('Brand updated');
      } else {
        brandService.create(input);
        toast.success('Brand created');
      }
      loadBrands();
      setShowForm(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save brand');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (!brandToDelete) return;

    try {
      brandService.delete(brandToDelete.id);
      toast.success('Brand deleted');
      loadBrands();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete brand');
    }
    setBrandToDelete(null);
  };

  // Toggle status
  const handleToggleStatus = (brand: Brand) => {
    try {
      brandService.toggleStatus(brand.id);
      toast.success(brand.isActive ? 'Brand deactivated' : 'Brand activated');
      loadBrands();
    } catch (error) {
      toast.error('Failed to update brand');
    }
  };

  // Table columns
  const columns: Column<Brand>[] = [
    {
      key: 'logo',
      header: '',
      width: '60px',
      render: (brand) => (
        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
          {brand.logo ? (
            <Image
              src={brand.logo}
              alt={brand.name}
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          ) : (
            <Building className="w-5 h-5 text-gray-300" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Brand',
      sortable: true,
      render: (brand) => (
        <div>
          <p className="font-medium text-gray-900">{brand.name}</p>
          <p className="text-xs text-gray-500">/{brand.slug}</p>
        </div>
      ),
    },
    {
      key: 'countryOfOrigin',
      header: 'Country',
      sortable: true,
      render: (brand) => (
        <span className="text-sm text-gray-600">
          {brand.countryOfOrigin || '-'}
        </span>
      ),
    },
    {
      key: 'website',
      header: 'Website',
      render: (brand) =>
        brand.website ? (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#004D8B] hover:underline"
          >
            <Globe className="w-3.5 h-3.5" />
            Visit
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        ),
    },
    {
      key: 'isActive',
      header: 'Status',
      align: 'center',
      render: (brand) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(brand);
          }}
          className={`
            px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors
            ${brand.isActive
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          {brand.isActive ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      align: 'right',
      render: (brand) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(brand);
            }}
            className="p-1.5 text-gray-500 hover:text-[#004D8B] hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBrandToDelete(brand);
            }}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500 mt-1">
            Manage product brands ({brands.length} total)
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white font-medium rounded-lg hover:bg-[#003a6a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {/* Brands Table */}
      <DataTable
        data={brands}
        columns={columns}
        keyExtractor={(b) => b.id}
        isLoading={isLoading}
        emptyMessage="No brands yet"
        onRowClick={handleEdit}
      />

      {/* Brand Form Modal */}
      {showForm && (
        <BrandForm
          brand={editingBrand}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingBrand(null);
          }}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!brandToDelete}
        onClose={() => setBrandToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete "${brandToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
