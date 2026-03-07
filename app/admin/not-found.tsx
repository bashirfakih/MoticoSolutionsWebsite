/**
 * Admin 404 Page
 *
 * Displayed when navigating to a non-existent admin route.
 *
 * @module app/admin/not-found
 */

import Link from 'next/link';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <LayoutDashboard className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Page Not Found</h2>
        <p className="text-sm text-gray-500 mb-8">
          This admin page doesn&apos;t exist or you may not have access.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#004D8B] text-white text-sm font-medium rounded-lg hover:bg-[#003a6a] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
