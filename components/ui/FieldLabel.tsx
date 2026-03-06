'use client';

/**
 * FieldLabel Component
 *
 * Label with optional Info icon for tooltip help.
 * Designed to pair with form inputs.
 * Respects the showTooltipHelp setting from site settings.
 *
 * @module components/ui/FieldLabel
 */

import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { useSettings } from '@/lib/hooks/useSettings';

interface FieldLabelProps {
  htmlFor: string;
  label: string;
  required?: boolean;
  tooltip?: string;
  className?: string;
}

export function FieldLabel({
  htmlFor,
  label,
  required = false,
  tooltip,
  className = '',
}: FieldLabelProps) {
  const { settings } = useSettings();

  // Check if tooltips should be shown (default to true if setting not loaded)
  const showTooltips = settings?.showTooltipHelp ?? true;

  return (
    <label
      htmlFor={htmlFor}
      className={`flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5 ${className}`}
    >
      <span>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {tooltip && showTooltips && (
        <Tooltip content={tooltip} position="top">
          <button
            type="button"
            className="p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-[#004D8B] rounded transition-colors"
            aria-label={`Help for ${label}`}
            tabIndex={0}
          >
            <Info className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
    </label>
  );
}
