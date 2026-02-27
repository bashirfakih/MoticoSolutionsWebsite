'use client';

/**
 * Customer Dashboard Page for Motico Solutions
 *
 * Overview dashboard for customers with orders, quotes, and quick actions.
 * Currently displays mock data - will connect to real API later.
 *
 * @module app/account/dashboard/page
 */

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  ShoppingCart,
  FileText,
  Package,
  Clock,
  ArrowRight,
  CheckCircle2,
  Truck,
  Heart,
  MessageSquare,
  Download,
  ExternalLink,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const stats = [
  {
    name: 'Active Orders',
    value: '3',
    description: '2 in transit',
    icon: ShoppingCart,
    color: '#004D8B',
    href: '/account/orders',
  },
  {
    name: 'Pending Quotes',
    value: '2',
    description: 'Awaiting response',
    icon: FileText,
    color: '#eab308',
    href: '/account/quotes',
  },
  {
    name: 'Favorites',
    value: '12',
    description: 'Saved products',
    icon: Heart,
    color: '#bb0c15',
    href: '/account/favorites',
  },
  {
    name: 'Total Orders',
    value: '47',
    description: 'Since Jan 2023',
    icon: Package,
    color: '#16a34a',
    href: '/account/orders',
  },
];

const recentOrders = [
  {
    id: 'ORD-2024-0089',
    date: 'Feb 25, 2024',
    items: 5,
    total: '$1,250.00',
    status: 'shipped',
    tracking: 'DHL-123456789',
  },
  {
    id: 'ORD-2024-0085',
    date: 'Feb 20, 2024',
    items: 3,
    total: '$780.00',
    status: 'delivered',
    tracking: null,
  },
  {
    id: 'ORD-2024-0078',
    date: 'Feb 15, 2024',
    items: 8,
    total: '$2,340.00',
    status: 'delivered',
    tracking: null,
  },
];

const pendingQuotes = [
  {
    id: 'QT-2024-0023',
    product: 'Hermes Abrasive Belts (Custom Size)',
    quantity: '500 pcs',
    submitted: '2 days ago',
    status: 'reviewing',
  },
  {
    id: 'QT-2024-0021',
    product: 'Bulk Order: Grinding Wheels',
    quantity: '200 pcs',
    submitted: '5 days ago',
    status: 'pending',
  },
];

const quickLinks = [
  {
    title: 'Browse Products',
    description: 'View our complete catalog',
    href: '/products',
    icon: Package,
  },
  {
    title: 'Request Quote',
    description: 'Get pricing for bulk orders',
    href: '/contact?type=quote',
    icon: FileText,
  },
  {
    title: 'Download Catalog',
    description: 'PDF catalog 2024',
    href: '/catalogs/motico-solutions-catalog-2025.pdf',
    icon: Download,
  },
  {
    title: 'Contact Support',
    description: 'Get help with your account',
    href: '/account/support',
    icon: MessageSquare,
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

function StatCard({ stat }: { stat: (typeof stats)[0] }) {
  const Icon = stat.icon;

  return (
    <Link
      href={stat.href}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${stat.color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: stat.color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 group-hover:text-[#004D8B] transition-colors">
            {stat.value}
          </p>
          <p className="text-sm font-medium text-gray-900">{stat.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{stat.description}</p>
        </div>
      </div>
    </Link>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck },
    delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
  };

  const { bg, text, icon: StatusIcon } = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${bg} ${text}`}
    >
      <StatusIcon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

function QuoteStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewing: 'bg-blue-100 text-blue-800',
    quoted: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CustomerDashboard() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#004D8B] to-[#002d52] rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Customer'}!
        </h1>
        <p className="text-blue-100">
          Welcome back to your Motico Solutions account.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#004D8B] font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Package className="w-4 h-4" />
            Browse Products
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            View Orders
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
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="text-sm font-medium text-[#004D8B] hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {order.date} · {order.items} items
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{order.total}</p>
                    {order.tracking && (
                      <a
                        href={`https://track.dhl.com/${order.tracking}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#004D8B] hover:underline flex items-center gap-1"
                      >
                        Track Package
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="p-2 text-gray-400 hover:text-[#004D8B] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Quotes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Quotes</h2>
            <Link
              href="/account/quotes"
              className="text-sm font-medium text-[#004D8B] hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {pendingQuotes.length > 0 ? (
              pendingQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900 text-sm">{quote.id}</p>
                    <QuoteStatusBadge status={quote.status} />
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{quote.product}</p>
                  <p className="text-xs text-gray-500">
                    {quote.quantity} · Submitted {quote.submitted}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No pending quotes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                href={link.href}
                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-[#004D8B]/10 transition-colors">
                  <Icon className="w-5 h-5 text-gray-600 group-hover:text-[#004D8B] transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-[#004D8B] transition-colors">
                    {link.title}
                  </p>
                  <p className="text-xs text-gray-500">{link.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Support Banner */}
      <div className="bg-gray-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <MessageSquare className="w-6 h-6 text-[#004D8B]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Need Help?</h3>
            <p className="text-sm text-gray-600">
              Our support team is available 24/7
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <a
            href="https://wa.me/9613741565"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
          >
            WhatsApp
          </a>
          <a
            href="tel:+9613741565"
            className="px-4 py-2 bg-[#004D8B] text-white font-medium rounded-lg hover:bg-[#003a6a] transition-colors"
          >
            Call Us
          </a>
        </div>
      </div>
    </div>
  );
}
