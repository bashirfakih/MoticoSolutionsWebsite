'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Success
    setStatus('success')

    // Reset after 5 seconds
    setTimeout(() => {
      setStatus('idle')
      setEmail('')
    }, 5000)
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 py-3 px-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)' }}>
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-white">Thanks! You&apos;re subscribed.</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            You&apos;ll receive our latest updates soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            placeholder="Your email address"
            aria-label="Email address for newsletter"
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: status === 'error' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
              color: 'white',
            }}
            onFocus={(e) => {
              if (status !== 'error') {
                e.target.style.borderColor = 'rgba(220,38,38,0.5)'
              }
            }}
            onBlur={(e) => {
              if (status !== 'error') {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)'
              }
            }}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-shimmer px-5 py-3 rounded-xl text-white text-sm font-semibold active:scale-95 transition-transform flex-shrink-0 flex items-center gap-2 disabled:opacity-70"
          style={{ background: '#bb0c15' }}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Subscribing...</span>
            </>
          ) : (
            'Subscribe →'
          )}
        </button>
      </div>
      {status === 'error' && (
        <div id="newsletter-error" className="flex items-center gap-2 mt-2 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          {errorMessage}
        </div>
      )}
    </form>
  )
}
