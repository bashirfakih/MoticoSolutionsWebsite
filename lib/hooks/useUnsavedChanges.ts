/**
 * useUnsavedChanges Hook
 *
 * Warns users when they try to navigate away from a page with unsaved changes.
 * Handles both browser navigation (beforeunload) and Next.js client-side navigation.
 */

'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseUnsavedChangesOptions {
  /** Whether there are unsaved changes */
  hasChanges: boolean;
  /** Message to show in the confirmation dialog */
  message?: string;
  /** Callback when user confirms they want to leave */
  onConfirmLeave?: () => void;
}

interface UseUnsavedChangesReturn {
  /** Whether the confirmation dialog should be shown */
  showDialog: boolean;
  /** The URL the user is trying to navigate to */
  pendingUrl: string | null;
  /** Confirm leaving the page */
  confirmLeave: () => void;
  /** Cancel leaving and stay on the page */
  cancelLeave: () => void;
  /** Safely navigate (bypasses the warning) */
  safeNavigate: (url: string) => void;
}

export function useUnsavedChanges({
  hasChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onConfirmLeave,
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [bypassWarning, setBypassWarning] = useState(false);

  // Handle browser beforeunload event (refresh, close tab, external navigation)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && !bypassWarning) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, message, bypassWarning]);

  // Intercept link clicks for client-side navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasChanges || bypassWarning) return;

      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);

        // Only intercept internal navigation
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          e.preventDefault();
          e.stopPropagation();
          setPendingUrl(url.pathname + url.search);
          setShowDialog(true);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasChanges, bypassWarning]);

  const confirmLeave = useCallback(() => {
    setBypassWarning(true);
    setShowDialog(false);
    onConfirmLeave?.();

    if (pendingUrl) {
      router.push(pendingUrl);
    }

    setPendingUrl(null);
  }, [pendingUrl, router, onConfirmLeave]);

  const cancelLeave = useCallback(() => {
    setShowDialog(false);
    setPendingUrl(null);
  }, []);

  const safeNavigate = useCallback((url: string) => {
    setBypassWarning(true);
    router.push(url);
  }, [router]);

  return {
    showDialog,
    pendingUrl,
    confirmLeave,
    cancelLeave,
    safeNavigate,
  };
}
