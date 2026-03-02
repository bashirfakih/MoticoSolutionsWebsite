/**
 * Notification System Types
 *
 * Type definitions for the admin notification system.
 *
 * @module lib/notifications/types
 */

export type NotificationType =
  | 'quote_request'
  | 'low_stock'
  | 'out_of_stock'
  | 'new_message'
  | 'order_status'
  | 'new_customer';

export type EntityType = 'quote' | 'product' | 'message' | 'order' | 'customer';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  subtitle: string;
  entityId: string;
  entityType: EntityType;
  href: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationConfig {
  type: NotificationType;
  icon: string;
  color: string;
}

export const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  quote_request: {
    type: 'quote_request',
    icon: 'FileText',
    color: 'purple',
  },
  low_stock: {
    type: 'low_stock',
    icon: 'Package',
    color: 'yellow',
  },
  out_of_stock: {
    type: 'out_of_stock',
    icon: 'PackageX',
    color: 'red',
  },
  new_message: {
    type: 'new_message',
    icon: 'MessageSquare',
    color: 'blue',
  },
  order_status: {
    type: 'order_status',
    icon: 'ShoppingCart',
    color: 'green',
  },
  new_customer: {
    type: 'new_customer',
    icon: 'UserPlus',
    color: 'teal',
  },
};
