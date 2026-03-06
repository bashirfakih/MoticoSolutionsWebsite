'use client';

/**
 * Admin Analytics Page
 *
 * Dashboard with charts, statistics, and business insights.
 * Fetches data from /api/analytics endpoint.
 *
 * @module app/admin/analytics/page
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Layers,
  Tag,
} from 'lucide-react';
import { TrendChart, PerformanceChart } from '@/components/admin/charts';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface AnalyticsData {
  period: number;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalQuotes: number;
    totalCustomers: number;
    averageOrderValue: number;
    revenueChange: number;
    ordersChange: number;
  };
  charts: {
    dailyRevenue: Array<{ date: string; value: number }>;
    dailyOrders: Array<{ date: string; value: number }>;
    dailyCustomers: Array<{ date: string; value: number }>;
    ordersByStatus: Array<{ name: string; value: number }>;
    ordersByPayment: Array<{ name: string; value: number }>;
    quotesByStatus: Array<{ name: string; value: number }>;
    messagesByType: Array<{ name: string; value: number }>;
    topProducts: Array<{ productId: string; name: string; quantity: number; revenue: number }>;
    categoryPerformance: Array<{ id: string; name: string; orders: number; revenue: number; quantity: number }>;
    brandPerformance: Array<{ id: string; name: string; orders: number; revenue: number; quantity: number }>;
  };
}

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004D8B] mx-auto mb-4" />
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load analytics</h3>
        <p className="text-gray-500 mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | '365'>('30');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics?period=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchAnalytics} />;
  }

  if (!data) {
    return null;
  }

  // Build stat cards from API data
  const statCards: StatCard[] = [
    {
      title: 'Total Revenue',
      value: `$${data.summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: Math.round(data.summary.revenueChange * 10) / 10,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Orders',
      value: data.summary.totalOrders,
      change: Math.round(data.summary.ordersChange * 10) / 10,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'New Customers',
      value: data.summary.totalCustomers,
      change: 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Avg Order Value',
      value: `$${data.summary.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total Quotes',
      value: data.summary.totalQuotes,
      change: 0,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Top Products',
      value: data.charts.topProducts.length,
      change: 0,
      icon: Package,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
  ];

  // Order status colors
  const statusColors: Record<string, string> = {
    pending: '#fbbf24',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    shipped: '#06b6d4',
    delivered: '#22c55e',
    cancelled: '#ef4444',
    refunded: '#6b7280',
  };

  const orderStatusData: ChartData[] = data.charts.ordersByStatus.map(item => ({
    label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    value: item.value,
    color: statusColors[item.name] || '#6b7280',
  }));

  const quoteStatusData: ChartData[] = data.charts.quotesByStatus.map(item => ({
    label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    value: item.value,
    color: statusColors[item.name] || '#6b7280',
  }));

  // Simple bar chart renderer
  const renderBarChart = (chartData: ChartData[], maxValue: number) => {
    return (
      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Simple pie chart renderer
  const renderPieChart = (chartData: ChartData[]) => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const segments = chartData.map((item) => {
      const angle = total > 0 ? (item.value / total) * 360 : 0;
      const segment = {
        ...item,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        percentage: total > 0 ? (item.value / total) * 100 : 0,
      };
      currentAngle += angle;
      return segment;
    });

    const createArc = (startAngle: number, endAngle: number, radius: number) => {
      const start = ((startAngle - 90) * Math.PI) / 180;
      const end = ((endAngle - 90) * Math.PI) / 180;
      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

      const x1 = 50 + radius * Math.cos(start);
      const y1 = 50 + radius * Math.sin(start);
      const x2 = 50 + radius * Math.cos(end);
      const y2 = 50 + radius * Math.sin(end);

      return `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    };

    return (
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="w-32 h-32">
          {segments.map((segment, index) => (
            segment.value > 0 && (
              <path
                key={index}
                d={createArc(segment.startAngle, segment.endAngle, 45)}
                fill={segment.color}
                className="transition-opacity hover:opacity-80"
              />
            )
          ))}
          <circle cx="50" cy="50" r="25" fill="white" className="dark:fill-gray-800" />
        </svg>
        <div className="space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="font-medium text-gray-900 dark:text-white">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 12 months</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.change !== 0 && (
                <div className={`flex items-center text-xs font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Trend Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TrendChart
          data={data.charts.dailyRevenue}
          title="Revenue Trend"
          color="#16a34a"
          valuePrefix="$"
        />
        <TrendChart
          data={data.charts.dailyOrders}
          title="Orders Trend"
          color="#004D8B"
        />
        <TrendChart
          data={data.charts.dailyCustomers}
          title="Customer Growth"
          color="#8b5cf6"
        />
      </div>

      {/* Performance Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart
          data={data.charts.categoryPerformance}
          title="Category Performance"
          metric="revenue"
        />
        <PerformanceChart
          data={data.charts.brandPerformance}
          title="Brand Performance"
          metric="revenue"
        />
      </div>

      {/* Status Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Status Distribution</h2>
          </div>
          {orderStatusData.length > 0 ? (
            renderBarChart(orderStatusData, Math.max(...orderStatusData.map(d => d.value)))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No order data available</p>
          )}
        </div>

        {/* Quote Status Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quote Status Distribution</h2>
          </div>
          {quoteStatusData.length > 0 ? (
            renderPieChart(quoteStatusData)
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No quote data available</p>
          )}
        </div>
      </div>

      {/* Top Products */}
      {data.charts.topProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Selling Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Product</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Quantity Sold</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.charts.topProducts.map((product, index) => (
                  <tr key={product.productId || index} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#004D8B] text-white text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                      {product.quantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                      ${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
