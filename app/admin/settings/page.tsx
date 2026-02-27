'use client';

/**
 * Admin Settings Page
 *
 * Site configuration, company info, and preferences.
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
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  website: string;
  taxId: string;
}

interface NotificationSettings {
  emailNewOrders: boolean;
  emailNewQuotes: boolean;
  emailNewMessages: boolean;
  emailLowStock: boolean;
  browserNotifications: boolean;
}

interface InventorySettings {
  lowStockThreshold: number;
  outOfStockBehavior: 'hide' | 'show' | 'backorder';
  trackInventory: boolean;
}

interface CurrencySettings {
  currency: string;
  currencySymbol: string;
  decimalPlaces: number;
  thousandsSeparator: string;
}

const STORAGE_KEY = 'motico_settings';

const defaultCompanySettings: CompanySettings = {
  name: 'Motico Solutions',
  email: 'info@moticosolutions.com',
  phone: '+961 1 234 567',
  address: 'Industrial Zone, Building 5',
  city: 'Beirut',
  country: 'Lebanon',
  website: 'www.moticosolutions.com',
  taxId: 'LB123456789',
};

const defaultNotificationSettings: NotificationSettings = {
  emailNewOrders: true,
  emailNewQuotes: true,
  emailNewMessages: true,
  emailLowStock: true,
  browserNotifications: false,
};

const defaultInventorySettings: InventorySettings = {
  lowStockThreshold: 10,
  outOfStockBehavior: 'show',
  trackInventory: true,
};

const defaultCurrencySettings: CurrencySettings = {
  currency: 'USD',
  currencySymbol: '$',
  decimalPlaces: 2,
  thousandsSeparator: ',',
};

export default function AdminSettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'company' | 'notifications' | 'inventory' | 'currency'>('company');
  const [company, setCompany] = useState<CompanySettings>(defaultCompanySettings);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotificationSettings);
  const [inventory, setInventory] = useState<InventorySettings>(defaultInventorySettings);
  const [currency, setCurrency] = useState<CurrencySettings>(defaultCurrencySettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load from API
      const response = await fetch('/api/settings');
      if (response.ok) {
        const dbSettings = await response.json();
        // Map database fields to local state
        setCompany(prev => ({
          ...prev,
          name: dbSettings.siteName || prev.name,
          email: dbSettings.contactEmail || prev.email,
          phone: dbSettings.contactPhone || prev.phone,
          address: dbSettings.address || prev.address,
        }));
        setNotifications(prev => ({
          ...prev,
          emailNewOrders: dbSettings.enableEmailNotifications ?? prev.emailNewOrders,
          emailNewQuotes: dbSettings.enableEmailNotifications ?? prev.emailNewQuotes,
          emailNewMessages: dbSettings.enableEmailNotifications ?? prev.emailNewMessages,
          emailLowStock: dbSettings.enableEmailNotifications ?? prev.emailLowStock,
        }));
        setInventory(prev => ({
          ...prev,
          lowStockThreshold: dbSettings.lowStockAlertThreshold ?? prev.lowStockThreshold,
        }));
        // Currency enum from DB
        if (dbSettings.currency) {
          setCurrency(prev => ({
            ...prev,
            currency: dbSettings.currency,
          }));
        }
      }

      // Also load extended settings from localStorage (for fields not in DB)
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const localSettings = JSON.parse(stored);
        // Merge localStorage fields that aren't in DB
        if (localSettings.company) {
          setCompany(prev => ({
            ...prev,
            city: localSettings.company.city || prev.city,
            country: localSettings.company.country || prev.country,
            website: localSettings.company.website || prev.website,
            taxId: localSettings.company.taxId || prev.taxId,
          }));
        }
        if (localSettings.notifications) {
          setNotifications(prev => ({
            ...prev,
            browserNotifications: localSettings.notifications.browserNotifications ?? prev.browserNotifications,
          }));
        }
        if (localSettings.inventory) {
          setInventory(prev => ({
            ...prev,
            outOfStockBehavior: localSettings.inventory.outOfStockBehavior || prev.outOfStockBehavior,
            trackInventory: localSettings.inventory.trackInventory ?? prev.trackInventory,
          }));
        }
        if (localSettings.currency) {
          setCurrency(prev => ({
            ...prev,
            currencySymbol: localSettings.currency.currencySymbol || prev.currencySymbol,
            decimalPlaces: localSettings.currency.decimalPlaces ?? prev.decimalPlaces,
            thousandsSeparator: localSettings.currency.thousandsSeparator || prev.thousandsSeparator,
          }));
        }
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
    setIsSaving(true);
    try {
      // Save to API (database)
      const apiPayload = {
        siteName: company.name,
        contactEmail: company.email,
        contactPhone: company.phone,
        address: company.address,
        currency: currency.currency,
        lowStockAlertThreshold: inventory.lowStockThreshold,
        enableEmailNotifications: notifications.emailNewOrders || notifications.emailNewQuotes || notifications.emailNewMessages || notifications.emailLowStock,
      };

      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      // Save extended settings to localStorage (for fields not in DB schema)
      const localSettings = {
        company: {
          city: company.city,
          country: company.country,
          website: company.website,
          taxId: company.taxId,
        },
        notifications: {
          browserNotifications: notifications.browserNotifications,
        },
        inventory: {
          outOfStockBehavior: inventory.outOfStockBehavior,
          trackInventory: inventory.trackInventory,
        },
        currency: {
          currencySymbol: currency.currencySymbol,
          decimalPlaces: currency.decimalPlaces,
          thousandsSeparator: currency.thousandsSeparator,
        },
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localSettings));

      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setCompany(defaultCompanySettings);
      setNotifications(defaultNotificationSettings);
      setInventory(defaultInventorySettings);
      setCurrency(defaultCurrencySettings);
      setHasChanges(true);
    }
  };

  const handleChange = () => {
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#004D8B]" />
      </div>
    );
  }

  const tabs = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'currency', label: 'Currency', icon: DollarSign },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store configuration</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
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
            {/* Company Settings */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={company.name}
                      onChange={(e) => { setCompany({ ...company, name: e.target.value }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={company.email}
                      onChange={(e) => { setCompany({ ...company, email: e.target.value }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={company.phone}
                      onChange={(e) => { setCompany({ ...company, phone: e.target.value }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      value={company.website}
                      onChange={(e) => { setCompany({ ...company, website: e.target.value }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={company.address}
                      onChange={(e) => { setCompany({ ...company, address: e.target.value }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={company.city}
                      onChange={(e) => { setCompany({ ...company, city: e.target.value }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={company.country}
                      onChange={(e) => { setCompany({ ...company, country: e.target.value }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax ID
                    </label>
                    <input
                      type="text"
                      value={company.taxId}
                      onChange={(e) => { setCompany({ ...company, taxId: e.target.value }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">New Orders</p>
                      <p className="text-sm text-gray-500">Receive email when a new order is placed</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailNewOrders}
                      onChange={(e) => { setNotifications({ ...notifications, emailNewOrders: e.target.checked }); handleChange(); }}
                      className="w-5 h-5 text-[#004D8B] rounded focus:ring-[#004D8B]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">New Quote Requests</p>
                      <p className="text-sm text-gray-500">Receive email when a new quote is requested</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailNewQuotes}
                      onChange={(e) => { setNotifications({ ...notifications, emailNewQuotes: e.target.checked }); handleChange(); }}
                      className="w-5 h-5 text-[#004D8B] rounded focus:ring-[#004D8B]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">New Messages</p>
                      <p className="text-sm text-gray-500">Receive email for contact form submissions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailNewMessages}
                      onChange={(e) => { setNotifications({ ...notifications, emailNewMessages: e.target.checked }); handleChange(); }}
                      className="w-5 h-5 text-[#004D8B] rounded focus:ring-[#004D8B]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">Low Stock Alerts</p>
                      <p className="text-sm text-gray-500">Receive email when products are running low</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailLowStock}
                      onChange={(e) => { setNotifications({ ...notifications, emailLowStock: e.target.checked }); handleChange(); }}
                      className="w-5 h-5 text-[#004D8B] rounded focus:ring-[#004D8B]"
                    />
                  </label>

                  <h3 className="text-sm font-medium text-gray-700 mt-6">Browser Notifications</h3>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">Enable Browser Notifications</p>
                      <p className="text-sm text-gray-500">Show desktop notifications for important events</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.browserNotifications}
                      onChange={(e) => { setNotifications({ ...notifications, browserNotifications: e.target.checked }); handleChange(); }}
                      className="w-5 h-5 text-[#004D8B] rounded focus:ring-[#004D8B]"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Inventory Settings */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Inventory Settings</h2>
                </div>

                <div className="space-y-6">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">Track Inventory</p>
                      <p className="text-sm text-gray-500">Enable stock level tracking for products</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={inventory.trackInventory}
                      onChange={(e) => { setInventory({ ...inventory, trackInventory: e.target.checked }); handleChange(); }}
                      className="w-5 h-5 text-[#004D8B] rounded focus:ring-[#004D8B]"
                    />
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Threshold
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Products with stock below this level will be marked as &quot;Low Stock&quot;
                    </p>
                    <input
                      type="number"
                      min="1"
                      value={inventory.lowStockThreshold}
                      onChange={(e) => { setInventory({ ...inventory, lowStockThreshold: parseInt(e.target.value) || 10 }); handleChange(); }}
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Out of Stock Behavior
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      How to handle products that are out of stock
                    </p>
                    <select
                      value={inventory.outOfStockBehavior}
                      onChange={(e) => { setInventory({ ...inventory, outOfStockBehavior: e.target.value as 'hide' | 'show' | 'backorder' }); handleChange(); }}
                      className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    >
                      <option value="show">Show but disable ordering</option>
                      <option value="hide">Hide from catalog</option>
                      <option value="backorder">Allow backorders</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Currency Settings */}
            {activeTab === 'currency' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Currency Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={currency.currency}
                      onChange={(e) => { setCurrency({ ...currency, currency: e.target.value }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    >
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                      <option value="LBP">Lebanese Pound (LBP)</option>
                      <option value="AED">UAE Dirham (AED)</option>
                      <option value="SAR">Saudi Riyal (SAR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={currency.currencySymbol}
                      onChange={(e) => { setCurrency({ ...currency, currencySymbol: e.target.value }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decimal Places
                    </label>
                    <select
                      value={currency.decimalPlaces}
                      onChange={(e) => { setCurrency({ ...currency, decimalPlaces: parseInt(e.target.value) }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    >
                      <option value="0">0</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thousands Separator
                    </label>
                    <select
                      value={currency.thousandsSeparator}
                      onChange={(e) => { setCurrency({ ...currency, thousandsSeparator: e.target.value }); handleChange(); }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                    >
                      <option value=",">Comma (1,000)</option>
                      <option value=".">Period (1.000)</option>
                      <option value=" ">Space (1 000)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Preview: {currency.currencySymbol}1{currency.thousandsSeparator}234{currency.decimalPlaces > 0 ? '.' + '0'.repeat(currency.decimalPlaces) : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
