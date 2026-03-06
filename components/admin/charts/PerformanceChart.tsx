'use client';

/**
 * PerformanceChart Component
 *
 * Horizontal bar chart for category/brand performance data.
 *
 * @module components/admin/charts/PerformanceChart
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PerformanceItem {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  quantity: number;
}

interface PerformanceChartProps {
  data: PerformanceItem[];
  title: string;
  metric?: 'revenue' | 'orders' | 'quantity';
  color?: string;
  height?: number;
  showLegend?: boolean;
}

// Color palette for bars
const COLORS = [
  '#004D8B',
  '#16a34a',
  '#eab308',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
  '#6366f1',
  '#84cc16',
];

export function PerformanceChart({
  data,
  title,
  metric = 'revenue',
  color,
  height = 300,
}: PerformanceChartProps) {
  // Transform data for chart
  const chartData = data.map((item, index) => ({
    ...item,
    fill: color || COLORS[index % COLORS.length],
  }));

  // Format value based on metric
  const formatValue = (value: number) => {
    if (metric === 'revenue') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return value.toLocaleString();
  };

  // Get metric label
  const getMetricLabel = () => {
    switch (metric) {
      case 'revenue': return 'Revenue';
      case 'orders': return 'Orders';
      case 'quantity': return 'Units Sold';
      default: return 'Value';
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: PerformanceItem }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{item.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400">Revenue:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400">Orders:</span>
              <span className="font-medium text-gray-900 dark:text-white">{item.orders}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400">Units:</span>
              <span className="font-medium text-gray-900 dark:text-white">{item.quantity}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate total
  const total = data.reduce((sum, item) => sum + item[metric], 0);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{title}</h3>
        <div className="flex items-center justify-center h-[200px] text-gray-500 dark:text-gray-400">
          No data available for this period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">Total {getMetricLabel()}: </span>
          <span className="font-medium text-gray-900 dark:text-white">{formatValue(total)}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => {
              if (metric === 'revenue') {
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                return `$${value}`;
              }
              return value.toString();
            }}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={metric} radius={[0, 4, 4, 0]} maxBarSize={30}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {chartData.slice(0, 5).map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
              {item.name}
            </span>
          </div>
        ))}
        {chartData.length > 5 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            +{chartData.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
}

export default PerformanceChart;
