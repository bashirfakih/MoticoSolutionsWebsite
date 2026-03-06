/**
 * Single Customer API Route Tests
 *
 * Tests for GET /api/customers/[id], PATCH /api/customers/[id], DELETE /api/customers/[id]
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, createRouteParams, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockCustomerFindUnique = jest.fn();
const mockCustomerUpdate = jest.fn();
const mockCustomerDelete = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    customer: {
      findUnique: (...args: unknown[]) => mockCustomerFindUnique(...args),
      update: (...args: unknown[]) => mockCustomerUpdate(...args),
      delete: (...args: unknown[]) => mockCustomerDelete(...args),
    },
  },
}));

// Import route handlers after mocks
import { GET, PATCH, DELETE } from '@/app/api/customers/[id]/route';

describe('Single Customer API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/customers/[id]', () => {
    describe('Success (200)', () => {
      it('returns customer by id with discountPercentage', async () => {
        const mockCustomer = {
          id: 'cust-1',
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Acme Corp',
          phone: '+1234567890',
          country: 'Lebanon',
          totalSpent: 5000.50,
          discountPercentage: 15,
          status: 'active',
          isVerified: true,
          orders: [
            { id: 'ord-1', orderNumber: 'ORD-001', total: 1000, status: 'completed', createdAt: new Date() },
          ],
          quotes: [
            { id: 'quote-1', quoteNumber: 'Q-001', total: 500, status: 'pending', createdAt: new Date() },
          ],
          _count: { orders: 5, quotes: 2 },
        };
        mockCustomerFindUnique.mockResolvedValue(mockCustomer);

        const request = createMockRequest('http://localhost/api/customers/cust-1');
        const response = await GET(request, createRouteParams({ id: 'cust-1' }));
        const data = await getResponseJson(response) as {
          id: string;
          totalSpent: number;
          discountPercentage: number;
          orderCount: number;
          quoteCount: number;
        };

        expect(response.status).toBe(200);
        expect(data.id).toBe('cust-1');
        expect(typeof data.totalSpent).toBe('number');
        expect(data.totalSpent).toBe(5000.50);
        expect(typeof data.discountPercentage).toBe('number');
        expect(data.discountPercentage).toBe(15);
        expect(data.orderCount).toBe(5);
        expect(data.quoteCount).toBe(2);
      });

      it('includes recent orders and quotes', async () => {
        const mockCustomer = {
          id: 'cust-1',
          totalSpent: 1000,
          discountPercentage: 0,
          orders: [
            { id: 'ord-1', orderNumber: 'ORD-001', total: 500, status: 'completed', createdAt: new Date() },
          ],
          quotes: [
            { id: 'quote-1', quoteNumber: 'Q-001', total: 300, status: 'pending', createdAt: new Date() },
          ],
          _count: { orders: 1, quotes: 1 },
        };
        mockCustomerFindUnique.mockResolvedValue(mockCustomer);

        const request = createMockRequest('http://localhost/api/customers/cust-1');
        const response = await GET(request, createRouteParams({ id: 'cust-1' }));
        const data = await getResponseJson(response) as { orders: { total: number }[]; quotes: { total: number }[] };

        expect(response.status).toBe(200);
        expect(data.orders).toHaveLength(1);
        expect(typeof data.orders[0].total).toBe('number');
        expect(data.quotes).toHaveLength(1);
        expect(typeof data.quotes[0].total).toBe('number');
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when customer does not exist', async () => {
        mockCustomerFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/customers/nonexistent');
        const response = await GET(request, createRouteParams({ id: 'nonexistent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Customer not found' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockCustomerFindUnique.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/customers/cust-1');
        const response = await GET(request, createRouteParams({ id: 'cust-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch customer' });
      });
    });
  });

  describe('PATCH /api/customers/[id]', () => {
    describe('Success (200)', () => {
      it('updates customer discount percentage', async () => {
        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-1',
          email: 'john@example.com',
          discountPercentage: 0,
        });
        mockCustomerUpdate.mockResolvedValue({
          id: 'cust-1',
          email: 'john@example.com',
          totalSpent: 1000,
          discountPercentage: 25,
        });

        const request = createMockRequest('http://localhost/api/customers/cust-1', {
          method: 'PATCH',
          body: { discountPercentage: 25 },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cust-1' }));
        const data = await getResponseJson(response) as { discountPercentage: number };

        expect(response.status).toBe(200);
        expect(data.discountPercentage).toBe(25);
        expect(mockCustomerUpdate).toHaveBeenCalledWith({
          where: { id: 'cust-1' },
          data: expect.objectContaining({ discountPercentage: 25 }),
        });
      });

      it('updates multiple fields including discount', async () => {
        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-1',
          email: 'old@example.com',
        });
        mockCustomerUpdate.mockResolvedValue({
          id: 'cust-1',
          name: 'Updated Name',
          email: 'old@example.com',
          company: 'New Company',
          totalSpent: 500,
          discountPercentage: 10,
        });

        const request = createMockRequest('http://localhost/api/customers/cust-1', {
          method: 'PATCH',
          body: {
            name: 'Updated Name',
            company: 'New Company',
            discountPercentage: 10,
          },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cust-1' }));
        const data = await getResponseJson(response) as { name: string; discountPercentage: number };

        expect(response.status).toBe(200);
        expect(data.name).toBe('Updated Name');
        expect(data.discountPercentage).toBe(10);
      });

      it('updates customer status', async () => {
        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-1',
          email: 'john@example.com',
          status: 'active',
        });
        mockCustomerUpdate.mockResolvedValue({
          id: 'cust-1',
          status: 'blocked',
          totalSpent: 0,
          discountPercentage: 0,
        });

        const request = createMockRequest('http://localhost/api/customers/cust-1', {
          method: 'PATCH',
          body: { status: 'blocked' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cust-1' }));
        const data = await getResponseJson(response) as { status: string };

        expect(response.status).toBe(200);
        expect(data.status).toBe('blocked');
      });

      it('normalizes email to lowercase', async () => {
        mockCustomerFindUnique
          .mockResolvedValueOnce({ id: 'cust-1', email: 'old@example.com' })
          .mockResolvedValueOnce(null); // No duplicate check
        mockCustomerUpdate.mockResolvedValue({
          id: 'cust-1',
          email: 'new@example.com',
          totalSpent: 0,
          discountPercentage: 0,
        });

        const request = createMockRequest('http://localhost/api/customers/cust-1', {
          method: 'PATCH',
          body: { email: 'NEW@EXAMPLE.COM' },
        });
        await PATCH(request, createRouteParams({ id: 'cust-1' }));

        expect(mockCustomerUpdate).toHaveBeenCalledWith({
          where: { id: 'cust-1' },
          data: expect.objectContaining({ email: 'new@example.com' }),
        });
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when customer does not exist', async () => {
        mockCustomerFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/customers/nonexistent', {
          method: 'PATCH',
          body: { name: 'Updated' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'nonexistent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Customer not found' });
      });
    });

    describe('Conflict (409)', () => {
      it('returns 409 when changing to existing email', async () => {
        mockCustomerFindUnique
          .mockResolvedValueOnce({ id: 'cust-1', email: 'old@example.com' })
          .mockResolvedValueOnce({ id: 'cust-2', email: 'existing@example.com' });

        const request = createMockRequest('http://localhost/api/customers/cust-1', {
          method: 'PATCH',
          body: { email: 'existing@example.com' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cust-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(409);
        expect(data).toEqual({ error: 'A customer with this email already exists' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockCustomerFindUnique.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/customers/cust-1', {
          method: 'PATCH',
          body: { name: 'Updated' },
        });
        const response = await PATCH(request, createRouteParams({ id: 'cust-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to update customer' });
      });
    });
  });

  describe('DELETE /api/customers/[id]', () => {
    describe('Success (200)', () => {
      it('deletes customer without orders', async () => {
        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-1',
          name: 'John Doe',
          _count: { orders: 0 },
        });
        mockCustomerDelete.mockResolvedValue({ id: 'cust-1' });

        const request = createMockRequest('http://localhost/api/customers/cust-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'cust-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data).toEqual({ success: true });
        expect(mockCustomerDelete).toHaveBeenCalledWith({
          where: { id: 'cust-1' },
        });
      });
    });

    describe('Not Found (404)', () => {
      it('returns 404 when customer does not exist', async () => {
        mockCustomerFindUnique.mockResolvedValue(null);

        const request = createMockRequest('http://localhost/api/customers/nonexistent', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'nonexistent' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Customer not found' });
      });
    });

    describe('Validation Error (400)', () => {
      it('returns 400 when customer has orders', async () => {
        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-1',
          name: 'John Doe',
          _count: { orders: 5 },
        });

        const request = createMockRequest('http://localhost/api/customers/cust-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'cust-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Cannot delete customer with orders. Consider blocking instead.' });
        expect(mockCustomerDelete).not.toHaveBeenCalled();
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockCustomerFindUnique.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/customers/cust-1', {
          method: 'DELETE',
        });
        const response = await DELETE(request, createRouteParams({ id: 'cust-1' }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to delete customer' });
      });
    });
  });
});
