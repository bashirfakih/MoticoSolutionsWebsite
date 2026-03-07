/**
 * Messages API Route Tests
 *
 * Tests for /api/messages and /api/messages/[id] endpoints
 */

// Mock next/server BEFORE importing anything that uses it
jest.mock('next/server', () => require('../helpers/testHelpers').nextServerMock);

import { createMockRequest, getResponseJson } from '../helpers/testHelpers';

// Mock Prisma
const mockMessageFindMany = jest.fn();
const mockMessageFindUnique = jest.fn();
const mockMessageCreate = jest.fn();
const mockMessageUpdate = jest.fn();
const mockMessageCount = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    message: {
      findMany: (...args: unknown[]) => mockMessageFindMany(...args),
      findUnique: (...args: unknown[]) => mockMessageFindUnique(...args),
      create: (...args: unknown[]) => mockMessageCreate(...args),
      update: (...args: unknown[]) => mockMessageUpdate(...args),
      count: (...args: unknown[]) => mockMessageCount(...args),
    },
  },
}));

// Mock security modules — tests run without real rate limiting
jest.mock('@/lib/security/rateLimit', () => ({
  enforceRateLimit: () => null,
  CONTACT_FORM_LIMIT: { windowMs: 3600000, maxAttempts: 5, name: 'contact' },
}));

// Import route handlers after mocks
import { GET, POST } from '@/app/api/messages/route';

