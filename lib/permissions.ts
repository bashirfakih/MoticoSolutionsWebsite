/**
 * Role Definitions & Permissions Architecture for Motico Solutions
 *
 * This file defines all roles and their associated permissions.
 * Import this file wherever permission checking is needed.
 *
 * @module lib/permissions
 */

// ═══════════════════════════════════════════════════════════════
// ROLE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// ═══════════════════════════════════════════════════════════════
// PERMISSION DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const PERMISSIONS = {
  // Product permissions
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',
  PRODUCTS_PUBLISH: 'products.publish',

  // Category permissions
  CATEGORIES_MANAGE: 'categories.manage',

  // Brand permissions
  BRANDS_MANAGE: 'brands.manage',

  // Quote permissions
  QUOTES_VIEW: 'quotes.view',
  QUOTES_RESPOND: 'quotes.respond',
  QUOTES_SUBMIT: 'quotes.submit',
  QUOTES_VIEW_OWN: 'quotes.viewOwn',

  // Blog permissions
  BLOG_MANAGE: 'blog.manage',

  // User management permissions
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',

  // Settings permissions
  SETTINGS_ACCESS: 'settings.access',

  // Dashboard permissions
  DASHBOARD_ACCESS: 'dashboard.access',

  // Profile permissions
  PROFILE_VIEW: 'profile.view',
  PROFILE_EDIT: 'profile.edit',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ═══════════════════════════════════════════════════════════════
// ROLE-PERMISSION MAPPINGS
// ═══════════════════════════════════════════════════════════════

/**
 * Admin Role Permissions:
 * - Full access to all product management
 * - Can manage categories, brands, and blog
 * - Can view and respond to all quotes
 * - Can manage users (customers)
 * - Has dashboard and settings access
 */
const ADMIN_PERMISSIONS: Permission[] = [
  PERMISSIONS.PRODUCTS_VIEW,
  PERMISSIONS.PRODUCTS_CREATE,
  PERMISSIONS.PRODUCTS_EDIT,
  PERMISSIONS.PRODUCTS_DELETE,
  PERMISSIONS.PRODUCTS_PUBLISH,
  PERMISSIONS.CATEGORIES_MANAGE,
  PERMISSIONS.BRANDS_MANAGE,
  PERMISSIONS.QUOTES_VIEW,
  PERMISSIONS.QUOTES_RESPOND,
  PERMISSIONS.BLOG_MANAGE,
  PERMISSIONS.USERS_VIEW,
  PERMISSIONS.USERS_MANAGE,
  PERMISSIONS.SETTINGS_ACCESS,
  PERMISSIONS.DASHBOARD_ACCESS,
  PERMISSIONS.PROFILE_VIEW,
  PERMISSIONS.PROFILE_EDIT,
];

/**
 * Customer Role Permissions:
 * - Can view published products
 * - Can submit and view their own quotes
 * - Can manage their own profile
 */
const CUSTOMER_PERMISSIONS: Permission[] = [
  PERMISSIONS.PRODUCTS_VIEW,
  PERMISSIONS.QUOTES_SUBMIT,
  PERMISSIONS.QUOTES_VIEW_OWN,
  PERMISSIONS.PROFILE_VIEW,
  PERMISSIONS.PROFILE_EDIT,
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: ADMIN_PERMISSIONS,
  [ROLES.CUSTOMER]: CUSTOMER_PERMISSIONS,
};

// ═══════════════════════════════════════════════════════════════
// USER TYPE DEFINITION
// ═══════════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  company: string | null;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  country?: string;
  industry?: string;
  position?: string;
  address?: string;
  city?: string;
}

// ═══════════════════════════════════════════════════════════════
// PERMISSION CHECKING UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a user has a specific permission
 * @param user - The user object (can be null)
 * @param permission - The permission to check
 * @returns boolean - true if user has the permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user || !user.role) return false;
  const perms = ROLE_PERMISSIONS[user.role] || [];
  return perms.includes(permission);
}

/**
 * Check if a user has ANY of the listed permissions
 * @param user - The user object (can be null)
 * @param permissions - Array of permissions to check
 * @returns boolean - true if user has at least one of the permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(user, p));
}

/**
 * Check if a user has ALL of the listed permissions
 * @param user - The user object (can be null)
 * @param permissions - Array of permissions to check
 * @returns boolean - true if user has all of the permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(user, p));
}

/**
 * Check if a user has a specific role
 * @param user - The user object (can be null)
 * @param role - The role to check
 * @returns boolean - true if user has the role
 */
export function hasRole(user: User | null, role: Role): boolean {
  if (!user || !user.role) return false;
  return user.role === role;
}

/**
 * Check if a user is an admin
 * @param user - The user object (can be null)
 * @returns boolean - true if user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, ROLES.ADMIN);
}

/**
 * Check if a user is a customer
 * @param user - The user object (can be null)
 * @returns boolean - true if user is a customer
 */
export function isCustomer(user: User | null): boolean {
  return hasRole(user, ROLES.CUSTOMER);
}

/**
 * Get all permissions for a role
 * @param role - The role to get permissions for
 * @returns Permission[] - Array of permissions for the role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get display name for a role
 * @param role - The role
 * @returns string - Human-readable role name
 */
export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case ROLES.ADMIN:
      return 'Administrator';
    case ROLES.CUSTOMER:
      return 'Customer';
    default:
      return 'Unknown';
  }
}
