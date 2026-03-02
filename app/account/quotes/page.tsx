'use client';

/**
 * Customer Quotes Page
 *
 * Displays customer's quote requests and their status.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  total: number | null;
  itemCount: number;
  createdAt: string;
  validUntil: string | null;
  responseMessage: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  reviewed: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  sent: { label: 'Quote Sent', color: 'bg-purple-100 text-purple-800', icon: FileText },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Declined', color: 'bg-red-100 text-red-800', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800', icon: Clock },
  converted: { label: 'Converted to Order', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

export default function CustomerQuotesPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes?customerEmail=${encodeURIComponent(user?.email || '')}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch quotes');
      const data = await res.json();
      setQuotes(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchQuotes();
    }
  }, [user?.email]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'Pending';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#004D8B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Quotes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View and track your quote requests
          </p>
        </div>
        <button
          onClick={fetchQuotes}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Quotes List */}
      {quotes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No quotes yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Request a quote for products you're interested in.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {quotes.map((quote) => {
              const status = statusConfig[quote.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Link
                  key={quote.id}
                  href={`/account/quotes/${quote.id}`}
                  className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {quote.quoteNumber}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {quote.itemCount} item{quote.itemCount !== 1 ? 's' : ''} • {formatDate(quote.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(quote.total)}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {quote.responseMessage && quote.status === 'sent' && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-400">
                      {quote.responseMessage}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
