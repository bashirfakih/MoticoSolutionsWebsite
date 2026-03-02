/**
 * Customers API Route Tests
 *
 * Tests for /api/customers and /api/customers/[id] endpoints
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockCustomerFindMany = jest.fn();
const mockCustomerFindUnique = jest.fn();
const mockCustomerCreate = jest.fn();
const mockCustomerUpdate = jest.fn();
const mockCustomerDelete = jest.fn();
const mockCustomerCount = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    customer: {
      findMany: (...args: unknown[]) => mockCustomerFindMany(...args),
      findUnique: (...args: unknown[]) => mockCustomerFindUnique(...args),
      create: (...args: unknown[]) => mockCustomerCreate(...args),
      update: (...args: unknown[]) => mockCustomerUpdate(...args),
      delete: (...args: unknown[]) => mockCustomerDelete(...args),
      count: (...args: unknown[]) => mockCustomerCount(...args),
    },
  },
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/customers/route';

describe('Customers API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/customers', () => {
    describe('Success (200)', () => {
      it('returns paginated customers list', async () => {
        const mockCustomers = [
          {
            id: 'cust-1',
            name: 'John Doe',
            email: 'john@example.com',
            totalSpent: 1500.00,
            _count: { orders: 3, quotes: 1 },
          },
        ];
        mockCustomerFindMany.mockResolvedValue(mockCustomers);
        mockCustomerCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/customers');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: unknown[]; total: number };

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(1);
        expect(data.total).toBe(1);
      });

      it('transforms totalSpent to number and adds orderCount/quoteCount', async () => {
        mockCustomerFindMany.mockResolvedValue([
          { id: 'cust-1', totalSpent: 1500.50, _count: { orders: 5, quotes: 2 } },
        ]);
        mockCustomerCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/customers');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: { totalSpent: number; orderCount: number; quoteCount: number; _count?: unknown }[] };

        expect(typeof data.data[0].totalSpent).toBe('number');
        expect(data.data[0].orderCount).toBe(5);
        expect(data.data[0].quoteCount).toBe(2);
        expect(data.data[0]._count).toBeUndefined();
      });

      it('filters by search query', async () => {
        mockCustomerFindMany.mockResolvedValue([]);
        mockCustomerCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/customers?search=john');
        await GET(request);

        expect(mockCustomerFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                { name: { contains: 'john', mode: 'insensitive' } },
                { email: { contains: 'john', mode: 'insensitive' } },
              ]),
            }),
          })
        );
      });

      it('filters by status', async () => {
        mockCustomerFindMany.mockResolvedValue([]);
        mockCustomerCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/customers?status=active');
        await GET(request);

        expect(mockCustomerFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ status: 'active' }),
          })
        );
      });

      it('filters by country', async () => {
        mockCustomerFindMany.mockResolvedValue([]);
        mockCustomerCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/customers?country=Lebanon');
        await GET(request);

        expect(mockCustomerFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ country: 'Lebanon' }),
          })
        );
      });

      it('filters by verified status', async () => {
        mockCustomerFindMany.mockResolvedValue([]);
        mockCustomerCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/customers?verified=true');
        await GET(request);

        expect(mockCustomerFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isVerified: true }),
          })
        );
      });

      it('supports pagination', async () => {
        mockCustomerFindMany.mockResolvedValue([]);
        mockCustomerCount.mockResolvedValue(100);

        const request = createMockRequest('http://localhost/api/customers?page=3&limit=10');
        const response = await GET(request);
        const data = await getResponseJson(response) as { page: number; limit: number; totalPages: number };

        expect(data.page).toBe(3);
        expect(data.limit).toBe(10);
        expect(data.totalPages).toBe(10);
      });

      it('supports sorting', async () => {
        mockCustomerFindMany.mockResolvedValue([]);
        mockCustomerCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/customers?sortBy=name&sortOrder=asc');
        await GET(request);

        expect(mockCustomerFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { name: 'asc' },
          })
        );
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockCustomerCount.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/customers');
        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch customers' });
      });
    });
  });

  describe('POST /api/customers', () => {
    describe('Success (201)', () => {
      it('creates a new customer', async () => {
        const newCustomer = {
          id: 'cust-new',
          name: 'Jane Doe',
          email: 'jane@example.com',
          totalSpent: 0,
          status: 'active',
        };
        mockCustomerFindUnique.mockResolvedValue(null);
        mockCustomerCreate.mockResolvedValue(newCustomer);

        const request = createMockRequest('http://localhost/api/customers', {
          method: 'POST',
          body: { name: 'Jane Doe', email: 'jane@example.com' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response) as { id: string };

        expect(response.status).toBe(201);
        expect(data.id).toBe('cust-new');
      });

      it('normalizes email to lowercase', async () => {
        mockCustomerFindUnique.mockResolvedValue(null);
        mockCustomerCreate.mockResolvedValue({
          id: 'cust-1',
          email: 'test@example.com',
          totalSpent: 0,
        });

        const request = createMockRequest('http://localhost/api/customers', {
          method: 'POST',
          body: { name: 'Test', email: 'TEST@EXAMPLE.COM' },
        });
        await POST(request);

        expect(mockCustomerCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({ email: 'test@example.com' }),
        });
      });

      it('creates customer with all fields', async () => {
        mockCustomerFindUnique.mockResolvedValue(null);
        mockCustomerCreate.mockResolvedValue({
          id: 'cust-1',
          totalSpent: 0,
        });

        const request = createMockRequest('http://localhost/api/customers', {
          method: 'POST',
          body: {
            name: 'Full Customer',
            email: 'full@example.com',
            company: 'Company Inc',
            phone: '+1234567890',
            address: '123 Main St',
            city: 'Beirut',
            region: 'Beirut',
            postalCode: '1100',
            country: 'Lebanon',
            status: 'active',
            isVerified: true,
            notes: 'VIP customer',
            tags: ['vip', 'wholesale'],
          },
        });
        const response = await POST(request);

        expect(response.status).toBe(201);
        expect(mockCustomerCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            company: 'Company Inc',
            tags: ['vip', 'wholesale'],
          }),
        });
      });

      it('defaults country to Lebanon', async () => {
        mockCustomerFindUnique.mockResolvedValue(null);
        mockCustomerCreate.mockResolvedValue({ id: 'cust-1', totalSpent: 0 });

        const request = createMockRequest('http://localhost/api/customers', {
          method: 'POST',
          body: { name: 'Test', email: 'test@example.com' },
        });
        await POST(request);

        expect(mockCustomerCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({ country: 'Lebanon' }),
        });
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when name is missing', async () => {
        const request = createMockRequest('http://localhost/api/customers', {
          method: 'POST',
          body: { email: 'test@example.com' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name and email are required' });
      });

      it('returns 400 when email is missing', async () => {
        const request = createMockRequest('http://localhost/api/customers', {
          method: 'POST',
          body: { name: 'Test User' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name and email are required' });
      });
    });

    describe('Conflict (409)', () => {
      it('returns 409 when email already exists', async () => {
        mockCustomerFindUnique.mockResolvedValue({ id: 'existing', email: 'test@example.com' });

        const request = createMockRequest('http://localhost/api/customers', {
          method: 'POST',
          body: { name: 'Test', email: 'test@example.com' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(409);
        expect(data).toEqual({ error: 'A customer with this email already exists' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on creation failure', async () => {
        mockCustomerFindUnique.mockResolvedValue(null);
        mockCustomerCreate.mockRejectedValue(new Error('Create failed'));

        const request = createMockRequest('http://localhost/api/customers', {
          method: 'POST',
          body: { name: 'Test', email: 'test@example.com' },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to create customer' });
      });
    });
  });
});
