/**
 * Authentication Utilities
 * Password hashing, session management, validation, and rate limiting
 */

import bcrypt from 'bcryptjs';

// ═══════════════════════════════════════════════════════════════
// USER ROLES
// ═══════════════════════════════════════════════════════════════

export const USER_ROLE = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

// ═══════════════════════════════════════════════════════════════
// PASSWORD HASHING
// ═══════════════════════════════════════════════════════════════

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ═══════════════════════════════════════════════════════════════
// EMAIL VALIDATION
// ═══════════════════════════════════════════════════════════════

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ═══════════════════════════════════════════════════════════════
// PASSWORD STRENGTH VALIDATION
// ═══════════════════════════════════════════════════════════════

export interface PasswordStrength {
  isValid: boolean;
  score: number;
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  } else {
    score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain a special character');
  } else {
    score += 1;
  }

  return {
    isValid: errors.length === 0,
    score,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════
// USER PERMISSIONS
// ═══════════════════════════════════════════════════════════════

export interface UserPermissions {
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  canManageProducts: boolean;
  canViewOrders: boolean;
  canModifyOrders: boolean;
}

export function getUserPermissions(role: UserRole): UserPermissions {
  return {
    canAccessAdmin: role === USER_ROLE.ADMIN || role === USER_ROLE.STAFF,
    canManageUsers: role === USER_ROLE.ADMIN,
    canManageProducts: role === USER_ROLE.ADMIN || role === USER_ROLE.STAFF,
    canViewOrders: true, // All roles can view orders
    canModifyOrders: role === USER_ROLE.ADMIN || role === USER_ROLE.STAFF,
  };
}

export function canUserAccess(
  role: UserRole,
  permission: keyof UserPermissions
): boolean {
  const permissions = getUserPermissions(role);
  return permissions[permission];
}

// ═══════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export interface Session {
  userId: string;
  email: string;
  role: UserRole;
  expiresAt: Date;
}

const DEFAULT_SESSION_DURATION_HOURS = 24;

export function createSession(
  user: User,
  durationHours: number = DEFAULT_SESSION_DURATION_HOURS
): Session {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + durationHours);

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt,
  };
}

export function validateSession(session: Session | null): boolean {
  if (!session) return false;
  return new Date() < session.expiresAt;
}

export function invalidateSession(session: Session): Session {
  return {
    ...session,
    expiresAt: new Date(0), // Set to past date
  };
}

// ═══════════════════════════════════════════════════════════════
// LOGIN VALIDATION
// ═══════════════════════════════════════════════════════════════

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export async function validateLoginCredentials(
  email: string,
  password: string,
  users: User[],
  getPasswordHash: (userId: string) => Promise<string>
): Promise<LoginResult> {
  // Check email
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Invalid email format' };
  }

  // Check password
  if (!password || password.length < 1) {
    return { success: false, error: 'Password is required' };
  }

  // Find user
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Check if user is active
  if (!user.isActive) {
    return { success: false, error: 'Account is disabled' };
  }

  // Verify password
  const hash = await getPasswordHash(user.id);
  const isValid = await verifyPassword(password, hash);
  if (!isValid) {
    return { success: false, error: 'Invalid email or password' };
  }

  return { success: true, user };
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════

export interface RateLimitState {
  attempts: number;
  lastAttempt: Date;
  blockedUntil: Date | null;
}

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MINUTES = 15;

export function checkRateLimit(
  state: RateLimitState
): { allowed: boolean; waitTime?: number } {
  // Check if currently blocked
  if (state.blockedUntil && new Date() < state.blockedUntil) {
    const waitTime = Math.ceil(
      (state.blockedUntil.getTime() - Date.now()) / 1000 / 60
    );
    return { allowed: false, waitTime };
  }

  // Reset if block expired
  if (state.blockedUntil && new Date() >= state.blockedUntil) {
    state.attempts = 0;
    state.blockedUntil = null;
  }

  // Check attempts
  if (state.attempts >= MAX_ATTEMPTS) {
    state.blockedUntil = new Date();
    state.blockedUntil.setMinutes(
      state.blockedUntil.getMinutes() + BLOCK_DURATION_MINUTES
    );
    return { allowed: false, waitTime: BLOCK_DURATION_MINUTES };
  }

  return { allowed: true };
}

export function resetRateLimit(state: RateLimitState): RateLimitState {
  return {
    attempts: 0,
    lastAttempt: new Date(),
    blockedUntil: null,
  };
}

// ═══════════════════════════════════════════════════════════════
// TOKEN GENERATION
// ═══════════════════════════════════════════════════════════════

export function generateToken(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateSecureToken(length: number = 32): string {
  // For browser environments, use crypto.getRandomValues
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');
  }

  // Fallback to simple random generation
  return generateToken(length);
}
