/**
 * Settings Hook
 *
 * Provides easy access to site settings throughout the application.
 * Automatically fetches and caches settings from the API.
 *
 * @module lib/hooks/useSettings
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SiteSettings {
  // Company Information
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  companyWebsite: string;
  companyTaxId: string;
  companyDescription: string;

  // Branding
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string | null;
  fontFamily: string;

  // Localization
  defaultLanguage: string;
  timezone: string;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;

  // Email Settings (admin only in full)
  emailFromName?: string;
  emailFromAddress?: string;
  emailOrderNotification?: string;
  emailQuoteNotification?: string;
  enableEmailNotifications?: boolean;
  enableOrderConfirmationEmail?: boolean;
  enableShippingNotificationEmail?: boolean;

  // Social Media
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialLinkedIn: string | null;
  socialYouTube: string | null;
  socialTwitter: string | null;
  socialTikTok: string | null;

  // Inventory Settings (admin only in full)
  lowStockThreshold?: number;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  outOfStockBehavior?: string;

  // Pricing & Tax (admin only in full)
  taxRate?: number;
  taxLabel?: string;
  pricesIncludeTax?: boolean;
  showPricesWithTax?: boolean;
  shippingFee?: number;
  freeShippingThreshold?: number | null;
  enableLocalPickup?: boolean;

  // Features
  enableQuotes: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  enableCompare?: boolean;
  enableBlog?: boolean;

  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage: string;

  // SEO (admin only)
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
}

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default settings fallback
const defaultSettings: SiteSettings = {
  companyName: 'Motico Solutions',
  companyEmail: 'info@example.com',
  companyPhone: '',
  companyAddress: '',
  companyCity: '',
  companyCountry: 'Lebanon',
  companyWebsite: '',
  companyTaxId: '',
  companyDescription: '',
  logo: null,
  favicon: null,
  primaryColor: '#004D8B',
  secondaryColor: '#bb0c15',
  accentColor: null,
  fontFamily: 'Inter',
  defaultLanguage: 'en',
  timezone: 'Asia/Beirut',
  currency: 'USD',
  currencySymbol: '$',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  socialFacebook: null,
  socialInstagram: null,
  socialLinkedIn: null,
  socialYouTube: null,
  socialTwitter: null,
  socialTikTok: null,
  enableQuotes: true,
  enableReviews: false,
  enableWishlist: false,
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      // Use default settings as fallback
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refetch: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to access site settings
 *
 * @example
 * const { settings, loading } = useSettings();
 * if (loading) return <Loader />;
 * return <div style={{ color: settings?.primaryColor }}>{settings?.companyName}</div>;
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
