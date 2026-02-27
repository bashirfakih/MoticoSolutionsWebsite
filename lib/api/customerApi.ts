/**
 * Customer API Client
 *
 * Client-side service for customer API operations.
 *
 * @module lib/api/customerApi
 */

import { Customer, CustomerInput, PaginatedResult, PaginationParams, CustomerStatus } from '@/lib/data/types';

const API_BASE = '/api/customers';

export interface CustomerFilter {
  search?: string;
  status?: CustomerStatus;
  country?: string;
  verified?: boolean;
}

/**
 * Fetch all customers (or with filters/pagination)
 */
export async function getCustomers(
  params?: PaginationParams,
  filter?: CustomerFilter
): Promise<PaginatedResult<Customer>> {
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
    if (filter.country) searchParams.set('country', filter.country);
    if (filter.verified !== undefined) searchParams.set('verified', String(filter.verified));
  }

  const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE;
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch customers');
  }

  return res.json();
}

/**
 * Fetch active customers only
 */
export async function getActiveCustomers(): Promise<Customer[]> {
  const result = await getCustomers(undefined, { status: 'active' });
  return result.data;
}

/**
 * Fetch a single customer by ID
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  const res = await fetch(`${API_BASE}/${id}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch customer');
  }

  return res.json();
}

/**
 * Create a new customer
 */
export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create customer');
  }

  return res.json();
}

/**
 * Update an existing customer
 */
export async function updateCustomer(id: string, input: Partial<Customer>): Promise<Customer> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update customer');
  }

  return res.json();
}

/**
 * Block a customer
 */
export async function blockCustomer(id: string): Promise<Customer> {
  return updateCustomer(id, { status: 'blocked' });
}

/**
 * Unblock a customer
 */
export async function unblockCustomer(id: string): Promise<Customer> {
  return updateCustomer(id, { status: 'active' });
}

/**
 * Verify a customer
 */
export async function verifyCustomer(id: string): Promise<Customer> {
  return updateCustomer(id, { isVerified: true });
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete customer');
  }

  return true;
}

/**
 * Customer API service object (for compatibility with existing code)
 */
export const customerApiService = {
  getAll: async () => (await getCustomers()).data,
  getActive: getActiveCustomers,
  getPaginated: getCustomers,
  getById: getCustomerById,
  create: createCustomer,
  update: updateCustomer,
  block: blockCustomer,
  unblock: unblockCustomer,
  verify: verifyCustomer,
  delete: deleteCustomer,
};
