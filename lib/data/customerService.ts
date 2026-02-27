/**
 * Customer Service for Motico Solutions CRM
 *
 * CRUD operations for customers using localStorage.
 *
 * @module lib/data/customerService
 */

import {
  Customer,
  CustomerInput,
  CustomerFilter,
  CustomerStatus,
  CUSTOMER_STATUS,
  PaginatedResult,
  PaginationParams,
  generateId,
  getCurrentTimestamp,
} from './types';
import { mockCustomers } from './mockCustomers';

const STORAGE_KEY = 'motico_customers';
const isClient = typeof window !== 'undefined';

// ═══════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

function initializeStorage(): void {
  if (!isClient) return;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCustomers));
  }
}

function getFromStorage(): Customer[] {
  if (!isClient) return mockCustomers;
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : mockCustomers;
}

function saveToStorage(customers: Customer[]): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

// ═══════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════

export function getAllCustomers(): Customer[] {
  return getFromStorage().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getActiveCustomers(): Customer[] {
  return getAllCustomers().filter(c => c.status === CUSTOMER_STATUS.ACTIVE);
}

export function getCustomerById(id: string): Customer | null {
  return getFromStorage().find(customer => customer.id === id) || null;
}

export function getCustomerByEmail(email: string): Customer | null {
  return getFromStorage().find(
    customer => customer.email.toLowerCase() === email.toLowerCase()
  ) || null;
}

export function getCustomersByStatus(status: CustomerStatus): Customer[] {
  return getAllCustomers().filter(customer => customer.status === status);
}

export function getTopCustomers(limit: number = 10): Customer[] {
  return getAllCustomers()
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

export function getRecentCustomers(limit: number = 10): Customer[] {
  return getAllCustomers()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function searchCustomers(query: string): Customer[] {
  const searchLower = query.toLowerCase();
  return getAllCustomers().filter(
    customer =>
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.company?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(query)
  );
}

export function getCustomersPaginated(
  params: PaginationParams,
  filter?: CustomerFilter
): PaginatedResult<Customer> {
  const { page = 1, limit = 10, sortBy = 'updatedAt', sortOrder = 'desc' } = params;

  let customers = getFromStorage();

  // Apply filters
  if (filter) {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      customers = customers.filter(
        c =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.company?.toLowerCase().includes(searchLower) ||
          c.phone?.includes(filter.search!)
      );
    }
    if (filter.status) {
      customers = customers.filter(c => c.status === filter.status);
    }
    if (filter.country) {
      customers = customers.filter(c => c.country === filter.country);
    }
    if (filter.hasOrders === true) {
      customers = customers.filter(c => c.totalOrders > 0);
    }
    if (filter.hasOrders === false) {
      customers = customers.filter(c => c.totalOrders === 0);
    }
  }

  // Sort
  customers = customers.sort((a, b) => {
    const aVal = a[sortBy as keyof Customer];
    const bVal = b[sortBy as keyof Customer];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const total = customers.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = customers.slice(start, start + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

export function createCustomer(input: CustomerInput): Customer {
  const customers = getFromStorage();

  // Check for duplicate email
  if (customers.some(c => c.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error(`Customer with email ${input.email} already exists`);
  }

  const now = getCurrentTimestamp();

  const newCustomer: Customer = {
    id: generateId(),
    email: input.email,
    name: input.name,
    company: input.company || null,
    phone: input.phone || null,
    address: input.address || null,
    city: input.city || null,
    region: input.region || null,
    postalCode: input.postalCode || null,
    country: input.country || 'Lebanon',
    totalOrders: 0,
    totalSpent: 0,
    lastOrderAt: null,
    status: input.status || CUSTOMER_STATUS.ACTIVE,
    isVerified: false,
    notes: input.notes || null,
    tags: input.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  customers.push(newCustomer);
  saveToStorage(customers);

  return newCustomer;
}

export function updateCustomer(id: string, updates: Partial<CustomerInput>): Customer {
  const customers = getFromStorage();
  const index = customers.findIndex(c => c.id === id);

  if (index === -1) {
    throw new Error(`Customer with ID ${id} not found`);
  }

  // Check for duplicate email if changing email
  if (updates.email && updates.email !== customers[index].email) {
    if (customers.some(c => c.email.toLowerCase() === updates.email!.toLowerCase())) {
      throw new Error(`Customer with email ${updates.email} already exists`);
    }
  }

  customers[index] = {
    ...customers[index],
    ...updates,
    updatedAt: getCurrentTimestamp(),
  };

  saveToStorage(customers);
  return customers[index];
}

export function updateCustomerStatus(id: string, status: CustomerStatus): Customer {
  return updateCustomer(id, { status });
}

export function deleteCustomer(id: string): boolean {
  const customers = getFromStorage();
  const index = customers.findIndex(c => c.id === id);

  if (index === -1) {
    throw new Error(`Customer with ID ${id} not found`);
  }

  customers.splice(index, 1);
  saveToStorage(customers);
  return true;
}

export function addTag(id: string, tag: string): Customer {
  const customer = getCustomerById(id);
  if (!customer) {
    throw new Error(`Customer with ID ${id} not found`);
  }

  const tags = [...new Set([...customer.tags, tag.toLowerCase()])];
  return updateCustomer(id, { tags });
}

export function removeTag(id: string, tag: string): Customer {
  const customer = getCustomerById(id);
  if (!customer) {
    throw new Error(`Customer with ID ${id} not found`);
  }

  const tags = customer.tags.filter(t => t !== tag.toLowerCase());
  return updateCustomer(id, { tags });
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════

export function getCustomerStats() {
  const customers = getFromStorage();
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    total: customers.length,
    active: customers.filter(c => c.status === CUSTOMER_STATUS.ACTIVE).length,
    inactive: customers.filter(c => c.status === CUSTOMER_STATUS.INACTIVE).length,
    blocked: customers.filter(c => c.status === CUSTOMER_STATUS.BLOCKED).length,
    verified: customers.filter(c => c.isVerified).length,
    withOrders: customers.filter(c => c.totalOrders > 0).length,
    newThisMonth: customers.filter(c => new Date(c.createdAt) >= thisMonth).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
  };
}

export function getCount(): number {
  return getFromStorage().length;
}

export function getActiveCount(): number {
  return getActiveCustomers().length;
}

export function getCountries(): string[] {
  const customers = getFromStorage();
  return [...new Set(customers.map(c => c.country))].sort();
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════

export const customerService = {
  getAll: getAllCustomers,
  getActive: getActiveCustomers,
  getById: getCustomerById,
  getByEmail: getCustomerByEmail,
  getByStatus: getCustomersByStatus,
  getTop: getTopCustomers,
  getRecent: getRecentCustomers,
  search: searchCustomers,
  getPaginated: getCustomersPaginated,
  create: createCustomer,
  update: updateCustomer,
  updateStatus: updateCustomerStatus,
  delete: deleteCustomer,
  addTag,
  removeTag,
  getStats: getCustomerStats,
  getCount,
  getActiveCount,
  getCountries,
};
