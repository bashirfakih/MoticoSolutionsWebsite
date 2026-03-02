/**
 * Inventory Alerts Component
 *
 * Displays low stock and out of stock alerts for admin dashboard
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Package,
  RefreshCw,
  Bell,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useInventoryAlerts, InventoryAlert } from '@/lib/hooks/useInventoryAlerts';
import { useToast } from '@/components/ui/Toast';

interface InventoryAlertsProps {
  maxItems?: number;
  showActions?: boolean;
  compact?: boolean;
}

export default function InventoryAlerts({
  maxItems = 10,
  showActions = true,
  compact = false,
}: InventoryAlertsProps) {
  const { alerts, summary, isLoading, error, refresh, sendNotification } = useInventoryAlerts();
  const { success, error: showError } = useToast();
  const [isSending, setIsSending] = useState(false);

  const displayAlerts = alerts.slice(0, maxItems);

  const handleSendNotification = async () => {
    setIsSending(true);
    try {
      const result = await sendNotification();
      if (result.success) {
        success(result.message);
      } else {
        showError(result.message || 'Failed to send notification');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-red-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Inventory Alerts
          </h3>
          {summary.total > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
              {summary.total}
            </span>
          )}
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendNotification}
              disabled={isSending || summary.total === 0}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
              title="Send alert notification"
            >
              <Bell className={`w-4 h-4 ${isSending ? 'animate-pulse' : ''}`} />
            </button>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      {!compact && summary.total > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-red-600 dark:text-red-400">{summary.critical}</strong> out of stock
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-amber-600 dark:text-amber-400">{summary.warning}</strong> low stock
            </span>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {displayAlerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 text-green-500" />
            <p>All products are well stocked!</p>
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} compact={compact} />
          ))
        )}
      </div>

      {/* Footer */}
      {alerts.length > maxItems && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Link
            href="/admin/products?filter=low_stock"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View all {alerts.length} alerts
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

function AlertItem({ alert, compact }: { alert: InventoryAlert; compact: boolean }) {
  return (
    <Link
      href={`/admin/products/${alert.id}/edit`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      {/* Severity Indicator */}
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          alert.severity === 'critical'
            ? 'bg-red-500'
            : alert.severity === 'warning'
            ? 'bg-amber-500'
            : 'bg-blue-500'
        }`}
      />

      {/* Product Image */}
      {!compact && (
        <div className="w-10 h-10 flex-shrink-0 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {alert.primaryImage ? (
            <img
              src={alert.primaryImage}
              alt={alert.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
      )}

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 dark:text-white truncate">
          {alert.name}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span>{alert.sku}</span>
          {alert.category && (
            <>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span>{alert.category.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Stock Info */}
      <div className="text-right flex-shrink-0">
        <div
          className={`font-semibold ${
            alert.stockQuantity === 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {alert.stockQuantity === 0 ? 'Out of stock' : `${alert.stockQuantity} left`}
        </div>
        {!compact && alert.minStockLevel > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Min: {alert.minStockLevel}
          </div>
        )}
      </div>

      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </Link>
  );
}
