'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Phone, FileText, X } from 'lucide-react'

interface FloatingActionsProps {
  onQuoteClick?: () => void
  whatsappMessage?: string
}

export default function FloatingActions({ onQuoteClick, whatsappMessage }: FloatingActionsProps) {
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(false)

  // Show after scrolling a bit
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const defaultMessage = whatsappMessage || "Hello Motico Solutions! I'm interested in your industrial products."
  const whatsappUrl = `https://wa.me/9613741565?text=${encodeURIComponent(defaultMessage)}`

  const actions = [
    {
      id: 'quote',
      icon: FileText,
      label: 'Get Quote',
      color: '#bb0c15',
      onClick: onQuoteClick,
    },
    {
      id: 'call',
      icon: Phone,
      label: 'Call Now',
      color: '#004D8B',
      href: 'tel:+9613741565',
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      color: '#25D366',
      href: whatsappUrl,
      external: true,
    },
  ]

  if (!visible) return null

  return (
    <div className="fixed z-50 bottom-6 right-6 flex flex-col-reverse items-end gap-3">
      {/* Action buttons - shown on desktop, expandable on mobile */}
      <div
        className="flex flex-col-reverse gap-3 transition-all duration-300"
        style={{
          opacity: expanded ? 1 : 0,
          visibility: expanded ? 'visible' : 'hidden',
          transform: expanded ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {actions.map((action) => {
          const Icon = action.icon
          const commonProps = {
            className: "group flex items-center gap-3 transition-all duration-200 hover:scale-105 active:scale-95",
            title: action.label,
          }

          const content = (
            <>
              {/* Label tooltip */}
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: action.color }}
              >
                {action.label}
              </span>
              {/* Icon button */}
              <span
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: action.color }}
              >
                <Icon className="w-5 h-5 text-white" />
              </span>
            </>
          )

          if (action.onClick) {
            return (
              <button
                key={action.id}
                {...commonProps}
                onClick={() => {
                  action.onClick?.()
                  setExpanded(false)
                }}
                aria-label={action.label}
              >
                {content}
              </button>
            )
          }

          return (
            <a
              key={action.id}
              {...commonProps}
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              aria-label={action.label}
            >
              {content}
            </a>
          )
        })}
      </div>

      {/* Main toggle button - mobile only */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="md:hidden w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: expanded ? '#1f2937' : '#25D366',
        }}
        aria-label={expanded ? 'Close menu' : 'Contact options'}
        aria-expanded={expanded}
      >
        {expanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Desktop: always show WhatsApp button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex whatsapp-btn w-14 h-14 rounded-full items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: '#25D366' }}
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  )
}
