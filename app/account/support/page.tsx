'use client';

/**
 * Customer Support Page
 *
 * Contact support options for customers.
 */

import React from 'react';
import { MessageSquare, Phone, Mail, Clock } from 'lucide-react';

export default function CustomerSupportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Support</h1>
        <p className="text-gray-500 mt-1">
          We&apos;re here to help with any questions
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* WhatsApp */}
        <a
          href="https://wa.me/9613741565?text=Hello!%20I%20need%20help%20with%20my%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
          <p className="text-gray-500 text-sm mb-3">
            Chat with us instantly for quick support
          </p>
          <span className="text-green-600 font-medium text-sm">
            +961 3 741 565 →
          </span>
        </a>

        {/* Phone */}
        <a
          href="tel:+9613741565"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <Phone className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
          <p className="text-gray-500 text-sm mb-3">
            Speak directly with our team
          </p>
          <span className="text-blue-600 font-medium text-sm">
            +961 3 741 565 →
          </span>
        </a>

        {/* Email */}
        <a
          href="mailto:info@moticosolutions.com"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <Mail className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
          <p className="text-gray-500 text-sm mb-3">
            Send us a detailed message
          </p>
          <span className="text-purple-600 font-medium text-sm">
            info@moticosolutions.com →
          </span>
        </a>

        {/* Business Hours */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
          <p className="text-gray-500 text-sm mb-3">
            When we&apos;re available
          </p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
            <p>Saturday: 9:00 AM - 2:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>
      </div>

      {/* FAQ Link */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600 mb-2">
          Looking for quick answers?
        </p>
        <a
          href="/account/help"
          className="text-[#004D8B] font-medium hover:underline"
        >
          Check our Help Center →
        </a>
      </div>
    </div>
  );
}
