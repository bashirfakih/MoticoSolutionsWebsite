'use client';

/**
 * Admin Quotes Page
 *
 * Quote management with filtering, status updates, and response handling.
 *
 * @module app/admin/quotes/page
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ArrowRight,
  X,
  MessageSquare,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useToast } from '@/components/ui/Toast';
import { QUOTE_STATUS, QuoteStatus } from '@/lib/data/types';
import { notifyQuoteRequest } from '@/lib/notifications/notificationService';

interface QuoteItem {
  id: string;
  productId: string | null;
  productName: string;
  description: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
}

interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  company: string | null;
  items: QuoteItem[];
  subtotal: number | null;
  discount: number;
  total: number | null;
  currency: string;
  status: QuoteStatus;
  validUntil: string | null;
  customerMessage: string | null;
  internalNotes: string | null;
  responseMessage: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
}

interface QuoteStats {
  total: number;
  pending: number;
  converted: number;
  totalValue: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  [QUOTE_STATUS.PENDING]: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
  [QUOTE_STATUS.REVIEWED]: { label: 'Reviewed', color: 'text-blue-700', bg: 'bg-blue-100', icon: Eye },
  [QUOTE_STATUS.SENT]: { label: 'Sent', color: 'text-purple-700', bg: 'bg-purple-100', icon: Send },
  [QUOTE_STATUS.ACCEPTED]: { label: 'Accepted', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
  [QUOTE_STATUS.REJECTED]: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
  [QUOTE_STATUS.EXPIRED]: { label: 'Expired', color: 'text-gray-700', bg: 'bg-gray-100', icon: Clock },
  [QUOTE_STATUS.CONVERTED]: { label: 'Converted', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: ArrowRight },
};

function StatusBadge({ status }: { status: QuoteStatus }) {
  const config = statusConfig[status] || statusConfig[QUOTE_STATUS.PENDING];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// New Quote Form State
interface NewQuoteItem {
  productName: string;
  quantity: number;
}

interface NewQuoteForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company: string;
  items: NewQuoteItem[];
  customerMessage: string;
}

const initialNewQuoteForm: NewQuoteForm = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  company: '',
  items: [{ productName: '', quantity: 1 }],
  customerMessage: '',
};

function QuotesContent() {
  const toast = useToast();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Quote Modal State
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);
  const [newQuoteForm, setNewQuoteForm] = useState<NewQuoteForm>(initialNewQuoteForm);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

  const loadQuotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/quotes?${params}`);
      if (!response.ok) throw new Error('Failed to fetch quotes');

      const data = await response.json();
      setQuotes(data.data || []);

      // Calculate stats
      const allQuotes = data.data || [];
      setStats({
        total: data.total || allQuotes.length,
        pending: allQuotes.filter((q: Quote) => q.status === 'pending').length,
        converted: allQuotes.filter((q: Quote) => q.status === 'converted').length,
        totalValue: allQuotes
          .filter((q: Quote) => q.total !== null)
          .reduce((sum: number, q: Quote) => sum + (q.total || 0), 0),
      });
    } catch (error) {
      console.error('Failed to load quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadQuotes();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadQuotes]);

  const handleStatusUpdate = async (quoteId: string, newStatus: QuoteStatus) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update quote');

      toast.success('Quote status updated');
      loadQuotes();

      if (selectedQuote?.id === quoteId) {
        const updated = await response.json();
        setSelectedQuote(updated);
      }
    } catch (error) {
      toast.error('Failed to update quote status');
    }
  };

  // New Quote Handlers
  const handleNewQuoteChange = (field: keyof NewQuoteForm, value: string) => {
    setNewQuoteForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNewQuoteItemChange = (index: number, field: keyof NewQuoteItem, value: string | number) => {
    setNewQuoteForm(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addQuoteItem = () => {
    setNewQuoteForm(prev => ({
      ...prev,
      items: [...prev.items, { productName: '', quantity: 1 }],
    }));
  };

  const removeQuoteItem = (index: number) => {
    if (newQuoteForm.items.length > 1) {
      setNewQuoteForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleCreateQuote = async () => {
    // Validation
    if (!newQuoteForm.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const validItems = newQuoteForm.items.filter(item => item.productName.trim());
    if (validItems.length === 0) {
      toast.error('At least one item is required');
      return;
    }

    setIsCreatingQuote(true);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newQuoteForm.customerName,
          customerEmail: newQuoteForm.customerEmail || `${newQuoteForm.customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          customerPhone: newQuoteForm.customerPhone || null,
          company: newQuoteForm.company || null,
          customerMessage: newQuoteForm.customerMessage || null,
          items: validItems.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            description: null,
            productId: null,
            unitPrice: null,
            totalPrice: null,
          })),
          status: QUOTE_STATUS.PENDING,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create quote');
      }

      const newQuote = await response.json();

      // Trigger notification for new quote
      notifyQuoteRequest(newQuoteForm.customerName, newQuote.id);

      toast.success('Quote created successfully');
      setShowNewQuoteModal(false);
      setNewQuoteForm(initialNewQuoteForm);
      loadQuotes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create quote');
    } finally {
      setIsCreatingQuote(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading && quotes.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage quote requests</p>
        </div>
        <button
          onClick={() => setShowNewQuoteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Quote
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Quotes</p>
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
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
                <p className="text-xs text-gray-500">Converted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-gray-500">Total Value</p>
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
              placeholder="Search quotes..."
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
            {Object.entries(QUOTE_STATUS).map(([key, value]) => (
              <option key={key} value={value}>
                {statusConfig[value]?.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quote</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Items</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-medium text-[#004D8B]">
                      {quote.quoteNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{quote.customerName}</p>
                    <p className="text-xs text-gray-500">{quote.company || quote.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-900">{quote.items?.length || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900">{formatCurrency(quote.total)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={quote.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">{formatDate(quote.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedQuote(quote)}
                      className="p-2 text-gray-500 hover:text-[#004D8B] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No quotes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedQuote.quoteNumber}</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedQuote.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <StatusBadge status={selectedQuote.status} />
                <select
                  value={selectedQuote.status}
                  onChange={(e) => handleStatusUpdate(selectedQuote.id, e.target.value as QuoteStatus)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                >
                  {Object.entries(QUOTE_STATUS).map(([key, value]) => (
                    <option key={key} value={value}>
                      {statusConfig[value]?.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{selectedQuote.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedQuote.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{selectedQuote.customerPhone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Company</p>
                    <p className="font-medium">{selectedQuote.company || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Customer Message */}
              {selectedQuote.customerMessage && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-700 mb-1">Customer Message</p>
                      <p className="text-sm text-blue-900">{selectedQuote.customerMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {(selectedQuote.items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              {selectedQuote.total !== null && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span>{formatCurrency(selectedQuote.subtotal)}</span>
                    </div>
                    {selectedQuote.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(selectedQuote.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>{formatCurrency(selectedQuote.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Response */}
              {selectedQuote.responseMessage && (
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-green-700 mb-1">Response Sent</p>
                  <p className="text-sm text-green-900">{selectedQuote.responseMessage}</p>
                  <p className="text-xs text-green-600 mt-2">Sent: {formatDate(selectedQuote.sentAt)}</p>
                </div>
              )}

              {/* Internal Notes */}
              {selectedQuote.internalNotes && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-yellow-700 mb-1">Internal Notes</p>
                  <p className="text-sm text-yellow-900">{selectedQuote.internalNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Quote Modal */}
      {showNewQuoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">New Quote Request</h2>
              <button
                onClick={() => {
                  setShowNewQuoteModal(false);
                  setNewQuoteForm(initialNewQuoteForm);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newQuoteForm.customerName}
                  onChange={(e) => handleNewQuoteChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newQuoteForm.customerEmail}
                    onChange={(e) => handleNewQuoteChange('customerEmail', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newQuoteForm.customerPhone}
                    onChange={(e) => handleNewQuoteChange('customerPhone', e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={newQuoteForm.company}
                  onChange={(e) => handleNewQuoteChange('company', e.target.value)}
                  placeholder="Company name (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                />
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {newQuoteForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => handleNewQuoteItemChange(index, 'productName', e.target.value)}
                        placeholder="Product name or description"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleNewQuoteItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B] text-center"
                      />
                      {newQuoteForm.items.length > 1 && (
                        <button
                          onClick={() => removeQuoteItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addQuoteItem}
                    className="inline-flex items-center gap-1 text-sm text-[#004D8B] hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Add item
                  </button>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={newQuoteForm.customerMessage}
                  onChange={(e) => handleNewQuoteChange('customerMessage', e.target.value)}
                  placeholder="Additional notes or requirements..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewQuoteModal(false);
                  setNewQuoteForm(initialNewQuoteForm);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateQuote}
                disabled={isCreatingQuote}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors disabled:opacity-50"
              >
                {isCreatingQuote && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminQuotesPage() {
  return (
    <ErrorBoundary>
      <QuotesContent />
    </ErrorBoundary>
  );
}
