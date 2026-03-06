'use client';

/**
 * Customer Favorites Page
 *
 * Displays customer's saved/favorite products.
 * Currently a placeholder - favorites feature to be implemented.
 */

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';

export default function CustomerFavoritesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
        <p className="text-gray-500 mt-1">
          Products you&apos;ve saved for later
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl border border-gray-200 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-500 mb-6">
            Browse our products and click the heart icon to save items you love.
            Your favorites will appear here for easy access.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors font-medium"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-2">
          Coming Soon: Save Your Favorites
        </h4>
        <p className="text-blue-700 text-sm">
          We&apos;re working on the favorites feature. Soon you&apos;ll be able to save products,
          create wishlists, and get notified about price changes on your favorite items.
        </p>
      </div>
    </div>
  );
}
