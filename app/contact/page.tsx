'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Phone, Mail, MapPin, Clock, MessageCircle, Send,
  CheckCircle, Loader2, Menu, X, ChevronDown, ArrowRight,
  Facebook, Instagram, Linkedin, Youtube, Globe,
  Layers, Wrench, Settings, Package, Disc, Scissors, Star,
} from 'lucide-react'
import { useSettings } from '@/lib/hooks/useSettings'
import * as LucideIcons from 'lucide-react'

/* ─── Category Interface ───────────────────────────── */
interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
}

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [productsMenuOpen, setProductsMenuOpen] = useState(false)
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [categories, setCategories] = useState<Category[]>([])
  const { settings, loading: settingsLoading } = useSettings()

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          // Filter to get only parent categories
          const parentCategories = data.filter((cat: Category) => !cat.id.includes('-'))
          setCategories(parentCategories)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Helper to get icon component from string name
  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return Layers
    const Icon = (LucideIcons as any)[iconName]
    return Icon || Layers
  }

  // Helper to get color with fallback
  const getColor = (index: number) => {
    if (!settings) return index % 2 === 0 ? '#004D8B' : '#bb0c15'
    return index % 2 === 0 ? settings.primaryColor : settings.secondaryColor
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('submitting')

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setFormState('success')

    // Reset after 5 seconds
    setTimeout(() => {
      setFormState('idle')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products', hasMenu: true },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50">
        {/* Top bar */}
        <div style={{ background: settings?.primaryColor || '#004D8B' }} className="py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              {settings?.companyPhone && (
                <a href={`tel:${settings.companyPhone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5 text-white/40" />
                  {settings.companyPhone}
                </a>
              )}
              {settings?.companyEmail && (
                <a href={`mailto:${settings.companyEmail}`} className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5 text-white/40" />
                  {settings.companyEmail}
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              {[
                { Icon: Facebook, label: 'Facebook', href: settings?.socialFacebook },
                { Icon: Instagram, label: 'Instagram', href: settings?.socialInstagram },
                { Icon: Linkedin, label: 'LinkedIn', href: settings?.socialLinkedIn },
                { Icon: Youtube, label: 'YouTube', href: settings?.socialYouTube },
              ].filter(({ href }) => href).map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = settings?.secondaryColor || '#bb0c15')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                >
                  <Icon className="w-3.5 h-3.5 text-white" />
                </a>
              ))}
              <span className="text-white/20 text-xs ml-1">|</span>
              <span className="text-xs text-white/40 flex items-center gap-1 ml-1">
                <Globe className="w-3 h-3" /> {settings?.defaultLanguage?.toUpperCase() || 'EN'}
              </span>
            </div>
          </div>
        </div>

        {/* Main navbar */}
        <nav
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 1px 20px rgba(0,0,0,0.08)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-18">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 mt-4">
              <img
                src={settings?.logo || '/images/logos/company/logo-motico-solutions.png'}
                alt={settings?.companyName || 'Company Logo'}
                className="h-24 w-auto object-contain"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                link.hasMenu ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setProductsMenuOpen(true)}
                    onMouseLeave={() => setProductsMenuOpen(false)}
                  >
                    <button
                      className="nav-link text-sm font-medium pb-0.5 flex items-center gap-1"
                      style={{ color: productsMenuOpen ? (settings?.primaryColor || '#004D8B') : '#4b5563' }}
                    >
                      {link.label}
                      <ChevronDown
                        className="w-3.5 h-3.5 transition-transform"
                        style={{ transform: productsMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                      />
                    </button>
                    {/* Mega Menu */}
                    <div
                      className="absolute top-full left-1/2 pt-3 transition-all duration-200"
                      style={{
                        transform: 'translateX(-50%)',
                        opacity: productsMenuOpen ? 1 : 0,
                        visibility: productsMenuOpen ? 'visible' : 'hidden',
                        pointerEvents: productsMenuOpen ? 'auto' : 'none',
                      }}
                    >
                      <div
                        className="rounded-2xl p-6 grid grid-cols-3 gap-3"
                        style={{
                          background: 'white',
                          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                          border: '1px solid #e5e7eb',
                          width: 520,
                        }}
                      >
                        {categories.map((cat, index) => {
                          const Icon = getIconComponent(cat.icon)
                          return (
                            <Link
                              key={cat.id}
                              href={`/products/${cat.slug}`}
                              className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50 group"
                              onClick={() => setProductsMenuOpen(false)}
                            >
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: cat.color || getColor(index) }}
                              >
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-700" style={{ color: undefined }}>
                                {cat.name}
                              </span>
                            </Link>
                          )
                        })}
                        <Link
                          href="/products"
                          className="col-span-3 mt-2 pt-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                          style={{ borderTop: '1px solid #e5e7eb', color: settings?.secondaryColor || '#bb0c15' }}
                          onClick={() => setProductsMenuOpen(false)}
                        >
                          View All Products <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="nav-link text-sm font-medium pb-0.5"
                    style={{ color: link.href === '/contact' ? (settings?.primaryColor || '#004D8B') : '#4b5563' }}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>

            {/* Right buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://wa.me/9613741565"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium px-4 py-2 rounded-lg border transition-all active:scale-95 flex items-center gap-2"
                style={{ borderColor: '#25D366', color: '#25D366' }}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <Link
                href="/#cta"
                className="btn-shimmer text-sm font-semibold px-5 py-2 rounded-lg text-white active:scale-95 transition-transform"
                style={{ background: settings?.secondaryColor || '#bb0c15', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}
              >
                Get Quote
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: settings?.primaryColor || '#004D8B' }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex flex-col overflow-y-auto" style={{ background: 'white', top: '104px' }}>
            <div className="flex flex-col p-6 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-xl font-semibold py-3 border-b"
                  style={{ color: settings?.primaryColor || '#004D8B', borderColor: '#f1f5f9' }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/#cta"
                onClick={() => setMenuOpen(false)}
                className="mt-4 text-center py-3 rounded-lg text-white font-semibold"
                style={{ background: settings?.secondaryColor || '#bb0c15' }}
              >
                Get Quote
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden" style={{ background: settings?.primaryColor || '#004D8B' }}>
          <div className="absolute inset-0 dot-grid opacity-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Get in <span style={{ color: settings?.secondaryColor || '#bb0c15' }}>Touch</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Have questions about our products or need a custom quote? Our team is here to help.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

                <div className="space-y-6 mb-10">
                  {settings?.companyPhone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: settings?.secondaryColor || '#bb0c15' }}>
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Phone</h3>
                        <a href={`tel:${settings.companyPhone.replace(/\s/g, '')}`} className="text-gray-600 transition-colors block" style={{ color: undefined }}>
                          {settings.companyPhone}
                        </a>
                      </div>
                    </div>
                  )}

                  {settings?.companyEmail && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: settings?.primaryColor || '#004D8B' }}>
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Email</h3>
                        <a href={`mailto:${settings.companyEmail}`} className="text-gray-600 transition-colors">
                          {settings.companyEmail}
                        </a>
                      </div>
                    </div>
                  )}

                  {(settings?.companyCity || settings?.companyCountry) && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: settings?.secondaryColor || '#bb0c15' }}>
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Location</h3>
                        <p className="text-gray-600">
                          {[settings?.companyCity, settings?.companyCountry].filter(Boolean).join(', ')}
                        </p>
                        {settings?.companyAddress && (
                          <p className="text-gray-600 text-sm">{settings.companyAddress}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: settings?.primaryColor || '#004D8B' }}>
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Business Hours</h3>
                      <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Saturday: 8:00 AM - 2:00 PM</p>
                      <p className="text-gray-500 text-sm">Sunday: Closed</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <a
                    href="https://wa.me/9613741565?text=Hello%20Motico%20Solutions!%20I%20have%20a%20question."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: '#25D366' }}
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp Us
                  </a>
                  <a
                    href={`tel:${settings?.companyPhone?.replace(/\s/g, '') || ''}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: settings?.primaryColor || '#004D8B' }}
                  >
                    <Phone className="w-5 h-5" />
                    Call Now
                  </a>
                </div>

                {/* Map */}
                <div className="rounded-2xl overflow-hidden shadow-lg" style={{ height: 300 }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d211902.54181632607!2d35.35857565!3d33.8886279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f17215880a78f%3A0x729182bae99836b4!2sBeirut%2C%20Lebanon!5e0!3m2!1sen!2s!4v1699999999999!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Motico Solutions Location - Beirut, Lebanon"
                  />
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                  <p className="text-gray-600 mb-6">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>

                  {formState === 'success' ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.1)' }}>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                      <p className="text-gray-600">Thank you for reaching out. Our team will respond shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-2 focus:border-transparent transition-all"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-2 focus:border-transparent transition-all"
                            placeholder="john@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-2 focus:border-transparent transition-all"
                            placeholder="+961 3 123 456"
                          />
                        </div>
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                            Subject *
                          </label>
                          <select
                            id="subject"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-2 focus:border-transparent transition-all bg-white"
                          >
                            <option value="">Select a subject...</option>
                            <option value="quote">Request a Quote</option>
                            <option value="product">Product Inquiry</option>
                            <option value="technical">Technical Support</option>
                            <option value="order">Order Status</option>
                            <option value="partnership">Partnership Inquiry</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-2 focus:border-transparent transition-all resize-none"
                          placeholder="Tell us how we can help..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={formState === 'submitting'}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                        style={{ background: settings?.secondaryColor || '#bb0c15', boxShadow: '0 4px 15px rgba(187,12,21,0.3)' }}
                      >
                        {formState === 'submitting' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#080e1a' }} aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">Footer</h2>
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={settings?.logo || '/images/logos/company/logo-moticosolutions-white.png'}
                alt={settings?.companyName || 'Company Logo'}
                className="h-8 w-auto brightness-0 invert"
                loading="lazy"
              />
              <span className="text-xs text-white/40">{settings?.companyDescription || 'Premium Industrial Products'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/30">© {new Date().getFullYear()} {settings?.companyName || 'Company'}. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
