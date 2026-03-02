/**
 * Search Bar Component
 *
 * Full-text search with autocomplete suggestions
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Package, Tag, Building2 } from 'lucide-react';
import { useProductSearch, SearchSuggestion } from '@/lib/hooks/useProductSearch';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  placeholder = 'Search products...',
  className = '',
  showSuggestions = true,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    suggestions,
    isLoadingSuggestions,
    search,
  } = useProductSearch();

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      }
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (type: string, slug: string) => {
    setIsOpen(false);
    switch (type) {
      case 'product':
        router.push(`/products/${slug}`);
        break;
      case 'category':
        router.push(`/products?category=${slug}`);
        break;
      case 'brand':
        router.push(`/products?brand=${slug}`);
        break;
    }
  };

  const hasSuggestions = suggestions && (
    suggestions.products.length > 0 ||
    suggestions.categories.length > 0 ||
    suggestions.brands.length > 0
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {isLoadingSuggestions ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />
            </div>
          ) : hasSuggestions ? (
            <div className="py-2">
              {/* Products */}
              {suggestions!.products.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Products
                  </div>
                  {suggestions!.products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick('product', product.slug)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{product.category}</span>
                          {product.price && (
                            <>
                              <span>·</span>
                              <span className="text-blue-600 dark:text-blue-400">
                                ${product.price.toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Categories */}
              {suggestions!.categories.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Categories
                  </div>
                  {suggestions!.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleSuggestionClick('category', category.slug)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                    >
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                        <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {category.productCount} products
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Brands */}
              {suggestions!.brands.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Brands
                  </div>
                  {suggestions!.brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleSuggestionClick('brand', brand.slug)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                    >
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {brand.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {brand.productCount} products
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* View all results */}
              <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2 px-3 pb-2">
                <button
                  onClick={() => handleSearch()}
                  className="w-full py-2 text-center text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                >
                  View all results for &quot;{query}&quot;
                </button>
              </div>
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
