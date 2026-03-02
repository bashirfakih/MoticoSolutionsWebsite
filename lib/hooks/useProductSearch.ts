/**
 * Product Search Hook
 *
 * Provides full-text product search with debouncing and suggestions
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SearchProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  price: number | null;
  compareAtPrice: number | null;
  stockStatus: string;
  stockQuantity: number;
  isPublished: boolean;
  isFeatured: boolean;
  isNew: boolean;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  primaryImage: { url: string; alt: string } | null;
  relevanceScore: number;
}

interface SearchFilters {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}

interface SearchResult {
  data: SearchProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  query: string;
}

interface SearchSuggestion {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number | null;
    image: string | null;
    category: string;
    type: 'product';
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
    type: 'category';
  }>;
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
    type: 'brand';
  }>;
}

export function useProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Search function
  const search = useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters = {},
    searchPage: number = 1
  ) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults(null);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        page: searchPage.toString(),
        limit: '20',
      });

      if (searchFilters.categoryId) params.set('categoryId', searchFilters.categoryId);
      if (searchFilters.brandId) params.set('brandId', searchFilters.brandId);
      if (searchFilters.minPrice !== undefined) params.set('minPrice', searchFilters.minPrice.toString());
      if (searchFilters.maxPrice !== undefined) params.set('maxPrice', searchFilters.maxPrice.toString());
      if (searchFilters.inStockOnly) params.set('inStockOnly', 'true');

      const response = await fetch(`/api/products/search?${params}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Search failed');
      }

      const data: SearchResult = await response.json();
      setResults(data);
      setPage(searchPage);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Get suggestions with debounce
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions(null);
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      const response = await fetch(`/api/products/search/suggestions?q=${encodeURIComponent(searchQuery.trim())}`);

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error('Suggestions error:', err);
      setSuggestions(null);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        getSuggestions(query);
      }, 200);
    } else {
      setSuggestions(null);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, getSuggestions]);

  // Execute search
  const executeSearch = useCallback((newPage?: number) => {
    search(query, filters, newPage ?? page);
  }, [query, filters, page, search]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setSuggestions(null);
    setError(null);
    setFilters({});
    setPage(1);
  }, []);

  // Next page
  const nextPage = useCallback(() => {
    if (results && page < results.totalPages) {
      search(query, filters, page + 1);
    }
  }, [results, page, query, filters, search]);

  // Previous page
  const prevPage = useCallback(() => {
    if (page > 1) {
      search(query, filters, page - 1);
    }
  }, [page, query, filters, search]);

  // Go to specific page
  const goToPage = useCallback((newPage: number) => {
    if (results && newPage >= 1 && newPage <= results.totalPages) {
      search(query, filters, newPage);
    }
  }, [results, query, filters, search]);

  return {
    // State
    query,
    results,
    suggestions,
    isSearching,
    isLoadingSuggestions,
    error,
    filters,
    page,

    // Actions
    setQuery,
    search: executeSearch,
    updateFilters,
    clearSearch,
    nextPage,
    prevPage,
    goToPage,
  };
}

export type { SearchProduct, SearchFilters, SearchResult, SearchSuggestion };
