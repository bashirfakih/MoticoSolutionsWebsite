'use client';

/**
 * Admin Help Page
 *
 * Documentation, FAQs, and support information.
 *
 * @module app/admin/help/page
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  ShoppingCart,
  Users,
  Package,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Zap,
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface Guide {
  title: string;
  description: string;
  icon: React.ElementType;
  steps: string[];
}

const faqs: FAQ[] = [
  {
    category: 'Orders',
    question: 'How do I process a new order?',
    answer: 'To process a new order, go to Orders page, click on the order you want to process, and update its status. You can change the status from Pending → Confirmed → Processing → Shipped → Delivered. Each status change will be logged with a timestamp.',
  },
  {
    category: 'Orders',
    question: 'How do I cancel an order?',
    answer: 'To cancel an order, open the order details and select "Cancelled" from the status dropdown. You can add notes explaining the cancellation reason. The customer will be notified automatically if email notifications are enabled.',
  },
  {
    category: 'Products',
    question: 'How do I add a new product?',
    answer: 'Navigate to Products page and click "Add Product". Fill in the product details including name, SKU, description, price, and upload images. You can also set inventory levels and assign categories/brands.',
  },
  {
    category: 'Products',
    question: 'How do I manage product inventory?',
    answer: 'Go to the Inventory page to see all products and their stock levels. You can adjust stock quantities, set low stock thresholds, and view inventory history. Products with low stock will be highlighted automatically.',
  },
  {
    category: 'Customers',
    question: 'How do I view customer order history?',
    answer: 'In the Customers page, click on any customer to view their details. You can see their order history, total spending, and communication history. You can also add tags and notes to customer profiles.',
  },
  {
    category: 'Quotes',
    question: 'How do I respond to a quote request?',
    answer: 'Open the Quotes page and select a pending quote. Review the items requested, set prices for each item, add any discounts, and write a response message. Click "Send Quote" to email the quote to the customer.',
  },
  {
    category: 'Quotes',
    question: 'How do I convert a quote to an order?',
    answer: 'When a customer accepts a quote, you can convert it to an order by clicking "Convert to Order" in the quote details. This will create a new order with all the quoted items and pricing.',
  },
  {
    category: 'Messages',
    question: 'How do I reply to customer messages?',
    answer: 'Go to the Messages page and select a message. Type your reply in the text area and click "Send Reply". The message will be sent to the customer\'s email address and marked as replied in the system.',
  },
  {
    category: 'Analytics',
    question: 'How are the analytics calculated?',
    answer: 'Analytics are calculated in real-time based on your order, customer, and quote data. Revenue metrics come from completed orders. Conversion rates are calculated from quotes that were converted to orders.',
  },
  {
    category: 'Settings',
    question: 'How do I change notification settings?',
    answer: 'Go to Settings → Notifications to configure which email notifications you want to receive. You can enable/disable notifications for new orders, quotes, messages, and low stock alerts.',
  },
];

const guides: Guide[] = [
  {
    title: 'Managing Orders',
    description: 'Learn how to process, track, and fulfill customer orders efficiently.',
    icon: ShoppingCart,
    steps: [
      'View all orders in the Orders page',
      'Filter orders by status, date, or customer',
      'Click an order to view full details',
      'Update order status as it progresses',
      'Add tracking information when shipped',
      'Mark as delivered when completed',
    ],
  },
  {
    title: 'Customer Management',
    description: 'Keep track of your customers and build relationships.',
    icon: Users,
    steps: [
      'View all customers in the Customers page',
      'Search by name, email, or company',
      'Click a customer to see their profile',
      'View order history and spending',
      'Add tags for segmentation',
      'Add notes for internal reference',
    ],
  },
  {
    title: 'Product Catalog',
    description: 'Manage your products, pricing, and inventory.',
    icon: Package,
    steps: [
      'Navigate to Products page',
      'Add new products with the Add button',
      'Edit existing products by clicking them',
      'Upload product images',
      'Set categories and brands',
      'Manage stock levels in Inventory',
    ],
  },
  {
    title: 'Quote Management',
    description: 'Handle quote requests and convert them to sales.',
    icon: FileText,
    steps: [
      'View quote requests in Quotes page',
      'Review requested items and quantities',
      'Set pricing for each item',
      'Apply discounts if applicable',
      'Send quote to customer',
      'Convert accepted quotes to orders',
    ],
  },
];

export default function AdminHelpPage() {
  const [search, setSearch] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);

  const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          <p className="text-sm text-gray-500 mt-1">Find answers and learn how to use the admin panel</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for help..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="/admin/orders" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#004D8B] transition-colors group">
          <ShoppingCart className="w-6 h-6 text-[#004D8B] mb-2" />
          <h3 className="font-medium text-gray-900 group-hover:text-[#004D8B]">Orders</h3>
          <p className="text-sm text-gray-500">Manage orders</p>
        </a>
        <a href="/admin/customers" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#004D8B] transition-colors group">
          <Users className="w-6 h-6 text-[#004D8B] mb-2" />
          <h3 className="font-medium text-gray-900 group-hover:text-[#004D8B]">Customers</h3>
          <p className="text-sm text-gray-500">View customers</p>
        </a>
        <a href="/admin/products" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#004D8B] transition-colors group">
          <Package className="w-6 h-6 text-[#004D8B] mb-2" />
          <h3 className="font-medium text-gray-900 group-hover:text-[#004D8B]">Products</h3>
          <p className="text-sm text-gray-500">Edit products</p>
        </a>
        <a href="/admin/settings" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#004D8B] transition-colors group">
          <Settings className="w-6 h-6 text-[#004D8B] mb-2" />
          <h3 className="font-medium text-gray-900 group-hover:text-[#004D8B]">Settings</h3>
          <p className="text-sm text-gray-500">Configure</p>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-[#004D8B] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredFAQs.map((faq, index) => (
                <div key={index} className="p-4">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full flex items-start justify-between text-left"
                  >
                    <div className="flex-1">
                      <span className="text-xs font-medium text-[#004D8B] bg-blue-50 px-2 py-0.5 rounded">
                        {faq.category}
                      </span>
                      <h3 className="font-medium text-gray-900 mt-2">{faq.question}</h3>
                    </div>
                    {expandedFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
              {filteredFAQs.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No FAQs found matching your search.
                </div>
              )}
            </div>
          </div>

          {/* Guides */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Quick Start Guides</h2>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {guides.map((guide, index) => (
                <div key={index} className="p-4">
                  <button
                    onClick={() => setExpandedGuide(expandedGuide === index ? null : index)}
                    className="w-full flex items-start gap-4 text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <guide.icon className="w-5 h-5 text-[#004D8B]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{guide.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{guide.description}</p>
                    </div>
                    {expandedGuide === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedGuide === index && (
                    <div className="mt-4 ml-14">
                      <ol className="space-y-2">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-3 text-sm text-gray-600">
                            <span className="w-5 h-5 rounded-full bg-[#004D8B] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {stepIndex + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact Support */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Contact Support</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Need more help? Our support team is here to assist you.
            </p>
            <div className="space-y-3">
              <a
                href="mailto:support@moticosolutions.com"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-[#004D8B]" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Support</p>
                  <p className="text-xs text-gray-500">support@moticosolutions.com</p>
                </div>
              </a>
              <a
                href="tel:+9611234567"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-[#004D8B]" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone Support</p>
                  <p className="text-xs text-gray-500">+961 1 234 567</p>
                </div>
              </a>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Search</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl + K</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Order</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl + O</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Product</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl + P</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Dashboard</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl + D</kbd>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Version</span>
                <span className="font-medium text-gray-900">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Data Storage</span>
                <span className="font-medium text-gray-900">LocalStorage</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium text-gray-900">Feb 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
