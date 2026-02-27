/**
 * Customer Service Unit Tests
 *
 * Tests for CRUD operations and utility functions.
 *
 * @module __tests__/lib/data/customerService.test
 */

import { customerService } from '@/lib/data/customerService';
import { CUSTOMER_STATUS } from '@/lib/data/types';

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

describe('customerService', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all customers sorted by updatedAt descending', () => {
      const customers = customerService.getAll();
      expect(customers).toBeDefined();
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeGreaterThan(0);

      // Check sorting (most recently updated first)
      for (let i = 1; i < customers.length; i++) {
        expect(new Date(customers[i].updatedAt).getTime())
          .toBeLessThanOrEqual(new Date(customers[i - 1].updatedAt).getTime());
      }
    });
  });

  describe('getActive', () => {
    it('should return only active customers', () => {
      const activeCustomers = customerService.getActive();
      activeCustomers.forEach(customer => {
        expect(customer.status).toBe(CUSTOMER_STATUS.ACTIVE);
      });
    });
  });

  describe('getById', () => {
    it('should return customer when found', () => {
      const customers = customerService.getAll();
      const firstCustomer = customers[0];
      const result = customerService.getById(firstCustomer.id);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(firstCustomer.id);
      expect(result?.name).toBe(firstCustomer.name);
    });

    it('should return null when not found', () => {
      const result = customerService.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getByEmail', () => {
    it('should return customer when found', () => {
      const customers = customerService.getAll();
      const firstCustomer = customers[0];
      const result = customerService.getByEmail(firstCustomer.email);
      expect(result).not.toBeNull();
      expect(result?.email.toLowerCase()).toBe(firstCustomer.email.toLowerCase());
    });

    it('should be case insensitive', () => {
      const customers = customerService.getAll();
      const firstCustomer = customers[0];
      const result = customerService.getByEmail(firstCustomer.email.toUpperCase());
      expect(result).not.toBeNull();
    });

    it('should return null when not found', () => {
      const result = customerService.getByEmail('nonexistent@email.com');
      expect(result).toBeNull();
    });
  });

  describe('getByStatus', () => {
    it('should return customers with specific status', () => {
      const activeCustomers = customerService.getByStatus(CUSTOMER_STATUS.ACTIVE);
      expect(Array.isArray(activeCustomers)).toBe(true);
      activeCustomers.forEach(customer => {
        expect(customer.status).toBe(CUSTOMER_STATUS.ACTIVE);
      });
    });
  });

  describe('getTop', () => {
    it('should return top customers by spending', () => {
      const topCustomers = customerService.getTop(3);
      expect(topCustomers.length).toBeLessThanOrEqual(3);

      // Check sorting by totalSpent (descending)
      for (let i = 1; i < topCustomers.length; i++) {
        expect(topCustomers[i].totalSpent).toBeLessThanOrEqual(topCustomers[i - 1].totalSpent);
      }
    });
  });

  describe('getRecent', () => {
    it('should return limited number of recent customers', () => {
      const recentCustomers = customerService.getRecent(3);
      expect(recentCustomers.length).toBeLessThanOrEqual(3);
    });
  });

  describe('search', () => {
    it('should find customers by name', () => {
      const customers = customerService.getAll();
      const customerName = customers[0].name.split(' ')[0]; // First name
      const results = customerService.search(customerName);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find customers by email', () => {
      const customers = customerService.getAll();
      const email = customers[0].email;
      const results = customerService.search(email);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find customers by company', () => {
      const customers = customerService.getAll();
      const customerWithCompany = customers.find(c => c.company);
      if (customerWithCompany && customerWithCompany.company) {
        const results = customerService.search(customerWithCompany.company);
        expect(results.length).toBeGreaterThan(0);
      }
    });

    it('should return empty array for no matches', () => {
      const results = customerService.search('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new customer', () => {
      const newCustomer = customerService.create({
        name: 'Test Customer',
        email: 'testcustomer@example.com',
        phone: '+961 1 234 567',
        company: 'Test Company',
        country: 'Lebanon',
      });

      expect(newCustomer).toBeDefined();
      expect(newCustomer.id).toBeDefined();
      expect(newCustomer.name).toBe('Test Customer');
      expect(newCustomer.email).toBe('testcustomer@example.com');
      expect(newCustomer.status).toBe(CUSTOMER_STATUS.ACTIVE);
      expect(newCustomer.totalOrders).toBe(0);
      expect(newCustomer.totalSpent).toBe(0);
      expect(newCustomer.createdAt).toBeDefined();

      // Verify it was saved
      const retrieved = customerService.getById(newCustomer.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Test Customer');
    });

    it('should throw error for duplicate email', () => {
      const customers = customerService.getAll();
      const existingCustomer = customers[0];

      expect(() => {
        customerService.create({
          name: 'Another Customer',
          email: existingCustomer.email,
        });
      }).toThrow(/already exists/);
    });
  });

  describe('update', () => {
    it('should update an existing customer', () => {
      const customers = customerService.getAll();
      const customerToUpdate = customers[0];
      const originalName = customerToUpdate.name;

      const updated = customerService.update(customerToUpdate.id, {
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(customerToUpdate.id);
      expect(updated.updatedAt).not.toBe(customerToUpdate.updatedAt);

      // Restore original
      customerService.update(customerToUpdate.id, { name: originalName });
    });

    it('should throw error for non-existent customer', () => {
      expect(() => {
        customerService.update('non-existent-id', { name: 'Test' });
      }).toThrow(/not found/);
    });

    it('should throw error when updating to duplicate email', () => {
      const customers = customerService.getAll();
      const customer1 = customers[0];
      const customer2 = customers[1];

      expect(() => {
        customerService.update(customer1.id, { email: customer2.email });
      }).toThrow(/already exists/);
    });
  });

  describe('updateStatus', () => {
    it('should update customer status', () => {
      const customers = customerService.getAll();
      const customer = customers[0];
      const originalStatus = customer.status;

      const updated = customerService.updateStatus(customer.id, CUSTOMER_STATUS.INACTIVE);
      expect(updated.status).toBe(CUSTOMER_STATUS.INACTIVE);

      // Restore original
      customerService.updateStatus(customer.id, originalStatus);
    });
  });

  describe('delete', () => {
    it('should delete an existing customer', () => {
      const newCustomer = customerService.create({
        name: 'Customer To Delete',
        email: 'deletetestcustomer@example.com',
      });

      const result = customerService.delete(newCustomer.id);
      expect(result).toBe(true);

      const retrieved = customerService.getById(newCustomer.id);
      expect(retrieved).toBeNull();
    });

    it('should throw error for non-existent customer', () => {
      expect(() => {
        customerService.delete('non-existent-id');
      }).toThrow(/not found/);
    });
  });

  describe('addTag', () => {
    it('should add a tag to customer', () => {
      const customers = customerService.getAll();
      const customer = customers[0];

      const updated = customerService.addTag(customer.id, 'vip');
      expect(updated.tags).toContain('vip');

      // Cleanup - remove tag
      customerService.removeTag(customer.id, 'vip');
    });

    it('should not add duplicate tags', () => {
      const customers = customerService.getAll();
      const customer = customers[0];

      customerService.addTag(customer.id, 'unique-tag');
      const updated = customerService.addTag(customer.id, 'unique-tag');

      const tagCount = updated.tags.filter(t => t === 'unique-tag').length;
      expect(tagCount).toBe(1);

      // Cleanup
      customerService.removeTag(customer.id, 'unique-tag');
    });
  });

  describe('removeTag', () => {
    it('should remove a tag from customer', () => {
      const customers = customerService.getAll();
      const customer = customers[0];

      customerService.addTag(customer.id, 'temp-tag');
      const updated = customerService.removeTag(customer.id, 'temp-tag');

      expect(updated.tags).not.toContain('temp-tag');
    });
  });

  describe('getPaginated', () => {
    it('should return paginated results', () => {
      const result = customerService.getPaginated({ page: 1, limit: 5 });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.total).toBeGreaterThan(0);
      expect(result.totalPages).toBeDefined();
    });

    it('should support filtering by status', () => {
      const result = customerService.getPaginated(
        { page: 1, limit: 10 },
        { status: CUSTOMER_STATUS.ACTIVE }
      );

      result.data.forEach(customer => {
        expect(customer.status).toBe(CUSTOMER_STATUS.ACTIVE);
      });
    });

    it('should support sorting', () => {
      const result = customerService.getPaginated({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].name.localeCompare(result.data[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('getStats', () => {
    it('should return customer statistics', () => {
      const stats = customerService.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.active).toBe('number');
      expect(typeof stats.inactive).toBe('number');
      expect(typeof stats.withOrders).toBe('number');
      expect(typeof stats.totalRevenue).toBe('number');
    });
  });

  describe('getCount', () => {
    it('should return total customer count', () => {
      const count = customerService.getCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getActiveCount', () => {
    it('should return active customer count', () => {
      const activeCount = customerService.getActiveCount();
      const totalCount = customerService.getCount();
      expect(typeof activeCount).toBe('number');
      expect(activeCount).toBeLessThanOrEqual(totalCount);
    });
  });

  describe('getCountries', () => {
    it('should return unique list of countries', () => {
      const countries = customerService.getCountries();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);

      // Check uniqueness
      const uniqueCountries = [...new Set(countries)];
      expect(uniqueCountries.length).toBe(countries.length);
    });
  });
});
