'use client';

/**
 * Order Detail Component
 *
 * Reusable component for displaying order details with status badges,
 * payment status, timeline, tracking info, shipping address, and line items.
 *
 * @module components/admin/OrderDetail
 */

import React from 'react';
import { ORDER_STATUS, PAYMENT_STATUS, OrderStatus, PaymentStatus } from '@/lib/data/types';
import {
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
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface OrderItem {
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

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
}

export interface ShippingAddress {
  name: string;
  company: string | null;
  address: string;
  city: string;
  region: string | null;
  postalCode: string | null;
  country: string;
  phone: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
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
  shippingAddress: ShippingAddress;
  customerNote: string | null;
  internalNote: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

// ═══════════════════════════════════════════════════════════════
// STATUS CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  [ORDER_STATUS.PENDING]: {
    label: 'Pending',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    icon: Clock,
  },
  [ORDER_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: CheckCircle,
  },
  [ORDER_STATUS.PROCESSING]: {
    label: 'Processing',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    icon: Package,
  },
  [ORDER_STATUS.SHIPPED]: {
    label: 'Shipped',
    color: 'text-indigo-700',
    bg: 'bg-indigo-100',
    icon: Truck,
  },
  [ORDER_STATUS.DELIVERED]: {
    label: 'Delivered',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: CheckCircle,
  },
  [ORDER_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: XCircle,
  },
  [ORDER_STATUS.REFUNDED]: {
    label: 'Refunded',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    icon: DollarSign,
  },
};

export const paymentStatusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  [PAYMENT_STATUS.PENDING]: {
    label: 'Pending',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
  },
  [PAYMENT_STATUS.PAID]: {
    label: 'Paid',
    color: 'text-green-700',
    bg: 'bg-green-100',
  },
  [PAYMENT_STATUS.FAILED]: {
    label: 'Failed',
    color: 'text-red-700',
    bg: 'bg-red-100',
  },
  [PAYMENT_STATUS.REFUNDED]: {
    label: 'Refunded',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
  },
};

const defaultStatusConfig = {
  label: 'Unknown',
  color: 'text-gray-700',
  bg: 'bg-gray-100',
  icon: Clock,
};

