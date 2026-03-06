'use client';

/**
 * TrendChart Component
 *
 * Reusable line/area chart for time-series data (revenue, orders, customers).
 *
 * @module components/admin/charts/TrendChart
 */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TrendChartProps {
  data: Array<{ date: string; value: number }>;
  title: string;
  color?: string;
  fillColor?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  height?: number;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
}

export function TrendChart({
  data,
  title,
  color = '#004D8B',
  fillColor,
  valuePrefix = '',
  valueSuffix = '',
  height = 300,
  showGrid = true,
  formatValue,
}: TrendChartProps) {
  const defaultFormatValue = (value: number) => {
    if (valuePrefix === '$') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${valuePrefix}${value.toLocaleString()}${valueSuffix}`;
  };

  const formatter = formatValue || defaultFormatValue;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {formatDate(label)}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatter(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate total and average
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const average = data.length > 0 ? total / data.length : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Total: </span>
            <span className="font-medium text-gray-900 dark:text-white">{formatter(total)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Avg: </span>
            <span className="font-medium text-gray-900 dark:text-white">{formatter(Math.round(average * 100) / 100)}</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          )}
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(value) => {
              if (valuePrefix === '$') {
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                return `$${value}`;
              }
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value.toString();
            }}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={fillColor || `${color}20`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
