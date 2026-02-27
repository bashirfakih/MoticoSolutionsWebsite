'use client';

/**
 * RoleBadge Component
 *
 * Displays user role with appropriate styling.
 *
 * @module components/auth/RoleBadge
 */

import React from 'react';
import { Shield, User } from 'lucide-react';
import { ROLES, Role } from '@/lib/permissions';

interface RoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const roleConfig: Record<Role, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  [ROLES.ADMIN]: {
    label: 'Admin',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    icon: Shield,
  },
  [ROLES.CUSTOMER]: {
    label: 'Customer',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: User,
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export default function RoleBadge({
  role,
  size = 'md',
  showIcon = true,
}: RoleBadgeProps) {
  const config = roleConfig[role] || roleConfig[ROLES.CUSTOMER];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.bg} ${config.text} ${sizeClasses[size]}
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
