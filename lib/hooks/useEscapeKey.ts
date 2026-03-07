'use client';

import { useEffect } from 'react';

/**
 * Calls the handler when the Escape key is pressed.
 * Only fires when `enabled` is true (i.e., when a modal is open).
 */
export function useEscapeKey(handler: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handler, enabled]);
}
