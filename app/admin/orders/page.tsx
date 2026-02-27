'use client';

/**
 * Admin Orders Page
 *
 * Order management with filtering, status updates, and details view.
 *
 * @module app/admin/orders/page
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
} from 'lucide-react';
import { orderService } from '@/lib/data/orderService';
import { Order, ORDER_STATUS, PAYMENT_STATUS, OrderStatus } from '@/lib/data/types';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { pluralize } from '@/lib/utils/formatting';

// Define order flow for detecting backward/destructive transitions
const ORDER_FLOW: OrderStatus[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

// Transitions that require confirmation
function isDestructiveTransition(from: OrderStatus, to: OrderStatus): boolean {
  // Moving to cancelled or refunded from any active state
  if (to === ORDER_STATUS.CANCELLED || to === ORDER_STATUS.REFUNDED) {
    return from !== ORDER_STATUS.CANCELLED && from !== ORDER_STATUS.REFUNDED;
  }
  // Moving backward in the flow (e.g., Delivered → Shipped)
  const fromIndex = ORDER_FLOW.indexOf(from);
  const toIndex = ORDER_FLOW.indexOf(to);
  return fromIndex >= 0 && toIndex >= 0 && toIndex < fromIndex;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  [ORDER_STATUS.PENDING]: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  [ORDER_STATUS.CONFIRMED]: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-100' },
  [ORDER_STATUS.PROCESSING]: { label: 'Processing', color: 'text-purple-700', bg: 'bg-purple-100' },
  [ORDER_STATUS.SHIPPED]: { label: 'Shipped', color: 'text-cyan-700', bg: 'bg-cyan-100' },
  [ORDER_STATUS.DELIVERED]: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-100' },
  [ORDER_STATUS.CANCELLED]: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100' },
  [ORDER_STATUS.REFUNDED]: { label: 'Refunded', color: 'text-gray-700', bg: 'bg-gray-100' },
};

const paymentConfig: Record<string, { label: string; color: string; bg: string }> = {
  [PAYMENT_STATUS.PENDING]: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  [PAYMENT_STATUS.PAID]: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100' },
  [PAYMENT_STATUS.FAILED]: { label: 'Failed', color: 'text-red-700', bg: 'bg-red-100' },
  [PAYMENT_STATUS.REFUNDED]: { label: 'Refunded', color: 'text-gray-700', bg: 'bg-gray-100' },
};

function StatusBadge({ status, type }: { status: string; type: 'order' | 'payment' }) {
  const config = type === 'order' ? statusConfig[status] : paymentConfig[status];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}

// Sortable column header component
function SortableHeader({
  label,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  align = 'left',
}: {
  label: string;
  sortKey: string;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
}) {
  const isActive = currentSortBy === sortKey;
  const alignClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <th className={`px-4 py-3 text-${align} text-xs font-semibold text-gray-500 uppercase`}>
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-gray-700 transition-colors ${alignClass}`}
      >
        {label}
        <span className="flex flex-col">
          <ChevronUp
            className={`w-3 h-3 -mb-1 ${isActive && currentSortOrder === 'asc' ? 'text-[#004D8B]' : 'text-gray-300'}`}
          />
          <ChevronDown
            className={`w-3 h-3 ${isActive && currentSortOrder === 'desc' ? 'text-[#004D8B]' : 'text-gray-300'}`}
          />
        </span>
      </button>
    </th>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof orderService.getStats> | null>(null);
  const toast = useToast();

  // Sort state
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Confirmation dialog state
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    orderId: string;
    orderNumber: string;
    fromStatus: OrderStatus;
    toStatus: OrderStatus;
  } | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, search, statusFilter, sortBy, sortOrder]);

  const loadOrders = () => {
    setOrders(orderService.getAll());
    setStats(orderService.getStats());
  };

  const filterAndSortOrders = () => {
    let result = orders;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        o =>
          o.orderNumber.toLowerCase().includes(searchLower) ||
          o.customerName.toLowerCase().includes(searchLower) ||
          o.customerEmail.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter) {
      result = result.filter(o => o.status === statusFilter);
    }

    // Sort the results
    result = [...result].sort((a, b) => {
      let aVal: string | number | Date;
      let bVal: string | number | Date;

      switch (sortBy) {
        case 'orderNumber':
          aVal = a.orderNumber;
          bVal = b.orderNumber;
          break;
        case 'customerName':
          aVal = a.customerName.toLowerCase();
          bVal = b.customerName.toLowerCase();
          break;
        case 'total':
          aVal = a.total;
          bVal = b.total;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'createdAt':
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredOrders(result);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const executeStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    try {
      orderService.updateStatus(orderId, newStatus);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(orderService.getById(orderId));
      }
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleStatusUpdate = (orderId: string, orderNumber: string, currentStatus: OrderStatus, newStatus: OrderStatus) => {
    if (currentStatus === newStatus) return;

    if (isDestructiveTransition(currentStatus, newStatus)) {
      setPendingStatusChange({ orderId, orderNumber, fromStatus: currentStatus, toStatus: newStatus });
    } else {
      executeStatusUpdate(orderId, newStatus);
    }
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      executeStatusUpdate(pendingStatusChange.orderId, pendingStatusChange.toStatus);
      setPendingStatusChange(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer orders</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
                <p className="text-xs text-gray-500">Shipped</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
          >
            <option value="">All Statuses</option>
            {Object.entries(ORDER_STATUS).map(([key, value]) => (
              <option key={key} value={value}>
                {statusConfig[value]?.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <SortableHeader
                  label="Order"
                  sortKey="orderNumber"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Customer"
                  sortKey="customerName"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Status"
                  sortKey="status"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                <SortableHeader
                  label="Total"
                  sortKey="total"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                />
                <SortableHeader
                  label="Date"
                  sortKey="createdAt"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-medium text-[#004D8B]">
                      {order.orderNumber}
                    </span>
                    <p className="text-xs text-gray-500">{pluralize(order.itemCount, 'item')}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} type="order" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-500 hover:text-[#004D8B] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order Status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(
                      selectedOrder.id,
                      selectedOrder.orderNumber,
                      selectedOrder.status,
                      e.target.value as OrderStatus
                    )}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                  >
                    {Object.entries(ORDER_STATUS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {statusConfig[value]?.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment</p>
                  <StatusBadge status={selectedOrder.paymentStatus} type="payment" />
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{selectedOrder.customerPhone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Company</p>
                    <p className="font-medium">{selectedOrder.shippingAddress.company || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-500">SKU: {item.productSku}</p>
                        {item.variantName && (
                          <p className="text-xs text-gray-500">{item.variantName}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                        <p className="text-xs text-gray-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span>{formatCurrency(selectedOrder.shippingCost)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {(selectedOrder.customerNote || selectedOrder.internalNote) && (
                <div className="space-y-3">
                  {selectedOrder.customerNote && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-700 mb-1">Customer Note</p>
                      <p className="text-sm text-blue-900">{selectedOrder.customerNote}</p>
                    </div>
                  )}
                  {selectedOrder.internalNote && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-yellow-700 mb-1">Internal Note</p>
                      <p className="text-sm text-yellow-900">{selectedOrder.internalNote}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!pendingStatusChange}
        onClose={() => setPendingStatusChange(null)}
        onConfirm={confirmStatusChange}
        title="Confirm Status Change"
        message={pendingStatusChange ? `Are you sure you want to change order ${pendingStatusChange.orderNumber} from "${statusConfig[pendingStatusChange.fromStatus]?.label}" to "${statusConfig[pendingStatusChange.toStatus]?.label}"? This may affect order processing.` : ''}
        confirmText="Change Status"
        variant={pendingStatusChange?.toStatus === ORDER_STATUS.CANCELLED ? 'danger' : 'warning'}
      />
    </div>
  );
}
