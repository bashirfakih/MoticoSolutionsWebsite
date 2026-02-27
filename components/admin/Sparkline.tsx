/**
 * Sparkline Component
 *
 * A simple SVG-based sparkline chart for displaying trends.
 */

'use client';

import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  showArea?: boolean;
}

export default function Sparkline({
  data,
  width = 100,
  height = 32,
  strokeColor = '#004D8B',
  fillColor = 'rgba(0, 77, 139, 0.1)',
  strokeWidth = 2,
  showArea = true,
}: SparklineProps) {
  if (data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Padding to avoid clipping
  const padding = strokeWidth;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return { x, y };
  });

  // Build SVG path
  const linePath = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ');

  // Build area path
  const areaPath = showArea
    ? `${linePath} L ${points[points.length - 1].x.toFixed(2)},${height - padding} L ${padding},${height - padding} Z`
    : '';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      {/* Area fill */}
      {showArea && (
        <path
          d={areaPath}
          fill={fillColor}
        />
      )}
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={3}
        fill={strokeColor}
      />
    </svg>
  );
}
