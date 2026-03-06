'use client';

/**
 * Customer Help Center Page
 *
 * FAQ and help documentation for customers.
 */

import React, { useState } from 'react';
import { ChevronDown, Search, ShoppingCart, Truck, CreditCard, User, Package, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ElementType;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: 'Orders & Quotes',
    icon: ShoppingCart,
    items: [
      {
        question: 'How do I place an order?',
        answer: 'Browse our products, add items to your quote request, and submit. Our team will review and send you a formal quote with pricing and availability.',
      },
      {
        question: 'How long does it take to receive a quote?',
        answer: 'We typically respond to quote requests within 24 business hours. For urgent inquiries, please contact us directly via WhatsApp.',
      },
      {
        question: 'Can I modify my order after placing it?',
        answer: 'Yes, you can request modifications before the order is confirmed. Contact our support team with your order number and the changes needed.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    icon: Truck,
    items: [
      {
        question: 'Where do you deliver?',
        answer: 'We deliver throughout Lebanon and can arrange international shipping to MENA region countries. Contact us for specific delivery options.',
      },
      {
        question: 'How long does delivery take?',
        answer: 'Local deliveries within Beirut typically take 1-2 business days. Other areas in Lebanon may take 2-4 business days.',
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you\'ll receive tracking information via email. You can also check your order status in the "My Orders" section.',
      },
    ],
  },
  {
    title: 'Payments',
    icon: CreditCard,
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept bank transfers, cash on delivery (COD), and checks for business accounts. Credit card payments coming soon.',
      },
      {
        question: 'Do you offer credit terms?',
        answer: 'Yes, we offer credit terms for qualified business customers. Contact our sales team to set up a business account.',
      },
    ],
  },
  {
    title: 'Account & Profile',
    icon: User,
    items: [
      {
        question: 'How do I update my account information?',
        answer: 'Go to "Profile" in your account menu to update your contact information, company details, and preferences.',
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive a link to reset your password.',
      },
    ],
  },
  {
    title: 'Products',
    icon: Package,
    items: [
      {
        question: 'How do I find the right abrasive product?',
        answer: 'Use our product filters to narrow down by category, brand, and specifications. You can also contact our technical team for recommendations.',
      },
      {
        question: 'Do you offer bulk pricing?',
        answer: 'Yes, we offer volume discounts for bulk orders. Your account may already have special pricing applied. Contact us for custom quotes on large orders.',
      },
    ],
  },
];

function FAQSection({ category }: { category: FAQCategory }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const Icon = category.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
        <Icon className="w-5 h-5 text-[#004D8B]" />
        <h3 className="font-semibold text-gray-900">{category.title}</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {category.items.map((item, index) => (
          <div key={index}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 pr-4">{item.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomerHelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = searchQuery
    ? faqData
        .map((category) => ({
          ...category,
          items: category.items.filter(
            (item) =>
              item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.items.length > 0)
    : faqData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-500 mt-1">
          Find answers to common questions
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004D8B] focus:border-transparent"
        />
      </div>

      {/* FAQ Categories */}
      <div className="space-y-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, index) => (
            <FAQSection key={index} category={category} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No results found for &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#004D8B] font-medium hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Still Need Help */}
      <div className="bg-[#004D8B] rounded-xl p-6 text-center text-white">
        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-80" />
        <h3 className="font-semibold text-lg mb-2">Still need help?</h3>
        <p className="text-blue-100 mb-4">
          Our support team is ready to assist you
        </p>
        <Link
          href="/account/support"
          className="inline-block px-6 py-2 bg-white text-[#004D8B] rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
