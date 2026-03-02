/**
 * FilterChips Component
 *
 * Horizontal chip UI for saved filters displayed above data tables.
 * Matches the spec: chips show name + × delete, active chip highlighted,
 * click to toggle filter, save new filters button when filters active.
 *
 * @module components/admin/FilterChips
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Bookmark, Plus } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type FilterPageType = 'products' | 'orders' | 'customers';

export interface SavedFilterChip {
  id: string;
  name: string;
  filter: Record<string, string | boolean | undefined>;
}

interface FilterChipsProps {
  pageType: FilterPageType;
  currentFilter: Record<string, string | boolean | undefined>;
  onApplyFilter: (filter: Record<string, string | boolean | undefined>) => void;
  onClearFilter: () => void;
  hasActiveFilter: boolean;
}

// ═══════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEYS: Record<FilterPageType, string> = {
  products: 'motico_saved_filters_products',
  orders: 'motico_saved_filters_orders',
  customers: 'motico_saved_filters_customers',
};

const MAX_FILTERS = 10;

// Default chips per page
const DEFAULT_CHIPS: Record<FilterPageType, SavedFilterChip[]> = {
  products: [
    { id: 'default_out_of_stock', name: 'Out of Stock', filter: { stockStatus: 'out_of_stock' } },
    { id: 'default_published', name: 'Published', filter: { isPublished: true } },
    { id: 'default_low_stock', name: 'Low Stock', filter: { stockStatus: 'low_stock' } },
  ],
  orders: [
    { id: 'default_pending', name: 'Pending', filter: { status: 'pending' } },
    { id: 'default_processing', name: 'Processing', filter: { status: 'processing' } },
  ],
  customers: [
    { id: 'default_active', name: 'Active', filter: { status: 'active' } },
  ],
};

function getStorageKey(pageType: FilterPageType): string {
  return STORAGE_KEYS[pageType];
}

function getSavedChips(pageType: FilterPageType): SavedFilterChip[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(getStorageKey(pageType));
    if (stored) {
      return JSON.parse(stored);
    }
    // Return default chips on first load
    return DEFAULT_CHIPS[pageType];
  } catch {
    return DEFAULT_CHIPS[pageType];
  }
}

function saveChips(pageType: FilterPageType, chips: SavedFilterChip[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(pageType), JSON.stringify(chips));
  } catch {
    // Ignore
  }
}

function generateId(): string {
  return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Check if two filters are equal (with null/undefined guards)
function filtersEqual(
  a: Record<string, string | boolean | undefined> | null | undefined,
  b: Record<string, string | boolean | undefined> | null | undefined
): boolean {
  // Guard against null/undefined
  if (!a || !b) return false;

  const keysA = Object.keys(a).filter(k => a[k] !== undefined && a[k] !== '');
  const keysB = Object.keys(b).filter(k => b[k] !== undefined && b[k] !== '');
  if (keysA.length !== keysB.length) return false;
  return keysA.every(k => a[k] === b[k]);
}

// ═══════════════════════════════════════════════════════════════
// SAVE FILTER POPOVER
// ═══════════════════════════════════════════════════════════════

interface SaveFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  error?: string;
}

function SaveFilterPopover({ isOpen, onClose, onSave, anchorRef, error }: SaveFilterPopoverProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        anchorRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, anchorRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
    >
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter Name
        </label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My custom filter"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] text-sm"
        />
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
        <div className="flex justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-3 py-1.5 text-sm text-white bg-[#004D8B] hover:bg-[#003d6f] rounded transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function FilterChips({
  pageType,
  currentFilter,
  onApplyFilter,
  onClearFilter,
  hasActiveFilter,
}: FilterChipsProps) {
  const [chips, setChips] = useState<SavedFilterChip[]>([]);
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const [showSavePopover, setShowSavePopover] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Load chips on mount
  useEffect(() => {
    setChips(getSavedChips(pageType));
  }, [pageType]);

  // Handle chip click
  const handleChipClick = useCallback((chip: SavedFilterChip) => {
    if (activeChipId === chip.id) {
      // Clicking active chip clears filter
      setActiveChipId(null);
      onClearFilter();
    } else {
      // Apply the chip's filter
      setActiveChipId(chip.id);
      onApplyFilter(chip.filter);
    }
  }, [activeChipId, onApplyFilter, onClearFilter]);

  // Handle chip delete
  const handleChipDelete = useCallback((e: React.MouseEvent, chipId: string) => {
    e.stopPropagation();
    const newChips = chips.filter(c => c.id !== chipId);
    setChips(newChips);
    saveChips(pageType, newChips);

    // If deleted chip was active, clear filter
    if (activeChipId === chipId) {
      setActiveChipId(null);
      onClearFilter();
    }
  }, [chips, pageType, activeChipId, onClearFilter]);

  // Handle save new filter
  const handleSaveFilter = useCallback((name: string) => {
    if (chips.length >= MAX_FILTERS) {
      setSaveError('Maximum of 10 saved filters reached. Delete one to add more.');
      return;
    }

    const newChip: SavedFilterChip = {
      id: generateId(),
      name,
      filter: { ...currentFilter },
    };

    const newChips = [...chips, newChip];
    setChips(newChips);
    saveChips(pageType, newChips);
    setShowSavePopover(false);
    setSaveError(undefined);
    setActiveChipId(newChip.id);
  }, [chips, currentFilter, pageType]);

  // Check if any chip matches current filter
  const matchingChip = chips.find(chip => filtersEqual(chip.filter, currentFilter));

  // Show save button if filters are active and no matching chip exists
  const showSaveButton = hasActiveFilter && !matchingChip;

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter Chips */}
        {chips.map((chip) => {
          const isActive = activeChipId === chip.id;
          return (
            <div
              key={chip.id}
              role="button"
              tabIndex={0}
              onClick={() => handleChipClick(chip)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChipClick(chip);
                }
              }}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer
                ${isActive
                  ? 'bg-[#004D8B] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                }
              `}
            >
              {chip.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChipDelete(e, chip.id);
                }}
                onKeyDown={(e) => {
                  // Prevent the parent div's onKeyDown from firing
                  e.stopPropagation();
                }}
                className={`
                  p-0.5 rounded-full transition-colors
                  ${isActive
                    ? 'hover:bg-white/20'
                    : 'hover:bg-gray-200'
                  }
                `}
                title="Delete filter"
                aria-label={`Remove ${chip.name} filter`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {/* Save This Filter Button */}
        {showSaveButton && (
          <div className="relative">
            <button
              ref={saveButtonRef}
              onClick={() => {
                setSaveError(undefined);
                setShowSavePopover(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#004D8B] hover:bg-blue-50 rounded-full border border-dashed border-[#004D8B] transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              Save this filter
            </button>
            <SaveFilterPopover
              isOpen={showSavePopover}
              onClose={() => {
                setShowSavePopover(false);
                setSaveError(undefined);
              }}
              onSave={handleSaveFilter}
              anchorRef={saveButtonRef}
              error={saveError}
            />
          </div>
        )}

        {/* Empty state hint */}
        {chips.length === 0 && !showSaveButton && (
          <span className="text-sm text-gray-400">
            Apply filters and save them for quick access
          </span>
        )}
      </div>
    </div>
  );
}