describe('Messages API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/messages', () => {
    describe('Success (200)', () => {
      it('returns paginated messages list with unread count', async () => {
        const mockMessages = [
          {
            id: 'msg-1',
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Inquiry',
            message: 'Hello',
            status: 'unread',
            repliedBy: null,
          },
        ];
        mockMessageFindMany.mockResolvedValue(mockMessages);
        mockMessageCount
          .mockResolvedValueOnce(1)  // total count
          .mockResolvedValueOnce(1); // unread count

        const request = createMockRequest('http://localhost/api/messages');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: unknown[]; total: number; unreadCount: number };

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(1);
        expect(data.total).toBe(1);
        expect(data.unreadCount).toBe(1);
      });

      it('filters by search query', async () => {
        mockMessageFindMany.mockResolvedValue([]);
        mockMessageCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/messages?search=inquiry');
        await GET(request);

        expect(mockMessageFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                { name: { contains: 'inquiry', mode: 'insensitive' } },
                { email: { contains: 'inquiry', mode: 'insensitive' } },
                { subject: { contains: 'inquiry', mode: 'insensitive' } },
                { message: { contains: 'inquiry', mode: 'insensitive' } },
              ]),
            }),
          })
        );
      });

      it('filters by status', async () => {
        mockMessageFindMany.mockResolvedValue([]);
        mockMessageCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/messages?status=unread');
        await GET(request);

        expect(mockMessageFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ status: 'unread' }),
          })
        );
      });

      it('filters by type', async () => {
        mockMessageFindMany.mockResolvedValue([]);
        mockMessageCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/messages?type=support');
        await GET(request);

        expect(mockMessageFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ type: 'support' }),
          })
        );
      });

      it('filters by starred', async () => {
        mockMessageFindMany.mockResolvedValue([]);
        mockMessageCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/messages?starred=true');
        await GET(request);

        expect(mockMessageFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isStarred: true }),
          })
        );
      });

      it('supports pagination', async () => {
        mockMessageFindMany.mockResolvedValue([]);
        mockMessageCount.mockResolvedValue(50);

        const request = createMockRequest('http://localhost/api/messages?page=2&limit=10');
        const response = await GET(request);
        const data = await getResponseJson(response) as { page: number; totalPages: number };

        expect(data.page).toBe(2);
        expect(data.totalPages).toBe(5);
      });

      it('supports sorting', async () => {
        mockMessageFindMany.mockResolvedValue([]);
        mockMessageCount.mockResolvedValue(0);

        const request = createMockRequest('http://localhost/api/messages?sortBy=name&sortOrder=asc');
        await GET(request);

        expect(mockMessageFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { name: 'asc' },
          })
        );
      });

      it('includes repliedBy user data', async () => {
        mockMessageFindMany.mockResolvedValue([
          {
            id: 'msg-1',
            status: 'replied',
            repliedBy: { id: 'user-1', name: 'Admin' },
          },
        ]);
        mockMessageCount.mockResolvedValue(1);

        const request = createMockRequest('http://localhost/api/messages');
        const response = await GET(request);
        const data = await getResponseJson(response) as { data: { repliedBy: { name: string } }[] };

        expect(data.data[0].repliedBy.name).toBe('Admin');
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on database error', async () => {
        mockMessageCount.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest('http://localhost/api/messages');
        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch messages' });
      });
    });
  });

  describe('POST /api/messages', () => {
    describe('Success (201)', () => {
      it('creates a new message', async () => {
        const newMessage = {
          id: 'msg-new',
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Inquiry',
          message: 'Hello, I have a question.',
          status: 'unread',
          type: 'contact',
        };
        mockMessageCreate.mockResolvedValue(newMessage);

        const request = createMockRequest('http://localhost/api/messages', {
          method: 'POST',
          body: {
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Inquiry',
            message: 'Hello, I have a question.',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response) as { id: string; status: string };

        expect(response.status).toBe(201);
        expect(data.id).toBe('msg-new');
        expect(data.status).toBe('unread');
      });

      it('creates message with optional fields', async () => {
        mockMessageCreate.mockResolvedValue({ id: 'msg-1', status: 'unread' });

        const request = createMockRequest('http://localhost/api/messages', {
          method: 'POST',
          body: {
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Support Request',
            message: 'Need help',
            phone: '+1234567890',
            company: 'Test Company',
            type: 'support',
          },
        });
        await POST(request);

        expect(mockMessageCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            phone: '+1234567890',
            company: 'Test Company',
            type: 'support',
          }),
        });
      });

      it('defaults type to contact', async () => {
        mockMessageCreate.mockResolvedValue({ id: 'msg-1', type: 'contact' });

        const request = createMockRequest('http://localhost/api/messages', {
          method: 'POST',
          body: {
            name: 'Test',
            email: 'test@example.com',
            subject: 'Test',
            message: 'Test message',
          },
        });
        await POST(request);

        expect(mockMessageCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            type: 'contact',
            status: 'unread',
          }),
        });
      });
    });

    describe('Validation Errors (400)', () => {
      it('returns 400 when name is missing', async () => {
        const request = createMockRequest('http://localhost/api/messages', {
          method: 'POST',
          body: {
            email: 'test@example.com',
            subject: 'Test',
            message: 'Test message',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name, email, subject, and message are required' });
      });

      it('returns 400 when email is missing', async () => {
        const request = createMockRequest('http://localhost/api/messages', {
          method: 'POST',
          body: {
            name: 'Test',
            subject: 'Test',
            message: 'Test message',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name, email, subject, and message are required' });
      });

      it('returns 400 when subject is missing', async () => {
        const request = createMockRequest('http://localhost/api/messages', {
          method: 'POST',
          body: {
            name: 'Test',
            email: 'test@example.com',
            message: 'Test message',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name, email, subject, and message are required' });
      });

      it('returns 400 when message is missing', async () => {
        const request = createMockRequest('http://localhost/api/messages', {
          method: 'POST',
          body: {
            name: 'Test',
            email: 'test@example.com',
            subject: 'Test',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Name, email, subject, and message are required' });
      });

      it('returns 400 for invalid email format', async () => {
        const request = createMockRequest('http://localhost/api/messages', {
          method: 'POST',
          body: {
            name: 'Test',
            email: 'invalid-email',
            subject: 'Test',
            message: 'Test message',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Invalid email format' });
      });

      it('returns 400 for email without @', async () => {
        const request = createMockRequest('http://localhost/api/messages', {
          method: 'POST',
          body: {
            name: 'Test',
            email: 'notanemail.com',
            subject: 'Test',
            message: 'Test message',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Invalid email format' });
      });
    });

    describe('Server Error (500)', () => {
      it('returns 500 on creation failure', async () => {
        mockMessageCreate.mockRejectedValue(new Error('Create failed'));

        const request = createMockRequest('http://localhost/api/messages', {
          method: 'POST',
          body: {
            name: 'Test',
            email: 'test@example.com',
            subject: 'Test',
            message: 'Test message',
          },
        });
        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to send message' });
      });
    });
  });
});
