import { redirect } from 'next/navigation';

/**
 * Registration Page - Disabled
 *
 * Self-registration is disabled. New users must be created by an admin.
 * This page redirects to the login page.
 */
export default function RegisterPage() {
  redirect('/login');
}
