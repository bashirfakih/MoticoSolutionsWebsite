/**
 * Notification Service
 *
 * Service for managing admin notifications with localStorage persistence.
 *
 * @module lib/notifications/notificationService
 */

import { Notification, NotificationType, EntityType } from './types';

const STORAGE_KEY = 'motico_notifications';
const MAX_NOTIFICATIONS = 50;

// Generate unique ID
function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get all notifications from localStorage
 */
export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save notifications to localStorage
 */
function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep only the most recent MAX_NOTIFICATIONS
    const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Create a new notification
 */
export function createNotification(params: {
  type: NotificationType;
  title: string;
  subtitle: string;
  entityId: string;
  entityType: EntityType;
  href: string;
}): Notification | null {
  try {
    const notification: Notification = {
      id: generateId(),
      type: params.type,
      title: params.title,
      subtitle: params.subtitle,
      entityId: params.entityId,
      entityType: params.entityType,
      href: params.href,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const notifications = getNotifications();
    notifications.unshift(notification);
    saveNotifications(notifications);

    // Dispatch custom event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-update', { detail: notification }));
    }

    return notification;
  } catch {
    return null;
  }
}

/**
 * Mark a notification as read
 */
export function markAsRead(notificationId: string): boolean {
  try {
    const notifications = getNotifications();
    const index = notifications.findIndex((n) => n.id === notificationId);
    if (index === -1) return false;

    notifications[index].isRead = true;
    saveNotifications(notifications);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-update'));
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): boolean {
  try {
    const notifications = getNotifications();
    notifications.forEach((n) => {
      n.isRead = true;
    });
    saveNotifications(notifications);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-update'));
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): boolean {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('notification-update'));
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a single notification
 */
export function deleteNotification(notificationId: string): boolean {
  try {
    const notifications = getNotifications();
    const filtered = notifications.filter((n) => n.id !== notificationId);
    saveNotifications(filtered);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-update'));
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
  try {
    const notifications = getNotifications();
    return notifications.filter((n) => !n.isRead).length;
  } catch {
    return 0;
  }
}

/**
 * Check if notifications have been seeded
 */
function hasBeenSeeded(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(`${STORAGE_KEY}_seeded`) === 'true';
  } catch {
    return true;
  }
}

/**
 * Mark as seeded
 */
function markAsSeeded(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_seeded`, 'true');
  } catch {
    // Ignore
  }
}

/**
 * Seed initial notifications (only on first load)
 */
export function seedNotifications(): void {
  if (hasBeenSeeded()) return;

  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  const seedData: Array<{
    type: NotificationType;
    title: string;
    subtitle: string;
    entityId: string;
    entityType: EntityType;
    href: string;
    hoursAgo: number;
  }> = [
    {
      type: 'quote_request',
      title: 'New quote request from John Smith',
      subtitle: 'Requesting pricing for 5 items',
      entityId: 'quote-1',
      entityType: 'quote',
      href: '/admin/quotes?id=quote-1',
      hoursAgo: 0.5,
    },
    {
      type: 'new_message',
      title: 'New message from Sarah Johnson',
      subtitle: 'Product inquiry: Abrasive Belt 100x610mm',
      entityId: 'msg-1',
      entityType: 'message',
      href: '/admin/messages?id=msg-1',
      hoursAgo: 2,
    },
    {
      type: 'order_status',
      title: 'Order ORD-2024-045 marked as Shipped',
      subtitle: 'Customer: Michael Brown',
      entityId: 'order-1',
      entityType: 'order',
      href: '/admin/orders/order-1',
      hoursAgo: 4,
    },
    {
      type: 'low_stock',
      title: 'Grinding Sleeve 90x100mm is running low',
      subtitle: '5 remaining in stock',
      entityId: 'prod-1',
      entityType: 'product',
      href: '/admin/products/prod-1',
      hoursAgo: 8,
    },
    {
      type: 'new_customer',
      title: 'New customer ABC Industries joined',
      subtitle: 'From United States',
      entityId: 'cust-1',
      entityType: 'customer',
      href: '/admin/customers?id=cust-1',
      hoursAgo: 12,
    },
    {
      type: 'out_of_stock',
      title: 'Abrasive Belt 150x2000mm is now out of stock',
      subtitle: 'Requires immediate restock',
      entityId: 'prod-2',
      entityType: 'product',
      href: '/admin/products/prod-2',
      hoursAgo: 24,
    },
    {
      type: 'order_status',
      title: 'Order ORD-2024-042 marked as Delivered',
      subtitle: 'Customer: Tech Solutions Ltd',
      entityId: 'order-2',
      entityType: 'order',
      href: '/admin/orders/order-2',
      hoursAgo: 36,
    },
    {
      type: 'quote_request',
      title: 'New quote request from Industrial Corp',
      subtitle: 'Bulk order inquiry',
      entityId: 'quote-2',
      entityType: 'quote',
      href: '/admin/quotes?id=quote-2',
      hoursAgo: 48,
    },
  ];

  const notifications: Notification[] = seedData.map((item, index) => ({
    id: `seed_${index}`,
    type: item.type,
    title: item.title,
    subtitle: item.subtitle,
    entityId: item.entityId,
    entityType: item.entityType,
    href: item.href,
    isRead: item.hoursAgo > 24, // Mark older ones as read
    createdAt: new Date(now - item.hoursAgo * hour).toISOString(),
  }));

  saveNotifications(notifications);
  markAsSeeded();
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS FOR SERVICE LAYER INTEGRATION
// ═══════════════════════════════════════════════════════════════

/**
 * Notify: New quote request received
 */
export function notifyQuoteRequest(customerName: string, quoteId: string): void {
  try {
    createNotification({
      type: 'quote_request',
      title: `New quote request from ${customerName}`,
      subtitle: 'Awaiting your response',
      entityId: quoteId,
      entityType: 'quote',
      href: `/admin/quotes?id=${quoteId}`,
    });
  } catch {
    // Never break core operations
  }
}

/**
 * Notify: Low stock alert
 */
export function notifyLowStock(productName: string, quantity: number, productId: string): void {
  try {
    createNotification({
      type: 'low_stock',
      title: `${productName} is running low`,
      subtitle: `${quantity} remaining in stock`,
      entityId: productId,
      entityType: 'product',
      href: `/admin/products/${productId}`,
    });
  } catch {
    // Never break core operations
  }
}

/**
 * Notify: Out of stock alert
 */
export function notifyOutOfStock(productName: string, productId: string): void {
  try {
    createNotification({
      type: 'out_of_stock',
      title: `${productName} is now out of stock`,
      subtitle: 'Requires immediate restock',
      entityId: productId,
      entityType: 'product',
      href: `/admin/products/${productId}`,
    });
  } catch {
    // Never break core operations
  }
}

/**
 * Notify: New message received
 */
export function notifyNewMessage(senderName: string, subject: string, messageId: string): void {
  try {
    createNotification({
      type: 'new_message',
      title: `New message from ${senderName}`,
      subtitle: subject,
      entityId: messageId,
      entityType: 'message',
      href: `/admin/messages?id=${messageId}`,
    });
  } catch {
    // Never break core operations
  }
}

/**
 * Notify: Order status changed
 */
export function notifyOrderStatusChange(orderNumber: string, status: string, orderId: string): void {
  try {
    createNotification({
      type: 'order_status',
      title: `Order ${orderNumber} marked as ${status}`,
      subtitle: 'Status updated successfully',
      entityId: orderId,
      entityType: 'order',
      href: `/admin/orders/${orderId}`,
    });
  } catch {
    // Never break core operations
  }
}

/**
 * Notify: New customer registered
 */
export function notifyNewCustomer(customerName: string, country: string, customerId: string): void {
  try {
    createNotification({
      type: 'new_customer',
      title: `New customer ${customerName} joined`,
      subtitle: `From ${country || 'Unknown location'}`,
      entityId: customerId,
      entityType: 'customer',
      href: `/admin/customers?id=${customerId}`,
    });
  } catch {
    // Never break core operations
  }
}

// Export service object
export const notificationService = {
  getAll: getNotifications,
  create: createNotification,
  markAsRead,
  markAllAsRead,
  clearAll: clearAllNotifications,
  delete: deleteNotification,
  getUnreadCount,
  seed: seedNotifications,
  // Notification helpers
  notifyQuoteRequest,
  notifyLowStock,
  notifyOutOfStock,
  notifyNewMessage,
  notifyOrderStatusChange,
  notifyNewCustomer,
};
