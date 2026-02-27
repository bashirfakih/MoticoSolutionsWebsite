/**
 * Mock Users for Development
 *
 * These users are used for testing the authentication system
 * before the real backend is connected.
 *
 * @module lib/auth/mockUsers
 */

import { User, ROLES } from '../permissions';

interface MockUser extends User {
  password: string; // Only in mock - never stored in real user object
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'admin-001',
    email: 'admin@moticosolutions.com',
    password: 'Admin@2024',
    name: 'Motico Admin',
    role: ROLES.ADMIN,
    company: 'Motico Solutions',
    phone: '+961 3 741 565',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    country: 'Lebanon',
    industry: 'Industrial Distribution',
  },
  {
    id: 'customer-001',
    email: 'demo@company.com',
    password: 'Demo@2024',
    name: 'Demo Customer',
    role: ROLES.CUSTOMER,
    company: 'Demo Manufacturing Co.',
    phone: '+961 1 234 567',
    avatar: null,
    isActive: true,
    createdAt: '2024-06-15T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    country: 'Lebanon',
    industry: 'Metal Fabrication',
  },
  {
    id: 'customer-002',
    email: 'pending@company.com',
    password: 'Pending@2024',
    name: 'Pending User',
    role: ROLES.CUSTOMER,
    company: 'Pending Industries',
    phone: '+961 1 111 111',
    avatar: null,
    isActive: false, // This user is pending approval
    createdAt: '2024-12-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    country: 'Saudi Arabia',
    industry: 'Construction',
  },
];

/**
 * Find a mock user by email
 */
export function findMockUserByEmail(email: string): MockUser | undefined {
  return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Validate mock user credentials
 * Returns the user (without password) if valid, null otherwise
 */
export function validateMockCredentials(email: string, password: string): User | null {
  const mockUser = findMockUserByEmail(email);
  if (!mockUser) return null;
  if (mockUser.password !== password) return null;

  // Return user without password
  const { password: _, ...user } = mockUser;
  return user;
}

/**
 * Simulate creating a new mock user (for registration)
 * In real implementation, this would call the API
 */
export function createMockUser(data: {
  name: string;
  email: string;
  password: string;
  company: string;
  phone?: string;
  country?: string;
  industry?: string;
}): User {
  const newUser: User = {
    id: `customer-${Date.now()}`,
    email: data.email,
    name: data.name,
    role: ROLES.CUSTOMER,
    company: data.company,
    phone: data.phone || null,
    avatar: null,
    isActive: false, // Requires admin approval
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    country: data.country,
    industry: data.industry,
  };

  // In mock mode, we don't actually persist this
  // In real mode, this would be saved to the database

  return newUser;
}
