'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Small delay to avoid blocking initial render
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all')
    setVisible(false)
  }

  const acceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential')
    setVisible(false)
  }

  if (!mounted || !visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[99999] p-4 sm:p-6"
      style={{
        animation: 'slideUp 0.4s ease-out',
      }}
    >
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div
        className="max-w-4xl mx-auto rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{
          background: 'rgba(10, 22, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.3)',
        }}
      >
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 sm:hidden p-1 rounded-full"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          aria-label="Close cookie banner"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 pr-8 sm:pr-0">
          <h3
            className="font-bold text-base mb-1.5"
            style={{ color: 'white' }}
          >
            Cookie Notice
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
            By clicking &ldquo;Accept All&rdquo;, you consent to our use of cookies.{' '}
            <a
              href="/privacy"
              className="underline hover:no-underline transition-colors"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              Learn more
            </a>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={acceptEssential}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            Essential Only
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: '#004D8B',
              boxShadow: '0 4px 15px rgba(0,77,139,0.4)',
            }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
