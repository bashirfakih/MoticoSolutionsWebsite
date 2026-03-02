/**
 * SavedFilters Component
 *
 * Dropdown component for managing saved filter presets on admin tables.
 * Allows saving current filters, applying saved filters, and managing presets.
 *
 * @module components/admin/SavedFilters
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Filter,
  ChevronDown,
  Plus,
  Pin,
  Trash2,
  Check,
  X,
  Bookmark,
  Star,
} from 'lucide-react';
import {
  SavedFilter,
  FilterPageType,
  FilterCondition,
} from '@/lib/filters/types';
import {
  getSavedFilters,
  createSavedFilter,
  deleteSavedFilter,
  toggleFilterPin,
  getFilterPresets,
  createFromPreset,
  FilterPreset,
} from '@/lib/filters/savedFilterService';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface SavedFiltersProps {
  pageType: FilterPageType;
  currentFilters: FilterCondition[];
  onApplyFilter: (filter: SavedFilter) => void;
  onClearFilters: () => void;
}

// ═══════════════════════════════════════════════════════════════
// SAVE FILTER MODAL
// ═══════════════════════════════════════════════════════════════

interface SaveFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  pageType: FilterPageType;
}

function SaveFilterModal({ isOpen, onClose, onSave, pageType }: SaveFilterModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">Save Filter</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`e.g., "My ${pageType} filter"`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D8B] focus:border-[#004D8B] outline-none"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#004D8B] hover:bg-[#003d6f] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function SavedFilters({
  pageType,
  currentFilters,
  onApplyFilter,
  onClearFilters,
}: SavedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load filters
  const loadFilters = useCallback(() => {
    setSavedFilters(getSavedFilters(pageType));
    setPresets(getFilterPresets(pageType));
  }, [pageType]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  // Listen for filter updates
  useEffect(() => {
    const handleUpdate = () => loadFilters();
    window.addEventListener('saved-filters-update', handleUpdate);
    return () => window.removeEventListener('saved-filters-update', handleUpdate);
  }, [loadFilters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle save current filter
  const handleSaveFilter = (name: string) => {
    const filter = createSavedFilter(name, pageType, currentFilters);
    setActiveFilterId(filter.id);
    loadFilters();
  };

  // Handle apply filter
  const handleApplyFilter = (filter: SavedFilter) => {
    setActiveFilterId(filter.id);
    onApplyFilter(filter);
    setIsOpen(false);
  };

  // Handle apply preset
  const handleApplyPreset = (preset: FilterPreset) => {
    // Create a temporary filter object to apply
    const tempFilter: SavedFilter = {
      id: 'preset_temp',
      name: preset.name,
      pageType: preset.pageType,
      conditions: preset.conditions,
      sortField: preset.sortField,
      sortDirection: preset.sortDirection,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };
    setActiveFilterId(null);
    onApplyFilter(tempFilter);
    setIsOpen(false);
  };

  // Handle delete filter
  const handleDeleteFilter = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSavedFilter(id);
    if (activeFilterId === id) {
      setActiveFilterId(null);
    }
    loadFilters();
  };

  // Handle toggle pin
  const handleTogglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFilterPin(id);
    loadFilters();
  };

  // Handle save preset
  const handleSavePreset = (e: React.MouseEvent, preset: FilterPreset) => {
    e.stopPropagation();
    createFromPreset(preset);
    loadFilters();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setActiveFilterId(null);
    onClearFilters();
    setIsOpen(false);
  };

  const hasActiveFilters = currentFilters.length > 0;
  const hasFiltersOrPresets = savedFilters.length > 0 || presets.length > 0;

  return (
    <>
      <div className="relative">
        {/* Trigger Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            activeFilterId || hasActiveFilters
              ? 'border-[#004D8B] text-[#004D8B] bg-blue-50'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span className="hidden sm:inline">Saved Filters</span>
          {savedFilters.length > 0 && (
            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {savedFilters.length}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Saved Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-1 text-xs text-[#004D8B] hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  Save Current
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[350px] overflow-y-auto">
              {/* Saved Filters */}
              {savedFilters.length > 0 && (
                <div className="p-2">
                  <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Your Filters
                  </p>
                  <div className="space-y-1">
                    {savedFilters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => handleApplyFilter(filter)}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors group ${
                          activeFilterId === filter.id
                            ? 'bg-[#004D8B]/10 text-[#004D8B]'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {filter.isPinned ? (
                          <Pin className="w-4 h-4 text-yellow-500 shrink-0" />
                        ) : (
                          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span className="flex-1 text-sm truncate">{filter.name}</span>
                        <span className="text-xs text-gray-400">
                          {filter.conditions.length} rule{filter.conditions.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleTogglePin(e, filter.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title={filter.isPinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className={`w-3 h-3 ${filter.isPinned ? 'text-yellow-500' : 'text-gray-400'}`} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteFilter(e, filter.id)}
                            className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Presets */}
              {presets.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Quick Presets
                  </p>
                  <div className="space-y-1">
                    {presets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handleApplyPreset(preset)}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors group"
                      >
                        <Star className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="flex-1 text-sm truncate">{preset.name}</span>
                        <button
                          onClick={(e) => handleSavePreset(e, preset)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded text-gray-400 hover:text-[#004D8B] transition-all"
                          title="Save as your filter"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!hasFiltersOrPresets && (
                <div className="py-8 text-center">
                  <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No saved filters</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Apply filters to the table and save them here
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {(hasActiveFilters || activeFilterId) && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleClearFilters}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-1"
                >
                  Clear active filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Modal */}
      <SaveFilterModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveFilter}
        pageType={pageType}
      />
    </>
  );
}
