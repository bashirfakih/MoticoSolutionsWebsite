'use client';

/**
 * Global Search Component
 *
 * Searches across products, orders, and customers with inline suggestions.
 *
 * @module components/admin/GlobalSearch
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Package,
  ShoppingCart,
  Users,
  X,
  Loader2,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'product' | 'order' | 'customer';
  title: string;
  subtitle: string;
  href: string;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function with debounce
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Search across multiple endpoints in parallel
      const [productsRes, ordersRes, customersRes] = await Promise.allSettled([
        fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`),
        fetch(`/api/orders?search=${encodeURIComponent(searchQuery)}&limit=5`),
        fetch(`/api/customers?search=${encodeURIComponent(searchQuery)}&limit=5`),
      ]);

      const searchResults: SearchResult[] = [];

      // Process products
      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        const data = await productsRes.value.json();
        const products = data.data || [];
        products.forEach((product: { id: string; name: string; sku: string }) => {
          searchResults.push({
            id: product.id,
            type: 'product',
            title: product.name,
            subtitle: product.sku,
            href: `/admin/products/${product.id}`,
          });
        });
      }

      // Process orders
      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        const data = await ordersRes.value.json();
        const orders = data.data || [];
        orders.forEach((order: { id: string; orderNumber: string; customerName: string; status: string }) => {
          searchResults.push({
            id: order.id,
            type: 'order',
            title: order.orderNumber,
            subtitle: `${order.customerName} - ${order.status}`,
            href: `/admin/orders/${order.id}`,
          });
        });
      }

      // Process customers
      if (customersRes.status === 'fulfilled' && customersRes.value.ok) {
        const data = await customersRes.value.json();
        const customers = data.data || [];
        customers.forEach((customer: { id: string; name: string; email: string; company?: string }) => {
          searchResults.push({
            id: customer.id,
            type: 'customer',
            title: customer.name,
            subtitle: customer.company || customer.email,
            href: `/admin/customers?id=${customer.id}`,
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          router.push(results[selectedIndex].href);
          setIsOpen(false);
          setQuery('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const getIcon = (type: 'product' | 'order' | 'customer') => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-green-500" />;
      case 'customer':
        return <Users className="w-4 h-4 text-purple-500" />;
    }
  };

  const getTypeLabel = (type: 'product' | 'order' | 'customer') => {
    switch (type) {
      case 'product':
        return 'Product';
      case 'order':
        return 'Order';
      case 'customer':
        return 'Customer';
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search products, orders, customers..."
          className="w-64 lg:w-80 pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.href}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-50 ${
                    selectedIndex === index ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {result.subtitle}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {getTypeLabel(result.type)}
                  </span>
                </Link>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
