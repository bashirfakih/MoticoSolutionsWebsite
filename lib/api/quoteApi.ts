/**
 * Quote API Client
 *
 * Client-side service for quote API operations.
 *
 * @module lib/api/quoteApi
 */

import { Quote, QuoteInput, PaginatedResult, PaginationParams, QuoteStatus } from '@/lib/data/types';

const API_BASE = '/api/quotes';

export interface QuoteFilter {
  search?: string;
  status?: QuoteStatus;
  customerId?: string;
}

/**
 * Fetch all quotes (or with filters/pagination)
 */
export async function getQuotes(
  params?: PaginationParams,
  filter?: QuoteFilter
): Promise<PaginatedResult<Quote>> {
  const searchParams = new URLSearchParams();

  if (params) {
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  }

  if (filter) {
    if (filter.search) searchParams.set('search', filter.search);
    if (filter.status) searchParams.set('status', filter.status);
    if (filter.customerId) searchParams.set('customerId', filter.customerId);
  }

  const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE;
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch quotes');
  }

  return res.json();
}

/**
 * Fetch pending quotes
 */
export async function getPendingQuotes(): Promise<Quote[]> {
  const result = await getQuotes(undefined, { status: 'pending' });
  return result.data;
}

/**
 * Fetch a single quote by ID
 */
export async function getQuoteById(id: string): Promise<Quote | null> {
  const res = await fetch(`${API_BASE}/${id}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch quote');
  }

  return res.json();
}

/**
 * Create a new quote request
 */
export async function createQuote(input: QuoteInput): Promise<Quote> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create quote');
  }

  return res.json();
}

/**
 * Update a quote
 */
export async function updateQuote(id: string, input: Partial<Quote>): Promise<Quote> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update quote');
  }

  return res.json();
}

/**
 * Update quote status
 */
export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<Quote> {
  return updateQuote(id, { status });
}

/**
 * Mark quote as reviewed
 */
export async function markAsReviewed(id: string): Promise<Quote> {
  return updateQuote(id, { status: 'reviewed' });
}

/**
 * Send quote to customer
 */
export async function sendQuote(id: string, responseMessage?: string): Promise<Quote> {
  return updateQuote(id, {
    status: 'sent',
    responseMessage,
  });
}

/**
 * Delete a quote
 */
export async function deleteQuote(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete quote');
  }

  return true;
}

/**
 * Quote API service object (for compatibility with existing code)
 */
export const quoteApiService = {
  getAll: async () => (await getQuotes()).data,
  getPending: getPendingQuotes,
  getPaginated: getQuotes,
  getById: getQuoteById,
  create: createQuote,
  update: updateQuote,
  updateStatus: updateQuoteStatus,
  markAsReviewed,
  send: sendQuote,
  delete: deleteQuote,
};
