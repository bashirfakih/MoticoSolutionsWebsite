/**
 * Message Service Unit Tests
 *
 * Tests for CRUD operations and utility functions.
 *
 * @module __tests__/lib/data/messageService.test
 */

import { messageService } from '@/lib/data/messageService';
import { MESSAGE_STATUS, MESSAGE_TYPE } from '@/lib/data/types';

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

describe('messageService', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all messages sorted by createdAt descending', () => {
      const messages = messageService.getAll();
      expect(messages).toBeDefined();
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);

      // Check sorting (newest first)
      for (let i = 1; i < messages.length; i++) {
        expect(new Date(messages[i].createdAt).getTime())
          .toBeLessThanOrEqual(new Date(messages[i - 1].createdAt).getTime());
      }
    });
  });

  describe('getById', () => {
    it('should return message when found', () => {
      const messages = messageService.getAll();
      const firstMessage = messages[0];
      const result = messageService.getById(firstMessage.id);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(firstMessage.id);
      expect(result?.subject).toBe(firstMessage.subject);
    });

    it('should return null when not found', () => {
      const result = messageService.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getByStatus', () => {
    it('should return messages with specific status', () => {
      const unreadMessages = messageService.getByStatus(MESSAGE_STATUS.UNREAD);
      expect(Array.isArray(unreadMessages)).toBe(true);
      unreadMessages.forEach(message => {
        expect(message.status).toBe(MESSAGE_STATUS.UNREAD);
      });
    });
  });

  describe('getByType', () => {
    it('should return messages with specific type', () => {
      const contactMessages = messageService.getByType(MESSAGE_TYPE.CONTACT);
      expect(Array.isArray(contactMessages)).toBe(true);
      contactMessages.forEach(message => {
        expect(message.type).toBe(MESSAGE_TYPE.CONTACT);
      });
    });
  });

  describe('getUnread', () => {
    it('should return only unread messages', () => {
      const unreadMessages = messageService.getUnread();
      unreadMessages.forEach(message => {
        expect(message.status).toBe(MESSAGE_STATUS.UNREAD);
      });
    });
  });

  describe('getStarred', () => {
    it('should return only starred messages', () => {
      const starredMessages = messageService.getStarred();
      starredMessages.forEach(message => {
        expect(message.isStarred).toBe(true);
      });
    });
  });

  describe('getRecent', () => {
    it('should return limited number of recent messages', () => {
      const recentMessages = messageService.getRecent(3);
      expect(recentMessages.length).toBeLessThanOrEqual(3);
    });
  });

  describe('search', () => {
    it('should find messages by name', () => {
      const messages = messageService.getAll();
      const senderName = messages[0].name.split(' ')[0]; // First name
      const results = messageService.search(senderName);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find messages by email', () => {
      const messages = messageService.getAll();
      const email = messages[0].email;
      const results = messageService.search(email);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find messages by subject', () => {
      const messages = messageService.getAll();
      const subject = messages[0].subject.split(' ')[0]; // First word
      const results = messageService.search(subject);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = messageService.search('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new message', () => {
      const newMessage = messageService.create({
        name: 'Test Sender',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.',
        type: MESSAGE_TYPE.CONTACT,
      });

      expect(newMessage).toBeDefined();
      expect(newMessage.id).toBeDefined();
      expect(newMessage.name).toBe('Test Sender');
      expect(newMessage.subject).toBe('Test Subject');
      expect(newMessage.status).toBe(MESSAGE_STATUS.UNREAD);
      expect(newMessage.isStarred).toBe(false);
      expect(newMessage.createdAt).toBeDefined();

      // Verify it was saved
      const retrieved = messageService.getById(newMessage.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Test Sender');
    });

    it('should create message with optional fields', () => {
      const newMessage = messageService.create({
        name: 'Test Sender',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message',
        phone: '+961 1 234 567',
        company: 'Test Company',
      });

      expect(newMessage.phone).toBe('+961 1 234 567');
      expect(newMessage.company).toBe('Test Company');
    });
  });

  describe('update', () => {
    it('should update an existing message', () => {
      const messages = messageService.getAll();
      const messageToUpdate = messages[0];

      const updated = messageService.update(messageToUpdate.id, {
        isStarred: true,
      });

      expect(updated.isStarred).toBe(true);
      expect(updated.id).toBe(messageToUpdate.id);
      expect(updated.updatedAt).not.toBe(messageToUpdate.updatedAt);
    });

    it('should throw error for non-existent message', () => {
      expect(() => {
        messageService.update('non-existent-id', { isStarred: true });
      }).toThrow(/not found/);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', () => {
      const messages = messageService.getAll();
      const unreadMessage = messages.find(m => m.status === MESSAGE_STATUS.UNREAD);

      if (unreadMessage) {
        const read = messageService.markAsRead(unreadMessage.id);
        expect(read.status).toBe(MESSAGE_STATUS.READ);
        expect(read.readAt).toBeDefined();
      }
    });
  });

  describe('markAsUnread', () => {
    it('should mark message as unread', () => {
      const messages = messageService.getAll();
      const readMessage = messages.find(m => m.status === MESSAGE_STATUS.READ);

      if (readMessage) {
        const unread = messageService.markAsUnread(readMessage.id);
        expect(unread.status).toBe(MESSAGE_STATUS.UNREAD);
        expect(unread.readAt).toBeNull();
      }
    });
  });

  describe('toggleStar', () => {
    it('should toggle star status', () => {
      const messages = messageService.getAll();
      const message = messages[0];
      const originalStarred = message.isStarred;

      const toggled = messageService.toggleStar(message.id);
      expect(toggled.isStarred).toBe(!originalStarred);

      // Toggle back
      const toggledBack = messageService.toggleStar(message.id);
      expect(toggledBack.isStarred).toBe(originalStarred);
    });
  });

  describe('reply', () => {
    it('should reply to a message', () => {
      const newMessage = messageService.create({
        name: 'Reply Test',
        email: 'reply@test.com',
        subject: 'Test Reply',
        message: 'Need a reply',
      });

      const replied = messageService.reply(newMessage.id, 'This is my reply.', 'admin');

      expect(replied.status).toBe(MESSAGE_STATUS.REPLIED);
      expect(replied.replyMessage).toBe('This is my reply.');
      expect(replied.repliedBy).toBe('admin');
      expect(replied.repliedAt).toBeDefined();
    });
  });

  describe('archive', () => {
    it('should archive a message', () => {
      const messages = messageService.getAll();
      const message = messages[0];

      const archived = messageService.archive(message.id);
      expect(archived.status).toBe(MESSAGE_STATUS.ARCHIVED);
    });
  });

  describe('markAsSpam', () => {
    it('should mark message as spam', () => {
      const messages = messageService.getAll();
      const message = messages[0];

      const spam = messageService.markAsSpam(message.id);
      expect(spam.status).toBe(MESSAGE_STATUS.SPAM);
    });
  });

  describe('delete', () => {
    it('should delete an existing message', () => {
      const newMessage = messageService.create({
        name: 'Message To Delete',
        email: 'delete@test.com',
        subject: 'Delete Me',
        message: 'This will be deleted',
      });

      const result = messageService.delete(newMessage.id);
      expect(result).toBe(true);

      const retrieved = messageService.getById(newMessage.id);
      expect(retrieved).toBeNull();
    });

    it('should throw error for non-existent message', () => {
      expect(() => {
        messageService.delete('non-existent-id');
      }).toThrow(/not found/);
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple messages', () => {
      const msg1 = messageService.create({
        name: 'Delete 1',
        email: 'del1@test.com',
        subject: 'Del 1',
        message: 'Delete me 1',
      });
      const msg2 = messageService.create({
        name: 'Delete 2',
        email: 'del2@test.com',
        subject: 'Del 2',
        message: 'Delete me 2',
      });

      const deletedCount = messageService.deleteMany([msg1.id, msg2.id]);
      expect(deletedCount).toBe(2);

      expect(messageService.getById(msg1.id)).toBeNull();
      expect(messageService.getById(msg2.id)).toBeNull();
    });
  });

  describe('markManyAsRead', () => {
    it('should mark multiple messages as read', () => {
      const msg1 = messageService.create({
        name: 'Read 1',
        email: 'read1@test.com',
        subject: 'Read 1',
        message: 'Mark as read 1',
      });
      const msg2 = messageService.create({
        name: 'Read 2',
        email: 'read2@test.com',
        subject: 'Read 2',
        message: 'Mark as read 2',
      });

      const readCount = messageService.markManyAsRead([msg1.id, msg2.id]);
      expect(readCount).toBe(2);

      const retrieved1 = messageService.getById(msg1.id);
      const retrieved2 = messageService.getById(msg2.id);
      expect(retrieved1?.status).toBe(MESSAGE_STATUS.READ);
      expect(retrieved2?.status).toBe(MESSAGE_STATUS.READ);
    });
  });

  describe('getPaginated', () => {
    it('should return paginated results', () => {
      const result = messageService.getPaginated({ page: 1, limit: 5 });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.total).toBeGreaterThan(0);
      expect(result.totalPages).toBeDefined();
    });

    it('should support filtering by status', () => {
      const result = messageService.getPaginated(
        { page: 1, limit: 10 },
        { status: MESSAGE_STATUS.UNREAD }
      );

      result.data.forEach(message => {
        expect(message.status).toBe(MESSAGE_STATUS.UNREAD);
      });
    });

    it('should support filtering by type', () => {
      const result = messageService.getPaginated(
        { page: 1, limit: 10 },
        { type: MESSAGE_TYPE.CONTACT }
      );

      result.data.forEach(message => {
        expect(message.type).toBe(MESSAGE_TYPE.CONTACT);
      });
    });

    it('should support filtering by starred', () => {
      const result = messageService.getPaginated(
        { page: 1, limit: 10 },
        { isStarred: true }
      );

      result.data.forEach(message => {
        expect(message.isStarred).toBe(true);
      });
    });
  });

  describe('getStats', () => {
    it('should return message statistics', () => {
      const stats = messageService.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.unread).toBe('number');
      expect(typeof stats.read).toBe('number');
      expect(typeof stats.replied).toBe('number');
      expect(typeof stats.archived).toBe('number');
      expect(typeof stats.spam).toBe('number');
      expect(typeof stats.starred).toBe('number');
      expect(stats.byType).toBeDefined();
      expect(typeof stats.byType.contact).toBe('number');
      expect(typeof stats.byType.support).toBe('number');
      expect(typeof stats.byType.inquiry).toBe('number');
      expect(typeof stats.byType.feedback).toBe('number');
    });
  });

  describe('getCount', () => {
    it('should return total message count', () => {
      const count = messageService.getCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', () => {
      const unreadCount = messageService.getUnreadCount();
      const totalCount = messageService.getCount();
      expect(typeof unreadCount).toBe('number');
      expect(unreadCount).toBeLessThanOrEqual(totalCount);
    });
  });

  describe('getPaginated - additional filters', () => {
    it('should filter by search term', () => {
      const messages = messageService.getAll();
      const subject = messages[0].subject;

      const result = messageService.getPaginated(
        { page: 1, limit: 100 },
        { search: subject }
      );

      expect(result.data.some(m => m.subject === subject)).toBe(true);
    });

    it('should filter by dateFrom', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = messageService.getPaginated(
        { page: 1, limit: 100 },
        { dateFrom: yesterday.toISOString() }
      );

      result.data.forEach(m => {
        expect(new Date(m.createdAt).getTime()).toBeGreaterThanOrEqual(yesterday.getTime());
      });
    });

    it('should filter by dateTo', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = messageService.getPaginated(
        { page: 1, limit: 100 },
        { dateTo: tomorrow.toISOString() }
      );

      result.data.forEach(m => {
        expect(new Date(m.createdAt).getTime()).toBeLessThanOrEqual(tomorrow.getTime());
      });
    });

    it('should filter by isStarred false', () => {
      const result = messageService.getPaginated(
        { page: 1, limit: 100 },
        { isStarred: false }
      );

      result.data.forEach(m => {
        expect(m.isStarred).toBe(false);
      });
    });

    it('should sort by string field ascending', () => {
      const result = messageService.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].name.localeCompare(result.data[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort by string field descending', () => {
      const result = messageService.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'desc',
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].name.localeCompare(result.data[i - 1].name)).toBeLessThanOrEqual(0);
      }
    });

    it('should calculate hasMore correctly', () => {
      const result = messageService.getPaginated({ page: 1, limit: 1 });

      if (result.total > 1) {
        expect(result.hasMore).toBe(true);
      }

      const lastPage = messageService.getPaginated({ page: result.totalPages, limit: 1 });
      expect(lastPage.hasMore).toBe(false);
    });
  });

  describe('create - additional options', () => {
    it('should use default type when not provided', () => {
      const newMessage = messageService.create({
        name: 'Default Type Test',
        email: 'defaulttype@test.com',
        subject: 'Test',
        message: 'Test message',
      });

      expect(newMessage.type).toBe(MESSAGE_TYPE.CONTACT);

      // Cleanup
      messageService.delete(newMessage.id);
    });

    it('should handle null optional fields', () => {
      const newMessage = messageService.create({
        name: 'Minimal Message',
        email: 'minimal@test.com',
        subject: 'Minimal',
        message: 'Minimal message',
      });

      expect(newMessage.phone).toBeNull();
      expect(newMessage.company).toBeNull();

      // Cleanup
      messageService.delete(newMessage.id);
    });
  });

  describe('search - additional coverage', () => {
    it('should search by message content', () => {
      const newMessage = messageService.create({
        name: 'Content Search',
        email: 'contentsearch@test.com',
        subject: 'Search Test',
        message: 'UniqueMessageContentXYZ123',
      });

      const results = messageService.search('UniqueMessageContentXYZ123');
      expect(results.some(m => m.id === newMessage.id)).toBe(true);

      // Cleanup
      messageService.delete(newMessage.id);
    });

    it('should search by company', () => {
      const newMessage = messageService.create({
        name: 'Company Search',
        email: 'companysearch@test.com',
        subject: 'Company Test',
        message: 'Test message',
        company: 'UniqueCompanySearchXYZ999',
      });

      const results = messageService.search('UniqueCompanySearchXYZ999');
      expect(results.some(m => m.id === newMessage.id)).toBe(true);

      // Cleanup
      messageService.delete(newMessage.id);
    });
  });

  describe('toggleStar - error handling', () => {
    it('should throw error for non-existent message', () => {
      expect(() => {
        messageService.toggleStar('non-existent-id-xyz');
      }).toThrow(/not found/);
    });
  });

  describe('markManyAsRead - additional coverage', () => {
    it('should not count already read messages', () => {
      // Create a message and mark it as read first
      const msg1 = messageService.create({
        name: 'Already Read',
        email: 'alreadyread@test.com',
        subject: 'Already Read',
        message: 'Already read message',
      });

      // Mark it as read
      messageService.markAsRead(msg1.id);

      // Now try to mark it as read again with markManyAsRead
      const readCount = messageService.markManyAsRead([msg1.id]);
      expect(readCount).toBe(0); // Should be 0 since it was already read

      // Cleanup
      messageService.delete(msg1.id);
    });
  });
});
