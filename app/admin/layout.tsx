'use client';

/**
 * Admin Layout for Motico Solutions
 *
 * Protected layout with sidebar navigation for admin users.
 * All admin routes are wrapped with role-based protection.
 *
 * @module app/admin/layout
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import GlobalSearch from '@/components/admin/GlobalSearch';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

// Badge counts interface
interface BadgeCounts {
  pendingOrders: number;
  pendingQuotes: number;
  unreadMessages: number;
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION CONFIG
// ═══════════════════════════════════════════════════════════════

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    badgeKey: null,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    badgeKey: 'pendingOrders' as const,
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    badgeKey: null,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    badgeKey: null,
  },
  {
    name: 'Quotes',
    href: '/admin/quotes',
    icon: FileText,
    badgeKey: 'pendingQuotes' as const,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    badgeKey: null,
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
    badgeKey: 'unreadMessages' as const,
  },
];

const secondaryNavigation = [
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    name: 'Help & Support',
    href: '/admin/help',
    icon: HelpCircle,
  },
];

// ═══════════════════════════════════════════════════════════════
// SIDEBAR COMPONENT
// ═══════════════════════════════════════════════════════════════

function Sidebar({
  isOpen,
  onClose,
  badgeCounts,
}: {
  isOpen: boolean;
  onClose: () => void;
  badgeCounts: BadgeCounts;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-[#001f3f] transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo-motico-solutions.png"
                alt="Motico Solutions"
                width={140}
                height={42}
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${active
                        ? 'bg-[#004D8B] text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{item.name}</span>
                    {item.badgeKey && badgeCounts[item.badgeKey] > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {badgeCounts[item.badgeKey]}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Secondary Navigation */}
            <div className="mt-8 pt-4 border-t border-white/10">
              <p className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                Settings
              </p>
              <div className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${active
                          ? 'bg-[#004D8B] text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#004D8B] flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {user?.email || 'admin@moticosolutions.com'}
                </p>
              </div>
              <button className="p-1 text-white/60 hover:text-white transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOP HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════

function TopHeader({ onMenuClick, totalNotifications }: { onMenuClick: () => void; totalNotifications: number }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden sm:block">
          <GlobalSearch />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {totalNotifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
              {totalNotifications > 99 ? '99+' : totalNotifications}
            </span>
          )}
        </button>

        {/* View Site */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          View Site
        </Link>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════
// LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════════

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    pendingOrders: 0,
    pendingQuotes: 0,
    unreadMessages: 0,
  });

  // Fetch badge counts from API
  const fetchBadgeCounts = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setBadgeCounts({
          pendingOrders: data.orders?.byStatus?.pending || 0,
          pendingQuotes: data.alerts?.pendingQuotes || 0,
          unreadMessages: data.alerts?.unreadMessages || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch badge counts:', error);
    }
  }, []);

  useEffect(() => {
    fetchBadgeCounts();
    // Refresh counts every 60 seconds
    const interval = setInterval(fetchBadgeCounts, 60000);
    return () => clearInterval(interval);
  }, [fetchBadgeCounts]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} badgeCounts={badgeCounts} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <TopHeader
          onMenuClick={() => setSidebarOpen(true)}
          totalNotifications={badgeCounts.pendingOrders + badgeCounts.pendingQuotes + badgeCounts.unreadMessages}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPORTED LAYOUT
// ═══════════════════════════════════════════════════════════════

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminRoute>
  );
}
