/**
 * Email Service Tests
 */

import { emailTemplates } from '@/lib/email';

describe('Email Templates', () => {
  describe('passwordReset', () => {
    it('generates password reset email with correct content', () => {
      const result = emailTemplates.passwordReset('John Doe', 'https://example.com/reset?token=abc123');

      expect(result.subject).toBe('Reset Your Password - Motico Solutions');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('https://example.com/reset?token=abc123');
      expect(result.html).toContain('Reset Password');
    });
  });

  describe('orderConfirmation', () => {
    it('generates order confirmation email with items', () => {
      const items = [
        { name: 'Product 1', quantity: 2, price: '$10.00' },
        { name: 'Product 2', quantity: 1, price: '$25.00' },
      ];

      const result = emailTemplates.orderConfirmation('ORD-2024-001', 'Jane Doe', '$45.00', items);

      expect(result.subject).toBe('Order Confirmed - ORD-2024-001');
      expect(result.html).toContain('Jane Doe');
      expect(result.html).toContain('ORD-2024-001');
      expect(result.html).toContain('$45.00');
      expect(result.html).toContain('Product 1');
      expect(result.html).toContain('Product 2');
    });
  });

  describe('quoteResponse', () => {
    it('generates quote response email', () => {
      const result = emailTemplates.quoteResponse(
        'QUO-2024-001',
        'Bob Smith',
        '$1,500.00',
        'Thank you for your inquiry!',
        'Dec 31, 2024'
      );

      expect(result.subject).toBe('Your Quote is Ready - QUO-2024-001');
      expect(result.html).toContain('Bob Smith');
      expect(result.html).toContain('QUO-2024-001');
      expect(result.html).toContain('$1,500.00');
      expect(result.html).toContain('Dec 31, 2024');
      expect(result.html).toContain('Thank you for your inquiry!');
    });
  });

  describe('newMessageNotification', () => {
    it('generates new message notification email', () => {
      const result = emailTemplates.newMessageNotification(
        'Alice Brown',
        'alice@example.com',
        'Product Inquiry',
        'I would like to know more about your products.'
      );

      expect(result.subject).toBe('New Contact Form Message: Product Inquiry');
      expect(result.html).toContain('Alice Brown');
      expect(result.html).toContain('alice@example.com');
      expect(result.html).toContain('Product Inquiry');
      expect(result.html).toContain('I would like to know more about your products.');
    });
  });
});
