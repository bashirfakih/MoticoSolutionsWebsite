'use client';

/**
 * Admin Categories Management Page
 *
 * Manage product categories with hierarchy support.
 *
 * @module app/admin/categories/page
 */

import React, { useState, useEffect, useCallback } from 'react';
import { categoryService } from '@/lib/data/categoryService';
import { Category, CategoryInput, generateSlug } from '@/lib/data/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Save,
  X,
  Loader2,
  GripVertical,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// CATEGORY TREE ITEM
// ═══════════════════════════════════════════════════════════════

interface CategoryTreeItemProps {
  category: Category;
  subcategories: Category[];
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddSubcategory: (parentId: string) => void;
}

function CategoryTreeItem({
  category,
  subcategories,
  level,
  onEdit,
  onDelete,
  onAddSubcategory,
}: CategoryTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = subcategories.length > 0;

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group
          ${level > 0 ? 'ml-8' : ''}
        `}
      >
        {/* Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
            hasChildren ? '' : 'invisible'
          }`}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* Folder Icon */}
        {hasChildren && isExpanded ? (
          <FolderOpen className="w-5 h-5 text-yellow-500" />
        ) : (
          <Folder className="w-5 h-5 text-gray-400" />
        )}

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{category.name}</span>
            {!category.isActive && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                Inactive
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            /{category.slug} • {category.productCount || 0} products
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {level === 0 && (
            <button
              onClick={() => onAddSubcategory(category.id)}
              className="p-1.5 text-gray-500 hover:text-[#004D8B] hover:bg-blue-50 rounded transition-colors"
              title="Add subcategory"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-gray-500 hover:text-[#004D8B] hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subcategories */}
      {hasChildren && isExpanded && (
        <div className="border-l-2 border-gray-100 ml-5">
          {subcategories.map(sub => (
            <CategoryTreeItem
              key={sub.id}
              category={sub}
              subcategories={[]} // No deeper nesting for now
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubcategory={onAddSubcategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY FORM MODAL
// ═══════════════════════════════════════════════════════════════

interface CategoryFormProps {
  category?: Category | null;
  parentId?: string | null;
  onSave: (input: CategoryInput, id?: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function CategoryForm({ category, parentId, onSave, onCancel, isSaving }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  const isEditing = !!category;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input: CategoryInput = {
      name,
      slug: slug || generateSlug(name),
      description: description || null,
      parentId: parentId || category?.parentId || null,
      isActive,
    };

    onSave(input, category?.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Category' : parentId ? 'Add Subcategory' : 'Add Category'}
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
                Name <span className="text-red-500">*</span>
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
                placeholder="Category name"
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
                placeholder="Category description (optional)"
                rows={3}
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

export default function AdminCategoriesPage() {
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Load categories
  const loadCategories = useCallback(() => {
    setIsLoading(true);
    setCategories(categoryService.getAll());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Get root categories and their children
  const rootCategories = categories.filter(c => c.parentId === null);
  const getSubcategories = (parentId: string) =>
    categories.filter(c => c.parentId === parentId);

  // Handle add new
  const handleAdd = (parentId: string | null = null) => {
    setEditingCategory(null);
    setParentIdForNew(parentId);
    setShowForm(true);
  };

  // Handle edit
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setParentIdForNew(null);
    setShowForm(true);
  };

  // Handle save
  const handleSave = async (input: CategoryInput, id?: string) => {
    setIsSaving(true);
    try {
      if (id) {
        categoryService.update(id, input);
        toast.success('Category updated');
      } else {
        categoryService.create(input);
        toast.success('Category created');
      }
      loadCategories();
      setShowForm(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (!categoryToDelete) return;

    try {
      categoryService.delete(categoryToDelete.id);
      toast.success('Category deleted');
      loadCategories();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    }
    setCategoryToDelete(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">
            Manage product categories ({categories.length} total)
          </p>
        </div>
        <button
          onClick={() => handleAdd()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white font-medium rounded-lg hover:bg-[#003a6a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
          </div>
        ) : rootCategories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No categories yet</p>
            <button
              onClick={() => handleAdd()}
              className="mt-3 text-[#004D8B] hover:underline"
            >
              Create your first category
            </button>
          </div>
        ) : (
          <div className="p-2">
            {rootCategories.map(category => (
              <CategoryTreeItem
                key={category.id}
                category={category}
                subcategories={getSubcategories(category.id)}
                level={0}
                onEdit={handleEdit}
                onDelete={setCategoryToDelete}
                onAddSubcategory={(parentId) => handleAdd(parentId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          parentId={parentIdForNew}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
            setParentIdForNew(null);
          }}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
