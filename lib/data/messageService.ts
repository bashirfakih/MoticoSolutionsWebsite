/**
 * Message Service for Motico Solutions CRM
 *
 * CRUD operations for messages using localStorage.
 *
 * @module lib/data/messageService
 */

import {
  Message,
  MessageInput,
  MessageFilter,
  MessageStatus,
  MESSAGE_STATUS,
  MESSAGE_TYPE,
  MessageType,
  PaginatedResult,
  PaginationParams,
  generateId,
  getCurrentTimestamp,
} from './types';
import { mockMessages } from './mockMessages';

const STORAGE_KEY = 'motico_messages';
const isClient = typeof window !== 'undefined';

// ═══════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

function initializeStorage(): void {
  if (!isClient) return;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockMessages));
  }
}

function getFromStorage(): Message[] {
  if (!isClient) return mockMessages;
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : mockMessages;
}

function saveToStorage(messages: Message[]): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

// ═══════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════

export function getAllMessages(): Message[] {
  return getFromStorage().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getMessageById(id: string): Message | null {
  return getFromStorage().find(message => message.id === id) || null;
}

export function getMessagesByStatus(status: MessageStatus): Message[] {
  return getAllMessages().filter(message => message.status === status);
}

export function getMessagesByType(type: MessageType): Message[] {
  return getAllMessages().filter(message => message.type === type);
}

export function getUnreadMessages(): Message[] {
  return getMessagesByStatus(MESSAGE_STATUS.UNREAD);
}

export function getStarredMessages(): Message[] {
  return getAllMessages().filter(message => message.isStarred);
}

export function getRecentMessages(limit: number = 10): Message[] {
  return getAllMessages().slice(0, limit);
}

export function searchMessages(query: string): Message[] {
  const searchLower = query.toLowerCase();
  return getAllMessages().filter(
    message =>
      message.name.toLowerCase().includes(searchLower) ||
      message.email.toLowerCase().includes(searchLower) ||
      message.subject.toLowerCase().includes(searchLower) ||
      message.message.toLowerCase().includes(searchLower) ||
      message.company?.toLowerCase().includes(searchLower)
  );
}

export function getMessagesPaginated(
  params: PaginationParams,
  filter?: MessageFilter
): PaginatedResult<Message> {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  let messages = getFromStorage();

  // Apply filters
  if (filter) {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      messages = messages.filter(
        m =>
          m.name.toLowerCase().includes(searchLower) ||
          m.email.toLowerCase().includes(searchLower) ||
          m.subject.toLowerCase().includes(searchLower) ||
          m.message.toLowerCase().includes(searchLower)
      );
    }
    if (filter.status) {
      messages = messages.filter(m => m.status === filter.status);
    }
    if (filter.type) {
      messages = messages.filter(m => m.type === filter.type);
    }
    if (filter.isStarred !== undefined) {
      messages = messages.filter(m => m.isStarred === filter.isStarred);
    }
    if (filter.dateFrom) {
      messages = messages.filter(m => new Date(m.createdAt) >= new Date(filter.dateFrom!));
    }
    if (filter.dateTo) {
      messages = messages.filter(m => new Date(m.createdAt) <= new Date(filter.dateTo!));
    }
  }

  // Sort
  messages = messages.sort((a, b) => {
    const aVal = a[sortBy as keyof Message];
    const bVal = b[sortBy as keyof Message];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const total = messages.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = messages.slice(start, start + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

export function createMessage(input: MessageInput): Message {
  const messages = getFromStorage();
  const now = getCurrentTimestamp();

  const newMessage: Message = {
    id: generateId(),
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    company: input.company || null,
    subject: input.subject,
    message: input.message,
    type: input.type || MESSAGE_TYPE.CONTACT,
    status: MESSAGE_STATUS.UNREAD,
    isStarred: false,
    replyMessage: null,
    repliedAt: null,
    repliedBy: null,
    createdAt: now,
    updatedAt: now,
    readAt: null,
  };

  messages.push(newMessage);
  saveToStorage(messages);

  return newMessage;
}

export function updateMessage(id: string, updates: Partial<Message>): Message {
  const messages = getFromStorage();
  const index = messages.findIndex(m => m.id === id);

  if (index === -1) {
    throw new Error(`Message with ID ${id} not found`);
  }

  messages[index] = {
    ...messages[index],
    ...updates,
    updatedAt: getCurrentTimestamp(),
  };

  saveToStorage(messages);
  return messages[index];
}

export function markAsRead(id: string): Message {
  return updateMessage(id, {
    status: MESSAGE_STATUS.READ,
    readAt: getCurrentTimestamp(),
  });
}

export function markAsUnread(id: string): Message {
  return updateMessage(id, {
    status: MESSAGE_STATUS.UNREAD,
    readAt: null,
  });
}

export function toggleStar(id: string): Message {
  const message = getMessageById(id);
  if (!message) {
    throw new Error(`Message with ID ${id} not found`);
  }
  return updateMessage(id, { isStarred: !message.isStarred });
}

export function replyToMessage(id: string, replyMessage: string, repliedBy: string): Message {
  return updateMessage(id, {
    status: MESSAGE_STATUS.REPLIED,
    replyMessage,
    repliedAt: getCurrentTimestamp(),
    repliedBy,
  });
}

export function archiveMessage(id: string): Message {
  return updateMessage(id, { status: MESSAGE_STATUS.ARCHIVED });
}

export function markAsSpam(id: string): Message {
  return updateMessage(id, { status: MESSAGE_STATUS.SPAM });
}

export function deleteMessage(id: string): boolean {
  const messages = getFromStorage();
  const index = messages.findIndex(m => m.id === id);

  if (index === -1) {
    throw new Error(`Message with ID ${id} not found`);
  }

  messages.splice(index, 1);
  saveToStorage(messages);
  return true;
}

export function deleteMany(ids: string[]): number {
  const messages = getFromStorage();
  const filtered = messages.filter(m => !ids.includes(m.id));
  const deletedCount = messages.length - filtered.length;
  saveToStorage(filtered);
  return deletedCount;
}

export function markManyAsRead(ids: string[]): number {
  const messages = getFromStorage();
  let count = 0;

  messages.forEach((m, i) => {
    if (ids.includes(m.id) && m.status === MESSAGE_STATUS.UNREAD) {
      messages[i] = {
        ...m,
        status: MESSAGE_STATUS.READ,
        readAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };
      count++;
    }
  });

  saveToStorage(messages);
  return count;
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════

export function getMessageStats() {
  const messages = getFromStorage();

  return {
    total: messages.length,
    unread: messages.filter(m => m.status === MESSAGE_STATUS.UNREAD).length,
    read: messages.filter(m => m.status === MESSAGE_STATUS.READ).length,
    replied: messages.filter(m => m.status === MESSAGE_STATUS.REPLIED).length,
    archived: messages.filter(m => m.status === MESSAGE_STATUS.ARCHIVED).length,
    spam: messages.filter(m => m.status === MESSAGE_STATUS.SPAM).length,
    starred: messages.filter(m => m.isStarred).length,
    byType: {
      contact: messages.filter(m => m.type === MESSAGE_TYPE.CONTACT).length,
      support: messages.filter(m => m.type === MESSAGE_TYPE.SUPPORT).length,
      inquiry: messages.filter(m => m.type === MESSAGE_TYPE.INQUIRY).length,
      feedback: messages.filter(m => m.type === MESSAGE_TYPE.FEEDBACK).length,
    },
  };
}

export function getCount(): number {
  return getFromStorage().length;
}

export function getUnreadCount(): number {
  return getUnreadMessages().length;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════

export const messageService = {
  getAll: getAllMessages,
  getById: getMessageById,
  getByStatus: getMessagesByStatus,
  getByType: getMessagesByType,
  getUnread: getUnreadMessages,
  getStarred: getStarredMessages,
  getRecent: getRecentMessages,
  search: searchMessages,
  getPaginated: getMessagesPaginated,
  create: createMessage,
  update: updateMessage,
  markAsRead,
  markAsUnread,
  toggleStar,
  reply: replyToMessage,
  archive: archiveMessage,
  markAsSpam,
  delete: deleteMessage,
  deleteMany,
  markManyAsRead,
  getStats: getMessageStats,
  getCount,
  getUnreadCount,
};
