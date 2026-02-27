'use client';

/**
 * Admin Order Detail Page
 *
 * View and manage individual order details.
 *
 * @module app/admin/orders/[id]/page
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ORDER_STATUS, PAYMENT_STATUS, OrderStatus, PaymentStatus } from '@/lib/data/types';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  FileText,
  Loader2,
  Save,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
  };
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  shippingAddress: {
    name: string;
    company: string | null;
    address: string;
    city: string;
    region: string | null;
    postalCode: string | null;
    country: string;
    phone: string | null;
  };
  customerNote: string | null;
  internalNote: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  [ORDER_STATUS.PENDING]: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
  [ORDER_STATUS.CONFIRMED]: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-100', icon: CheckCircle },
  [ORDER_STATUS.PROCESSING]: { label: 'Processing', color: 'text-purple-700', bg: 'bg-purple-100', icon: Package },
  [ORDER_STATUS.SHIPPED]: { label: 'Shipped', color: 'text-indigo-700', bg: 'bg-indigo-100', icon: Truck },
  [ORDER_STATUS.DELIVERED]: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
  [ORDER_STATUS.CANCELLED]: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
  [ORDER_STATUS.REFUNDED]: { label: 'Refunded', color: 'text-gray-700', bg: 'bg-gray-100', icon: DollarSign },
};

const paymentStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  [PAYMENT_STATUS.PENDING]: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  [PAYMENT_STATUS.PAID]: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100' },
  [PAYMENT_STATUS.FAILED]: { label: 'Failed', color: 'text-red-700', bg: 'bg-red-100' },
  [PAYMENT_STATUS.REFUNDED]: { label: 'Refunded', color: 'text-gray-700', bg: 'bg-gray-100' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const defaultConfig = { label: 'Unknown', color: 'text-gray-700', bg: 'bg-gray-100', icon: Clock };
  const config = statusConfig[status] || statusConfig[ORDER_STATUS.PENDING] || defaultConfig;
  const Icon = config.icon || Clock;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const defaultConfig = { label: 'Unknown', color: 'text-gray-700', bg: 'bg-gray-100' };
  const config = paymentStatusConfig[status] || paymentStatusConfig[PAYMENT_STATUS.PENDING] || defaultConfig;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}

function OrderDetailContent() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [internalNote, setInternalNote] = useState('');

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Order not found');
          router.push('/admin/orders');
          return;
        }
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrder(data);
      setInternalNote(data.internalNote || '');
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router, toast]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusChange = (newStatus: OrderStatus) => {
    setPendingStatus(newStatus);
    setShowStatusConfirm(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus || !order) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success(`Order status updated to ${statusConfig[pendingStatus]?.label || pendingStatus}`);
      loadOrder();
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setIsSaving(false);
      setShowStatusConfirm(false);
      setPendingStatus(null);
    }
  };

  const handleSaveNote = async () => {
    if (!order) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNote }),
      });

      if (!response.ok) throw new Error('Failed to save note');

      toast.success('Internal note saved');
      loadOrder();
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link href="/admin/orders" className="text-[#004D8B] hover:underline mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#004D8B] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        SKU: {item.productSku}
                        {item.variantName && ` · ${item.variantName}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span>{formatCurrency(order.shippingCost)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Note */}
          {order.customerNote && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-700 mb-1">Customer Note</p>
                  <p className="text-sm text-blue-900">{order.customerNote}</p>
                </div>
              </div>
            </div>
          )}

          {/* Internal Note */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Internal Note</h3>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add internal notes about this order..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
            />
            <button
              onClick={handleSaveNote}
              disabled={isSaving}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Note
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
            >
              {Object.entries(ORDER_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {statusConfig[value]?.label || key}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Changing the status will trigger notifications to the customer.
            </p>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Customer</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#004D8B] flex items-center justify-center text-white font-semibold">
                  {order.customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.customer.name}</p>
                  {order.customer.company && (
                    <p className="text-sm text-gray-500">{order.customer.company}</p>
                  )}
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{order.customer.email}</span>
                </div>
                {order.customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{order.customer.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Shipping Address</h3>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">{order.shippingAddress.name}</p>
                {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.region && `, ${order.shippingAddress.region}`}
                  {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-2 text-gray-500">{order.shippingAddress.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid</span>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.shippedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipped</span>
                  <span>{formatDate(order.shippedAt)}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivered</span>
                  <span>{formatDate(order.deliveredAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Confirmation */}
      <ConfirmDialog
        isOpen={showStatusConfirm}
        onClose={() => {
          setShowStatusConfirm(false);
          setPendingStatus(null);
        }}
        onConfirm={confirmStatusChange}
        title="Update Order Status"
        message={`Are you sure you want to change the order status to "${pendingStatus ? (statusConfig[pendingStatus]?.label || pendingStatus) : ''}"? This will notify the customer.`}
        confirmText="Update Status"
        variant="primary"
        isLoading={isSaving}
      />
    </div>
  );
}

export default function AdminOrderDetailPage() {
  return (
    <ErrorBoundary>
      <OrderDetailContent />
    </ErrorBoundary>
  );
}
