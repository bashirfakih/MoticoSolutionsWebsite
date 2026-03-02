/**
 * NotificationBell Component
 *
 * Notification bell with dropdown panel for admin notifications.
 * Shows unread count badge and allows marking notifications as read.
 *
 * @module components/admin/NotificationBell
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  FileText,
  Package,
  PackageX,
  MessageSquare,
  ShoppingCart,
  UserPlus,
  Check,
  Trash2,
  X,
} from 'lucide-react';
import {
  Notification,
  NotificationType,
  NOTIFICATION_CONFIG,
} from '@/lib/notifications/types';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  getUnreadCount,
  seedNotifications,
} from '@/lib/notifications/notificationService';

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type: NotificationType): React.ReactNode {
  const iconMap: Record<NotificationType, React.ReactNode> = {
    quote_request: <FileText className="w-4 h-4" />,
    low_stock: <Package className="w-4 h-4" />,
    out_of_stock: <PackageX className="w-4 h-4" />,
    new_message: <MessageSquare className="w-4 h-4" />,
    order_status: <ShoppingCart className="w-4 h-4" />,
    new_customer: <UserPlus className="w-4 h-4" />,
  };
  return iconMap[type] || <Bell className="w-4 h-4" />;
}

function getNotificationColor(type: NotificationType): string {
  const colorMap: Record<NotificationType, string> = {
    quote_request: 'bg-purple-100 text-purple-600',
    low_stock: 'bg-yellow-100 text-yellow-600',
    out_of_stock: 'bg-red-100 text-red-600',
    new_message: 'bg-blue-100 text-blue-600',
    order_status: 'bg-green-100 text-green-600',
    new_customer: 'bg-teal-100 text-teal-600',
  };
  return colorMap[type] || 'bg-gray-100 text-gray-600';
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onClick: (notification: Notification) => void;
}

function NotificationItem({ notification, onRead, onClick }: NotificationItemProps) {
  return (
    <button
      onClick={() => onClick(notification)}
      className={`w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
        !notification.isRead ? 'bg-blue-50/50' : ''
      }`}
      role="menuitem"
    >
      {/* Icon */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getNotificationColor(
          notification.type
        )}`}
      >
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p className={`text-sm truncate ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{notification.subtitle}</p>
        <p className="text-xs text-gray-400 mt-1">{getRelativeTime(notification.createdAt)}</p>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load notifications
  const loadNotifications = useCallback(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  }, []);

  // Seed and load on mount
  useEffect(() => {
    seedNotifications();
    loadNotifications();
  }, [loadNotifications]);

  // Listen for notification updates
  useEffect(() => {
    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('notification-update', handleUpdate);
    return () => window.removeEventListener('notification-update', handleUpdate);
  }, [loadNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle notification click
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.isRead) {
        markAsRead(notification.id);
        loadNotifications();
      }
      setIsOpen(false);
      router.push(notification.href);
    },
    [router, loadNotifications]
  );

  // Handle mark all as read
  const handleMarkAllRead = useCallback(() => {
    markAllAsRead();
    loadNotifications();
  }, [loadNotifications]);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    clearAllNotifications();
    loadNotifications();
    setIsOpen(false);
  }, [loadNotifications]);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#004D8B] hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                  onClick={handleNotificationClick}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 text-center">
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
