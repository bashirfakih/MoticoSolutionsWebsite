'use client';

/**
 * ProtectedRoute Component
 *
 * Wraps pages that require authentication or specific permissions.
 * Shows loading state while checking auth, redirects if not authorized.
 *
 * @module components/auth/ProtectedRoute
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Role,
  Permission,
  hasRole,
  hasPermission,
  ROLES,
} from '@/lib/permissions';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: Permission;
  fallback?: React.ReactNode;
}

// ═══════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-48 h-12 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>

        {/* Spinner */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#004D8B] rounded-full animate-spin" />
        </div>

        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACCESS DENIED COMPONENT
// ═══════════════════════════════════════════════════════════════

interface AccessDeniedProps {
  requiredRole?: Role;
  requiredPermission?: Permission;
}

function AccessDenied({ requiredRole, requiredPermission }: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access this page.
          {requiredRole && (
            <span className="block mt-2 text-sm">
              Required role: <span className="font-semibold capitalize">{requiredRole}</span>
            </span>
          )}
          {requiredPermission && (
            <span className="block mt-2 text-sm">
              Required permission: <span className="font-semibold">{requiredPermission}</span>
            </span>
          )}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#004D8B] text-white font-semibold rounded-lg hover:bg-[#003d6f] transition-colors"
          >
            Go to Homepage
          </button>
          <button
            onClick={() => router.push('/contact')}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROTECTED ROUTE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // If not authenticated, redirect to login with returnUrl
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?returnUrl=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Show loading state
  if (isLoading) {
    return fallback || <LoadingSkeleton />;
  }

  // If not authenticated, show loading while redirecting
  if (!isAuthenticated) {
    return fallback || <LoadingSkeleton />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(user, requiredRole)) {
    return <AccessDenied requiredRole={requiredRole} />;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <AccessDenied requiredPermission={requiredPermission} />;
  }

  // User is authorized - render children
  return <>{children}</>;
}

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE WRAPPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Wrapper for admin-only pages
 */
export function AdminRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={ROLES.ADMIN} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Wrapper for customer-only pages
 */
export function CustomerRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={ROLES.CUSTOMER} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Wrapper for authenticated pages (any role)
 */
export function AuthenticatedRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}
