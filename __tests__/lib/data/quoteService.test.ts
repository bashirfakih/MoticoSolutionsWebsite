/**
 * Quote Service Unit Tests
 *
 * Tests for CRUD operations and utility functions.
 *
 * @module __tests__/lib/data/quoteService.test
 */

import { quoteService } from '@/lib/data/quoteService';
import { QUOTE_STATUS } from '@/lib/data/types';

// Mock localStorage
const localStorageMock: Record<string, string> = {};
const mockLocalStorage = {
  getItem: jest.fn((key: string) => localStorageMock[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    localStorageMock[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageMock[key];
  }),
  clear: jest.fn(() => {
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('quoteService', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all quotes sorted by createdAt descending', () => {
      const quotes = quoteService.getAll();
      expect(quotes).toBeDefined();
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBeGreaterThan(0);

      // Check sorting (newest first)
      for (let i = 1; i < quotes.length; i++) {
        expect(new Date(quotes[i].createdAt).getTime())
          .toBeLessThanOrEqual(new Date(quotes[i - 1].createdAt).getTime());
      }
    });
  });

  describe('getById', () => {
    it('should return quote when found', () => {
      const quotes = quoteService.getAll();
      const firstQuote = quotes[0];
      const result = quoteService.getById(firstQuote.id);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(firstQuote.id);
      expect(result?.quoteNumber).toBe(firstQuote.quoteNumber);
    });

    it('should return null when not found', () => {
      const result = quoteService.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getByNumber', () => {
    it('should return quote when found', () => {
      const quotes = quoteService.getAll();
      const firstQuote = quotes[0];
      const result = quoteService.getByNumber(firstQuote.quoteNumber);
      expect(result).not.toBeNull();
      expect(result?.quoteNumber).toBe(firstQuote.quoteNumber);
    });

    it('should return null when not found', () => {
      const result = quoteService.getByNumber('QUO-NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('getByCustomer', () => {
    it('should return quotes for a specific customer', () => {
      const quotes = quoteService.getAll();
      const quoteWithCustomer = quotes.find(q => q.customerId);
      if (quoteWithCustomer && quoteWithCustomer.customerId) {
        const customerQuotes = quoteService.getByCustomer(quoteWithCustomer.customerId);

        expect(Array.isArray(customerQuotes)).toBe(true);
        customerQuotes.forEach(quote => {
          expect(quote.customerId).toBe(quoteWithCustomer.customerId);
        });
      }
    });
  });

  describe('getByStatus', () => {
    it('should return quotes with specific status', () => {
      const pendingQuotes = quoteService.getByStatus(QUOTE_STATUS.PENDING);
      expect(Array.isArray(pendingQuotes)).toBe(true);
      pendingQuotes.forEach(quote => {
        expect(quote.status).toBe(QUOTE_STATUS.PENDING);
      });
    });
  });

  describe('getPending', () => {
    it('should return only pending quotes', () => {
      const pendingQuotes = quoteService.getPending();
      pendingQuotes.forEach(quote => {
        expect(quote.status).toBe(QUOTE_STATUS.PENDING);
      });
    });
  });

  describe('getRecent', () => {
    it('should return limited number of recent quotes', () => {
      const recentQuotes = quoteService.getRecent(3);
      expect(recentQuotes.length).toBeLessThanOrEqual(3);
    });
  });

  describe('search', () => {
    it('should find quotes by quote number', () => {
      const quotes = quoteService.getAll();
      const quoteNumber = quotes[0].quoteNumber;
      const results = quoteService.search(quoteNumber);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(q => q.quoteNumber === quoteNumber)).toBe(true);
    });

    it('should find quotes by customer name', () => {
      const quotes = quoteService.getAll();
      const customerName = quotes[0].customerName.split(' ')[0]; // First name
      const results = quoteService.search(customerName);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = quoteService.search('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new quote', () => {
      const newQuote = quoteService.create({
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        items: [
          {
            productName: 'Test Product',
            sku: 'TEST-001',
            quantity: 10,
            requestedPrice: null,
          },
        ],
      });

      expect(newQuote).toBeDefined();
      expect(newQuote.id).toBeDefined();
      expect(newQuote.quoteNumber).toMatch(/^QUO-\d{4}-\d{3}$/);
      expect(newQuote.customerName).toBe('Test Customer');
      expect(newQuote.status).toBe(QUOTE_STATUS.PENDING);
      expect(newQuote.createdAt).toBeDefined();

      // Verify it was saved
      const retrieved = quoteService.getById(newQuote.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.customerName).toBe('Test Customer');
    });
  });

  describe('update', () => {
    it('should update an existing quote', () => {
      const quotes = quoteService.getAll();
      const quoteToUpdate = quotes[0];

      const updated = quoteService.update(quoteToUpdate.id, {
        internalNotes: 'Updated notes',
      });

      expect(updated.internalNotes).toBe('Updated notes');
      expect(updated.id).toBe(quoteToUpdate.id);
      expect(updated.updatedAt).not.toBe(quoteToUpdate.updatedAt);
    });

    it('should throw error for non-existent quote', () => {
      expect(() => {
        quoteService.update('non-existent-id', { internalNotes: 'Test' });
      }).toThrow(/not found/);
    });
  });

  describe('updateStatus', () => {
    it('should update quote status', () => {
      const quotes = quoteService.getAll();
      const pendingQuote = quotes.find(q => q.status === QUOTE_STATUS.PENDING);

      if (pendingQuote) {
        const updated = quoteService.updateStatus(pendingQuote.id, QUOTE_STATUS.REVIEWED);
        expect(updated.status).toBe(QUOTE_STATUS.REVIEWED);
        expect(updated.reviewedAt).toBeDefined();
      }
    });

    it('should set sentAt when status is sent', () => {
      const newQuote = quoteService.create({
        customerName: 'Test',
        customerEmail: 'test@test.com',
        items: [],
      });

      const sent = quoteService.updateStatus(newQuote.id, QUOTE_STATUS.SENT);
      expect(sent.sentAt).toBeDefined();
    });
  });

  describe('respond', () => {
    it('should respond to a quote with pricing', () => {
      const newQuote = quoteService.create({
        customerName: 'Response Test',
        customerEmail: 'response@test.com',
        items: [
          { productName: 'Product A', sku: 'PROD-A', quantity: 5, requestedPrice: null },
        ],
      });

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      const responded = quoteService.respond(newQuote.id, {
        items: [
          { ...newQuote.items[0], unitPrice: 100, totalPrice: 500 },
        ],
        subtotal: 500,
        discount: 50,
        total: 450,
        validUntil: validUntil.toISOString(),
        responseMessage: 'Please find our quote attached.',
      });

      expect(responded.status).toBe(QUOTE_STATUS.SENT);
      expect(responded.subtotal).toBe(500);
      expect(responded.discount).toBe(50);
      expect(responded.total).toBe(450);
      expect(responded.responseMessage).toBe('Please find our quote attached.');
      expect(responded.sentAt).toBeDefined();
      expect(responded.respondedAt).toBeDefined();
    });
  });

  describe('convertToOrder', () => {
    it('should convert quote to order', () => {
      const newQuote = quoteService.create({
        customerName: 'Convert Test',
        customerEmail: 'convert@test.com',
        items: [],
      });

      const converted = quoteService.convertToOrder(newQuote.id, 'order-123');

      expect(converted.status).toBe(QUOTE_STATUS.CONVERTED);
      expect(converted.orderId).toBe('order-123');
    });
  });

  describe('delete', () => {
    it('should delete an existing quote', () => {
      const newQuote = quoteService.create({
        customerName: 'Quote To Delete',
        customerEmail: 'delete@test.com',
        items: [],
      });

      const result = quoteService.delete(newQuote.id);
      expect(result).toBe(true);

      const retrieved = quoteService.getById(newQuote.id);
      expect(retrieved).toBeNull();
    });

    it('should throw error for non-existent quote', () => {
      expect(() => {
        quoteService.delete('non-existent-id');
      }).toThrow(/not found/);
    });
  });

  describe('getPaginated', () => {
    it('should return paginated results', () => {
      const result = quoteService.getPaginated({ page: 1, limit: 5 });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.total).toBeGreaterThan(0);
      expect(result.totalPages).toBeDefined();
    });

    it('should support filtering by status', () => {
      const result = quoteService.getPaginated(
        { page: 1, limit: 10 },
        { status: QUOTE_STATUS.PENDING }
      );

      result.data.forEach(quote => {
        expect(quote.status).toBe(QUOTE_STATUS.PENDING);
      });
    });
  });

  describe('getStats', () => {
    it('should return quote statistics', () => {
      const stats = quoteService.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.pending).toBe('number');
      expect(typeof stats.sent).toBe('number');
      expect(typeof stats.accepted).toBe('number');
      expect(typeof stats.rejected).toBe('number');
      expect(typeof stats.converted).toBe('number');
      expect(typeof stats.totalValue).toBe('number');
      expect(typeof stats.conversionRate).toBe('number');
    });
  });

  describe('getCount', () => {
    it('should return total quote count', () => {
      const count = quoteService.getCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getPendingCount', () => {
    it('should return pending quote count', () => {
      const pendingCount = quoteService.getPendingCount();
      const totalCount = quoteService.getCount();
      expect(typeof pendingCount).toBe('number');
      expect(pendingCount).toBeLessThanOrEqual(totalCount);
    });
  });
});