const defaultPaymentConfig = {
  label: 'Unknown',
  color: 'text-gray-700',
  bg: 'bg-gray-100',
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getStatusConfig(status: string) {
  return (
    statusConfig[status] ||
    statusConfig[ORDER_STATUS.PENDING] ||
    defaultStatusConfig
  );
}

export function getPaymentStatusConfig(status: string) {
  return (
    paymentStatusConfig[status] ||
    paymentStatusConfig[PAYMENT_STATUS.PENDING] ||
    defaultPaymentConfig
  );
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatAddress(address: ShippingAddress): string {
  const parts = [
    address.address,
    address.city,
    address.region,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  return parts.join(', ');
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = getStatusConfig(status);
  const Icon = config.icon || Clock;
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = getPaymentStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
    >
      {config.label}
    </span>
  );
}

export function OrderItemsList({
  items,
  currency = 'USD',
}: {
  items: OrderItem[];
  currency?: string;
}) {
  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => (
        <div
          key={item.id}
          className="px-6 py-4 flex items-center justify-between"
        >
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
            <p className="font-semibold">{formatCurrency(item.totalPrice, currency)}</p>
            <p className="text-sm text-gray-500">
              {item.quantity} × {formatCurrency(item.unitPrice, currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderTotals({
  subtotal,
  shippingCost,
  tax,
  discount,
  total,
  currency = 'USD',
}: {
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency?: string;
}) {
  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Shipping</span>
          <span>{formatCurrency(shippingCost, currency)}</span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax</span>
            <span>{formatCurrency(tax, currency)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(discount, currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>{formatCurrency(total, currency)}</span>
        </div>
      </div>
    </div>
  );
}

export function CustomerInfo({ customer }: { customer: OrderCustomer }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#004D8B] flex items-center justify-center text-white font-semibold">
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900">{customer.name}</p>
          {customer.company && (
            <p className="text-sm text-gray-500">{customer.company}</p>
          )}
        </div>
      </div>
      <div className="pt-3 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-gray-400" />
          <span>{customer.email}</span>
        </div>
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{customer.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ShippingAddressDisplay({
  address,
}: {
  address: ShippingAddress;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
      <div>
        <p className="font-medium">{address.name}</p>
        {address.company && <p>{address.company}</p>}
        <p>{address.address}</p>
        <p>
          {address.city}
          {address.region && `, ${address.region}`}
          {address.postalCode && ` ${address.postalCode}`}
        </p>
        <p>{address.country}</p>
        {address.phone && (
          <p className="mt-2 text-gray-500">{address.phone}</p>
        )}
      </div>
    </div>
  );
}

export function OrderTimeline({
  createdAt,
  paidAt,
  shippedAt,
  deliveredAt,
}: {
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">Created</span>
        <span>{formatDate(createdAt)}</span>
      </div>
      {paidAt && (
        <div className="flex justify-between">
          <span className="text-gray-500">Paid</span>
          <span>{formatDate(paidAt)}</span>
        </div>
      )}
      {shippedAt && (
        <div className="flex justify-between">
          <span className="text-gray-500">Shipped</span>
          <span>{formatDate(shippedAt)}</span>
        </div>
      )}
      {deliveredAt && (
        <div className="flex justify-between">
          <span className="text-gray-500">Delivered</span>
          <span>{formatDate(deliveredAt)}</span>
        </div>
      )}
    </div>
  );
}

export function TrackingInfo({
  trackingNumber,
  trackingUrl,
}: {
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  if (!trackingNumber) {
    return (
      <p className="text-sm text-gray-500">No tracking information available</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Truck className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium">{trackingNumber}</span>
      </div>
      {trackingUrl && (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#004D8B] hover:underline"
        >
          Track Package
        </a>
      )}
    </div>
  );
}

export function CustomerNote({ note }: { note: string }) {
  return (
    <div className="bg-blue-50 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-blue-700 mb-1">
            Customer Note
          </p>
          <p className="text-sm text-blue-900">{note}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface OrderDetailProps {
  order: Order;
  showActions?: boolean;
  onStatusChange?: (status: OrderStatus) => void;
  onSaveNote?: (note: string) => void;
}

export default function OrderDetail({
  order,
  showActions = false,
  onStatusChange,
  onSaveNote,
}: OrderDetailProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {order.orderNumber}
          </h1>
          <p className="text-gray-500 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.paymentStatus} />
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
            <OrderItemsList items={order.items} currency={order.currency} />
            <OrderTotals
              subtotal={order.subtotal}
              shippingCost={order.shippingCost}
              tax={order.tax}
              discount={order.discount}
              total={order.total}
              currency={order.currency}
            />
          </div>

          {/* Customer Note */}
          {order.customerNote && <CustomerNote note={order.customerNote} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          {showActions && onStatusChange && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Update Status
              </h3>
              <select
                value={order.status}
                onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              >
                {Object.entries(ORDER_STATUS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {statusConfig[value]?.label || key}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Customer</h3>
            <CustomerInfo customer={order.customer} />
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Shipping Address
            </h3>
            <ShippingAddressDisplay address={order.shippingAddress} />
          </div>

          {/* Tracking */}
          {(order.trackingNumber || order.status === ORDER_STATUS.SHIPPED) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tracking</h3>
              <TrackingInfo
                trackingNumber={order.trackingNumber}
                trackingUrl={order.trackingUrl}
              />
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <OrderTimeline
              createdAt={order.createdAt}
              paidAt={order.paidAt}
              shippedAt={order.shippedAt}
              deliveredAt={order.deliveredAt}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
