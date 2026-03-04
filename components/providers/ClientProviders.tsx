/**
 * Client Providers Wrapper
 *
 * Wraps all client-side providers in a single component
 * for use in the root server layout.
 */

'use client';

import { ReactNode } from 'react';
import { SettingsProvider } from '@/lib/hooks/useSettings';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ToastProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ToastProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
