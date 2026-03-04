/**
 * Server-side Settings Helper
 *
 * Fetches settings from database for use in server components and metadata generation
 */

import { prisma } from '@/lib/db';

export async function getSettings() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'default',
        },
      });
    }

    return settings;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    // Return default fallback settings
    return {
      id: 'default',
      companyName: 'Company',
      companyEmail: 'info@example.com',
      companyPhone: '',
      companyAddress: '',
      companyCity: '',
      companyCountry: 'Lebanon',
      companyWebsite: '',
      companyTaxId: '',
      companyDescription: 'Premium Products',
      logo: null,
      favicon: null,
      primaryColor: '#004D8B',
      secondaryColor: '#bb0c15',
      accentColor: null,
      fontFamily: 'Inter',
      defaultLanguage: 'en',
      timezone: 'Asia/Beirut',
      currency: 'USD' as const,
      currencySymbol: '$',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      emailFromName: '',
      emailFromAddress: '',
      emailOrderNotification: '',
      emailQuoteNotification: '',
      enableEmailNotifications: true,
      enableOrderConfirmationEmail: true,
      enableShippingNotificationEmail: true,
      socialFacebook: null,
      socialInstagram: null,
      socialLinkedIn: null,
      socialYouTube: null,
      socialTwitter: null,
      socialTikTok: null,
      lowStockThreshold: 10,
      trackInventory: true,
      allowBackorders: false,
      outOfStockBehavior: 'show',
      taxRate: 0,
      taxLabel: 'VAT',
      pricesIncludeTax: false,
      showPricesWithTax: true,
      shippingFee: 0,
      freeShippingThreshold: null,
      enableLocalPickup: false,
      enableQuotes: true,
      enableReviews: false,
      enableWishlist: false,
      enableCompare: false,
      enableBlog: false,
      metaTitle: null,
      metaDescription: null,
      metaKeywords: null,
      maintenanceMode: false,
      maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
