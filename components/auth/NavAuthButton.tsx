'use client';

/**
 * NavAuthButton Component
 *
 * Auth-aware navigation button that shows:
 * - Login/Register links for guests
 * - User avatar with dropdown menu for authenticated users
 *
 * @module components/auth/NavAuthButton
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { isAdmin } from '@/lib/permissions';
import {
  User,
  LogOut,
  Settings,
  ShoppingCart,
  FileText,
  LayoutDashboard,
  ChevronDown,
  Shield,
} from 'lucide-react';

interface NavAuthButtonProps {
  variant?: 'default' | 'minimal' | 'mobile';
  className?: string;
}

export default function NavAuthButton({
  variant = 'default',
  className = '',
}: NavAuthButtonProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    window.location.href = '/';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`w-10 h-10 rounded-full bg-gray-200 animate-pulse ${className}`} />
    );
  }

  // Guest state - show login/register
  if (!isAuthenticated) {
    if (variant === 'mobile') {
      return (
        <div className={`flex flex-col gap-2 ${className}`}>
          <Link
            href="/login"
            className="w-full px-4 py-2.5 text-center font-medium text-gray-700 hover:text-[#004D8B] border border-gray-300 rounded-lg hover:border-[#004D8B] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="w-full px-4 py-2.5 text-center font-medium text-white bg-[#004D8B] rounded-lg hover:bg-[#003a6a] transition-colors"
          >
            Create Account
          </Link>
        </div>
      );
    }

    if (variant === 'minimal') {
      return (
        <Link
          href="/login"
          className={`inline-flex items-center gap-2 px-4 py-2 font-medium text-[#004D8B] hover:text-[#003a6a] transition-colors ${className}`}
        >
          <User className="w-4 h-4" />
          Sign In
        </Link>
      );
    }

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Link
          href="/login"
          className="px-4 py-2 font-medium text-gray-700 hover:text-[#004D8B] transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 font-medium text-white bg-[#004D8B] rounded-lg hover:bg-[#003a6a] transition-colors"
        >
          Register
        </Link>
      </div>
    );
  }

  // Authenticated state - show avatar with dropdown
  const userIsAdmin = isAdmin(user);
  const dashboardLink = userIsAdmin ? '/admin/dashboard' : '/account/dashboard';
  const initials = user?.name?.charAt(0).toUpperCase() || 'U';

  if (variant === 'mobile') {
    return (
      <div className={`${className}`}>
        {/* User Info */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-200">
          <div className="w-12 h-12 rounded-full bg-[#004D8B] flex items-center justify-center text-white font-semibold text-lg">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.company || user?.email}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          <Link
            href={dashboardLink}
            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          {!userIsAdmin && (
            <>
              <Link
                href="/account/orders"
                className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                My Orders
              </Link>
              <Link
                href="/account/quotes"
                className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5" />
                Quotes
              </Link>
            </>
          )}
          <Link
            href="/account/profile"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User className="w-5 h-5" />
            Profile
          </Link>
          <Link
            href="/account/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#004D8B] focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-9 h-9 rounded-full bg-[#004D8B] flex items-center justify-center text-white font-semibold">
          {initials}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#004D8B] flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            {userIsAdmin && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 rounded-full px-2.5 py-1 w-fit">
                <Shield className="w-3 h-3" />
                Administrator
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href={dashboardLink}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            {!userIsAdmin && (
              <>
                <Link
                  href="/account/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  My Orders
                </Link>
                <Link
                  href="/account/quotes"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Quotes
                </Link>
              </>
            )}
            <Link
              href="/account/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <Link
              href="/account/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-1 mt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
