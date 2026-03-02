/**
 * CommandPalette Component
 *
 * Full-featured Ctrl+K command palette for navigation, actions, and entity search.
 * Uses cmdk for the command menu implementation.
 *
 * Features:
 * - Navigation commands (Dashboard, Products, Orders, etc.)
 * - Action commands (New Product, Export CSV, etc.)
 * - Live search across products, orders, customers with 200ms debounce
 * - Recent pages tracking (last 5 visited pages)
 * - Full keyboard navigation
 * - ARIA compliant for accessibility
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Package,
  Users,
  ShoppingCart,
  MessageSquare,
  FileText,
  LayoutDashboard,
  Settings,
  Search,
  Plus,
  ArrowRight,
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  group: 'navigation' | 'actions' | 'recent';
}

interface ProductSearchResult {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  minStockLevel: number;
  isPublished: boolean;
}

interface OrderSearchResult {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
}

interface CustomerSearchResult {
  id: string;
  name: string;
  email: string;
  country?: string;
}

interface RecentPage {
  path: string;
  label: string;
  icon: string;
  visitedAt: number;
}

const RECENT_PAGES_KEY = 'motico_cmd_history';
const MAX_RECENT_PAGES = 5;

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getStockStatus(quantity: number, minLevel: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= minLevel) return 'low_stock';
  return 'in_stock';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function getRecentPages(): RecentPage[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_PAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentPage(page: Omit<RecentPage, 'visitedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentPages();
    // Remove if already exists
    const filtered = recent.filter((p) => p.path !== page.path);
    // Add to front
    const updated = [{ ...page, visitedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT_PAGES);
    localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

// Page path to label/icon mapping
const PAGE_INFO: Record<string, { label: string; icon: string }> = {
  '/admin/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
  '/admin/products': { label: 'Products', icon: 'Package' },
  '/admin/orders': { label: 'Orders', icon: 'ShoppingCart' },
  '/admin/customers': { label: 'Customers', icon: 'Users' },
  '/admin/quotes': { label: 'Quotes', icon: 'FileText' },
  '/admin/messages': { label: 'Messages', icon: 'MessageSquare' },
  '/admin/settings': { label: 'Settings', icon: 'Settings' },
  '/admin/analytics': { label: 'Analytics', icon: 'BarChart3' },
  '/admin/brands': { label: 'Brands', icon: 'Tag' },
  '/admin/categories': { label: 'Categories', icon: 'Layers' },
};

function getIconComponent(iconName: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
    Package: <Package className="w-4 h-4" />,
    ShoppingCart: <ShoppingCart className="w-4 h-4" />,
    Users: <Users className="w-4 h-4" />,
    FileText: <FileText className="w-4 h-4" />,
    MessageSquare: <MessageSquare className="w-4 h-4" />,
    Settings: <Settings className="w-4 h-4" />,
  };
  return iconMap[iconName] || <LayoutDashboard className="w-4 h-4" />;
}

// ═══════════════════════════════════════════════════════════════
// STOCK STATUS BADGE
// ═══════════════════════════════════════════════════════════════

function StockStatusBadge({ status }: { status: 'in_stock' | 'low_stock' | 'out_of_stock' }) {
  const config = {
    in_stock: { label: 'In Stock', className: 'bg-green-100 text-green-700', icon: CheckCircle },
    low_stock: { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    out_of_stock: { label: 'Out of Stock', className: 'bg-red-100 text-red-700', icon: XCircle },
  };
  const { label, className, icon: Icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-1.5 py-0.5 text-xs font-medium rounded capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface CommandPaletteProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CommandPalette({ isOpen: externalIsOpen, onOpenChange }: CommandPaletteProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const open = externalIsOpen !== undefined ? externalIsOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [orders, setOrders] = useState<OrderSearchResult[]>([]);
  const [customers, setCustomers] = useState<CustomerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const searchAbortController = useRef<AbortController | null>(null);

  // Track page visits for recent pages
  useEffect(() => {
    if (pathname && PAGE_INFO[pathname]) {
      saveRecentPage({
        path: pathname,
        label: PAGE_INFO[pathname].label,
        icon: PAGE_INFO[pathname].icon,
      });
    }
  }, [pathname]);

  // Load recent pages when opening
  useEffect(() => {
    if (open) {
      setRecentPages(getRecentPages());
    }
  }, [open]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Search entities when search term changes (200ms debounce)
  useEffect(() => {
    if (search.length < 2) {
      setProducts([]);
      setOrders([]);
      setCustomers([]);
      return;
    }

    // Cancel previous search
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
    searchAbortController.current = new AbortController();
    const signal = searchAbortController.current.signal;

    const searchTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Search products, orders, customers in parallel
        const [productRes, orderRes, customerRes] = await Promise.all([
          fetch(`/api/products?search=${encodeURIComponent(search)}&limit=5`, { signal }),
          fetch(`/api/orders?search=${encodeURIComponent(search)}&limit=5`, { signal }),
          fetch(`/api/customers?search=${encodeURIComponent(search)}&limit=5`, { signal }),
        ]);

        if (productRes.ok) {
          const data = await productRes.json();
          setProducts(
            (data.data || []).map((p: ProductSearchResult) => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              stockQuantity: p.stockQuantity ?? 0,
              minStockLevel: p.minStockLevel ?? 10,
              isPublished: p.isPublished ?? false,
            }))
          );
        }

        if (orderRes.ok) {
          const data = await orderRes.json();
          setOrders(
            (data.data || []).map((o: OrderSearchResult) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              customerName: o.customerName,
              total: o.total,
              status: o.status,
            }))
          );
        }

        if (customerRes.ok) {
          const data = await customerRes.json();
          setCustomers(
            (data.data || []).map((c: CustomerSearchResult) => ({
              id: c.id,
              name: c.name,
              email: c.email,
              country: c.country,
            }))
          );
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Search failed:', error);
        }
      }
      setIsSearching(false);
    }, 200);

    return () => {
      clearTimeout(searchTimer);
    };
  }, [search]);

  // Navigation function that also tracks recent pages
  const navigateTo = useCallback(
    (path: string, label?: string, icon?: string) => {
      setOpen(false);
      setSearch('');
      if (label && icon) {
        saveRecentPage({ path, label, icon });
      }
      router.push(path);
    },
    [router]
  );

  // Export handlers
  const handleExportProducts = useCallback(async () => {
    setOpen(false);
    setSearch('');
    try {
      const response = await fetch('/api/products?format=csv&limit=1000');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, []);

  const handleExportOrders = useCallback(async () => {
    setOpen(false);
    setSearch('');
    try {
      const response = await fetch('/api/orders/export?format=csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, []);

  // Navigation commands
  const navigationCommands: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      description: 'Overview and stats',
      icon: <LayoutDashboard className="w-4 h-4" />,
      action: () => navigateTo('/admin/dashboard', 'Dashboard', 'LayoutDashboard'),
      keywords: ['home', 'overview', 'stats'],
      group: 'navigation',
    },
    {
      id: 'products',
      label: 'Go to Products',
      description: 'Manage inventory',
      icon: <Package className="w-4 h-4" />,
      action: () => navigateTo('/admin/products', 'Products', 'Package'),
      keywords: ['inventory', 'items', 'catalog'],
      group: 'navigation',
    },
    {
      id: 'orders',
      label: 'Go to Orders',
      description: 'View and manage orders',
      icon: <ShoppingCart className="w-4 h-4" />,
      action: () => navigateTo('/admin/orders', 'Orders', 'ShoppingCart'),
      keywords: ['sales', 'purchases'],
      group: 'navigation',
    },
    {
      id: 'customers',
      label: 'Go to Customers',
      description: 'Customer management',
      icon: <Users className="w-4 h-4" />,
      action: () => navigateTo('/admin/customers', 'Customers', 'Users'),
      keywords: ['users', 'clients'],
      group: 'navigation',
    },
    {
      id: 'quotes',
      label: 'Go to Quotes',
      description: 'Quote requests',
      icon: <FileText className="w-4 h-4" />,
      action: () => navigateTo('/admin/quotes', 'Quotes', 'FileText'),
      keywords: ['estimates', 'proposals'],
      group: 'navigation',
    },
    {
      id: 'messages',
      label: 'Go to Messages',
      description: 'Customer messages',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => navigateTo('/admin/messages', 'Messages', 'MessageSquare'),
      keywords: ['inbox', 'contact'],
      group: 'navigation',
    },
    {
      id: 'settings',
      label: 'Go to Settings',
      description: 'System settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => navigateTo('/admin/settings', 'Settings', 'Settings'),
      keywords: ['preferences', 'config'],
      group: 'navigation',
    },
  ];

  // Action commands
  const actionCommands: CommandItem[] = [
    {
      id: 'new-product',
      label: 'New Product',
      description: 'Create a new product',
      icon: <Plus className="w-4 h-4" />,
      action: () => navigateTo('/admin/products/new'),
      keywords: ['create', 'add', 'product'],
      group: 'actions',
    },
    {
      id: 'new-customer',
      label: 'New Customer',
      description: 'Add a new customer',
      icon: <Plus className="w-4 h-4" />,
      action: () => navigateTo('/admin/customers?action=new'),
      keywords: ['create', 'add', 'customer'],
      group: 'actions',
    },
    {
      id: 'new-quote',
      label: 'New Quote',
      description: 'Create a new quote',
      icon: <Plus className="w-4 h-4" />,
      action: () => navigateTo('/admin/quotes?action=new'),
      keywords: ['create', 'add', 'quote'],
      group: 'actions',
    },
    {
      id: 'export-products',
      label: 'Export Products (CSV)',
      description: 'Download products as CSV',
      icon: <Download className="w-4 h-4" />,
      action: handleExportProducts,
      keywords: ['download', 'export', 'csv'],
      group: 'actions',
    },
    {
      id: 'export-orders',
      label: 'Export Orders (CSV)',
      description: 'Download orders as CSV',
      icon: <Download className="w-4 h-4" />,
      action: handleExportOrders,
      keywords: ['download', 'export', 'csv'],
      group: 'actions',
    },
  ];

  // Recent pages as commands
  const recentCommands: CommandItem[] = recentPages
    .filter((page) => page.path !== pathname) // Don't show current page
    .map((page) => ({
      id: `recent-${page.path}`,
      label: page.label,
      description: 'Recently visited',
      icon: getIconComponent(page.icon),
      action: () => navigateTo(page.path, page.label, page.icon),
      group: 'recent' as const,
    }));

  const hasSearchResults = products.length > 0 || orders.length > 0 || customers.length > 0;
  const showRecent = search.length < 2 && recentCommands.length > 0;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Command Dialog */}
      <div className="absolute left-1/2 top-[15%] -translate-x-1/2 w-full max-w-[600px] px-4">
        <Command
          className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150"
          shouldFilter={true}
          loop
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search or type a command..."
              className="flex-1 text-base outline-none placeholder:text-gray-400 bg-transparent"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded font-mono">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-gray-500">
              {isSearching ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-[#004D8B] rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                'No results found.'
              )}
            </Command.Empty>

            {/* Recent Pages (shown when no search query) */}
            {showRecent && (
              <Command.Group heading="Recent">
                {recentCommands.map((command) => (
                  <Command.Item
                    key={command.id}
                    value={`recent ${command.label}`}
                    onSelect={command.action}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-blue-50 transition-colors"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">{command.icon}</span>
                    <span className="flex-1 text-sm font-medium text-gray-900">{command.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-aria-selected:opacity-100" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Search Results - Products */}
            {products.length > 0 && (
              <Command.Group heading="Products">
                {products.map((product) => (
                  <Command.Item
                    key={`product-${product.id}`}
                    value={`product ${product.name} ${product.sku}`}
                    onSelect={() => navigateTo(`/admin/products/${product.id}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-blue-50 transition-colors"
                  >
                    <Package className="w-4 h-4 text-[#004D8B]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 truncate">SKU: {product.sku}</p>
                    </div>
                    <StockStatusBadge status={getStockStatus(product.stockQuantity, product.minStockLevel)} />
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Search Results - Orders */}
            {orders.length > 0 && (
              <Command.Group heading="Orders">
                {orders.map((order) => (
                  <Command.Item
                    key={`order-${order.id}`}
                    value={`order ${order.orderNumber} ${order.customerName}`}
                    onSelect={() => navigateTo(`/admin/orders/${order.id}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-blue-50 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {order.customerName} · {formatCurrency(order.total)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Search Results - Customers */}
            {customers.length > 0 && (
              <Command.Group heading="Customers">
                {customers.map((customer) => (
                  <Command.Item
                    key={`customer-${customer.id}`}
                    value={`customer ${customer.name} ${customer.email}`}
                    onSelect={() => navigateTo(`/admin/customers?id=${customer.id}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-blue-50 transition-colors"
                  >
                    <Users className="w-4 h-4 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {customer.email}
                        {customer.country && ` · ${customer.country}`}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Navigation Commands (shown when no search results) */}
            {!hasSearchResults && (
              <Command.Group heading="Navigation">
                {navigationCommands.map((command) => (
                  <Command.Item
                    key={command.id}
                    value={`${command.label} ${command.description || ''} ${command.keywords?.join(' ') || ''}`}
                    onSelect={command.action}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-blue-50 transition-colors"
                  >
                    <span className="text-gray-500">{command.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{command.label}</p>
                      {command.description && (
                        <p className="text-xs text-gray-500">{command.description}</p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Action Commands (shown when no search results) */}
            {!hasSearchResults && (
              <Command.Group heading="Actions">
                {actionCommands.map((command) => (
                  <Command.Item
                    key={command.id}
                    value={`${command.label} ${command.description || ''} ${command.keywords?.join(' ') || ''}`}
                    onSelect={command.action}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-blue-50 transition-colors"
                  >
                    <span className="text-[#004D8B]">{command.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{command.label}</p>
                      {command.description && (
                        <p className="text-xs text-gray-500">{command.description}</p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Keyboard Hints Footer */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono">↑↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono">esc</kbd>
              <span>to close</span>
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
