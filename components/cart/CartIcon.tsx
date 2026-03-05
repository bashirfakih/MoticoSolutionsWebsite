'use client';

/**
 * Cart Icon Component
 *
 * Header icon with item count badge for shopping cart.
 * Only visible to authenticated users.
 *
 * @module components/cart/CartIcon
 */

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart/CartContext';
import { useAuth } from '@/lib/auth/AuthContext';

export function CartIcon() {
  const { itemCount, isLoading } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Don't show cart icon for guests or while loading
  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="relative p-2 text-gray-600 hover:text-[#004D8B] transition-colors"
      aria-label={`Shopping cart${itemCount > 0 ? ` with ${itemCount} items` : ''}`}
    >
      <ShoppingCart className="w-6 h-6" />
      {!isLoading && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold text-white bg-[#bb0c15] rounded-full">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
