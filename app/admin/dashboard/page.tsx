'use client';

/**
 * Admin Dashboard Page for Motico Solutions
 *
 * Overview dashboard with stats, recent activity, and quick actions.
 * Fetches real data from the dashboard stats API.
 *
 * @module app/admin/dashboard/page
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDashboardStats, DashboardStats } from '@/lib/api/dashboardApi';
import {
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  FileText,
  Plus,
  Mail,
  Loader2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface StatCardData {
  name: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
  href: string;
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

function StatCard({ stat }: { stat: StatCardData }) {
  const Icon = stat.icon;
  const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : null;

  return (
    <Link
      href={stat.href}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${stat.color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: stat.color }} />
        </div>
        {TrendIcon && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <TrendIcon className="w-4 h-4" />
            {stat.change}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.name}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-[#004D8B] dark:group-hover:text-blue-400 transition-colors">
        {stat.value}
      </p>
    </Link>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      {status}
    </span>
  );
}


function LoadingState() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004D8B] mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load dashboard
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await getDashboardStats();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Build stats from API data
  const stats: StatCardData[] = data
    ? [
        {
          name: 'Orders This Month',
          value: formatNumber(data.overview.ordersThisMonth),
          change: formatChange(data.overview.ordersChange),
          trend: data.overview.ordersChange >= 0 ? 'up' : 'down',
          icon: ShoppingCart,
          color: '#004D8B',
          href: '/admin/orders',
        },
        {
          name: 'Active Customers',
          value: formatNumber(data.overview.totalCustomers),
          change: '',
          trend: 'neutral',
          icon: Users,
          color: '#16a34a',
          href: '/admin/customers',
        },
        {
          name: 'Monthly Revenue',
          value: formatCurrency(data.overview.totalRevenue),
          change: formatChange(data.overview.revenueChange),
          trend: data.overview.revenueChange >= 0 ? 'up' : 'down',
          icon: DollarSign,
          color: '#eab308',
          href: '/admin/analytics',
        },
        {
          name: 'Products',
          value: formatNumber(data.overview.totalProducts),
          change: '',
          trend: 'neutral',
          icon: Package,
          color: '#bb0c15',
          href: '/admin/products',
        },
      ]
    : [];

  // Build pending actions from API data
  const pendingActions = data
    ? [
        ...(data.alerts.pendingQuotes > 0
          ? [
              {
                title: `${data.alerts.pendingQuotes} Pending Quote${data.alerts.pendingQuotes > 1 ? 's' : ''}`,
                description: 'Customers waiting for pricing',
                icon: FileText,
                href: '/admin/quotes?status=pending',
                priority: 'high' as const,
              },
            ]
          : []),
        ...(data.alerts.unreadMessages > 0
          ? [
              {
                title: `${data.alerts.unreadMessages} Unread Message${data.alerts.unreadMessages > 1 ? 's' : ''}`,
                description: 'New contact form submissions',
                icon: Mail,
                href: '/admin/messages',
                priority: 'medium' as const,
              },
            ]
          : []),
        ...(data.alerts.lowStockProducts > 0
          ? [
              {
                title: `${data.alerts.lowStockProducts} Low Stock Item${data.alerts.lowStockProducts > 1 ? 's' : ''}`,
                description: 'Products need restocking',
                icon: Package,
                href: '/admin/products?stock=low',
                priority: 'low' as const,
              },
            ]
          : []),
      ]
    : [];

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white font-medium rounded-lg hover:bg-[#003a6a] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.name} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-[#004D8B] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.orders.recent.length > 0 ? (
              data.orders.recent.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors block"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getRelativeTime(order.createdAt)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No orders yet
              </div>
            )}
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Actions</h2>
          </div>
          <div className="p-4 space-y-3">
            {pendingActions.length > 0 ? (
              pendingActions.map((action, index) => {
                const Icon = action.icon;
                const priorityColors = {
                  high: 'border-l-red-500',
                  medium: 'border-l-yellow-500',
                  low: 'border-l-blue-500',
                };
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className={`block p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border-l-4 ${
                      priorityColors[action.priority]
                    } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{action.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p className="text-green-600 dark:text-green-400 font-medium">All caught up!</p>
                <p className="text-sm mt-1">No pending actions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions & Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Brands & Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Catalog</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {data.overview.totalBrands} brands, {data.overview.totalCategories} categories
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/brands"
                className="flex-1 px-3 py-2 text-sm text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Brands
              </Link>
              <Link
                href="/admin/categories"
                className="flex-1 px-3 py-2 text-sm text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Categories
              </Link>
            </div>
          </div>

          {/* Analytics Preview */}
          <Link
            href="/admin/analytics"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#004D8B]">Analytics</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">View detailed reports</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Sales trends, customer insights, and inventory reports
            </p>
          </Link>

          {/* Settings */}
          <Link
            href="/admin/settings"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#004D8B]">Settings</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Store configuration</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Company info, notifications, inventory & currency settings
            </p>
          </Link>
        </div>
      </div>

      {/* Quick Help */}
      <div className="bg-gradient-to-r from-[#004D8B] to-[#002d52] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Need Help?</h3>
              <p className="text-blue-100">
                Contact technical support or view documentation.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/help"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
            >
              View Docs
            </Link>
            <a
              href="https://wa.me/9613741565"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-[#004D8B] rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Get Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
