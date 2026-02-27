/**
 * StockBadge Component Tests
 *
 * Tests for stock status badge rendering.
 *
 * @module __tests__/components/admin/StockBadge.test
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import StockBadge, { StockIndicator } from '@/components/admin/StockBadge';
import { STOCK_STATUS } from '@/lib/data/types';

describe('StockBadge', () => {
  describe('In Stock status', () => {
    it('should render In Stock badge', () => {
      render(<StockBadge status={STOCK_STATUS.IN_STOCK} />);
      expect(screen.getByText('In Stock')).toBeInTheDocument();
    });

    it('should have green styling for In Stock', () => {
      const { container } = render(<StockBadge status={STOCK_STATUS.IN_STOCK} />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-800');
    });
  });

  describe('Low Stock status', () => {
    it('should render Low Stock badge', () => {
      render(<StockBadge status={STOCK_STATUS.LOW_STOCK} />);
      expect(screen.getByText('Low Stock')).toBeInTheDocument();
    });

    it('should have yellow styling for Low Stock', () => {
      const { container } = render(<StockBadge status={STOCK_STATUS.LOW_STOCK} />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-yellow-100');
      expect(badge).toHaveClass('text-yellow-800');
    });
  });

  describe('Out of Stock status', () => {
    it('should render Out of Stock badge', () => {
      render(<StockBadge status={STOCK_STATUS.OUT_OF_STOCK} />);
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    it('should have red styling for Out of Stock', () => {
      const { container } = render(<StockBadge status={STOCK_STATUS.OUT_OF_STOCK} />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-red-100');
      expect(badge).toHaveClass('text-red-800');
    });
  });

  describe('showQuantity prop', () => {
    it('should show quantity with label when showQuantity is true', () => {
      render(
        <StockBadge
          status={STOCK_STATUS.IN_STOCK}
          quantity={50}
          showQuantity={true}
        />
      );
      expect(screen.getByText('50 In Stock')).toBeInTheDocument();
    });

    it('should not show quantity when showQuantity is false', () => {
      render(
        <StockBadge
          status={STOCK_STATUS.IN_STOCK}
          quantity={50}
          showQuantity={false}
        />
      );
      expect(screen.getByText('In Stock')).toBeInTheDocument();
      expect(screen.queryByText('50')).not.toBeInTheDocument();
    });
  });

  describe('size prop', () => {
    it('should apply small size classes', () => {
      const { container } = render(
        <StockBadge status={STOCK_STATUS.IN_STOCK} size="sm" />
      );
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('text-xs');
      expect(badge).toHaveClass('px-2');
    });

    it('should apply medium size classes by default', () => {
      const { container } = render(
        <StockBadge status={STOCK_STATUS.IN_STOCK} />
      );
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('text-sm');
      expect(badge).toHaveClass('px-2.5');
    });

    it('should apply large size classes', () => {
      const { container } = render(
        <StockBadge status={STOCK_STATUS.IN_STOCK} size="lg" />
      );
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('text-base');
      expect(badge).toHaveClass('px-3');
    });
  });
});

describe('StockIndicator', () => {
  it('should render quantity', () => {
    render(<StockIndicator quantity={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should have green styling when quantity is above min level', () => {
    const { container } = render(<StockIndicator quantity={100} minLevel={10} />);
    const indicator = container.querySelector('span');
    expect(indicator).toHaveClass('text-green-600');
    expect(indicator).toHaveClass('bg-green-50');
  });

  it('should have yellow styling when quantity is at or below min level', () => {
    const { container } = render(<StockIndicator quantity={10} minLevel={10} />);
    const indicator = container.querySelector('span');
    expect(indicator).toHaveClass('text-yellow-600');
    expect(indicator).toHaveClass('bg-yellow-50');
  });

  it('should have yellow styling when quantity is below min level', () => {
    const { container } = render(<StockIndicator quantity={5} minLevel={10} />);
    const indicator = container.querySelector('span');
    expect(indicator).toHaveClass('text-yellow-600');
    expect(indicator).toHaveClass('bg-yellow-50');
  });

  it('should have red styling when quantity is zero', () => {
    const { container } = render(<StockIndicator quantity={0} />);
    const indicator = container.querySelector('span');
    expect(indicator).toHaveClass('text-red-600');
    expect(indicator).toHaveClass('bg-red-50');
  });

  it('should have red styling when quantity is negative', () => {
    const { container } = render(<StockIndicator quantity={-5} />);
    const indicator = container.querySelector('span');
    expect(indicator).toHaveClass('text-red-600');
    expect(indicator).toHaveClass('bg-red-50');
  });

  it('should use default minLevel of 10', () => {
    const { container } = render(<StockIndicator quantity={15} />);
    const indicator = container.querySelector('span');
    expect(indicator).toHaveClass('text-green-600');
  });
});
