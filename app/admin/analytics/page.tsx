'use client';

/**
 * Admin Analytics Page
 *
 * Dashboard with charts, statistics, and business insights.
 *
 * @module app/admin/analytics/page
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  MessageSquare,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { orderService } from '@/lib/data/orderService';
import { customerService } from '@/lib/data/customerService';
import { quoteService } from '@/lib/data/quoteService';
import { messageService } from '@/lib/data/messageService';
import { productService } from '@/lib/data/productService';

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

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const [stats, setStats] = useState<{
    orders: ReturnType<typeof orderService.getStats>;
    customers: ReturnType<typeof customerService.getStats>;
    quotes: ReturnType<typeof quoteService.getStats>;
    messages: ReturnType<typeof messageService.getStats>;
    products: ReturnType<typeof productService.getStats>;
  } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setStats({
      orders: orderService.getStats(),
      customers: customerService.getStats(),
      quotes: quoteService.getStats(),
      messages: messageService.getStats(),
      products: productService.getStats(),
    });
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004D8B]"></div>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      title: 'Total Revenue',
      value: `$${stats.orders.totalRevenue.toLocaleString()}`,
      change: 12.5,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Orders',
      value: stats.orders.total,
      change: 8.2,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Customers',
      value: stats.customers.active,
      change: 5.1,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Products',
      value: stats.products.totalProducts,
      change: 2.3,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Pending Quotes',
      value: stats.quotes.pending,
      change: -3.2,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Unread Messages',
      value: stats.messages.unread,
      change: 15.4,
      icon: MessageSquare,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const orderStatusData: ChartData[] = [
    { label: 'Pending', value: stats.orders.pending, color: '#fbbf24' },
    { label: 'Confirmed', value: stats.orders.confirmed, color: '#3b82f6' },
    { label: 'Processing', value: stats.orders.processing, color: '#8b5cf6' },
    { label: 'Shipped', value: stats.orders.shipped, color: '#06b6d4' },
    { label: 'Delivered', value: stats.orders.delivered, color: '#22c55e' },
    { label: 'Cancelled', value: stats.orders.cancelled, color: '#ef4444' },
  ];

  const quoteStatusData: ChartData[] = [
    { label: 'Pending', value: stats.quotes.pending, color: '#fbbf24' },
    { label: 'Reviewed', value: stats.quotes.reviewed, color: '#3b82f6' },
    { label: 'Sent', value: stats.quotes.sent, color: '#8b5cf6' },
    { label: 'Accepted', value: stats.quotes.accepted, color: '#22c55e' },
    { label: 'Rejected', value: stats.quotes.rejected, color: '#ef4444' },
    { label: 'Converted', value: stats.quotes.converted, color: '#06b6d4' },
  ];

  const messageTypeData: ChartData[] = [
    { label: 'Contact', value: stats.messages.byType.contact, color: '#6b7280' },
    { label: 'Support', value: stats.messages.byType.support, color: '#3b82f6' },
    { label: 'Inquiry', value: stats.messages.byType.inquiry, color: '#8b5cf6' },
    { label: 'Feedback', value: stats.messages.byType.feedback, color: '#22c55e' },
  ];

  const stockStatusData: ChartData[] = [
    { label: 'In Stock', value: stats.products.totalProducts - stats.products.lowStockProducts - stats.products.outOfStockProducts, color: '#22c55e' },
    { label: 'Low Stock', value: stats.products.lowStockProducts, color: '#fbbf24' },
    { label: 'Out of Stock', value: stats.products.outOfStockProducts, color: '#ef4444' },
  ];

  // Simple bar chart renderer
  const renderBarChart = (data: ChartData[], maxValue: number) => {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium text-gray-900">{item.value}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
  const renderPieChart = (data: ChartData[]) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const segments = data.map((item) => {
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

    // Create SVG pie chart
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
          <circle cx="50" cy="50" r="25" fill="white" />
        </svg>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium text-gray-900">({item.value})</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`flex items-center text-xs font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                )}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Order Status Distribution</h2>
          </div>
          {renderBarChart(orderStatusData, Math.max(...orderStatusData.map(d => d.value)))}
        </div>

        {/* Quote Status Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Quote Conversion</h2>
          </div>
          {renderPieChart(quoteStatusData)}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Types Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Message Types</h2>
          </div>
          {renderBarChart(messageTypeData, Math.max(...messageTypeData.map(d => d.value)))}
        </div>

        {/* Stock Status Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Stock Status</h2>
          </div>
          {renderPieChart(stockStatusData)}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Metrics */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Customers</span>
              <span className="font-semibold text-gray-900">{stats.customers.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Customers</span>
              <span className="font-semibold text-green-600">{stats.customers.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">With Orders</span>
              <span className="font-semibold text-blue-600">{stats.customers.withOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New This Month</span>
              <span className="font-semibold text-purple-600">{stats.customers.newThisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="font-semibold text-gray-900">${stats.customers.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Order Metrics */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="font-semibold text-gray-900">{stats.orders.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Order Value</span>
              <span className="font-semibold text-green-600">${stats.orders.averageOrderValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Orders</span>
              <span className="font-semibold text-yellow-600">{stats.orders.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Delivered Orders</span>
              <span className="font-semibold text-green-600">{stats.orders.delivered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="font-semibold text-gray-900">${stats.orders.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Quote Metrics */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Quotes</span>
              <span className="font-semibold text-gray-900">{stats.quotes.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Review</span>
              <span className="font-semibold text-yellow-600">{stats.quotes.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Accepted</span>
              <span className="font-semibold text-green-600">{stats.quotes.accepted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-blue-600">{stats.quotes.conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Value</span>
              <span className="font-semibold text-gray-900">${stats.quotes.totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.products.lowStockProducts > 0 && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Low Stock Alert</h3>
              <p className="text-sm text-yellow-700">
                {stats.products.lowStockProducts} products are running low on stock.{' '}
                <a href="/admin/inventory" className="underline font-medium">View inventory</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
