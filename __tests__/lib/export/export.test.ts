/**
 * Export Utilities Tests
 */

import {
  arrayToCSV,
  generateOrdersCSV,
  generateOrderItemsCSV,
  generateQuotesCSV,
  generateCustomersCSV,
  generateProductsCSV,
} from '@/lib/export';

describe('Export Utilities', () => {
  describe('arrayToCSV', () => {
    it('generates CSV header correctly', () => {
      const data = [{ name: 'Test', value: 100 }];
      const columns = [
        { key: 'name' as const, label: 'Name' },
        { key: 'value' as const, label: 'Value' },
      ];

      const csv = arrayToCSV(data, columns);
      const lines = csv.split('\r\n');

      expect(lines[0]).toBe('Name,Value');
    });

    it('generates data rows correctly', () => {
      const data = [
        { name: 'Item 1', value: 100 },
        { name: 'Item 2', value: 200 },
      ];
      const columns = [
        { key: 'name' as const, label: 'Name' },
        { key: 'value' as const, label: 'Value' },
      ];

      const csv = arrayToCSV(data, columns);
      const lines = csv.split('\r\n');

      expect(lines[1]).toBe('Item 1,100');
      expect(lines[2]).toBe('Item 2,200');
    });

    it('escapes commas in values', () => {
      const data = [{ name: 'Item, with comma', value: 100 }];
      const columns = [
        { key: 'name' as const, label: 'Name' },
        { key: 'value' as const, label: 'Value' },
      ];

      const csv = arrayToCSV(data, columns);
      const lines = csv.split('\r\n');

      expect(lines[1]).toBe('"Item, with comma",100');
    });

    it('escapes quotes in values', () => {
      const data = [{ name: 'Item "with" quotes', value: 100 }];
      const columns = [
        { key: 'name' as const, label: 'Name' },
        { key: 'value' as const, label: 'Value' },
      ];

      const csv = arrayToCSV(data, columns);
      const lines = csv.split('\r\n');

      expect(lines[1]).toBe('"Item ""with"" quotes",100');
    });

    it('handles null and undefined values', () => {
      const data = [{ name: null, value: undefined }];
      const columns = [
        { key: 'name' as const, label: 'Name' },
        { key: 'value' as const, label: 'Value' },
      ];

      const csv = arrayToCSV(data as any, columns);
      const lines = csv.split('\r\n');

      expect(lines[1]).toBe(',');
    });

    it('handles empty data array', () => {
      const data: Array<{ name: string; value: number }> = [];
      const columns = [
        { key: 'name' as const, label: 'Name' },
        { key: 'value' as const, label: 'Value' },
      ];

      const csv = arrayToCSV(data, columns);
      const lines = csv.split('\r\n');

      expect(lines).toHaveLength(1);
      expect(lines[0]).toBe('Name,Value');
    });
  });

  describe('generateOrdersCSV', () => {
    it('generates orders CSV with correct columns', () => {
      const orders = [
        {
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          status: 'pending',
          paymentStatus: 'pending',
          itemCount: 3,
          subtotal: 100,
          shippingCost: 10,
          tax: 5,
          discount: 0,
          total: 115,
          currency: 'USD',
          createdAt: new Date('2024-01-15'),
          paidAt: null,
          shippedAt: null,
          deliveredAt: null,
        },
      ];

      const csv = generateOrdersCSV(orders);
      const lines = csv.split('\r\n');

      expect(lines[0]).toContain('Order Number');
      expect(lines[0]).toContain('Customer Name');
      expect(lines[0]).toContain('Total');
      expect(lines[1]).toContain('ORD-001');
      expect(lines[1]).toContain('John Doe');
    });

    it('formats dates correctly', () => {
      const orders = [
        {
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          status: 'delivered',
          paymentStatus: 'paid',
          itemCount: 1,
          subtotal: 100,
          shippingCost: 0,
          tax: 0,
          discount: 0,
          total: 100,
          currency: 'USD',
          createdAt: new Date('2024-01-15'),
          paidAt: new Date('2024-01-15'),
          shippedAt: new Date('2024-01-16'),
          deliveredAt: new Date('2024-01-18'),
        },
      ];

      const csv = generateOrdersCSV(orders);

      expect(csv).toContain('2024-01-15');
      expect(csv).toContain('2024-01-16');
      expect(csv).toContain('2024-01-18');
    });

    it('formats currency correctly', () => {
      const orders = [
        {
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          status: 'pending',
          paymentStatus: 'pending',
          itemCount: 1,
          subtotal: 99.99,
          shippingCost: 10,
          tax: 5.5,
          discount: 0,
          total: 115.49,
          currency: 'USD',
          createdAt: new Date(),
          paidAt: null,
          shippedAt: null,
          deliveredAt: null,
        },
      ];

      const csv = generateOrdersCSV(orders);

      expect(csv).toContain('$99.99');
      expect(csv).toContain('$115.49');
    });
  });

  describe('generateOrderItemsCSV', () => {
    it('generates order items CSV correctly', () => {
      const items = [
        {
          orderNumber: 'ORD-001',
          productName: 'Power Drill',
          productSku: 'PD-001',
          variantName: 'Blue',
          quantity: 2,
          unitPrice: 99.99,
          totalPrice: 199.98,
          currency: 'USD',
        },
      ];

      const csv = generateOrderItemsCSV(items);
      const lines = csv.split('\r\n');

      expect(lines[0]).toContain('Order Number');
      expect(lines[0]).toContain('Product Name');
      expect(lines[0]).toContain('Quantity');
      expect(lines[1]).toContain('ORD-001');
      expect(lines[1]).toContain('Power Drill');
    });

    it('handles null variant name', () => {
      const items = [
        {
          orderNumber: 'ORD-001',
          productName: 'Power Drill',
          productSku: 'PD-001',
          variantName: null,
          quantity: 1,
          unitPrice: 99.99,
          totalPrice: 99.99,
          currency: 'USD',
        },
      ];

      const csv = generateOrderItemsCSV(items);

      expect(csv).not.toContain('null');
    });
  });

  describe('generateQuotesCSV', () => {
    it('generates quotes CSV correctly', () => {
      const quotes = [
        {
          quoteNumber: 'QUO-001',
          customerName: 'Jane Doe',
          customerEmail: 'jane@example.com',
          company: 'Acme Inc',
          status: 'sent',
          subtotal: 500,
          discount: 50,
          total: 450,
          currency: 'USD',
          validUntil: new Date('2024-02-15'),
          createdAt: new Date('2024-01-15'),
        },
      ];

      const csv = generateQuotesCSV(quotes);
      const lines = csv.split('\r\n');

      expect(lines[0]).toContain('Quote Number');
      expect(lines[0]).toContain('Company');
      expect(lines[1]).toContain('QUO-001');
      expect(lines[1]).toContain('Acme Inc');
    });

    it('handles null values', () => {
      const quotes = [
        {
          quoteNumber: 'QUO-001',
          customerName: 'Jane Doe',
          customerEmail: 'jane@example.com',
          company: null,
          status: 'pending',
          subtotal: null,
          discount: 0,
          total: null,
          currency: 'USD',
          validUntil: null,
          createdAt: new Date(),
        },
      ];

      const csv = generateQuotesCSV(quotes);

      expect(csv).not.toContain('null');
    });
  });

  describe('generateCustomersCSV', () => {
    it('generates customers CSV correctly', () => {
      const customers = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Acme Inc',
          phone: '+1234567890',
          address: '123 Main St',
          city: 'New York',
          region: 'NY',
          postalCode: '10001',
          country: 'USA',
          status: 'active',
          totalOrders: 5,
          totalSpent: 1500,
          createdAt: new Date('2024-01-01'),
        },
      ];

      const csv = generateCustomersCSV(customers);
      const lines = csv.split('\r\n');

      expect(lines[0]).toContain('Name');
      expect(lines[0]).toContain('Email');
      expect(lines[0]).toContain('Total Orders');
      expect(lines[0]).toContain('Total Spent');
      expect(lines[1]).toContain('John Doe');
      expect(lines[1]).toContain('5');
    });
  });

  describe('generateProductsCSV', () => {
    it('generates products CSV correctly', () => {
      const products = [
        {
          sku: 'PD-001',
          name: 'Power Drill',
          categoryName: 'Power Tools',
          brandName: 'DeWalt',
          price: 199.99,
          currency: 'USD',
          stockQuantity: 50,
          stockStatus: 'in_stock',
          isPublished: true,
          isFeatured: false,
          createdAt: new Date('2024-01-01'),
        },
      ];

      const csv = generateProductsCSV(products);
      const lines = csv.split('\r\n');

      expect(lines[0]).toContain('SKU');
      expect(lines[0]).toContain('Name');
      expect(lines[0]).toContain('Category');
      expect(lines[0]).toContain('Brand');
      expect(lines[1]).toContain('PD-001');
      expect(lines[1]).toContain('Power Drill');
      expect(lines[1]).toContain('Yes'); // isPublished
    });

    it('handles null price', () => {
      const products = [
        {
          sku: 'PD-001',
          name: 'Power Drill',
          categoryName: 'Power Tools',
          brandName: 'DeWalt',
          price: null,
          currency: 'USD',
          stockQuantity: 0,
          stockStatus: 'out_of_stock',
          isPublished: false,
          isFeatured: false,
          createdAt: new Date(),
        },
      ];

      const csv = generateProductsCSV(products);

      expect(csv).toContain('No'); // isPublished = false
      expect(csv).not.toContain('null');
    });
  });
});
