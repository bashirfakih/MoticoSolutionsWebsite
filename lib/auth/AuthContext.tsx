'use client';

/**
 * Authentication Context for Motico Solutions
 *
 * Provides authentication state and methods throughout the app.
 * Uses server-side session management with httpOnly cookies.
 *
 * @module lib/auth/AuthContext
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, ROLES } from '../permissions';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  company?: string;
  phone?: string;
  country?: string;
  industry?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<AuthResult>;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch current user from API
 */
async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return mapApiUserToUser(data.user);
  } catch {
    return null;
  }
}

/**
 * Map API user response to User type
 */
function mapApiUserToUser(apiUser: {
  id: string;
  email: string;
  name: string;
  role: string;
  company?: string | null;
  phone?: string | null;
  avatar?: string | null;
  isActive?: boolean;
  country?: string | null;
  industry?: string | null;
  position?: string | null;
  address?: string | null;
  city?: string | null;
  lastLogin?: string | null;
}): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role === 'admin' ? ROLES.ADMIN : ROLES.CUSTOMER,
    company: apiUser.company ?? null,
    phone: apiUser.phone ?? null,
    avatar: apiUser.avatar ?? null,
    isActive: apiUser.isActive ?? true,
    country: apiUser.country ?? undefined,
    industry: apiUser.industry ?? undefined,
    position: apiUser.position ?? undefined,
    address: apiUser.address ?? undefined,
    city: apiUser.city ?? undefined,
    createdAt: new Date().toISOString(),
    lastLogin: apiUser.lastLogin || new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// AUTH PROVIDER
// ═══════════════════════════════════════════════════════════════

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from session
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        return {
          success: false,
          error: data.error || 'Invalid email or password.',
        };
      }

      const loggedInUser = mapApiUserToUser(data.user);
      setUser(loggedInUser);
      setIsLoading(false);

      return {
        success: true,
        user: loggedInUser,
      };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      };
    }
  }, []);

  /**
   * Logout the current user
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Continue with logout even if API fails
    }

    setUser(null);
    setIsLoading(false);
  }, []);

  /**
   * Register a new customer account
   */
  const register = useCallback(async (data: RegisterData): Promise<AuthResult> => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        return {
          success: false,
          error: responseData.error || 'Registration failed.',
        };
      }

      // Registration auto-logs in the user
      const newUser = mapApiUserToUser(responseData.user);
      setUser(newUser);
      setIsLoading(false);

      return {
        success: true,
        user: newUser,
      };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      };
    }
  }, []);

  /**
   * Update user data locally
   * For optimistic updates - should be followed by API call
   */
  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Hook to access auth context
 * Throws if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════
// HOC FOR CLASS COMPONENTS
// ═══════════════════════════════════════════════════════════════

/**
 * Higher-Order Component for class components
 * Injects auth props into wrapped component
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P & AuthContextType>
) {
  return function WithAuthComponent(props: P) {
    const auth = useAuth();
    return <WrappedComponent {...props} {...auth} />;
  };
}

export default AuthContext;
