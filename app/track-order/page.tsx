/**
 * Order Tracking Page
 *
 * Public page for customers to track their orders
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  CheckCircle,
  Circle,
  Truck,
  MapPin,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface TimelineEvent {
  status: string;
  label: string;
  description: string;
  date: string | null;
  completed: boolean;
  current: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  items: OrderItem[];
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim() || !email.trim()) {
      setError('Please enter both order number and email');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to track order');
      }

      setOrder(data.order);
      setTimeline(data.timeline);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track order');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusIcon = (status: string, completed: boolean, current: boolean) => {
    if (status === 'cancelled' || status === 'refunded') {
      return <XCircle className="w-6 h-6 text-red-500" />;
    }
    if (completed) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    if (current) {
      return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
    }
    return <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your order number and email to track your delivery
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., ORD-2024-0001"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {isLoading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order {order.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : order.status === 'cancelled'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Timeline */}
              <div className="relative">
                {timeline.map((event, index) => (
                  <div key={event.status} className="flex gap-4 pb-6 last:pb-0">
                    {/* Line */}
                    {index < timeline.length - 1 && (
                      <div
                        className={`absolute left-3 mt-6 w-0.5 h-[calc(100%-3rem)] ${
                          event.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        style={{ top: `${index * 4}rem` }}
                      />
                    )}

                    {/* Icon */}
                    <div className="relative z-10 flex-shrink-0">
                      {getStatusIcon(event.status, event.completed, event.current)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${
                          event.current
                            ? 'text-blue-600 dark:text-blue-400'
                            : event.completed
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {event.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {event.description}
                      </p>
                      {event.date && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(event.date)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Items
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        SKU: {item.productSku}
                        {item.variantName && ` • ${item.variantName}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.totalPrice, order.currency)}
                      </div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(order.subtotal, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(order.shippingCost, order.currency)}
                  </span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(order.tax, order.currency)}
                    </span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-600">
                      -{formatCurrency(order.discount, order.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Shipping Address
                </h3>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.customerName}
                </p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.region}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
          <p>
            Need help?{' '}
            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
