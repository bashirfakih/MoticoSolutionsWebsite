/**
 * Brand API Client Tests
 *
 * Tests for client-side brand API operations.
 */

import {
  getBrands,
  getActiveBrands,
  getBrandById,
  createBrand,
  updateBrand,
  toggleBrandStatus,
  deleteBrand,
  brandApiService,
} from '@/lib/api/brandApi';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('brandApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('getBrands', () => {
    it('fetches brands without params', async () => {
      const mockData = { data: [], total: 0, page: 1, limit: 10, totalPages: 0, hasMore: false };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await getBrands();

      expect(mockFetch).toHaveBeenCalledWith('/api/brands');
      expect(result).toEqual(mockData);
    });

    it('fetches brands with pagination params', async () => {
      const mockData = { data: [], total: 0, page: 2, limit: 20, totalPages: 0, hasMore: false };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await getBrands({ page: 2, limit: 20, sortBy: 'name', sortOrder: 'asc' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=20')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=name')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortOrder=asc')
      );
    });

    it('fetches brands with filter params', async () => {
      const mockData = { data: [], total: 0, page: 1, limit: 10, totalPages: 0, hasMore: false };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await getBrands(undefined, { search: 'test', active: true });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=test')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('active=true')
      );
    });

    it('throws error on fetch failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      await expect(getBrands()).rejects.toThrow('Server error');
    });

    it('throws default error message when no error provided', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      await expect(getBrands()).rejects.toThrow('Failed to fetch brands');
    });
  });

  describe('getActiveBrands', () => {
    it('fetches only active brands', async () => {
      const mockBrands = [
        { id: '1', name: 'Brand 1', isActive: true },
        { id: '2', name: 'Brand 2', isActive: true },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockBrands, total: 2 }),
      });

      const result = await getActiveBrands();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('active=true'));
      expect(result).toEqual(mockBrands);
    });
  });

  describe('getBrandById', () => {
    it('fetches brand by ID', async () => {
      const mockBrand = { id: '1', name: 'Test Brand' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockBrand),
      });

      const result = await getBrandById('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/brands/1');
      expect(result).toEqual(mockBrand);
    });

    it('returns null when brand not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await getBrandById('non-existent');

      expect(result).toBeNull();
    });

    it('throws error on other failures', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      await expect(getBrandById('1')).rejects.toThrow('Server error');
    });
  });

  describe('createBrand', () => {
    it('creates a new brand', async () => {
      const newBrand = { id: '1', name: 'New Brand', slug: 'new-brand' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(newBrand),
      });

      const result = await createBrand({ name: 'New Brand' });

      expect(mockFetch).toHaveBeenCalledWith('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Brand' }),
      });
      expect(result).toEqual(newBrand);
    });

    it('throws error on create failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Duplicate slug' }),
      });

      await expect(createBrand({ name: 'Test' })).rejects.toThrow('Duplicate slug');
    });
  });

  describe('updateBrand', () => {
    it('updates an existing brand', async () => {
      const updatedBrand = { id: '1', name: 'Updated Brand' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedBrand),
      });

      const result = await updateBrand('1', { name: 'Updated Brand' });

      expect(mockFetch).toHaveBeenCalledWith('/api/brands/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Brand' }),
      });
      expect(result).toEqual(updatedBrand);
    });

    it('throws error on update failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      });

      await expect(updateBrand('1', { name: 'Test' })).rejects.toThrow('Not found');
    });
  });

  describe('toggleBrandStatus', () => {
    it('toggles brand active to inactive', async () => {
      const brand = { id: '1', name: 'Brand', isActive: true };
      const updatedBrand = { ...brand, isActive: false };

      // First call: getBrandById
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(brand),
      });
      // Second call: updateBrand
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedBrand),
      });

      const result = await toggleBrandStatus('1');

      expect(result.isActive).toBe(false);
    });

    it('toggles brand inactive to active', async () => {
      const brand = { id: '1', name: 'Brand', isActive: false };
      const updatedBrand = { ...brand, isActive: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(brand),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedBrand),
      });

      const result = await toggleBrandStatus('1');

      expect(result.isActive).toBe(true);
    });

    it('throws error when brand not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(toggleBrandStatus('non-existent')).rejects.toThrow('Brand not found');
    });
  });

  describe('deleteBrand', () => {
    it('deletes a brand', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await deleteBrand('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/brands/1', { method: 'DELETE' });
      expect(result).toBe(true);
    });

    it('throws error on delete failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Has products' }),
      });

      await expect(deleteBrand('1')).rejects.toThrow('Has products');
    });
  });

  describe('brandApiService', () => {
    it('has all methods', () => {
      expect(brandApiService.getAll).toBeDefined();
      expect(brandApiService.getActive).toBeDefined();
      expect(brandApiService.getPaginated).toBeDefined();
      expect(brandApiService.getById).toBeDefined();
      expect(brandApiService.create).toBeDefined();
      expect(brandApiService.update).toBeDefined();
      expect(brandApiService.toggleStatus).toBeDefined();
      expect(brandApiService.delete).toBeDefined();
    });

    it('getAll returns data array', async () => {
      const mockBrands = [{ id: '1', name: 'Brand 1' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockBrands, total: 1 }),
      });

      const result = await brandApiService.getAll();

      expect(result).toEqual(mockBrands);
    });
  });
});
