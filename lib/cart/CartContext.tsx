'use client';

/**
 * Cart Context for Motico Solutions
 *
 * Manages shopping cart state with localStorage persistence.
 * Allows customers to collect multiple products before submitting a quote.
 *
 * @module lib/cart/CartContext
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  slug: string;
  categorySlug: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  selectedDimension?: string;
  selectedSize?: string;
  selectedGrit?: string;
  selectedPackaging?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  isLoading: boolean;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemKey: (item: CartItem | Omit<CartItem, 'quantity'>) => string;
  isInCart: (productId: string, specs?: SpecsKey) => boolean;
}

interface SpecsKey {
  selectedDimension?: string;
  selectedSize?: string;
  selectedGrit?: string;
  selectedPackaging?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const CART_STORAGE_KEY = 'motico_cart';
const MAX_CART_ITEMS = 50;
const MAX_QUANTITY = 9999;

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════

const CartContext = createContext<CartContextType | null>(null);

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a unique key for a cart item based on product ID and selected specs
 */
function generateItemKey(item: Omit<CartItem, 'quantity'> | CartItem): string {
  const specs = [
    item.selectedDimension || '',
    item.selectedSize || '',
    item.selectedGrit || '',
    item.selectedPackaging || '',
  ].join('|');
  return `${item.productId}-${specs}`;
}

/**
 * Check if two items have the same specs
 */
function specsMatch(item: CartItem, specs?: SpecsKey): boolean {
  if (!specs) return true;
  return (
    (item.selectedDimension || '') === (specs.selectedDimension || '') &&
    (item.selectedSize || '') === (specs.selectedSize || '') &&
    (item.selectedGrit || '') === (specs.selectedGrit || '') &&
    (item.selectedPackaging || '') === (specs.selectedPackaging || '')
  );
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Calculate item count
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoading]);

  // Clear cart on logout
  useEffect(() => {
    if (!isAuthenticated && !isLoading && items.length > 0) {
      setItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [isAuthenticated, isLoading, items.length]);

  // Get item key
  const getItemKey = useCallback((item: CartItem | Omit<CartItem, 'quantity'>) => {
    return generateItemKey(item);
  }, []);

  // Add item to cart
  const addItem = useCallback(
    (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
      const quantity = Math.min(newItem.quantity || 1, MAX_QUANTITY);
      const itemKey = generateItemKey(newItem);

      setItems((prevItems) => {
        // Check if item already exists
        const existingIndex = prevItems.findIndex(
          (item) => generateItemKey(item) === itemKey
        );

        if (existingIndex >= 0) {
          // Update quantity of existing item
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: Math.min(
              updated[existingIndex].quantity + quantity,
              MAX_QUANTITY
            ),
          };
          return updated;
        }

        // Check max items limit
        if (prevItems.length >= MAX_CART_ITEMS) {
          console.warn('Cart is full. Maximum items:', MAX_CART_ITEMS);
          return prevItems;
        }

        // Add new item
        return [
          ...prevItems,
          {
            productId: newItem.productId,
            productName: newItem.productName,
            sku: newItem.sku,
            slug: newItem.slug,
            categorySlug: newItem.categorySlug,
            image: newItem.image,
            quantity,
            unitPrice: newItem.unitPrice,
            selectedDimension: newItem.selectedDimension,
            selectedSize: newItem.selectedSize,
            selectedGrit: newItem.selectedGrit,
            selectedPackaging: newItem.selectedPackaging,
          },
        ];
      });
    },
    []
  );

  // Remove item from cart
  const removeItem = useCallback((itemKey: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => generateItemKey(item) !== itemKey)
    );
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemKey: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      setItems((prevItems) =>
        prevItems.filter((item) => generateItemKey(item) !== itemKey)
      );
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        generateItemKey(item) === itemKey
          ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
          : item
      )
    );
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  // Calculate subtotal
  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [items]);

  // Check if product is in cart
  const isInCart = useCallback(
    (productId: string, specs?: SpecsKey) => {
      return items.some(
        (item) => item.productId === productId && specsMatch(item, specs)
      );
    },
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      isLoading,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getSubtotal,
      getItemKey,
      isInCart,
    }),
    [
      items,
      itemCount,
      isLoading,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getSubtotal,
      getItemKey,
      isInCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
