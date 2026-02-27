/**
 * Quote Service for Motico Solutions CRM
 *
 * CRUD operations for quotes using localStorage.
 *
 * @module lib/data/quoteService
 */

import {
  Quote,
  QuoteInput,
  QuoteFilter,
  QuoteStatus,
  QUOTE_STATUS,
  PaginatedResult,
  PaginationParams,
  CURRENCY,
  generateId,
  getCurrentTimestamp,
} from './types';
import { mockQuotes } from './mockQuotes';

const STORAGE_KEY = 'motico_quotes';
const isClient = typeof window !== 'undefined';

// ═══════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

function initializeStorage(): void {
  if (!isClient) return;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockQuotes));
  }
}

function getFromStorage(): Quote[] {
  if (!isClient) return mockQuotes;
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : mockQuotes;
}

function saveToStorage(quotes: Quote[]): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const quotes = getFromStorage();
  const count = quotes.filter(q => q.quoteNumber.includes(`QUO-${year}`)).length + 1;
  return `QUO-${year}-${count.toString().padStart(3, '0')}`;
}

// ═══════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════

export function getAllQuotes(): Quote[] {
  return getFromStorage().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getQuoteById(id: string): Quote | null {
  return getFromStorage().find(quote => quote.id === id) || null;
}

export function getQuoteByNumber(quoteNumber: string): Quote | null {
  return getFromStorage().find(quote => quote.quoteNumber === quoteNumber) || null;
}

export function getQuotesByCustomer(customerId: string): Quote[] {
  return getAllQuotes().filter(quote => quote.customerId === customerId);
}

export function getQuotesByStatus(status: QuoteStatus): Quote[] {
  return getAllQuotes().filter(quote => quote.status === status);
}

export function getPendingQuotes(): Quote[] {
  return getQuotesByStatus(QUOTE_STATUS.PENDING);
}

export function getRecentQuotes(limit: number = 10): Quote[] {
  return getAllQuotes().slice(0, limit);
}

export function searchQuotes(query: string): Quote[] {
  const searchLower = query.toLowerCase();
  return getAllQuotes().filter(
    quote =>
      quote.quoteNumber.toLowerCase().includes(searchLower) ||
      quote.customerName.toLowerCase().includes(searchLower) ||
      quote.customerEmail.toLowerCase().includes(searchLower) ||
      quote.company?.toLowerCase().includes(searchLower)
  );
}

export function getQuotesPaginated(
  params: PaginationParams,
  filter?: QuoteFilter
): PaginatedResult<Quote> {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  let quotes = getFromStorage();

  // Apply filters
  if (filter) {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      quotes = quotes.filter(
        q =>
          q.quoteNumber.toLowerCase().includes(searchLower) ||
          q.customerName.toLowerCase().includes(searchLower) ||
          q.customerEmail.toLowerCase().includes(searchLower) ||
          q.company?.toLowerCase().includes(searchLower)
      );
    }
    if (filter.status) {
      quotes = quotes.filter(q => q.status === filter.status);
    }
    if (filter.customerId) {
      quotes = quotes.filter(q => q.customerId === filter.customerId);
    }
    if (filter.dateFrom) {
      quotes = quotes.filter(q => new Date(q.createdAt) >= new Date(filter.dateFrom!));
    }
    if (filter.dateTo) {
      quotes = quotes.filter(q => new Date(q.createdAt) <= new Date(filter.dateTo!));
    }
  }

  // Sort
  quotes = quotes.sort((a, b) => {
    const aVal = a[sortBy as keyof Quote];
    const bVal = b[sortBy as keyof Quote];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const total = quotes.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = quotes.slice(start, start + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

export function createQuote(input: QuoteInput): Quote {
  const quotes = getFromStorage();
  const now = getCurrentTimestamp();

  const newQuote: Quote = {
    id: generateId(),
    quoteNumber: generateQuoteNumber(),
    customerId: input.customerId || null,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone || null,
    company: input.company || null,
    items: input.items.map(item => ({ ...item, id: generateId() })),
    subtotal: null,
    discount: 0,
    total: null,
    currency: CURRENCY.USD,
    status: QUOTE_STATUS.PENDING,
    validUntil: null,
    customerMessage: input.customerMessage || null,
    internalNotes: null,
    responseMessage: null,
    orderId: null,
    createdAt: now,
    updatedAt: now,
    reviewedAt: null,
    sentAt: null,
    respondedAt: null,
  };

  quotes.push(newQuote);
  saveToStorage(quotes);

  return newQuote;
}

export function updateQuote(id: string, updates: Partial<Quote>): Quote {
  const quotes = getFromStorage();
  const index = quotes.findIndex(q => q.id === id);

  if (index === -1) {
    throw new Error(`Quote with ID ${id} not found`);
  }

  quotes[index] = {
    ...quotes[index],
    ...updates,
    updatedAt: getCurrentTimestamp(),
  };

  saveToStorage(quotes);
  return quotes[index];
}

export function updateQuoteStatus(id: string, status: QuoteStatus): Quote {
  const updates: Partial<Quote> = { status };

  if (status === QUOTE_STATUS.REVIEWED) {
    updates.reviewedAt = getCurrentTimestamp();
  }
  if (status === QUOTE_STATUS.SENT) {
    updates.sentAt = getCurrentTimestamp();
  }

  return updateQuote(id, updates);
}

export function respondToQuote(
  id: string,
  response: {
    items: Quote['items'];
    subtotal: number;
    discount?: number;
    total: number;
    validUntil: string;
    responseMessage: string;
  }
): Quote {
  return updateQuote(id, {
    items: response.items,
    subtotal: response.subtotal,
    discount: response.discount || 0,
    total: response.total,
    validUntil: response.validUntil,
    responseMessage: response.responseMessage,
    status: QUOTE_STATUS.SENT,
    sentAt: getCurrentTimestamp(),
    respondedAt: getCurrentTimestamp(),
  });
}

export function convertToOrder(id: string, orderId: string): Quote {
  return updateQuote(id, {
    status: QUOTE_STATUS.CONVERTED,
    orderId,
  });
}

export function deleteQuote(id: string): boolean {
  const quotes = getFromStorage();
  const index = quotes.findIndex(q => q.id === id);

  if (index === -1) {
    throw new Error(`Quote with ID ${id} not found`);
  }

  quotes.splice(index, 1);
  saveToStorage(quotes);
  return true;
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════

export function getQuoteStats() {
  const quotes = getFromStorage();

  return {
    total: quotes.length,
    pending: quotes.filter(q => q.status === QUOTE_STATUS.PENDING).length,
    reviewed: quotes.filter(q => q.status === QUOTE_STATUS.REVIEWED).length,
    sent: quotes.filter(q => q.status === QUOTE_STATUS.SENT).length,
    accepted: quotes.filter(q => q.status === QUOTE_STATUS.ACCEPTED).length,
    rejected: quotes.filter(q => q.status === QUOTE_STATUS.REJECTED).length,
    converted: quotes.filter(q => q.status === QUOTE_STATUS.CONVERTED).length,
    totalValue: quotes
      .filter(q => q.total !== null)
      .reduce((sum, q) => sum + (q.total || 0), 0),
    conversionRate:
      quotes.length > 0
        ? (quotes.filter(q => q.status === QUOTE_STATUS.CONVERTED).length / quotes.length) * 100
        : 0,
  };
}

export function getCount(): number {
  return getFromStorage().length;
}

export function getPendingCount(): number {
  return getPendingQuotes().length;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════

export const quoteService = {
  getAll: getAllQuotes,
  getById: getQuoteById,
  getByNumber: getQuoteByNumber,
  getByCustomer: getQuotesByCustomer,
  getByStatus: getQuotesByStatus,
  getPending: getPendingQuotes,
  getRecent: getRecentQuotes,
  search: searchQuotes,
  getPaginated: getQuotesPaginated,
  create: createQuote,
  update: updateQuote,
  updateStatus: updateQuoteStatus,
  respond: respondToQuote,
  convertToOrder,
  delete: deleteQuote,
  getStats: getQuoteStats,
  getCount,
  getPendingCount,
};
