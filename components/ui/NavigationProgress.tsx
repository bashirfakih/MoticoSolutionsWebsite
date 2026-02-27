'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setProgress(0)
  }, [])

  const completeLoading = useCallback(() => {
    setProgress(100)
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 200)
  }, [])

  // Detect route changes
  useEffect(() => {
    completeLoading()
  }, [pathname, searchParams, completeLoading])

  // Intercept link clicks to start loading
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (anchor && anchor.href && !anchor.target && !anchor.download) {
        const url = new URL(anchor.href, window.location.origin)
        // Only trigger for internal navigation
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          startLoading()
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname, startLoading])

  // Animate progress
  useEffect(() => {
    if (!isLoading) return

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        // Slow down as we approach 90%
        const increment = prev < 50 ? 10 : prev < 70 ? 5 : 2
        return Math.min(prev + increment, 90)
      })
    }, 200)

    return () => clearInterval(timer)
  }, [isLoading])

  if (!isLoading && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page loading progress"
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-gray-200/30" />

      {/* Progress bar */}
      <div
        className="h-full transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #004D8B, #bb0c15)',
          boxShadow: '0 0 10px rgba(187, 12, 21, 0.5)',
        }}
      />

      {/* Pulsing glow at the end */}
      {isLoading && (
        <div
          className="absolute top-0 h-full w-20 animate-pulse"
          style={{
            right: `${100 - progress}%`,
            background: 'linear-gradient(90deg, transparent, rgba(187, 12, 21, 0.4))',
          }}
        />
      )}
    </div>
  )
}
