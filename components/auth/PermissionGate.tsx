'use client';

/**
 * PermissionGate Component
 *
 * Conditionally renders children based on user permissions.
 * Does not redirect - just hides content if permission not met.
 *
 * @module components/auth/PermissionGate
 */

import React from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Permission,
  Role,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  isAdmin,
  isCustomer,
} from '@/lib/permissions';

// ═══════════════════════════════════════════════════════════════
// PERMISSION GATE
// ═══════════════════════════════════════════════════════════════

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Gate that shows children only if user has required permission(s)
 */
export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { user } = useAuth();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(user, permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(user, permissions)
      : hasAnyPermission(user, permissions);
  } else {
    // No permission specified = show to all authenticated users
    hasAccess = !!user;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// ═══════════════════════════════════════════════════════════════
// ROLE GATE
// ═══════════════════════════════════════════════════════════════

interface RoleGateProps {
  children: React.ReactNode;
  role: Role;
  fallback?: React.ReactNode;
}

/**
 * Gate that shows children only if user has required role
 */
export function RoleGate({
  children,
  role,
  fallback = null,
}: RoleGateProps) {
  const { user } = useAuth();

  const hasAccess = hasRole(user, role);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// ═══════════════════════════════════════════════════════════════
// ADMIN GATE
// ═══════════════════════════════════════════════════════════════

interface AdminGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Gate that shows children only to admin users
 */
export function AdminGate({
  children,
  fallback = null,
}: AdminGateProps) {
  const { user } = useAuth();

  return isAdmin(user) ? <>{children}</> : <>{fallback}</>;
}

// ═══════════════════════════════════════════════════════════════
// CUSTOMER GATE
// ═══════════════════════════════════════════════════════════════

interface CustomerGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Gate that shows children only to customer users
 */
export function CustomerGate({
  children,
  fallback = null,
}: CustomerGateProps) {
  const { user } = useAuth();

  return isCustomer(user) ? <>{children}</> : <>{fallback}</>;
}

// ═══════════════════════════════════════════════════════════════
// AUTH GATE
// ═══════════════════════════════════════════════════════════════

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Gate that shows children only to authenticated users (any role)
 */
export function AuthGate({
  children,
  fallback = null,
}: AuthGateProps) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}

/**
 * Gate that shows children only to guests (unauthenticated users)
 */
export function GuestGate({
  children,
  fallback = null,
}: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't show anything while loading
  if (isLoading) return null;

  return !isAuthenticated ? <>{children}</> : <>{fallback}</>;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default PermissionGate;
