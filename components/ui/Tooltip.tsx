'use client';

/**
 * Tooltip Component
 *
 * Accessible, portal-based tooltip that shows on hover/focus.
 * Supports multiple positions with smart viewport boundary handling.
 *
 * @module components/ui/Tooltip
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  delay?: number;
  maxWidth?: number;
  className?: string;
}

export function Tooltip({
  content,
  position = 'top',
  children,
  delay = 200,
  maxWidth = 250,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substring(2, 9)}`);

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;
    const gap = 8;
    let finalPosition = position;

    // Calculate initial position
    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - gap;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        // Flip to bottom if not enough space above
        if (triggerRect.top < tooltipRect.height + gap) {
          top = triggerRect.bottom + scrollY + gap;
          finalPosition = 'bottom';
        }
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + gap;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        // Flip to top if not enough space below
        if (window.innerHeight - triggerRect.bottom < tooltipRect.height + gap) {
          top = triggerRect.top + scrollY - tooltipRect.height - gap;
          finalPosition = 'top';
        }
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - gap;
        // Flip to right if not enough space on left
        if (triggerRect.left < tooltipRect.width + gap) {
          left = triggerRect.right + scrollX + gap;
          finalPosition = 'right';
        }
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollX + gap;
        // Flip to left if not enough space on right
        if (window.innerWidth - triggerRect.right < tooltipRect.width + gap) {
          left = triggerRect.left + scrollX - tooltipRect.width - gap;
          finalPosition = 'left';
        }
        break;
    }

    // Viewport boundary checks for horizontal overflow
    const padding = 8;
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding + scrollX));

    setCoords({ top, left });
    setActualPosition(finalPosition);
  }, [position]);

  const showTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  // Calculate position when visible
  useEffect(() => {
    if (isVisible) {
      // Use requestAnimationFrame to ensure tooltip is rendered before calculating
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }
  }, [isVisible, calculatePosition]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideTooltip();
    };
    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, hideTooltip]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Arrow styles based on position
  const arrowStyles: Record<string, string> = {
    top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'right-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'left-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onClick={showTooltip}
        aria-describedby={isVisible ? tooltipId.current : undefined}
        className={`inline-flex ${className}`}
      >
        {children}
      </span>

      {mounted &&
        isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId.current}
            role="tooltip"
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
              maxWidth,
              zIndex: 9999,
            }}
            className="px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
          >
            {content}
            <span
              className={`absolute w-0 h-0 border-[6px] ${arrowStyles[actualPosition]}`}
              aria-hidden="true"
            />
          </div>,
          document.body
        )}
    </>
  );
}
