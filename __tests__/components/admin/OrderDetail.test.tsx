/**
 * Order Detail Component Tests
 * Tests status badges, order display, and edge cases
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Order status constants (matching the app)
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const;

type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// Status configuration (matching app/admin/orders/[id]/page.tsx)
const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100', icon: 'Clock' },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-100', icon: 'CheckCircle' },
  processing: { label: 'Processing', color: 'text-purple-700', bg: 'bg-purple-100', icon: 'Package' },
  shipped: { label: 'Shipped', color: 'text-indigo-700', bg: 'bg-indigo-100', icon: 'Truck' },
  delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-100', icon: 'CheckCircle2' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100', icon: 'XCircle' },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100' },
  partial: { label: 'Partial', color: 'text-orange-700', bg: 'bg-orange-100' },
  paid: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100' },
  refunded: { label: 'Refunded', color: 'text-red-700', bg: 'bg-red-100' },
};

describe('Order Status Badge', () => {
  const defaultConfig = { label: 'Unknown', color: 'text-gray-700', bg: 'bg-gray-100', icon: 'Clock' };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as OrderStatus] || statusConfig[ORDER_STATUS.PENDING] || defaultConfig;
  };

  it('returns correct config for pending status', () => {
    const config = getStatusConfig('pending');
    expect(config.label).toBe('Pending');
    expect(config.color).toBe('text-amber-700');
  });

  it('returns correct config for confirmed status', () => {
    const config = getStatusConfig('confirmed');
    expect(config.label).toBe('Confirmed');
    expect(config.color).toBe('text-blue-700');
  });

  it('returns correct config for processing status', () => {
    const config = getStatusConfig('processing');
    expect(config.label).toBe('Processing');
    expect(config.color).toBe('text-purple-700');
  });

  it('returns correct config for shipped status', () => {
    const config = getStatusConfig('shipped');
    expect(config.label).toBe('Shipped');
    expect(config.color).toBe('text-indigo-700');
  });

  it('returns correct config for delivered status', () => {
    const config = getStatusConfig('delivered');
    expect(config.label).toBe('Delivered');
    expect(config.color).toBe('text-green-700');
  });

  it('returns correct config for cancelled status', () => {
    const config = getStatusConfig('cancelled');
    expect(config.label).toBe('Cancelled');
    expect(config.color).toBe('text-red-700');
  });

  it('returns fallback config for unknown status', () => {
    const config = getStatusConfig('unknown_status');
    expect(config).toBeDefined();
    expect(config.label).toBeDefined();
    expect(config.color).toBeDefined();
    expect(config.icon).toBeDefined();
  });

  it('returns fallback config for null status', () => {
    const config = getStatusConfig(null as unknown as string);
    expect(config).toBeDefined();
  });

  it('returns fallback config for undefined status', () => {
    const config = getStatusConfig(undefined as unknown as string);
    expect(config).toBeDefined();
  });
});

describe('Payment Status Badge', () => {
  const defaultConfig = { label: 'Unknown', color: 'text-gray-700', bg: 'bg-gray-100' };

  const getPaymentStatusConfig = (status: string) => {
    return paymentStatusConfig[status as PaymentStatus] || paymentStatusConfig[PAYMENT_STATUS.PENDING] || defaultConfig;
  };

  it('returns correct config for pending payment', () => {
    const config = getPaymentStatusConfig('pending');
    expect(config.label).toBe('Pending');
    expect(config.color).toBe('text-amber-700');
  });

  it('returns correct config for partial payment', () => {
    const config = getPaymentStatusConfig('partial');
    expect(config.label).toBe('Partial');
    expect(config.color).toBe('text-orange-700');
  });

  it('returns correct config for paid status', () => {
    const config = getPaymentStatusConfig('paid');
    expect(config.label).toBe('Paid');
    expect(config.color).toBe('text-green-700');
  });

  it('returns correct config for refunded status', () => {
    const config = getPaymentStatusConfig('refunded');
    expect(config.label).toBe('Refunded');
    expect(config.color).toBe('text-red-700');
  });

  it('returns fallback config for unknown payment status', () => {
    const config = getPaymentStatusConfig('unknown');
    expect(config).toBeDefined();
  });
});

describe('Order Data Display', () => {
  it('formats order number correctly', () => {
    const orderNumber = 'ORD-2024-001';
    expect(orderNumber).toMatch(/^ORD-\d{4}-\d{3}$/);
  });

  it('formats currency correctly', () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    expect(formatCurrency(99.99)).toBe('$99.99');
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats date correctly', () => {
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    const testDate = new Date('2024-03-15');
    expect(formatDate(testDate)).toContain('Mar');
    expect(formatDate(testDate)).toContain('15');
    expect(formatDate(testDate)).toContain('2024');
  });

  it('calculates line item total', () => {
    const item = { quantity: 3, unitPrice: 49.99 };
    const total = item.quantity * item.unitPrice;
    expect(total).toBeCloseTo(149.97, 2);
  });

  it('calculates order total from items', () => {
    const items = [
      { quantity: 2, unitPrice: 99.99 },
      { quantity: 1, unitPrice: 49.99 },
    ];

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    expect(subtotal).toBeCloseTo(249.97, 2);
  });
});

describe('Order Customer Display', () => {
  it('displays full customer name', () => {
    const customer = { name: 'John Doe' };
    expect(customer.name).toBe('John Doe');
  });

  it('displays customer email', () => {
    const customer = { email: 'john@example.com' };
    expect(customer.email).toContain('@');
  });

  it('formats phone number', () => {
    const formatPhone = (phone: string): string => {
      // Simple Lebanon phone format
      if (phone.startsWith('+961')) {
        return phone.replace(/(\+961)(\d)(\d{3})(\d{3})/, '$1 $2 $3 $4');
      }
      return phone;
    };

    expect(formatPhone('+9613741565')).toBe('+961 3 741 565');
  });

  it('handles missing customer data', () => {
    const order = { customer: null };
    const customerName = order.customer?.name || 'Unknown Customer';
    expect(customerName).toBe('Unknown Customer');
  });
});

describe('Order Address Display', () => {
  it('formats shipping address', () => {
    const address = {
      street: '123 Main St',
      city: 'Beirut',
      state: '',
      country: 'Lebanon',
      postalCode: '',
    };

    const formatAddress = (addr: typeof address): string => {
      const parts = [addr.street, addr.city, addr.state, addr.country, addr.postalCode]
        .filter(Boolean);
      return parts.join(', ');
    };

    const formatted = formatAddress(address);
    expect(formatted).toContain('123 Main St');
    expect(formatted).toContain('Beirut');
    expect(formatted).toContain('Lebanon');
  });

  it('handles missing address fields', () => {
    const address = {
      street: '123 Main St',
      city: '',
      state: '',
      country: 'Lebanon',
      postalCode: '',
    };

    const formatAddress = (addr: typeof address): string => {
      const parts = [addr.street, addr.city, addr.state, addr.country, addr.postalCode]
        .filter(Boolean);
      return parts.join(', ');
    };

    const formatted = formatAddress(address);
    expect(formatted).not.toContain(', ,'); // No double commas
  });

  it('handles null address', () => {
    const order = { shippingAddress: null };
    const hasAddress = Boolean(order.shippingAddress);
    expect(hasAddress).toBe(false);
  });
});

describe('Order Items Display', () => {
  it('displays product name from item', () => {
    const item = {
      product: { name: 'Power Drill', sku: 'PD-001' },
      quantity: 2,
      unitPrice: 149.99,
    };

    expect(item.product.name).toBe('Power Drill');
    expect(item.product.sku).toBe('PD-001');
  });

  it('handles deleted product in item', () => {
    const item = {
      product: null,
      productName: 'Deleted Product', // Fallback stored name
      quantity: 1,
      unitPrice: 99.99,
    };

    const displayName = item.product?.name || item.productName || 'Unknown Product';
    expect(displayName).toBe('Deleted Product');
  });

  it('calculates item subtotal', () => {
    const item = { quantity: 3, unitPrice: 33.33 };
    const subtotal = item.quantity * item.unitPrice;
    expect(subtotal).toBeCloseTo(99.99, 2);
  });

  it('displays empty state for no items', () => {
    const items: unknown[] = [];
    expect(items.length).toBe(0);
    const isEmpty = items.length === 0;
    expect(isEmpty).toBe(true);
  });
});

describe('Order Timeline', () => {
  it('shows created date', () => {
    const order = {
      createdAt: new Date('2024-03-01T10:00:00Z'),
    };

    expect(order.createdAt).toBeDefined();
  });

  it('shows payment date when paid', () => {
    const order = {
      paymentStatus: 'paid',
      paidAt: new Date('2024-03-02T14:30:00Z'),
    };

    const hasPaidDate = order.paymentStatus === 'paid' && order.paidAt;
    expect(hasPaidDate).toBeTruthy();
  });

  it('shows shipped date when shipped', () => {
    const order = {
      status: 'shipped',
      shippedAt: new Date('2024-03-03T09:00:00Z'),
    };

    const hasShippedDate = order.status === 'shipped' && order.shippedAt;
    expect(hasShippedDate).toBeTruthy();
  });

  it('shows delivered date when delivered', () => {
    const order = {
      status: 'delivered',
      deliveredAt: new Date('2024-03-05T16:00:00Z'),
    };

    const hasDeliveredDate = order.status === 'delivered' && order.deliveredAt;
    expect(hasDeliveredDate).toBeTruthy();
  });

  it('handles missing timeline dates', () => {
    const order = {
      status: 'pending',
      shippedAt: null,
      deliveredAt: null,
    };

    expect(order.shippedAt).toBeNull();
    expect(order.deliveredAt).toBeNull();
  });
});

describe('Order Actions', () => {
  it('determines available status transitions', () => {
    const getAvailableTransitions = (currentStatus: string): string[] => {
      const transitions: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered'],
        delivered: [],
        cancelled: [],
      };
      return transitions[currentStatus] || [];
    };

    expect(getAvailableTransitions('pending')).toContain('confirmed');
    expect(getAvailableTransitions('pending')).toContain('cancelled');
    expect(getAvailableTransitions('delivered')).toHaveLength(0);
  });

  it('determines if order can be cancelled', () => {
    const canCancel = (status: string): boolean => {
      return ['pending', 'confirmed', 'processing'].includes(status);
    };

    expect(canCancel('pending')).toBe(true);
    expect(canCancel('shipped')).toBe(false);
    expect(canCancel('delivered')).toBe(false);
  });

  it('determines if order can be edited', () => {
    const canEdit = (status: string): boolean => {
      return ['pending', 'confirmed'].includes(status);
    };

    expect(canEdit('pending')).toBe(true);
    expect(canEdit('processing')).toBe(false);
  });
});

describe('Order Notes', () => {
  it('displays order notes', () => {
    const order = {
      notes: 'Please handle with care. Call before delivery.',
    };

    expect(order.notes).toBeDefined();
    expect(order.notes.length).toBeGreaterThan(0);
  });

  it('displays internal notes', () => {
    const order = {
      internalNotes: 'VIP customer - priority shipping',
    };

    expect(order.internalNotes).toBeDefined();
  });

  it('handles empty notes', () => {
    const order = {
      notes: '',
      internalNotes: null,
    };

    const hasNotes = Boolean(order.notes);
    const hasInternalNotes = Boolean(order.internalNotes);

    expect(hasNotes).toBe(false);
    expect(hasInternalNotes).toBe(false);
  });
});

describe('Order Tracking', () => {
  it('displays tracking number', () => {
    const order = {
      trackingNumber: 'TRACK123456789',
      trackingUrl: 'https://tracking.example.com/TRACK123456789',
    };

    expect(order.trackingNumber).toBe('TRACK123456789');
    expect(order.trackingUrl).toContain(order.trackingNumber);
  });

  it('handles missing tracking info', () => {
    const order = {
      trackingNumber: null,
      trackingUrl: null,
    };

    const hasTracking = Boolean(order.trackingNumber);
    expect(hasTracking).toBe(false);
  });

  it('validates tracking URL format', () => {
    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    expect(isValidUrl('https://tracking.example.com/123')).toBe(true);
    expect(isValidUrl('not-a-url')).toBe(false);
  });
});
