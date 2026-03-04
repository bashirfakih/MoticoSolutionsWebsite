'use client';

/**
 * Admin Settings Page - White Label Configuration
 *
 * Comprehensive settings for white-label e-commerce platform.
 * All settings are stored in database for easy deployment across instances.
 *
 * @module app/admin/settings/page
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Bell,
  Save,
  RotateCcw,
  AlertTriangle,
  DollarSign,
  Package,
  Loader2,
  Palette,
  Globe,
  Mail,
  Settings,
  Shield,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface SiteSettings {
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

  // Email Settings
  emailFromName: string;
  emailFromAddress: string;
  emailOrderNotification: string;
  emailQuoteNotification: string;
  enableEmailNotifications: boolean;
  enableOrderConfirmationEmail: boolean;
  enableShippingNotificationEmail: boolean;

  // Social Media
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialLinkedIn: string | null;
  socialYouTube: string | null;
  socialTwitter: string | null;
  socialTikTok: string | null;

  // Inventory Settings
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  outOfStockBehavior: string;

  // Pricing & Tax
  taxRate: number;
  taxLabel: string;
  pricesIncludeTax: boolean;
  showPricesWithTax: boolean;

  // Shipping
  shippingFee: number;
  freeShippingThreshold: number | null;
  enableLocalPickup: boolean;

  // Features
  enableQuotes: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  enableCompare: boolean;
  enableBlog: boolean;

  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;

  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

type TabId = 'company' | 'branding' | 'localization' | 'email' | 'social' | 'inventory' | 'pricing' | 'features';

export default function AdminSettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('company');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        toast.error('Failed to load settings');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#004D8B]" />
      </div>
    );
  }

  const tabs = [
    { id: 'company' as const, label: 'Company', icon: Building2 },
    { id: 'branding' as const, label: 'Branding', icon: Palette },
    { id: 'localization' as const, label: 'Localization', icon: Globe },
    { id: 'email' as const, label: 'Email', icon: Mail },
    { id: 'social' as const, label: 'Social Media', icon: Globe },
    { id: 'inventory' as const, label: 'Inventory', icon: Package },
    { id: 'pricing' as const, label: 'Pricing & Tax', icon: DollarSign },
    { id: 'features' as const, label: 'Features', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your e-commerce platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadSettings()}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reload
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg font-medium hover:bg-[#003a6a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          You have unsaved changes. Don&apos;t forget to save!
        </div>
      )}

      {/* Maintenance Mode Banner */}
      {settings.maintenanceMode && (
        <div className="bg-orange-50 text-orange-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <strong>Maintenance Mode is ON</strong> - Your site is currently offline for customers.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#004D8B] text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Company Tab */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => updateSetting('companyName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={settings.companyEmail}
                      onChange={(e) => updateSetting('companyEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={settings.companyPhone}
                      onChange={(e) => updateSetting('companyPhone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="text"
                      value={settings.companyWebsite}
                      onChange={(e) => updateSetting('companyWebsite', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={settings.companyAddress}
                      onChange={(e) => updateSetting('companyAddress', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={settings.companyCity}
                      onChange={(e) => updateSetting('companyCity', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={settings.companyCountry}
                      onChange={(e) => updateSetting('companyCountry', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                    <input
                      type="text"
                      value={settings.companyTaxId}
                      onChange={(e) => updateSetting('companyTaxId', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                    <textarea
                      value={settings.companyDescription}
                      onChange={(e) => updateSetting('companyDescription', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Palette className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Branding & Theme</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                      <div className="space-y-3">
                        {settings.logo && (
                          <div className="relative w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                            <img
                              src={settings.logo}
                              alt="Logo preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('type', 'logo');

                              try {
                                const response = await fetch('/api/upload/image', {
                                  method: 'POST',
                                  body: formData,
                                });

                                if (response.ok) {
                                  const data = await response.json();
                                  updateSetting('logo', data.url);
                                } else {
                                  alert('Failed to upload image');
                                }
                              } catch (error) {
                                console.error('Upload error:', error);
                                alert('Failed to upload image');
                              }
                            }}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-center text-sm font-medium text-gray-700 transition-colors"
                          >
                            Upload Logo
                          </label>
                          <input
                            type="text"
                            value={settings.logo || ''}
                            onChange={(e) => updateSetting('logo', e.target.value || null)}
                            placeholder="/logo.png"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                          />
                        </div>
                        <p className="text-xs text-gray-500">Upload an image or enter a URL (PNG, JPEG, WebP, SVG - max 5MB)</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                      <div className="space-y-3">
                        {settings.favicon && (
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                            <img
                              src={settings.favicon}
                              alt="Favicon preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/x-icon"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('type', 'favicon');

                              try {
                                const response = await fetch('/api/upload/image', {
                                  method: 'POST',
                                  body: formData,
                                });

                                if (response.ok) {
                                  const data = await response.json();
                                  updateSetting('favicon', data.url);
                                } else {
                                  alert('Failed to upload image');
                                }
                              } catch (error) {
                                console.error('Upload error:', error);
                                alert('Failed to upload image');
                              }
                            }}
                            className="hidden"
                            id="favicon-upload"
                          />
                          <label
                            htmlFor="favicon-upload"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-center text-sm font-medium text-gray-700 transition-colors"
                          >
                            Upload Favicon
                          </label>
                          <input
                            type="text"
                            value={settings.favicon || ''}
                            onChange={(e) => updateSetting('favicon', e.target.value || null)}
                            placeholder="/favicon.ico"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                          />
                        </div>
                        <p className="text-xs text-gray-500">Upload an image or enter a URL (ICO, PNG - max 5MB)</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Brand Colors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) => updateSetting('primaryColor', e.target.value)}
                            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.primaryColor}
                            onChange={(e) => updateSetting('primaryColor', e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.secondaryColor}
                            onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.secondaryColor}
                            onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.accentColor || '#000000'}
                            onChange={(e) => updateSetting('accentColor', e.target.value)}
                            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.accentColor || ''}
                            onChange={(e) => updateSetting('accentColor', e.target.value || null)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                    <select
                      value={settings.fontFamily}
                      onChange={(e) => updateSetting('fontFamily', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Localization Tab */}
            {activeTab === 'localization' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Localization Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    >
                      <option value="en">English</option>
                      <option value="ar">Arabic</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    >
                      <option value="Asia/Beirut">Asia/Beirut</option>
                      <option value="Asia/Dubai">Asia/Dubai</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="LBP">LBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
                    <input
                      type="text"
                      value={settings.currencySymbol}
                      onChange={(e) => updateSetting('currencySymbol', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => updateSetting('dateFormat', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                    <select
                      value={settings.timeFormat}
                      onChange={(e) => updateSetting('timeFormat', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    >
                      <option value="12h">12-hour</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Email Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                    <input
                      type="text"
                      value={settings.emailFromName}
                      onChange={(e) => updateSetting('emailFromName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Address</label>
                    <input
                      type="email"
                      value={settings.emailFromAddress}
                      onChange={(e) => updateSetting('emailFromAddress', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Notification Email</label>
                    <input
                      type="email"
                      value={settings.emailOrderNotification}
                      onChange={(e) => updateSetting('emailOrderNotification', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quote Notification Email</label>
                    <input
                      type="email"
                      value={settings.emailQuoteNotification}
                      onChange={(e) => updateSetting('emailQuoteNotification', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enableEmailNotifications}
                      onChange={(e) => updateSetting('enableEmailNotifications', e.target.checked)}
                      className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                    />
                    <span className="text-sm text-gray-700">Enable email notifications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enableOrderConfirmationEmail}
                      onChange={(e) => updateSetting('enableOrderConfirmationEmail', e.target.checked)}
                      className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                    />
                    <span className="text-sm text-gray-700">Send order confirmation emails</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enableShippingNotificationEmail}
                      onChange={(e) => updateSetting('enableShippingNotificationEmail', e.target.checked)}
                      className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                    />
                    <span className="text-sm text-gray-700">Send shipping notification emails</span>
                  </label>
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Social Media Links</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                    <input
                      type="text"
                      value={settings.socialFacebook || ''}
                      onChange={(e) => updateSetting('socialFacebook', e.target.value || null)}
                      placeholder="https://facebook.com/yourcompany"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                    <input
                      type="text"
                      value={settings.socialInstagram || ''}
                      onChange={(e) => updateSetting('socialInstagram', e.target.value || null)}
                      placeholder="https://instagram.com/yourcompany"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                    <input
                      type="text"
                      value={settings.socialLinkedIn || ''}
                      onChange={(e) => updateSetting('socialLinkedIn', e.target.value || null)}
                      placeholder="https://linkedin.com/company/yourcompany"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                    <input
                      type="text"
                      value={settings.socialYouTube || ''}
                      onChange={(e) => updateSetting('socialYouTube', e.target.value || null)}
                      placeholder="https://youtube.com/@yourcompany"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter/X URL</label>
                    <input
                      type="text"
                      value={settings.socialTwitter || ''}
                      onChange={(e) => updateSetting('socialTwitter', e.target.value || null)}
                      placeholder="https://twitter.com/yourcompany"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TikTok URL</label>
                    <input
                      type="text"
                      value={settings.socialTikTok || ''}
                      onChange={(e) => updateSetting('socialTikTok', e.target.value || null)}
                      placeholder="https://tiktok.com/@yourcompany"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Inventory Management</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                    <input
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) => updateSetting('lowStockThreshold', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this number</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Out of Stock Behavior</label>
                    <select
                      value={settings.outOfStockBehavior}
                      onChange={(e) => updateSetting('outOfStockBehavior', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    >
                      <option value="show">Show (but disabled)</option>
                      <option value="hide">Hide completely</option>
                      <option value="backorder">Allow backorders</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.trackInventory}
                      onChange={(e) => updateSetting('trackInventory', e.target.checked)}
                      className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                    />
                    <span className="text-sm text-gray-700">Track inventory levels</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.allowBackorders}
                      onChange={(e) => updateSetting('allowBackorders', e.target.checked)}
                      className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                    />
                    <span className="text-sm text-gray-700">Allow backorders by default</span>
                  </label>
                </div>
              </div>
            )}

            {/* Pricing & Tax Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Pricing & Tax Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.taxRate}
                      onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Label</label>
                    <input
                      type="text"
                      value={settings.taxLabel}
                      onChange={(e) => updateSetting('taxLabel', e.target.value)}
                      placeholder="VAT, GST, Tax..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Fee</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.shippingFee}
                      onChange={(e) => updateSetting('shippingFee', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.freeShippingThreshold || ''}
                      onChange={(e) => updateSetting('freeShippingThreshold', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Leave empty to disable"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.pricesIncludeTax}
                      onChange={(e) => updateSetting('pricesIncludeTax', e.target.checked)}
                      className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                    />
                    <span className="text-sm text-gray-700">Prices include tax</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.showPricesWithTax}
                      onChange={(e) => updateSetting('showPricesWithTax', e.target.checked)}
                      className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                    />
                    <span className="text-sm text-gray-700">Show prices with tax</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enableLocalPickup}
                      onChange={(e) => updateSetting('enableLocalPickup', e.target.checked)}
                      className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                    />
                    <span className="text-sm text-gray-700">Enable local pickup option</span>
                  </label>
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Feature Toggles</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Enable Quotes</p>
                        <p className="text-xs text-gray-500">Allow customers to request quotes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableQuotes}
                        onChange={(e) => updateSetting('enableQuotes', e.target.checked)}
                        className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                      />
                    </label>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Enable Reviews</p>
                        <p className="text-xs text-gray-500">Allow customers to leave product reviews</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableReviews}
                        onChange={(e) => updateSetting('enableReviews', e.target.checked)}
                        className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                      />
                    </label>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Enable Wishlist</p>
                        <p className="text-xs text-gray-500">Allow customers to save favorite products</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableWishlist}
                        onChange={(e) => updateSetting('enableWishlist', e.target.checked)}
                        className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                      />
                    </label>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Enable Product Compare</p>
                        <p className="text-xs text-gray-500">Allow customers to compare products side-by-side</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableCompare}
                        onChange={(e) => updateSetting('enableCompare', e.target.checked)}
                        className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                      />
                    </label>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Enable Blog</p>
                        <p className="text-xs text-gray-500">Enable blog/news section</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableBlog}
                        onChange={(e) => updateSetting('enableBlog', e.target.checked)}
                        className="w-4 h-4 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                      />
                    </label>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-900">Maintenance Mode</p>
                        <p className="text-xs text-orange-700">Take site offline for maintenance</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600"
                      />
                    </label>
                    {settings.maintenanceMode && (
                      <div className="mt-3">
                        <textarea
                          value={settings.maintenanceMessage}
                          onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Maintenance message..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
