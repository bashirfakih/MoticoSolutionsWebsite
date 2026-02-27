'use client';

/**
 * Unauthorized Page
 *
 * Shown when a user tries to access a page they don't have permission for.
 * Matches Motico Solutions brand design.
 *
 * @module app/unauthorized/page
 */

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Home, MessageCircle } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requiredRole = searchParams.get('role');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-block">
            <Image
              src="/logo-motico-solutions.png"
              alt="Motico Solutions"
              width={180}
              height={54}
              className="h-12 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div className="relative mx-auto w-32 h-32 mb-8">
            {/* Decorative rings */}
            <div className="absolute inset-0 rounded-full border-4 border-red-100 animate-ping opacity-30" />
            <div className="absolute inset-4 rounded-full border-4 border-red-200 animate-ping opacity-30 animation-delay-150" />

            {/* Main icon */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-xl">
              <Shield className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 mb-4">
            Sorry, you don&apos;t have permission to view this page.
          </p>

          {requiredRole && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm mb-8">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                This page requires <span className="font-semibold capitalize">{requiredRole}</span> access
              </span>
            </div>
          )}

          <p className="text-gray-500 mb-8">
            If you believe this is a mistake, please contact our support team.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#004D8B] text-white font-semibold rounded-full hover:bg-[#003d6f] transition-colors shadow-lg shadow-blue-500/20"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </button>
            <a
              href="https://wa.me/9613741565?text=Hello!%20I%20need%20help%20with%20my%20account%20access."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Motico Solutions. All rights reserved.
        </p>
      </footer>

      {/* Styles for animation delay */}
      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
}
