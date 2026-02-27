/**
 * CommandPalette Component
 *
 * Ctrl+K command palette for navigation and entity search.
 * Uses cmdk for the command menu implementation.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Package,
  Users,
  ShoppingCart,
  MessageSquare,
  FileText,
  LayoutDashboard,
  Settings,
  Tag,
  Layers,
  Search,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  group: string;
}

interface SearchResult {
  id: string;
  type: 'product' | 'customer' | 'order';
  name: string;
  subtitle?: string;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search entities when search term changes
  useEffect(() => {
    if (search.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results: SearchResult[] = [];

        // Search products
        const productRes = await fetch(`/api/products?search=${encodeURIComponent(search)}&limit=5`);
        if (productRes.ok) {
          const data = await productRes.json();
          (data.data || []).forEach((p: { id: string; name: string; sku: string }) => {
            results.push({
              id: p.id,
              type: 'product',
              name: p.name,
              subtitle: p.sku,
            });
          });
        }

        // Search customers
        const customerRes = await fetch(`/api/customers?search=${encodeURIComponent(search)}&limit=5`);
        if (customerRes.ok) {
          const data = await customerRes.json();
          (data.data || []).forEach((c: { id: string; name: string; email: string }) => {
            results.push({
              id: c.id,
              type: 'customer',
              name: c.name,
              subtitle: c.email,
            });
          });
        }

        // Search orders
        const orderRes = await fetch(`/api/orders?search=${encodeURIComponent(search)}&limit=5`);
        if (orderRes.ok) {
          const data = await orderRes.json();
          (data.data || []).forEach((o: { id: string; orderNumber: string; customerName: string }) => {
            results.push({
              id: o.id,
              type: 'order',
              name: o.orderNumber,
              subtitle: o.customerName,
            });
          });
        }

        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [search]);

  // Navigation commands
  const navigationCommands: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Go to dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      action: () => router.push('/admin/dashboard'),
      keywords: ['home', 'overview'],
      group: 'Navigation',
    },
    {
      id: 'products',
      label: 'Products',
      description: 'View all products',
      icon: <Package className="w-4 h-4" />,
      action: () => router.push('/admin/products'),
      keywords: ['inventory', 'items'],
      group: 'Navigation',
    },
    {
      id: 'new-product',
      label: 'New Product',
      description: 'Create a new product',
      icon: <Plus className="w-4 h-4" />,
      action: () => router.push('/admin/products/new'),
      keywords: ['create', 'add'],
      group: 'Actions',
    },
    {
      id: 'orders',
      label: 'Orders',
      description: 'View all orders',
      icon: <ShoppingCart className="w-4 h-4" />,
      action: () => router.push('/admin/orders'),
      keywords: ['sales', 'purchases'],
      group: 'Navigation',
    },
    {
      id: 'customers',
      label: 'Customers',
      description: 'View all customers',
      icon: <Users className="w-4 h-4" />,
      action: () => router.push('/admin/customers'),
      keywords: ['users', 'clients'],
      group: 'Navigation',
    },
    {
      id: 'quotes',
      label: 'Quotes',
      description: 'View all quotes',
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push('/admin/quotes'),
      keywords: ['estimates', 'proposals'],
      group: 'Navigation',
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'View all messages',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => router.push('/admin/messages'),
      keywords: ['inbox', 'contact'],
      group: 'Navigation',
    },
    {
      id: 'categories',
      label: 'Categories',
      description: 'Manage categories',
      icon: <Layers className="w-4 h-4" />,
      action: () => router.push('/admin/categories'),
      keywords: ['organize', 'taxonomy'],
      group: 'Navigation',
    },
    {
      id: 'brands',
      label: 'Brands',
      description: 'Manage brands',
      icon: <Tag className="w-4 h-4" />,
      action: () => router.push('/admin/brands'),
      keywords: ['manufacturers'],
      group: 'Navigation',
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'System settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/admin/settings'),
      keywords: ['preferences', 'config'],
      group: 'Navigation',
    },
  ];

  const handleSelect = useCallback((action: () => void) => {
    setOpen(false);
    setSearch('');
    action();
  }, []);

  const handleResultSelect = useCallback((result: SearchResult) => {
    setOpen(false);
    setSearch('');
    switch (result.type) {
      case 'product':
        router.push(`/admin/products/${result.id}`);
        break;
      case 'customer':
        router.push(`/admin/customers?id=${result.id}`);
        break;
      case 'order':
        router.push(`/admin/orders?id=${result.id}`);
        break;
    }
  }, [router]);

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'customer':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-purple-600" />;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Command Dialog */}
      <div className="absolute left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl">
        <Command
          className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          shouldFilter={true}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search or type a command..."
              className="flex-1 text-base outline-none placeholder:text-gray-400"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-gray-500">
              {isSearching ? 'Searching...' : 'No results found.'}
            </Command.Empty>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Command.Group heading="Search Results">
                {searchResults.map((result) => (
                  <Command.Item
                    key={`${result.type}-${result.id}`}
                    value={`${result.type} ${result.name} ${result.subtitle || ''}`}
                    onSelect={() => handleResultSelect(result)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-blue-50"
                  >
                    {getResultIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.name}
                      </p>
                      {result.subtitle && (
                        <p className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 capitalize">
                      {result.type}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Navigation Commands */}
            <Command.Group heading="Navigation">
              {navigationCommands
                .filter(cmd => cmd.group === 'Navigation')
                .map((command) => (
                  <Command.Item
                    key={command.id}
                    value={`${command.label} ${command.description || ''} ${command.keywords?.join(' ') || ''}`}
                    onSelect={() => handleSelect(command.action)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-blue-50"
                  >
                    <span className="text-gray-500">{command.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {command.label}
                      </p>
                      {command.description && (
                        <p className="text-xs text-gray-500">{command.description}</p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Command.Item>
                ))}
            </Command.Group>

            {/* Action Commands */}
            <Command.Group heading="Actions">
              {navigationCommands
                .filter(cmd => cmd.group === 'Actions')
                .map((command) => (
                  <Command.Item
                    key={command.id}
                    value={`${command.label} ${command.description || ''} ${command.keywords?.join(' ') || ''}`}
                    onSelect={() => handleSelect(command.action)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-blue-50"
                  >
                    <span className="text-[#004D8B]">{command.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {command.label}
                      </p>
                      {command.description && (
                        <p className="text-xs text-gray-500">{command.description}</p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Command.Item>
                ))}
            </Command.Group>
          </Command.List>

          <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">esc</kbd>
              close
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
