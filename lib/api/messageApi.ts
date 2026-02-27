/**
 * Message API Client
 *
 * Client-side service for message API operations.
 *
 * @module lib/api/messageApi
 */

import { Message, MessageInput, PaginatedResult, PaginationParams, MessageStatus, MessageType } from '@/lib/data/types';

const API_BASE = '/api/messages';

export interface MessageFilter {
  search?: string;
  status?: MessageStatus;
  type?: MessageType;
  starred?: boolean;
}

export interface MessageListResult extends PaginatedResult<Message> {
  unreadCount: number;
}

/**
 * Fetch all messages (or with filters/pagination)
 */
export async function getMessages(
  params?: PaginationParams,
  filter?: MessageFilter
): Promise<MessageListResult> {
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
    if (filter.type) searchParams.set('type', filter.type);
    if (filter.starred !== undefined) searchParams.set('starred', String(filter.starred));
  }

  const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE;
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch messages');
  }

  return res.json();
}

/**
 * Fetch unread messages
 */
export async function getUnreadMessages(): Promise<Message[]> {
  const result = await getMessages(undefined, { status: 'unread' });
  return result.data;
}

/**
 * Fetch starred messages
 */
export async function getStarredMessages(): Promise<Message[]> {
  const result = await getMessages(undefined, { starred: true });
  return result.data;
}

/**
 * Fetch a single message by ID
 */
export async function getMessageById(id: string): Promise<Message | null> {
  const res = await fetch(`${API_BASE}/${id}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch message');
  }

  return res.json();
}

/**
 * Create a new message (contact form)
 */
export async function createMessage(input: MessageInput): Promise<Message> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to send message');
  }

  return res.json();
}

/**
 * Update a message
 */
export async function updateMessage(id: string, input: Partial<Message>): Promise<Message> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update message');
  }

  return res.json();
}

/**
 * Mark message as read
 */
export async function markAsRead(id: string): Promise<Message> {
  return updateMessage(id, { status: 'read' });
}

/**
 * Mark message as archived
 */
export async function archiveMessage(id: string): Promise<Message> {
  return updateMessage(id, { status: 'archived' });
}

/**
 * Mark message as spam
 */
export async function markAsSpam(id: string): Promise<Message> {
  return updateMessage(id, { status: 'spam' });
}

/**
 * Toggle starred status
 */
export async function toggleStarred(id: string): Promise<Message> {
  const message = await getMessageById(id);
  if (!message) {
    throw new Error('Message not found');
  }
  return updateMessage(id, { isStarred: !message.isStarred });
}

/**
 * Reply to a message
 */
export async function replyToMessage(id: string, replyMessage: string, repliedBy?: string): Promise<Message> {
  return updateMessage(id, {
    replyMessage,
    repliedBy,
    status: 'replied',
  });
}

/**
 * Delete a message
 */
export async function deleteMessage(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete message');
  }

  return true;
}

/**
 * Message API service object (for compatibility with existing code)
 */
export const messageApiService = {
  getAll: async () => (await getMessages()).data,
  getUnread: getUnreadMessages,
  getStarred: getStarredMessages,
  getPaginated: getMessages,
  getById: getMessageById,
  create: createMessage,
  update: updateMessage,
  markAsRead,
  archive: archiveMessage,
  markAsSpam,
  toggleStarred,
  reply: replyToMessage,
  delete: deleteMessage,
};
