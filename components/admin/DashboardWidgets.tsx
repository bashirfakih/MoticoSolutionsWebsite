'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// BADGE
// ═══════════════════════════════════════════════════════════════

const badgeVariants: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  restock: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  respond: 'bg-purple-100 text-purple-700 border-purple-200',
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-sky-100 text-sky-700 border-sky-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function Badge({
  variant = 'default',
  children,
}: {
  variant?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${
        badgeVariants[variant] ?? badgeVariants.default
      }`}
    >
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// TREND BADGE
// ═══════════════════════════════════════════════════════════════

export function TrendBadge({ value }: { value: number }) {
  if (value === -100) {
    return (
      <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
        No prior data
      </span>
    );
  }
  if (value === 0) {
    return (
      <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
        0% change
      </span>
    );
  }
  const isPositive = value > 0;
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
        isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {Math.abs(value)}%
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge?: { text: string; variant: string };
  trend?: { value: number; label: string };
  href: string;
}

export function StatCard({ icon, label, value, badge, trend, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-gray-50">{icon}</div>
        {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
        {trend && <TrendBadge value={trend.value} />}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
// SKELETON COMPONENTS
// ═══════════════════════════════════════════════════════════════

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gray-200" />
        <div className="w-14 h-5 rounded-full bg-gray-200" />
      </div>
      <div className="w-12 h-7 rounded bg-gray-200 mb-1" />
      <div className="w-24 h-4 rounded bg-gray-200" />
    </div>
  );
}

export function SkeletonOrderRow() {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 animate-pulse border-b border-gray-50">
      <div>
        <div className="w-32 h-4 rounded bg-gray-200 mb-1" />
        <div className="w-20 h-3 rounded bg-gray-100" />
      </div>
      <div className="w-16 h-4 rounded bg-gray-200 self-center" />
      <div className="w-16 h-3 rounded bg-gray-100 self-center" />
      <div className="w-20 h-5 rounded-full bg-gray-200 self-center" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RECENT ORDERS
// ═══════════════════════════════════════════════════════════════

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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

export function RecentOrders({
  orders,
  isLoading,
}: {
  orders: OrderData[];
  isLoading: boolean;
}) {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-[#004D8B] hover:underline flex items-center gap-1"
        >
          View All
        </Link>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
        <span>Order / Customer</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Date</span>
        <span>Status</span>
      </div>

      {isLoading ? (
        <>
          <SkeletonOrderRow />
          <SkeletonOrderRow />
          <SkeletonOrderRow />
        </>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingCart className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No orders yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Orders will appear here once customers start purchasing.
          </p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
            >
              <div>
                <p className="font-medium text-gray-900">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{order.customerName}</p>
              </div>
              <p className="font-medium text-gray-900 text-right">
                {formatCurrency(order.total)}
              </p>
              <p className="text-xs text-gray-500 text-right">
                {getRelativeTime(order.createdAt)}
              </p>
              <Badge variant={order.status}>{order.status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
