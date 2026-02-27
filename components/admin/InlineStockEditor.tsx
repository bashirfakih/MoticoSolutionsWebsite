/**
 * InlineStockEditor Component
 *
 * Click-to-edit stock quantity with Enter to confirm, Escape to cancel.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { StockIndicator } from '@/components/admin/StockBadge';
import { Check, X, Loader2 } from 'lucide-react';

interface InlineStockEditorProps {
  productId: string;
  quantity: number;
  minLevel: number;
  onSave: (productId: string, newQuantity: number) => Promise<void>;
}

export default function InlineStockEditor({
  productId,
  quantity,
  minLevel,
  onSave,
}: InlineStockEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(quantity.toString());
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset value when quantity changes externally
  useEffect(() => {
    setValue(quantity.toString());
  }, [quantity]);

  const handleSave = async () => {
    const newQuantity = parseInt(value) || 0;
    if (newQuantity === quantity) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(productId, newQuantity);
      setIsEditing(false);
    } catch {
      // Error is handled by parent, reset value
      setValue(quantity.toString());
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(quantity.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isSaving}
          min="0"
          className="w-20 px-2 py-1 text-sm text-center border border-[#004D8B] rounded focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
        />
        {isSaving ? (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Save (Enter)"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
              title="Cancel (Escape)"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="group cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
      title="Click to edit"
    >
      <StockIndicator quantity={quantity} minLevel={minLevel} />
      <span className="ml-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Edit
      </span>
    </button>
  );
}
