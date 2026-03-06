/**
 * Tooltip Content Strings
 *
 * Centralized tooltip content for form fields across the application.
 * Organized by section for easy maintenance and future i18n support.
 *
 * @module lib/content/tooltips
 */

export const TOOLTIPS = {
  admin: {
    products: {
      compareAtPrice:
        'Original price before discounts. Displayed as a strikethrough to show customers the savings.',
      trackInventory:
        'When enabled, stock levels are monitored and low stock alerts are triggered based on the threshold.',
      allowBackorders:
        'Allow customers to order this product even when stock is zero. Orders will be marked as backorder.',
      quickSpecs:
        'Enable dropdown selectors for dimension, size, grit, and packaging options on the product page.',
      sku: 'Stock Keeping Unit - a unique identifier for this product used in inventory management.',
      slug: 'URL-friendly name for the product. Auto-generated from the product name if left empty.',
      minStockLevel:
        'Trigger low stock alerts when inventory falls to or below this quantity.',
      stockQuantity: 'Current available inventory for this product.',
    },
    users: {
      discountPercentage:
        'Percentage discount applied to all product prices for this user. Range: 0-100%.',
      role: 'Admin users have full access to the admin dashboard. Customer users can only access their account area.',
      active:
        'Inactive users cannot log in. Use this to temporarily disable access without deleting the account.',
    },
    customers: {
      discountPercentage:
        'Permanent discount rate for this customer. Applied automatically at checkout on all products.',
      status:
        'Active: Can log in and order. Inactive: Cannot access account. Blocked: Denied all access.',
      isVerified:
        'Mark as verified after completing identity or business verification.',
      tags: 'Comma-separated tags for categorizing customers (e.g., "wholesale, priority, vip").',
    },
    settings: {
      inventory: {
        lowStockThreshold:
          'Products with stock at or below this number will trigger low stock alerts on the dashboard.',
        trackInventory:
          'When enabled globally, all products track inventory by default. Can be overridden per product.',
        allowBackorders:
          'When enabled globally, all products allow backorders by default. Can be overridden per product.',
        outOfStockBehavior:
          'Show: Display product but disable ordering. Hide: Remove from catalog. Backorder: Allow ordering with notice.',
      },
      pricing: {
        taxRate:
          'Default tax percentage applied to orders. Example: Enter 11 for 11% VAT.',
        taxLabel:
          'Label shown on invoices and checkout (e.g., "VAT", "Tax", "GST").',
        pricesIncludeTax:
          'When enabled, product prices shown include tax. When disabled, tax is added at checkout.',
        showPricesWithTax:
          'Display prices with tax included on the storefront, regardless of internal pricing.',
        freeShippingThreshold:
          'Order subtotal required for free shipping. Leave empty to disable free shipping.',
        shippingFee:
          'Default shipping fee applied to orders below the free shipping threshold.',
      },
      email: {
        emailFromName:
          'Name displayed in the "From" field of outgoing emails.',
        emailFromAddress:
          'Email address used as the sender for system emails.',
        orderNotification:
          'Email address that receives new order notifications.',
        quoteNotification:
          'Email address that receives new quote request notifications.',
      },
      features: {
        maintenanceMode:
          'WARNING: Enabling this will make the site inaccessible to customers. Only admins can access during maintenance.',
        enableQuotes:
          'Allow customers to request quotes instead of placing orders directly.',
        enableReviews:
          'Allow customers to leave reviews and ratings on products.',
        enableWishlist:
          'Allow customers to save products to a wishlist for later.',
        enableCompare:
          'Allow customers to compare multiple products side by side.',
      },
    },
    orders: {
      internalNote:
        'Private note visible only to admin staff. Not shown to customers.',
      customerNote:
        'Note from the customer, visible to both customer and admin.',
    },
    quotes: {
      validUntil:
        'Expiration date for the quote. Customer cannot accept after this date.',
      discountApplied:
        "Customer's discount percentage at the time the quote was created. This is locked and won't change.",
    },
  },
  account: {
    profile: {
      discountRate:
        'Your negotiated discount rate, set by Motico Solutions based on your account agreement. Contact us to discuss pricing.',
      phone:
        'Include country code (e.g., +961 3 XXX XXX). Used for order and delivery notifications.',
      position:
        'Your job title or role at your company (e.g., Purchasing Manager, Workshop Owner).',
      company:
        'Your company or business name. Used for invoicing and business account features.',
    },
    settings: {
      emailNotifications:
        'Receive important account updates, security alerts, and announcements via email.',
      quoteNotifications:
        'Get notified when your quote requests are reviewed, updated, or ready for acceptance.',
      orderNotifications:
        'Receive updates about order status changes, shipping, and delivery confirmations.',
      promotionalEmails:
        'Receive occasional emails about new products, special offers, and industry news.',
    },
    quotes: {
      validUntil:
        'The date until which this quote remains valid. After this date, prices may change.',
      acceptQuote:
        'Accepting this quote will convert it into a binding order. You will receive order confirmation.',
    },
  },
} as const;

// Type helper for accessing tooltip content
export type AdminTooltips = typeof TOOLTIPS.admin;
export type AccountTooltips = typeof TOOLTIPS.account;
