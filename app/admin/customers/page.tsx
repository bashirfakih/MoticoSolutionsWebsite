'use client';

/**
 * Admin Customers Page
 *
 * Customer management with filtering, details view, and status updates.
 *
 * @module app/admin/customers/page
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Eye,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  DollarSign,
  Tag,
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { CUSTOMER_STATUS, CustomerStatus } from '@/lib/data/types';

interface Customer {
  id: string;
  email: string;
  name: string;
  company: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  status: CustomerStatus;
  isVerified: boolean;
  notes: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface CustomerStats {
  total: number;
  active: number;
  withOrders: number;
  totalRevenue: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  [CUSTOMER_STATUS.ACTIVE]: { label: 'Active', color: 'text-green-700', bg: 'bg-green-100' },
  [CUSTOMER_STATUS.INACTIVE]: { label: 'Inactive', color: 'text-gray-700', bg: 'bg-gray-100' },
  [CUSTOMER_STATUS.BLOCKED]: { label: 'Blocked', color: 'text-red-700', bg: 'bg-red-100' },
};

function StatusBadge({ status }: { status: CustomerStatus }) {
  const config = statusConfig[status] || statusConfig[CUSTOMER_STATUS.ACTIVE];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}

function CustomersContent() {
  const toast = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/customers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch customers');

      const data = await response.json();
      setCustomers(data.data || []);

      // Calculate stats from data
      const allCustomers = data.data || [];
      setStats({
        total: data.total || allCustomers.length,
        active: allCustomers.filter((c: Customer) => c.status === 'active').length,
        withOrders: allCustomers.filter((c: Customer) => c.totalOrders > 0).length,
        totalRevenue: allCustomers.reduce((sum: number, c: Customer) => sum + (c.totalSpent || 0), 0),
      });
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadCustomers]);

  const handleStatusUpdate = async (customerId: string, newStatus: CustomerStatus) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update customer');

      toast.success('Customer status updated');
      loadCustomers();

      if (selectedCustomer?.id === customerId) {
        const updated = await response.json();
        setSelectedCustomer(updated);
      }
    } catch (error) {
      toast.error('Failed to update customer status');
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      const response = await fetch(`/api/customers/${customerToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete customer');

      toast.success('Customer deleted');
      loadCustomers();

      if (selectedCustomer?.id === customerToDelete.id) {
        setSelectedCustomer(null);
      }
    } catch (error) {
      toast.error('Failed to delete customer');
    }
    setCustomerToDelete(null);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your customer base</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Customers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.withOrders}</p>
                <p className="text-xs text-gray-500">With Orders</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
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
              placeholder="Search customers..."
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
            {Object.entries(CUSTOMER_STATUS).map(([key, value]) => (
              <option key={key} value={value}>
                {statusConfig[value]?.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Orders</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total Spent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#004D8B] flex items-center justify-center text-white font-semibold text-sm">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        {customer.company && (
                          <p className="text-xs text-gray-500">{customer.company}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{customer.email}</p>
                    <p className="text-xs text-gray-500">{customer.phone || '-'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{customer.city || '-'}</p>
                    <p className="text-xs text-gray-500">{customer.country}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-gray-900">{customer.totalOrders}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 text-gray-500 hover:text-[#004D8B] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCustomerToDelete(customer)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Customer Details</h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[#004D8B] flex items-center justify-center text-white font-bold text-2xl">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  {selectedCustomer.company && (
                    <p className="text-gray-500">{selectedCustomer.company}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={selectedCustomer.status} />
                    {selectedCustomer.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedCustomer.email}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {[selectedCustomer.city, selectedCustomer.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedCustomer.totalOrders}</p>
                  <p className="text-xs text-gray-500">Total Orders</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedCustomer.totalSpent)}</p>
                  <p className="text-xs text-gray-500">Total Spent</p>
                </div>
              </div>

              {/* Tags */}
              {selectedCustomer.tags && selectedCustomer.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedCustomer.notes && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-yellow-700 mb-1">Notes</p>
                  <p className="text-sm text-yellow-900">{selectedCustomer.notes}</p>
                </div>
              )}

              {/* Dates */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Customer since: {formatDate(selectedCustomer.createdAt)}</p>
                <p>Last order: {formatDate(selectedCustomer.lastOrderAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <select
                  value={selectedCustomer.status}
                  onChange={(e) => handleStatusUpdate(selectedCustomer.id, e.target.value as CustomerStatus)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                >
                  {Object.entries(CUSTOMER_STATUS).map(([key, value]) => (
                    <option key={key} value={value}>
                      {statusConfig[value]?.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customerToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

export default function AdminCustomersPage() {
  return (
    <ErrorBoundary>
      <CustomersContent />
    </ErrorBoundary>
  );
}
