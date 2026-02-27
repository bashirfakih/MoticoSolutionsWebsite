/**
 * Settings API Client
 *
 * Client-side service for site settings.
 *
 * @module lib/api/settingsApi
 */

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: 'USD' | 'EUR' | 'LBP';
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number | null;
  orderNotificationEmail: string;
  lowStockAlertThreshold: number;
  enableEmailNotifications: boolean;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialLinkedIn: string | null;
  socialYouTube: string | null;
  updatedAt: string;
}

export type SettingsInput = Partial<Omit<SiteSettings, 'id' | 'updatedAt'>>;

/**
 * Fetch site settings
 */
export async function getSettings(): Promise<SiteSettings> {
  const res = await fetch('/api/settings');

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch settings');
  }

  return res.json();
}

/**
 * Update site settings
 */
export async function updateSettings(input: SettingsInput): Promise<SiteSettings> {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update settings');
  }

  return res.json();
}

/**
 * Settings API service object
 */
export const settingsApiService = {
  get: getSettings,
  update: updateSettings,
};
