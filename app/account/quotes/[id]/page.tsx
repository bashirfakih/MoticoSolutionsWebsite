/**
 * Quote Detail Page
 *
 * Customer view of a specific quote
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  MessageSquare,
  ShoppingCart,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface QuoteItem {
  id: string;
  productId: string | null;
  productName: string;
  sku: string | null;
  description: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
  // Selected specs
  selectedDimension?: string | null;
  selectedSize?: string | null;
  selectedGrit?: string | null;
  selectedPackaging?: string | null;
  discountApplied?: number | null;
}

interface Quote {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  company: string | null;
  status: string;
  subtotal: number | null;
  tax: number;
  taxLabel: string | null;
  discount: number;
  total: number | null;
  currency: string;
  validUntil: string | null;
  customerMessage: string | null;
  responseMessage: string | null;
  createdAt: string;
  sentAt: string | null;
  items: QuoteItem[];
}

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { error: showError } = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quotes/${params.id}`);
        if (!response.ok) {
          throw new Error('Quote not found');
        }
        const data = await response.json();
        setQuote(data);
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to load quote');
        router.push('/account/quotes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      reviewed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      sent: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      accepted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      expired: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
      converted: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date();
  const canAccept = quote.status === 'sent' && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/account/quotes"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotes
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quote.quoteNumber}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Requested on {formatDate(quote.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(quote.status)}
              {quote.status === 'converted' && (
                <Link
                  href="/account/orders"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ShoppingCart className="w-4 h-4" />
                  View Order
                </Link>
              )}
            </div>
          </div>

          {/* Quote Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {quote.status}
                </p>
              </div>
            </div>
            {quote.validUntil && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Valid Until</p>
                  <p className={`font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {formatDate(quote.validUntil)}
                    {isExpired && ' (Expired)'}
                  </p>
                </div>
              </div>
            )}
            {quote.total !== null && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quote Total</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(quote.total, quote.currency)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quote Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quoted Items
          </h2>
          <div className="space-y-4">
            {quote.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {item.productName}
                  </h4>
                  {item.sku && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      SKU: {item.sku}
                    </p>
                  )}
                  {/* Selected Specs */}
                  {(item.selectedDimension || item.selectedSize || item.selectedGrit || item.selectedPackaging) && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      {item.selectedDimension && <p>Dimension: {item.selectedDimension}</p>}
                      {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                      {item.selectedGrit && <p>Grit: {item.selectedGrit}</p>}
                      {item.selectedPackaging && <p>Packaging: {item.selectedPackaging}</p>}
                    </div>
                  )}
                  {item.discountApplied && item.discountApplied > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Discount: {item.discountApplied}% applied
                    </p>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Qty</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.quantity}
                  </p>
                </div>
                {item.unitPrice !== null && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unit Price</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.unitPrice, quote.currency)}
                    </p>
                  </div>
                )}
                {item.totalPrice !== null && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.totalPrice, quote.currency)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totals */}
          {(quote.subtotal !== null || quote.total !== null) && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              {quote.subtotal !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(quote.subtotal, quote.currency)}
                  </span>
                </div>
              )}
              {quote.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Discount</span>
                  <span className="text-green-600 dark:text-green-400">
                    -{formatCurrency(quote.discount, quote.currency)}
                  </span>
                </div>
              )}
              {quote.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {quote.taxLabel || 'TVA'}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(quote.tax, quote.currency)}
                  </span>
                </div>
              )}
              {quote.total !== null && (
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(quote.total, quote.currency)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        {(quote.customerMessage || quote.responseMessage) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </h2>

            <div className="space-y-4">
              {quote.customerMessage && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Your Message
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {quote.customerMessage}
                  </p>
                </div>
              )}

              {quote.responseMessage && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                    Our Response
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {quote.responseMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {canAccept && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Ready to proceed?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Accept this quote to place your order
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/contact"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Have Questions?
                </Link>
                <button
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Quote
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expired Notice */}
        {isExpired && quote.status !== 'converted' && quote.status !== 'rejected' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  Quote Expired
                </h3>
                <p className="text-amber-700 dark:text-amber-400 mt-1">
                  This quote has expired. Please{' '}
                  <Link href="/contact" className="underline hover:no-underline">
                    contact us
                  </Link>{' '}
                  to request an updated quote.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
