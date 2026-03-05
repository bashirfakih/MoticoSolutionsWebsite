'use client';

/**
 * Shopping Cart Page
 *
 * Full cart view with item management and quote submission.
 * Allows customers to review collected products before submitting a quote request.
 *
 * @module app/cart/page
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Send,
  Package,
  AlertCircle,
} from 'lucide-react';
import { useCart, CartItem } from '@/lib/cart/CartContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useSettings } from '@/lib/hooks/useSettings';

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

function CartItemRow({
  item,
  itemKey,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  itemKey: string;
  onRemove: (key: string) => void;
  onUpdateQuantity: (key: string, qty: number) => void;
}) {
  const specs = [
    item.selectedDimension && `Dimension: ${item.selectedDimension}`,
    item.selectedSize && `Size: ${item.selectedSize}`,
    item.selectedGrit && `Grit: ${item.selectedGrit}`,
    item.selectedPackaging && `Packaging: ${item.selectedPackaging}`,
  ].filter(Boolean);

  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Image */}
      <div className="flex-shrink-0">
        <Link href={`/products/category/${item.categorySlug}/${item.slug}`}>
          <div className="w-24 h-24 sm:w-20 sm:h-20 relative rounded-lg overflow-hidden bg-gray-100">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.productName}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/category/${item.categorySlug}/${item.slug}`}
          className="font-semibold text-gray-900 hover:text-[#004D8B] transition-colors line-clamp-2"
        >
          {item.productName}
        </Link>
        <p className="text-sm text-gray-500 mt-0.5">SKU: {item.sku}</p>
        {specs.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">{specs.join(' | ')}</p>
        )}
        <p className="text-sm font-medium text-[#004D8B] mt-1">
          ${item.unitPrice.toFixed(2)} each
        </p>
      </div>

      {/* Quantity & Actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Line Total */}
        <p className="font-semibold text-gray-900">${lineTotal.toFixed(2)}</p>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(itemKey)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          aria-label="Remove item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <ShoppingCart className="w-12 h-12 text-gray-300" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Your cart is empty
      </h2>
      <p className="text-gray-500 mb-6">
        Browse our products and add items to your cart to request a quote.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#004D8B] text-white font-medium rounded-lg hover:bg-[#003a6a] transition-colors"
      >
        <Package className="w-5 h-5" />
        Browse Products
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CartPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, isLoading: cartLoading, removeItem, updateQuantity, clearCart, getSubtotal, getItemKey } = useCart();
  const toast = useToast();
  const { settings } = useSettings();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerMessage, setCustomerMessage] = useState('');

  // Redirect guests to login
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Login Required
            </h2>
            <p className="text-gray-500 mb-6">
              Please log in to view your cart and submit quote requests.
            </p>
            <Link
              href="/login?redirect=/cart"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#004D8B] text-white font-medium rounded-lg hover:bg-[#003a6a] transition-colors"
            >
              Login to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const userDiscount = user?.discountPercentage ? Number(user.discountPercentage) : 0;

  // TVA calculation from settings
  const taxRate = settings?.taxRate ? Number(settings.taxRate) : 0;
  const taxLabel = settings?.taxLabel || 'TVA';
  const discountedSubtotal = userDiscount > 0 ? subtotal * (1 - userDiscount / 100) : subtotal;
  const tvaAmount = taxRate > 0 ? discountedSubtotal * (taxRate / 100) : 0;
  const total = discountedSubtotal + tvaAmount;

  // Handle quote submission
  const handleSubmitQuote = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName: user?.name || '',
          customerEmail: user?.email || '',
          customerPhone: user?.phone || null,
          company: user?.company || null,
          customerMessage: customerMessage || null,
          subtotal: subtotal,
          tax: tvaAmount,
          taxLabel: taxRate > 0 ? taxLabel : null,
          discount: userDiscount > 0 ? subtotal * (userDiscount / 100) : 0,
          total: total,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            selectedDimension: item.selectedDimension || null,
            selectedSize: item.selectedSize || null,
            selectedGrit: item.selectedGrit || null,
            selectedPackaging: item.selectedPackaging || null,
            discountApplied: userDiscount || null,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit quote');
      }

      const quote = await response.json();

      // Clear cart on success
      clearCart();
      toast.success('Quote request submitted successfully!');

      // Redirect to quote details
      router.push(`/account/quotes/${quote.id}`);
    } catch (error) {
      console.error('Quote submission error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit quote'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#004D8B] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-[#004D8B]" />
            Shopping Cart
            {items.length > 0 && (
              <span className="text-lg font-normal text-gray-500">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h1>
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const itemKey = getItemKey(item);
                return (
                  <CartItemRow
                    key={itemKey}
                    item={item}
                    itemKey={itemKey}
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                  />
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Quote Summary
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-2 pb-4 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {userDiscount > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Your Discount ({userDiscount}%)</span>
                        <span className="text-green-600 font-medium">
                          -${(subtotal * userDiscount / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">After Discount</span>
                        <span className="font-medium">${discountedSubtotal.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {taxRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{taxLabel} ({taxRate}%)</span>
                      <span className="font-medium">${tvaAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-[#004D8B]">${total.toFixed(2)}</span>
                </div>

                {/* Note */}
                <p className="text-xs text-gray-500 mt-3 mb-4">
                  Final pricing will be confirmed in your quote. Shipping costs
                  will be calculated based on your location.
                </p>

                {/* Message */}
                <div className="mb-4">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Add a note (optional)
                  </label>
                  <textarea
                    id="message"
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    placeholder="Special requirements, delivery instructions..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]/20 focus:border-[#004D8B] resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitQuote}
                  disabled={isSubmitting || items.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#004D8B] text-white font-semibold rounded-lg hover:bg-[#003a6a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Quote Request
                    </>
                  )}
                </button>

                {/* Clear Cart */}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your cart?')) {
                      clearCart();
                      toast.info('Cart cleared');
                    }
                  }}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
