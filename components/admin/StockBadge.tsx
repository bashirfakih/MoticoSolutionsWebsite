'use client';

/**
 * StockBadge Component
 *
 * Visual indicator for product stock status.
 *
 * @module components/admin/StockBadge
 */

import React from 'react';
import { Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { StockStatus, STOCK_STATUS } from '@/lib/data/types';

interface StockBadgeProps {
  status: StockStatus;
  quantity?: number;
  showQuantity?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const config = {
  [STOCK_STATUS.IN_STOCK]: {
    label: 'In Stock',
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: CheckCircle,
  },
  [STOCK_STATUS.LOW_STOCK]: {
    label: 'Low Stock',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: AlertTriangle,
  },
  [STOCK_STATUS.OUT_OF_STOCK]: {
    label: 'Out of Stock',
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: XCircle,
  },
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export default function StockBadge({
  status,
  quantity,
  showQuantity = false,
  size = 'md',
}: StockBadgeProps) {
  const { label, bg, text, icon: Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${bg} ${text} ${sizes[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {showQuantity && quantity !== undefined ? (
        <span>{quantity} {label}</span>
      ) : (
        <span>{label}</span>
      )}
    </span>
  );
}

/**
 * Compact stock indicator (just the quantity with color)
 */
export function StockIndicator({
  quantity,
  minLevel = 10,
}: {
  quantity: number;
  minLevel?: number;
}) {
  let colorClass = 'text-green-600';
  let bgClass = 'bg-green-50';

  if (quantity <= 0) {
    colorClass = 'text-red-600';
    bgClass = 'bg-red-50';
  } else if (quantity <= minLevel) {
    colorClass = 'text-yellow-600';
    bgClass = 'bg-yellow-50';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium ${colorClass} ${bgClass}`}
    >
      <Package className="w-3.5 h-3.5" />
      {quantity}
    </span>
  );
}
