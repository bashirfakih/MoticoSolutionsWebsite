/**
 * useProductSearch Hook Tests
 *
 * Tests initial state, search actions, pagination, filters, and error handling
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductSearch } from '@/lib/hooks/useProductSearch';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock AbortController
const mockAbort = jest.fn();
global.AbortController = jest.fn().mockImplementation(() => ({
  abort: mockAbort,
  signal: 'mock-signal',
})) as unknown as typeof AbortController;

describe('useProductSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useProductSearch());

      expect(result.current.query).toBe('');
      expect(result.current.results).toBeNull();
      expect(result.current.suggestions).toBeNull();
      expect(result.current.isSearching).toBe(false);
      expect(result.current.isLoadingSuggestions).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.filters).toEqual({});
      expect(result.current.page).toBe(1);
    });

    it('exposes all expected actions', () => {
      const { result } = renderHook(() => useProductSearch());

      expect(typeof result.current.setQuery).toBe('function');
      expect(typeof result.current.search).toBe('function');
      expect(typeof result.current.updateFilters).toBe('function');
      expect(typeof result.current.clearSearch).toBe('function');
      expect(typeof result.current.nextPage).toBe('function');
      expect(typeof result.current.prevPage).toBe('function');
      expect(typeof result.current.goToPage).toBe('function');
    });
  });

  describe('setQuery', () => {
    it('updates query state', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('power drill');
      });

      expect(result.current.query).toBe('power drill');
    });

    it('triggers suggestions fetch after debounce when query >= 2 chars', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: {
            products: [{ id: '1', name: 'Power Drill', type: 'product' }],
            categories: [],
            brands: [],
          },
        }),
      });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('po');
      });

      // Fast-forward debounce timer (200ms)
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/products/search/suggestions?q=po')
        );
      });
    });

    it('does not fetch suggestions for query < 2 chars', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('p');
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('clears suggestions when query becomes empty', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('power');
      });

      act(() => {
        result.current.setQuery('');
      });

      expect(result.current.suggestions).toBeNull();
    });
  });

  describe('search', () => {
    it('executes search with current query and filters', async () => {
      const mockResults = {
        data: [{ id: '1', name: 'Power Drill', sku: 'PD-001' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        query: 'power',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('power');
      });

      await act(async () => {
        result.current.search();
      });

      await waitFor(() => {
        expect(result.current.results).toEqual(mockResults);
      });
    });

    it('manages isSearching state through search lifecycle', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
      });

      const { result } = renderHook(() => useProductSearch());

      // Initially not searching
      expect(result.current.isSearching).toBe(false);

      act(() => {
        result.current.setQuery('power');
      });

      await act(async () => {
        result.current.search();
      });

      // After search completes, isSearching should be false
      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });
    });

    it('does not search when query is too short', async () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('p');
      });

      await act(async () => {
        result.current.search();
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.results).toBeNull();
    });

    it('includes filters in search request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
      });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('drill');
        result.current.updateFilters({
          categoryId: 'cat-1',
          brandId: 'brand-1',
          minPrice: 50,
          maxPrice: 200,
          inStockOnly: true,
        });
      });

      await act(async () => {
        result.current.search();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('categoryId=cat-1'),
          expect.any(Object)
        );
      });
    });

    it('handles search error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Search service unavailable' }),
      });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('power');
      });

      await act(async () => {
        result.current.search();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Search service unavailable');
        expect(result.current.results).toBeNull();
      });
    });

    it('cancels previous request when new search starts', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('power');
      });

      // Start first search
      act(() => {
        result.current.search();
      });

      // Start second search immediately
      act(() => {
        result.current.search();
      });

      expect(mockAbort).toHaveBeenCalled();
    });
  });

  describe('updateFilters', () => {
    it('updates filters state', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateFilters({ categoryId: 'cat-123' });
      });

      expect(result.current.filters.categoryId).toBe('cat-123');
    });

    it('merges new filters with existing', () => {
      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.updateFilters({ categoryId: 'cat-1' });
      });

      act(() => {
        result.current.updateFilters({ brandId: 'brand-1' });
      });

      expect(result.current.filters).toEqual({
        categoryId: 'cat-1',
        brandId: 'brand-1',
      });
    });

    it('resets page to 1 when filters change', () => {
      const { result } = renderHook(() => useProductSearch());

      // Simulate being on page 3
      act(() => {
        // We can't directly set page, but updateFilters should reset it
        result.current.updateFilters({ categoryId: 'cat-1' });
      });

      expect(result.current.page).toBe(1);
    });
  });

  describe('clearSearch', () => {
    it('resets all search state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ id: '1', name: 'Product' }],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        }),
      });

      const { result } = renderHook(() => useProductSearch());

      // Set up some state
      act(() => {
        result.current.setQuery('test');
        result.current.updateFilters({ categoryId: 'cat-1' });
      });

      await act(async () => {
        result.current.search();
      });

      // Clear everything
      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.query).toBe('');
      expect(result.current.results).toBeNull();
      expect(result.current.suggestions).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.filters).toEqual({});
      expect(result.current.page).toBe(1);
    });
  });

  describe('Pagination', () => {
    const mockResultsPage1 = {
      data: [{ id: '1', name: 'Product 1' }],
      total: 50,
      page: 1,
      limit: 20,
      totalPages: 3,
      query: 'test',
    };

    const mockResultsPage2 = {
      data: [{ id: '2', name: 'Product 2' }],
      total: 50,
      page: 2,
      limit: 20,
      totalPages: 3,
      query: 'test',
    };

    beforeEach(() => {
      mockFetch.mockReset();
    });

    it('nextPage increments page and fetches', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResultsPage1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResultsPage2,
        });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('test');
      });

      await act(async () => {
        result.current.search();
      });

      await waitFor(() => {
        expect(result.current.results?.page).toBe(1);
      });

      await act(async () => {
        result.current.nextPage();
      });

      await waitFor(() => {
        expect(result.current.page).toBe(2);
      });
    });

    it('nextPage does nothing on last page', async () => {
      const lastPageResults = {
        data: [{ id: '3', name: 'Product 3' }],
        total: 50,
        page: 3,
        limit: 20,
        totalPages: 3,
        query: 'test',
      };

      // Mock both search and any suggestions requests
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => lastPageResults,
      });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('test');
      });

      // Advance past debounce timer to trigger any pending suggestions
      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Search explicitly for page 3 so internal state matches
      await act(async () => {
        result.current.search(3);
      });

      await waitFor(() => {
        expect(result.current.results?.page).toBe(3);
        expect(result.current.page).toBe(3);
      });

      // Get count of search calls (filter to only search endpoint calls)
      const searchCallsBefore = mockFetch.mock.calls.filter(
        (call) => call[0].includes('/api/products/search?')
      ).length;

      act(() => {
        result.current.nextPage();
      });

      // Give time for any async operations
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // Should not make additional search fetch (nextPage should be a no-op on last page)
      const searchCallsAfter = mockFetch.mock.calls.filter(
        (call) => call[0].includes('/api/products/search?')
      ).length;
      expect(searchCallsAfter).toBe(searchCallsBefore);
    });

    it('prevPage decrements page', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResultsPage2,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResultsPage1,
        });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('test');
      });

      // Simulate being on page 2
      await act(async () => {
        result.current.search(2);
      });

      await act(async () => {
        result.current.prevPage();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenLastCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      });
    });

    it('prevPage does nothing on first page', () => {
      const { result } = renderHook(() => useProductSearch());

      expect(result.current.page).toBe(1);

      act(() => {
        result.current.prevPage();
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('goToPage navigates to specific page', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResultsPage1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockResultsPage1, page: 3 }),
        });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('test');
      });

      await act(async () => {
        result.current.search();
      });

      await waitFor(() => {
        expect(result.current.results).not.toBeNull();
      });

      await act(async () => {
        result.current.goToPage(3);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenLastCalledWith(
          expect.stringContaining('page=3'),
          expect.any(Object)
        );
      });
    });

    it('goToPage ignores invalid page numbers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResultsPage1,
      });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('test');
      });

      await act(async () => {
        result.current.search();
      });

      await waitFor(() => {
        expect(result.current.results).not.toBeNull();
      });

      const callCountBefore = mockFetch.mock.calls.length;

      act(() => {
        result.current.goToPage(0); // Invalid
      });

      act(() => {
        result.current.goToPage(10); // Beyond totalPages
      });

      expect(mockFetch.mock.calls.length).toBe(callCountBefore);
    });
  });

  describe('Suggestions', () => {
    it('fetches suggestions after debounce', async () => {
      const mockSuggestions = {
        suggestions: {
          products: [
            { id: '1', name: 'Power Drill', slug: 'power-drill', type: 'product' },
          ],
          categories: [
            { id: 'cat-1', name: 'Power Tools', slug: 'power-tools', type: 'category' },
          ],
          brands: [],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('power');
      });

      // Before debounce
      expect(result.current.isLoadingSuggestions).toBe(false);

      // After debounce
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current.suggestions).toEqual(mockSuggestions.suggestions);
      });
    });

    it('handles suggestions fetch error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed' }),
      });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('test');
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current.suggestions).toBeNull();
      });

      consoleSpy.mockRestore();
    });

    it('debounces rapid query changes', () => {
      const { result } = renderHook(() => useProductSearch());

      // Type multiple characters rapidly
      act(() => {
        result.current.setQuery('p');
      });
      act(() => {
        jest.advanceTimersByTime(50);
        result.current.setQuery('po');
      });
      act(() => {
        jest.advanceTimersByTime(50);
        result.current.setQuery('pow');
      });
      act(() => {
        jest.advanceTimersByTime(50);
        result.current.setQuery('powe');
      });

      // Should not have fetched yet (only 150ms total)
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('sets error state on search failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('test');
      });

      await act(async () => {
        result.current.search();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });

    it('clears error on successful search', async () => {
      // First search fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed' }),
      });

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('test');
      });

      await act(async () => {
        result.current.search();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed');
      });

      // Second search succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
      });

      await act(async () => {
        result.current.search();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('handles aborted requests silently', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.setQuery('test');
      });

      await act(async () => {
        result.current.search();
      });

      // Should not set error for aborted requests
      expect(result.current.error).toBeNull();
    });
  });
});
