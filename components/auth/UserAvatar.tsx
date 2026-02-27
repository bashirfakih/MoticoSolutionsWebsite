'use client';

/**
 * UserAvatar Component
 *
 * Displays user avatar with initials fallback.
 *
 * @module components/auth/UserAvatar
 */

import React from 'react';
import Image from 'next/image';
import { User } from '@/lib/permissions';

interface UserAvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const statusSizes = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

/**
 * Get initials from name
 */
function getInitials(name: string | undefined): string {
  if (!name) return 'U';

  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate consistent color from string
 */
function getColorFromString(str: string): string {
  const colors = [
    '#004D8B', // Primary blue
    '#bb0c15', // Primary red
    '#16a34a', // Green
    '#7c3aed', // Purple
    '#0891b2', // Cyan
    '#ea580c', // Orange
    '#4f46e5', // Indigo
    '#be185d', // Pink
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export default function UserAvatar({
  user,
  size = 'md',
  className = '',
  showStatus = false,
}: UserAvatarProps) {
  const initials = getInitials(user?.name);
  const bgColor = getColorFromString(user?.email || user?.name || 'user');

  return (
    <div className={`relative inline-block ${className}`}>
      {user?.avatar ? (
        <Image
          src={user.avatar}
          alt={user.name || 'User'}
          width={64}
          height={64}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white`}
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}

      {/* Online status indicator */}
      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0 ${statusSizes[size]}
            bg-green-500 border-2 border-white rounded-full
          `}
        />
      )}
    </div>
  );
}

/**
 * Avatar with dropdown menu
 */
interface UserAvatarMenuProps extends UserAvatarProps {
  children: React.ReactNode;
}

export function UserAvatarWithMenu({
  user,
  size = 'md',
  className = '',
  showStatus = false,
  children,
}: UserAvatarMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none focus:ring-2 focus:ring-[#004D8B] focus:ring-offset-2 rounded-full"
      >
        <UserAvatar user={user} size={size} className={className} showStatus={showStatus} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
}
