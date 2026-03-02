/**
 * Email Service
 *
 * Handles sending emails for notifications, password resets, etc.
 * Currently logs to console in development. Configure SMTP for production.
 *
 * @module lib/email
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const DEFAULT_FROM = process.env.EMAIL_FROM || 'Motico Solutions <noreply@moticosolutions.com>';

/**
 * Send an email
 * In development, logs to console. In production, uses configured SMTP.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const { to, subject, html, text, from = DEFAULT_FROM, replyTo } = options;

  // Development mode - log to console
  if (process.env.NODE_ENV !== 'production' || !process.env.SMTP_HOST) {
    console.log('========================================');
    console.log('EMAIL (Development Mode - Not Sent)');
    console.log('========================================');
    console.log(`From: ${from}`);
    console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`Subject: ${subject}`);
    if (replyTo) console.log(`Reply-To: ${replyTo}`);
    console.log('----------------------------------------');
    console.log(text || html.replace(/<[^>]*>/g, ''));
    console.log('========================================');

    return {
      success: true,
      messageId: `dev-${Date.now()}`,
    };
  }

  // Production mode - use nodemailer
  try {
    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const result = await transporter.sendMail({
      from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      replyTo,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Email templates
 */
export const emailTemplates = {
  /**
   * Password reset email
   */
  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Reset Your Password - Motico Solutions',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #004D8B; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #004D8B; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Motico Solutions</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>Hi ${name},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Motico Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Order confirmation email
   */
  orderConfirmation: (orderNumber: string, customerName: string, total: string, items: Array<{ name: string; quantity: number; price: string }>) => ({
    subject: `Order Confirmed - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #004D8B; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .order-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .total { font-size: 18px; font-weight: bold; padding: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              <p>Thank you for your order! We've received your order and will process it shortly.</p>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <h3>Order Details</h3>
              ${items.map(item => `
                <div class="order-item">
                  <strong>${item.name}</strong><br>
                  Qty: ${item.quantity} × ${item.price}
                </div>
              `).join('')}
              <div class="total">Total: ${total}</div>
              <p>We'll send you another email when your order ships.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Motico Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Quote response email
   */
  quoteResponse: (quoteNumber: string, customerName: string, total: string, message: string, validUntil: string) => ({
    subject: `Your Quote is Ready - ${quoteNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #004D8B; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .quote-box { background: white; padding: 20px; border: 2px solid #004D8B; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #004D8B; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Quote is Ready!</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              <p>We've prepared a quote for your inquiry.</p>
              <div class="quote-box">
                <p><strong>Quote Number:</strong> ${quoteNumber}</p>
                <p><strong>Total:</strong> ${total}</p>
                <p><strong>Valid Until:</strong> ${validUntil}</p>
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
              </div>
              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/account/quotes" class="button">View Quote</a>
              </p>
              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Motico Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * New message notification (admin)
   */
  newMessageNotification: (senderName: string, senderEmail: string, subject: string, message: string) => ({
    subject: `New Contact Form Message: ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #004D8B; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .message-box { background: white; padding: 20px; border-left: 4px solid #004D8B; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #004D8B; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Message Received</h1>
            </div>
            <div class="content">
              <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <div class="message-box">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/messages" class="button">View in Admin</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Motico Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Inventory alert notification (admin)
   */
  inventoryAlert: (
    criticalItems: Array<{ name: string; sku: string; quantity: number; category: string }>,
    warningItems: Array<{ name: string; sku: string; quantity: number; minLevel: number; category: string }>,
    threshold: number
  ) => ({
    subject: `Inventory Alert: ${criticalItems.length} out of stock, ${warningItems.length} low stock`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .header.warning { background: #f59e0b; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .section { margin: 20px 0; }
            .section-title { font-size: 16px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }
            .section-title.warning { color: #f59e0b; }
            .item { padding: 10px; background: white; border-left: 4px solid #dc2626; margin: 8px 0; }
            .item.warning { border-left-color: #f59e0b; }
            .item-name { font-weight: bold; }
            .item-details { font-size: 14px; color: #666; }
            .summary { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .summary-item { display: inline-block; margin-right: 30px; }
            .summary-value { font-size: 24px; font-weight: bold; }
            .critical { color: #dc2626; }
            .warning { color: #f59e0b; }
            .button { display: inline-block; padding: 12px 24px; background: #004D8B; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header ${criticalItems.length === 0 ? 'warning' : ''}">
              <h1>Inventory Alert</h1>
            </div>
            <div class="content">
              <div class="summary">
                <div class="summary-item">
                  <div class="summary-value critical">${criticalItems.length}</div>
                  <div>Out of Stock</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value warning">${warningItems.length}</div>
                  <div>Low Stock</div>
                </div>
              </div>

              ${criticalItems.length > 0 ? `
              <div class="section">
                <div class="section-title">Out of Stock (Critical)</div>
                ${criticalItems.map(item => `
                  <div class="item">
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">
                      SKU: ${item.sku} | Category: ${item.category} | <strong>Qty: ${item.quantity}</strong>
                    </div>
                  </div>
                `).join('')}
              </div>
              ` : ''}

              ${warningItems.length > 0 ? `
              <div class="section">
                <div class="section-title warning">Low Stock (Below ${threshold} or min level)</div>
                ${warningItems.map(item => `
                  <div class="item warning">
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">
                      SKU: ${item.sku} | Category: ${item.category} | Qty: ${item.quantity} (Min: ${item.minLevel})
                    </div>
                  </div>
                `).join('')}
              </div>
              ` : ''}

              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/products" class="button">Manage Inventory</a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated inventory alert from Motico Solutions.</p>
              <p>&copy; ${new Date().getFullYear()} Motico Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};
