'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BadgeCheck, Zap, Headphones, Package, Users, Globe,
  Clock, Truck, ShieldCheck, Phone, Mail, MapPin,
  Menu, X, ChevronRight, ChevronLeft, ChevronDown, ArrowRight, CircleCheck,
  Facebook, Instagram, Linkedin, Youtube,
  Star, Layers, Scissors, Wrench, Disc, Settings, Quote,
} from 'lucide-react'
import CountUp from '@/components/ui/CountUp'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import QuoteForm from '@/components/ui/QuoteForm'

/* ─── Hooks ─────────────────────────────────────────────── */
function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [threshold])
  return scrolled
}

/* ─── Product Categories Data ───────────────────────────── */
const categories = [
  { id: 'abrasive-belts', title: 'Abrasive Belts', icon: Layers, color: '#bb0c15', bg: '/product-abrasive-belts.png' },
  { id: 'air-power-tools', title: 'Air & Power Tools', icon: Wrench, color: '#004D8B', bg: '/product-air-power-tools.png' },
  { id: 'belt-disc-sanders', title: 'Belt & Disc Sanders', icon: Settings, color: '#bb0c15', bg: '/product-belt-disc-sander.png' },
  { id: 'stationery-machines', title: 'Stationery Machines', icon: Package, color: '#004D8B', bg: '/product-stationery-machines.png' },
  { id: 'grinding-sleeves', title: 'Grinding Sleeves & Wheels', icon: Disc, color: '#bb0c15', bg: '/product-grinding-sleeve-wheels.png' },
  { id: 'abrasive-discs', title: 'Abrasive Discs', icon: Disc, color: '#004D8B', bg: '/product-abrasive-discs.png' },
  { id: 'cutting-discs', title: 'Cutting Discs', icon: Scissors, color: '#bb0c15', bg: '/product-cutting-discs.png' },
  { id: 'mounted-points', title: 'Mounted Point & Burrs', icon: Star, color: '#004D8B', bg: '/product-points-burrs.png' },
  { id: 'hand-finishing', title: 'Hand Finishing Products', icon: Layers, color: '#bb0c15', bg: '/product-hand-finishing-products.png' },
  { id: 'polish-care', title: 'Polish & Care Products', icon: ShieldCheck, color: '#004D8B', bg: 'product-polish-care-products.png' },
  { id: 'welding', title: 'Welding', icon: Zap, color: '#bb0c15', bg: '/product-welding.png' },
  { id: 'accessories', title: 'Accessories', icon: Settings, color: '#004D8B', bg: '/product-accessories.png' },
]

/* ─── Why Motico Features ───────────────────────────────── */
const features = [
  {
    icon: BadgeCheck,
    title: 'Official Brand Distributor',
    desc: 'Official distributor for Hermes, Eisenblätter, Hoffmann, Osborn, and more. Every product is 100% genuine with full manufacturer warranty.',
  },
  {
    icon: Truck,
    title: 'Fast Regional Delivery',
    desc: 'Reliable logistics across Lebanon, Middle East, and West Africa. Most orders delivered within 24–72 hours.',
  },
  {
    icon: Users,
    title: '300+ Satisfied Clients',
    desc: 'From small workshops to major manufacturing plants, we serve businesses of all sizes across industries.',
  },
  {
    icon: Headphones,
    title: 'Technical Expert Support',
    desc: 'Our team of industrial specialists helps you choose the right product for every application — before and after the sale.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    desc: 'ISO-aligned processes and rigorous product vetting ensure every item meets the highest performance standards.',
  },
  {
    icon: Globe,
    title: 'Regional Market Expertise',
    desc: 'Over 20 years serving the unique demands of Lebanon, Middle East & West Africa industries. We understand your market.',
  },
]

/* ─── Brands ─────────────────────────────────────────────── */
const brands = [
  { name: 'Hermes', logo: '/logo-hermes.png' },
  { name: 'Eisenblätter', logo: '/logo-eisenblaetter.png' },
  { name: 'Hoffmann', logo: '/logo-hoffmann.png' },
  { name: 'Osborn', logo: '/logo-osborn.png' },
  { name: '3M', logo: '/logo-3m.png' },
  { name: 'ZAT (OEM)', logo: '/logo-zat.jpg' },
  { name: 'Sandwox', logo: '/logo-sandwox.png' },
  { name: 'DCA', logo: '/logo-dca.png' },
  { name: 'Egeli', logo: '/logo-egeli.png' },
  { name: 'NS', logo: '/logo-ns.png' },
]

/* ─── Hero Slides ───────────────────────────────────────── */
const heroSlides = [
  {
    image: '/slide-1.png',
    tag: 'GRINDING SOLUTIONS',
    headline: ['The first hand-held', ' linear grinder'],
    tagline: 'The All-in-One Solution for Flat Surface Finishing on Stainless steel.',
    accent: '#bb0c15',
    accentSecondary: '#004D8B',
  },
  {
    image: '/slide-2-belt.png',
    tag: 'ABRASIVE BELTS',
    headline: ['Premium Wood', 'Abrasives'],
    tagline: 'Custom-converted wide belts tailored to your specific machinery and wood finishing requirements.',
    accent: '#004D8B',
    accentSecondary: '#bb0c15',
  },
  {
    image: '/slide-3-disc.png',
    tag: 'POWER TOOLS',
    headline: ['Power', 'Built for', 'Industry.'],
    tagline: 'Professional belt sanders, disc grinders and machines by ZAT.',
    accent: '#bb0c15',
    accentSecondary: '#004D8B',
  },
  {
    image: '/slide-4.png',
    tag: 'WIRE BRUSHES',
    headline: ['Surface', 'Finishing', 'Perfected'],
    tagline: 'High-performance sanding belts in all grits, widths and lengths.',
    accent: '#004D8B',
    accentSecondary: '#bb0c15',
  },
  {
    image: '/slide-5.png',
    tag: 'SPECIALTY ABRASIVES',
    headline: ['Industrial Wire Solutions'],
    tagline: 'High-performance wire wheels and brushes engineered for heavy-duty deburring, rust removal, and professional metal finishing',
    accent: '#bb0c15',
    accentSecondary: '#004D8B',
  },
]

/* ─── Testimonials ───────────────────────────────────────── */
const testimonials = [
  {
    name: 'Ahmad Khalil',
    role: 'Production Manager',
    company: 'Beirut Steel Works',
    quote: 'Motico Solutions has been our trusted partner for 8 years. Their Hermes belts outlast any competitor by 40%, and the technical support is unmatched.',
    rating: 5,
  },
  {
    name: 'Hassan Mansour',
    role: 'Operations Director',
    company: 'Gulf Metal Industries',
    quote: 'Switching to Motico cut our abrasive costs by 25% while improving finish quality. Their team understands industrial needs like no other.',
    rating: 5,
  },
  {
    name: 'Karim El-Masri',
    role: 'Workshop Owner',
    company: 'El-Masri Fabrication',
    quote: 'Fast delivery, premium products, expert advice. Motico is the gold standard for industrial abrasives in Lebanon.',
    rating: 5,
  },
  {
    name: 'Nabil Haddad',
    role: 'Maintenance Supervisor',
    company: 'Arabian Manufacturing Co.',
    quote: 'We have been working with Motico for over 5 years. Their product quality and consistent supply chain have made them indispensable to our operations.',
    rating: 5,
  },
  {
    name: 'Omar Farouk',
    role: 'Procurement Manager',
    company: 'West Africa Metals Ltd.',
    quote: 'Excellent range of products and competitive pricing. The team goes above and beyond to ensure we get exactly what we need for our projects.',
    rating: 5,
  },
]

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Home() {
  const scrolled = useScrolled(60)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [activeSlide, setActiveSlide] = useState(0)
  const [productsMenuOpen, setProductsMenuOpen] = useState(false)
  const [quoteFormOpen, setQuoteFormOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])
  const productsMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  /* Auto-advance hero slider */
  const [isPaused, setIsPaused] = useState(false)
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  /* Feature scroll spy */
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    featureRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveFeature(i) },
        { threshold: 0.5 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Products', href: '#products', hasMenu: true },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '#cta' },
  ]

  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transition: 'opacity 200ms ease',
      }}
    >
      {/* ════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Top bar */}
        <div style={{ background: '#004D8B' }} className="py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            {/* Contact info */}
            <div className="flex items-center gap-5">
              <a
                href="tel:+9613741565"
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-white/40" />
                +961 3 741 565
              </a>
              <a
                href="mailto:info@moticosolutions.com"
                className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-white/40" />
                info@moticosolutions.com
              </a>
            </div>
            {/* Social icons + language */}
            <div className="flex items-center gap-2">
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Linkedin, label: 'LinkedIn' },
                { Icon: Youtube, label: 'YouTube' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#bb0c15')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                >
                  <Icon className="w-3.5 h-3.5 text-white" />
                </a>
              ))}
              <span className="text-white/20 text-xs ml-1">|</span>
              <span className="text-xs text-white/40 flex items-center gap-1 ml-1">
                <Globe className="w-3 h-3" /> EN
              </span>
            </div>
          </div>
        </div>

        {/* Main navbar */}
        <nav
          style={{
            background: scrolled ? 'rgba(255,255,255,0.97)' : 'white',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : '0 1px 0 #f1f5f9',
            transition: 'all 0.3s ease',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-18">
            {/* Logo */}
            <a href="#" className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-motico-solutions.png"
                alt="Motico Solutions"
                className="h-24 w-auto object-contain"
              />
            </a>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                link.hasMenu ? (
                  <div
                    key={link.label}
                    className="relative"
                    ref={productsMenuRef}
                    onMouseEnter={() => setProductsMenuOpen(true)}
                    onMouseLeave={() => setProductsMenuOpen(false)}
                  >
                    <button
                      className="nav-link text-sm font-medium pb-0.5 flex items-center gap-1"
                      style={{ color: productsMenuOpen ? '#004D8B' : '#4b5563' }}
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
                        {categories.slice(0, 9).map(cat => {
                          const Icon = cat.icon
                          return (
                            <a
                              key={cat.id}
                              href={`#${cat.id}`}
                              className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50 group"
                              onClick={() => setProductsMenuOpen(false)}
                            >
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: cat.color }}
                              >
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-[#004D8B]">
                                {cat.title}
                              </span>
                            </a>
                          )
                        })}
                        <a
                          href="#products"
                          className="col-span-3 mt-2 pt-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                          style={{ borderTop: '1px solid #e5e7eb', color: '#bb0c15' }}
                          onClick={() => setProductsMenuOpen(false)}
                        >
                          View All Products <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="nav-link text-sm font-medium pb-0.5"
                    style={{ color: '#4b5563' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#004D8B')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
                  >
                    {link.label}
                  </a>
                )
              ))}

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-44 pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#004D8B] focus:outline-none focus:ring-1 focus:ring-[#004D8B] transition-all"
                  style={{ background: '#f8fafc' }}
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Right buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="#"
                className="text-sm font-medium px-4 py-2 rounded-lg border transition-all active:scale-95"
                style={{
                  borderColor: '#e5e7eb',
                  color: '#4b5563',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#bb0c15'
                  e.currentTarget.style.color = '#bb0c15'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.color = '#4b5563'
                }}
              >
                Login
              </a>
              <a
                href="#cta"
                className="btn-shimmer text-sm font-semibold px-5 py-2 rounded-lg text-white active:scale-95 transition-transform"
                style={{
                  background: '#bb0c15',
                  boxShadow: '0 4px 14px rgba(220,38,38,0.3)',
                }}
              >
                Get Quote
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: '#004D8B' }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile full-screen menu */}
        {menuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 flex flex-col"
            style={{ background: 'white', top: '104px' }}
          >
            <div className="flex flex-col p-6 gap-2">
              {navLinks.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-xl font-semibold py-3 border-b"
                  style={{
                    color: '#004D8B',
                    borderColor: '#f1f5f9',
                    animation: `lineReveal 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`,
                  }}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#"
                className="text-xl font-semibold py-3 border-b"
                style={{ color: '#004D8B', borderColor: '#f1f5f9', animation: `lineReveal 0.4s cubic-bezier(0.16,1,0.3,1) ${4 * 60}ms both` }}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </a>
              <a
                href="#cta"
                onClick={() => setMenuOpen(false)}
                className="mt-4 text-center font-bold text-white py-4 rounded-xl active:scale-95 transition-transform"
                style={{ background: '#bb0c15' }}
              >
                Get Quote →
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════
          HERO SECTION — Full Viewport Cinematic Slider
      ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative flex items-center overflow-hidden"
        style={{
          height: '100vh',
          minHeight: 700,
          paddingTop: 104,
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-labelledby="hero-heading"
      >
        <h1 id="hero-heading" className="sr-only">Industrial Excellence Delivered</h1>

        {/* LAYER 1 — Slide backgrounds (Next.js Image for WebP + optimization) */}
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              zIndex: 0,
              opacity: activeSlide === i ? 1 : 0,
              transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Image
              src={slide.image}
              alt={slide.tag}
              fill
              sizes="100vw"
              priority={i === 0}
              quality={85}
              className="object-cover"
              style={{
                transform: activeSlide === i ? 'scale(1.04)' : 'scale(1.0)',
                transition: 'transform 6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
        ))}

        {/* LAYER 2 — Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background: 'linear-gradient(105deg, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.75) 35%, rgba(10,22,40,0.35) 65%, rgba(10,22,40,0.15) 100%)',
          }}
        />

        {/* LAYER 3 — Dot grid texture */}
        <div
          className="dot-grid absolute inset-0 pointer-events-none"
          style={{ zIndex: 2 }}
        />

        {/* LAYER 4 — Content */}
        <div className="relative z-10 max-w-3xl pl-6 sm:pl-10 lg:pl-20 overflow-visible">
          {/* Kinetic Typography — re-mounts on slide change */}
          <div key={activeSlide}>
            {/* TAG LINE */}
            <div
              className="inline-flex items-center px-4 py-1.5 rounded-full mb-6"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                animation: 'fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0ms both',
              }}
            >
              <span
                className="text-[11px] font-bold tracking-[0.2em] uppercase"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                {heroSlides[activeSlide].tag}
              </span>
            </div>

            {/* HEADLINE — 3 lines, staggered (mobile-optimized) */}
            <div className="mb-4 sm:mb-6">
              {heroSlides[activeSlide].headline.map((line, idx) => (
                <div key={idx} style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: 'clamp(32px, 10vw, 96px)',
                      fontWeight: 900,
                      lineHeight: 0.95,
                      letterSpacing: '-0.02em',
                      color: idx === 1 ? heroSlides[activeSlide].accent : 'white',
                      animation: `fadeSlideUp 0.7s ease ${100 + idx * 100}ms both`,
                    }}
                  >
                    {line}
                  </div>
                </div>
              ))}
            </div>

            {/* TAGLINE TEXT */}
            <p
              className="text-sm sm:text-lg max-w-md leading-relaxed mb-4 sm:mb-6"
              style={{
                color: 'rgba(255,255,255,0.6)',
                animation: 'fadeSlideUp 0.7s ease 450ms both',
              }}
            >
              {heroSlides[activeSlide].tagline}
            </p>

            {/* FEATURE PILLS */}
            <div
              className="flex flex-wrap gap-3 mb-8"
              style={{ animation: 'fadeSlideUp 0.7s ease 550ms both' }}
            >
              {[
                { icon: BadgeCheck, label: 'Quality Brands' },
                { icon: Zap, label: 'Fast Delivery' },
                { icon: Headphones, label: 'Expert Support' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: heroSlides[activeSlide].accent }} />
                  {label}
                </div>
              ))}
            </div>

            {/* CTA BUTTONS */}
            <div
              className="flex flex-wrap gap-4"
              style={{ animation: 'fadeSlideUp 0.7s ease 650ms both' }}
            >
              <a
                href="#products"
                className="btn-shimmer inline-flex items-center gap-2 px-8 py-5 rounded-full text-white font-bold text-base leading-none active:scale-95 transition-all"
                style={{
                  background: heroSlides[activeSlide].accent,
                  boxShadow: `0 8px 30px ${heroSlides[activeSlide].accent}66`,
                }}
              >
                Explore Products <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#cta"
                className="inline-flex items-center gap-2 px-8 py-5 rounded-full font-semibold text-base leading-none active:scale-95 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  animation: 'fadeSlideUp 0.7s ease 700ms both',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                }}
              >
                Request Quote
              </a>
            </div>
          </div>
        </div>

        {/* HORIZONTAL PROGRESS DOTS — bottom center */}
        <div
          className="absolute hidden md:flex items-center gap-3 px-4 py-2 rounded-full"
          style={{
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="transition-all duration-300 hover:scale-110"
              style={{
                width: activeSlide === i ? 28 : 10,
                height: 10,
                borderRadius: 99,
                background: activeSlide === i ? '#bb0c15' : 'rgba(255,255,255,0.5)',
                border: activeSlide === i ? '2px solid white' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
                boxShadow: activeSlide === i ? '0 2px 8px rgba(187,12,21,0.5)' : 'none',
              }}
            />
          ))}
        </div>

        {/* PREV/NEXT ARROWS — side positioned */}
        <button
          onClick={() => setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute hidden md:flex w-12 h-12 rounded-full items-center justify-center text-white active:scale-95 transition-all hover:bg-white/30"
          style={{
            left: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            zIndex: 20,
          }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setActiveSlide(prev => (prev + 1) % heroSlides.length)}
          className="absolute hidden md:flex w-12 h-12 rounded-full items-center justify-center text-white active:scale-95 transition-all hover:bg-white/30"
          style={{
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            zIndex: 20,
          }}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* MINI STATS STRIP — bottom center (hidden on mobile) */}
        <div
          className="absolute hidden lg:flex items-center gap-6 px-6 py-3 rounded-full"
          style={{
            bottom: 70,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {[
            { value: '700+', label: 'Products' },
            { value: '300+', label: 'Clients' },
            { value: '20+', label: 'Years' },
          ].map(({ value, label }, i, arr) => (
            <div key={label} className="flex items-center gap-4">
              <div className="text-center">
                <div className="font-bold text-white text-base">{value}</div>
                <div className="text-white/60 text-xs">{label}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.3)' }} />
              )}
            </div>
          ))}
        </div>

        {/* PROGRESS BAR — bottom */}
        <div
          className="absolute left-0 right-0"
          style={{ bottom: 0, height: 3, background: 'rgba(255,255,255,0.1)', zIndex: 20 }}
        >
          <div
            key={activeSlide}
            className="h-full progress-animate"
            style={{
              background: heroSlides[activeSlide].accent,
            }}
          />
        </div>
      </section>

      {/* ════════════════════════════════════════
          DISTRIBUTED BRANDS — Infinite Marquee
      ════════════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ background: 'white' }}>
        {/* Top Gradient Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(90deg, #004D8B 0%, #bb0c15 25%, #f97316 50%, #bb0c15 75%, #004D8B 100%)',
          }}
        />

        {/* Animated glow effect on top line */}
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-60"
          style={{
            background: 'linear-gradient(90deg, transparent, #bb0c15, transparent)',
            animation: 'shimmerSlide 3s ease-in-out infinite',
          }}
        />

        <div className="py-12">
          {/* Section Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(0,69,96,0.08), rgba(187,12,21,0.08))',
                border: '1px solid rgba(0,69,96,0.1)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: '#bb0c15' }}
              />
              <span
                className="text-xs tracking-[0.15em] uppercase font-semibold"
                style={{ color: '#004D8B' }}
              >
                Official Distribution Partners & Supplied Products
              </span>
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: '#004D8B', animationDelay: '0.5s' }}
              />
            </div>
            <h3
              className="text-2xl md:text-3xl font-black"
              style={{ color: '#004D8B', letterSpacing: '-0.02em' }}
            >
              Trusted by <span style={{ color: '#bb0c15' }}>World-Class</span> Brands
            </h3>
          </div>

          {/* Marquee Container */}
          <div className="marquee-wrapper overflow-hidden">
            <div className="marquee-track">
              {/* First set of brands */}
              {[...brands, ...brands].map((brand, i) => (
                <div
                  key={i}
                  className="group flex-shrink-0 mx-4"
                >
                  <div
                    className="relative flex items-center justify-center w-48 h-24 rounded-2xl transition-all duration-500 cursor-pointer overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Hover gradient background */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,69,96,0.03) 0%, rgba(187,12,21,0.03) 100%)',
                      }}
                    />

                    {/* Corner accent on hover */}
                    <div
                      className="absolute top-0 right-0 w-0 h-0 group-hover:w-16 group-hover:h-16 transition-all duration-500"
                      style={{
                        background: 'linear-gradient(135deg, transparent 50%, rgba(187,12,21,0.1) 50%)',
                      }}
                    />

                    {/* Brand content */}
                    <div className="relative z-10 flex items-center justify-center p-4">
                      {brand.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="max-h-12 w-auto object-contain transition-all duration-500 group-hover:scale-110"
                          style={{
                            filter: 'grayscale(20%)',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.filter = 'grayscale(0%) drop-shadow(0 0 8px rgba(187,12,21,0.3))')}
                          onMouseLeave={e => (e.currentTarget.style.filter = 'grayscale(20%)')}
                        />
                      ) : (
                        <span
                          className="font-bold text-lg tracking-wide transition-all duration-500 group-hover:scale-110"
                          style={{ color: '#004D8B' }}
                        >
                          {brand.name}
                        </span>
                      )}
                    </div>

                    {/* Bottom accent line on hover */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-3/4 transition-all duration-500"
                      style={{
                        background: 'linear-gradient(90deg, transparent, #bb0c15, transparent)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="text-center mt-10">
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Premium quality products from <span style={{ color: '#004D8B', fontWeight: 600 }}>trusted manufacturers</span> worldwide
            </p>
          </div>
        </div>

        {/* Bottom Gradient Line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(90deg, #004D8B 0%, #bb0c15 25%, #f97316 50%, #bb0c15 75%, #004D8B 100%)',
          }}
        />

        {/* Animated glow effect on bottom line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
          style={{
            background: 'linear-gradient(90deg, transparent, #f97316, transparent)',
            animation: 'shimmerSlide 3s ease-in-out infinite 1.5s',
          }}
        />
      </div>

      {/* ════════════════════════════════════════
          STATS COUNTER
      ════════════════════════════════════════ */}
      <section
        style={{ background: 'white' }}
        className="py-12 relative"
        aria-labelledby="stats-heading"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, transparent, #bb0c15 30%, #f97316 70%, transparent)',
          }}
        />
        <h2 id="stats-heading" className="sr-only">Company statistics</h2>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { icon: Clock, value: 20, suffix: '+', label: 'Years of Experience' },
              { icon: Package, value: 700, suffix: '+', label: 'Products Available' },
              { icon: Users, value: 300, suffix: '+', label: 'Happy Clients' },
              { icon: Globe, value: 10, suffix: '+', label: 'Countries Served' },
            ].map(({ icon: Icon, value, suffix, label }, i) => (
              <RevealOnScroll key={label} delay={i * 100}>
                <div
                  className="flex flex-col items-center text-center py-10 px-4"
                  style={{
                    borderRight: i < 3 ? '1px solid #e5e7eb' : 'none',
                    borderBottom: i < 2 ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  <Icon className="w-8 h-8 mb-4" style={{ color: '#bb0c15' }} />
                  <div
                    className="font-black leading-none"
                    style={{ fontSize: 'clamp(48px, 5vw, 72px)', color: '#004D8B' }}
                  >
                    <CountUp target={value} suffix={suffix} />
                  </div>
                  <div
                    className="text-sm uppercase tracking-widest mt-2"
                    style={{ color: '#9ca3af' }}
                  >
                    {label}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRODUCT CATEGORIES
      ════════════════════════════════════════ */}
      <section
        id="products"
        style={{ background: '#f8fafc' }}
        className="py-12"
        aria-labelledby="products-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <RevealOnScroll className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold mb-5"
              style={{
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.15)',
                color: '#bb0c15',
              }}
            >
              Motico Solutions Products
            </div>
            <h2
              id="products-heading"
              className="font-black leading-none"
              style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', color: '#004D8B', letterSpacing: '-0.02em' }}
            >
              Built for Every
              <br />
              Industrial Challenge
            </h2>
            <p className="text-gray-500 mt-5 max-w-xl mx-auto leading-relaxed">
              From grinding to cutting, polishing to finishing. We stock the full range
              of industrial abrasives and special tools your operation demands.
            </p>
          </RevealOnScroll>

          {/* Spectacular Product Cards Grid — 3 columns x 4 rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(({ id, title, icon: Icon, color, bg }, i) => (
              <RevealOnScroll key={id} delay={i * 80}>
                <Link href={`/products/${id}`} className="block">
                  <div
                    className={`product-card product-card-${i} group relative h-72 cursor-pointer`}
                    style={{ animationFillMode: 'both' }}
                  >
                  {/* Background Image */}
                  <div
                    className="card-bg"
                    style={{ backgroundImage: `url(${bg})` }}
                  />

                  {/* Glassmorphism Overlay */}
                  <div className="card-glass" />

                  {/* Shimmer Effect */}
                  <div className="card-shimmer" />

                  {/* Floating Particles */}
                  <div className="card-particles">
                    {[...Array(6)].map((_, j) => (
                      <div
                        key={j}
                        className="particle"
                        style={{
                          left: `${15 + j * 15}%`,
                          animationDelay: `${j * 0.5}s`,
                          width: j % 2 === 0 ? '3px' : '5px',
                          height: j % 2 === 0 ? '3px' : '5px',
                          background: j % 2 === 0 ? 'rgba(187, 12, 21, 0.6)' : 'rgba(255, 255, 255, 0.4)',
                        }}
                      />
                    ))}
                  </div>

                  {/* Corner Accent */}
                  <div className="corner-accent" />

                  {/* Card Content */}
                  <div className="card-content relative z-10 h-full flex flex-col justify-between p-6">
                    {/* Top Section */}
                    <div>
                      {/* Icon Container */}
                      <div
                        className="card-icon w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          background: 'linear-gradient(135deg, rgba(187,12,21,0.95), rgba(220,38,38,0.85))',
                          boxShadow: '0 8px 32px rgba(187,12,21,0.4)',
                        }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Title */}
                      <h3
                        className="card-title font-extrabold text-xl text-white leading-tight mb-2"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)' }}
                      >
                        {title}
                      </h3>

                      {/* Category Badge */}
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(8px)',
                          color: 'rgba(255,255,255,0.8)',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: '#bb0c15' }}
                        />
                        Industrial Grade
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                      >
                        Explore Products
                      </span>
                      <div
                        className="card-arrow w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Ring */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700"
                    style={{
                      boxShadow: `inset 0 0 80px ${color}30, 0 0 40px ${color}20`,
                    }}
                  />
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>

          {/* Browse All Products CTA */}
          <RevealOnScroll delay={600}>
            <div className="flex justify-center mt-14">
              <a
                href="#"
                className="btn-shimmer group inline-flex items-center gap-3 px-10 py-5 rounded-full text-white font-bold text-lg active:scale-95 transition-all"
                style={{
                  background: '#bb0c15',
                  boxShadow: '0 12px 40px rgba(220,38,38,0.35)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 16px 50px rgba(220,38,38,0.5)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(220,38,38,0.35)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                View All 700+ Products
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ════════════════════════════════════════
          WHY MOTICO
      ════════════════════════════════════════ */}
      <section
        id="about"
        style={{ background: 'white' }}
        className="py-12"
        aria-labelledby="why-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT — with image and text */}
            <div className="lg:self-start">
              {/* Image above text */}
              <RevealOnScroll>
                <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[4/3]">
                  <Image
                    src="/slide-1-grinding.png"
                    alt="Industrial Excellence"
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,77,139,0.3) 0%, transparent 50%)',
                    }}
                  />
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={100}>
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold mb-6"
                  style={{
                    background: 'rgba(220,38,38,0.08)',
                    border: '1px solid rgba(220,38,38,0.15)',
                    color: '#bb0c15',
                  }}
                >
                  Why Motico
                </div>
              </RevealOnScroll>
              <RevealOnScroll delay={150}>
                <h2
                  id="why-heading"
                  className="font-black leading-none mb-6"
                  style={{ fontSize: 'clamp(36px, 3.5vw, 48px)', color: '#004D8B', letterSpacing: '-0.02em' }}
                >
                  Your Trusted Partner in Industrial Excellence
                </h2>
              </RevealOnScroll>
              <RevealOnScroll delay={200}>
                <p className="text-gray-500 leading-relaxed max-w-sm mb-8">
                  Since 2004, Motico Solutions has been the go-to distributor for industrial
                  businesses across MENA, combining premium brands with expert technical
                  support and reliable logistics.
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={300}>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 font-semibold text-sm transition-all hover:gap-3"
                  style={{ color: '#bb0c15' }}
                >
                  Learn More About Us <ArrowRight className="w-4 h-4" />
                </a>
              </RevealOnScroll>
            </div>

            {/* RIGHT — feature cards */}
            <div className="flex flex-col gap-5">
              {features.map((feature, i) => {
                const Icon = feature.icon
                const isEven = i % 2 === 0
                return (
                  <RevealOnScroll key={feature.title} delay={i * 60}>
                    <div
                      ref={el => { featureRefs.current[i] = el }}
                      className="group rounded-2xl p-7 transition-all duration-300 cursor-default relative overflow-hidden"
                      style={{
                        background: 'white',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)'
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#f1f5f9'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div className="flex gap-5 items-start">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isEven
                              ? '#bb0c15'
                              : '#004D8B',
                          }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2" style={{ color: '#004D8B' }}>
                            {feature.title}
                          </h3>
                          <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                            {feature.desc}
                          </p>
                        </div>
                        <div
                          className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-8px] group-hover:translate-x-0 flex-shrink-0"
                        >
                          <ArrowRight className="w-5 h-5" style={{ color: '#bb0c15' }} />
                        </div>
                      </div>
                    </div>
                  </RevealOnScroll>
                )
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA SECTION
      ════════════════════════════════════════ */}
      <section
        id="cta"
        className="relative py-16 overflow-hidden hero-grain"
        style={{ background: '#004D8B' }}
        aria-labelledby="cta-heading"
      >
        {/* Rings */}
        <div
          className="spin-ring absolute rounded-full pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            width: 384,
            height: 384,
            marginTop: -192,
            marginLeft: -192,
            border: '2px solid rgba(220,38,38,0.2)',
            boxShadow: '0 0 80px rgba(220,38,38,0.12)',
          }}
        />
        <div
          className="spin-ring-slow absolute rounded-full pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            width: 600,
            height: 600,
            marginTop: -300,
            marginLeft: -300,
            border: '1px solid rgba(220,38,38,0.08)',
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
              style={{
                background: 'rgba(187,12,21,0.2)',
                border: '1px solid rgba(187,12,21,0.3)',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              Get Started Today
            </div>
            <h2
              id="cta-heading"
              className="font-black mb-5"
              style={{
                fontSize: 'clamp(44px, 6vw, 72px)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              <span className="text-white">Ready to Transform</span>
              <br />
              <span style={{ color: '#bb0c15' }}>Your Operations?</span>
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={100}>
            <p className="text-lg mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Join 300+ businesses across Lebanon and the Middle East who trust Motico Solutions
              for their industrial abrasive and tooling needs.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <button
                onClick={() => setQuoteFormOpen(true)}
                className="btn-shimmer inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full text-white font-bold text-lg active:scale-95 transition-all cursor-pointer"
                style={{
                  background: '#bb0c15',
                  boxShadow: '0 0 60px rgba(220,38,38,0.5)',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.boxShadow = '0 0 80px rgba(220,38,38,0.7)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.boxShadow = '0 0 60px rgba(220,38,38,0.5)')
                }
              >
                Request Quote <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="tel:+9613741565"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full font-semibold text-lg active:scale-95 transition-all"
                style={{
                  background: 'white',
                  color: '#004D8B',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f1f5f9'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'white'
                }}
              >
                Contact Sales
              </a>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={400}>
            <div className="flex flex-wrap gap-6 justify-center">
              {['Free Consultation', 'Competitive Pricing', '24h Response'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CircleCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item}</span>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          {/* Testimonials — Moving Cards */}
          <RevealOnScroll delay={500}>
            <div className="mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-center mb-10">
                <span
                  className="text-sm font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  What Our Clients Say
                </span>
              </div>

              {/* Marquee Container */}
              <div className="relative overflow-hidden">
                {/* Fade edges */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to right, #004D8B, transparent)' }}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to left, #004D8B, transparent)' }}
                />

                {/* Moving cards track */}
                <div
                  className="flex gap-6 testimonial-marquee"
                  style={{
                    width: 'fit-content',
                    animation: 'testimonialScroll 40s linear infinite',
                  }}
                >
                  {/* Duplicate testimonials for seamless loop */}
                  {[...testimonials, ...testimonials].map((t, i) => (
                    <div
                      key={`${t.name}-${i}`}
                      className="rounded-2xl p-6 relative flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]"
                      style={{
                        width: 340,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <Quote
                        className="absolute top-4 right-4 w-8 h-8"
                        style={{ color: 'rgba(187,12,21,0.3)' }}
                      />
                      <div className="flex gap-1 mb-4">
                        {[...Array(t.rating)].map((_, j) => (
                          <Star
                            key={j}
                            className="w-4 h-4"
                            style={{ color: '#f59e0b', fill: '#f59e0b' }}
                          />
                        ))}
                      </div>
                      <p
                        className="text-sm leading-relaxed mb-6 text-left"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        &quot;{t.quote}&quot;
                      </p>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                          style={{ background: i % 2 === 0 ? '#bb0c15' : '#004D8B' }}
                        >
                          {t.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white">{t.name}</div>
                          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {t.role}, {t.company}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ════════════════════════════════════════
          KNOWLEDGE BASE / BLOG SECTION
      ════════════════════════════════════════ */}
      <section
        id="resources"
        className="py-20"
        style={{ background: '#f8fafc' }}
        aria-labelledby="resources-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold mb-4"
                style={{
                  background: 'rgba(0,77,139,0.08)',
                  border: '1px solid rgba(0,77,139,0.15)',
                  color: '#004D8B',
                }}
              >
                Knowledge Base
              </div>
              <h2
                id="resources-heading"
                className="font-black mb-4"
                style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  color: '#0a1628',
                  letterSpacing: '-0.02em',
                }}
              >
                Expert Insights & Guides
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Learn from our 20+ years of industry experience. Tips, guides, and technical resources to help you choose the right abrasives.
              </p>
            </div>
          </RevealOnScroll>

          {/* Blog Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'How to Choose the Right Grinding Wheel',
                excerpt: 'A comprehensive guide to selecting grinding wheels based on material, application, and finish requirements.',
                category: 'Guides',
                readTime: '5 min read',
                image: '/slide-1-grinding.png',
              },
              {
                title: 'Ceramic vs Zirconia Abrasives Explained',
                excerpt: 'Understanding the differences between ceramic and zirconia abrasives and when to use each type.',
                category: 'Technical',
                readTime: '7 min read',
                image: '/slide-5-abrasiv.png',
              },
              {
                title: 'Extending Belt Life: Pro Tips',
                excerpt: 'Industry secrets to maximize the lifespan of your abrasive belts and reduce operational costs.',
                category: 'Tips',
                readTime: '4 min read',
                image: '/slide-2-belt.png',
              },
            ].map((article, i) => (
              <RevealOnScroll key={article.title} delay={i * 100}>
                <article
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{ border: '1px solid rgba(0,0,0,0.05)' }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: i === 0 ? '#bb0c15' : i === 1 ? '#004D8B' : '#059669',
                        color: 'white',
                      }}
                    >
                      {article.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#004D8B] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{article.readTime}</span>
                      <span
                        className="text-sm font-semibold flex items-center gap-1 transition-colors group-hover:text-[#bb0c15]"
                        style={{ color: '#004D8B' }}
                      >
                        Read More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>

          {/* View All CTA */}
          <RevealOnScroll delay={400}>
            <div className="flex justify-center mt-12">
              <button
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95"
                style={{
                  background: '#004D8B',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(0,77,139,0.3)',
                }}
              >
                Browse All Articles <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer style={{ background: '#080e1a' }} aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">Footer</h2>

        {/* Top gradient border */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

        {/* Newsletter bar */}
        <div
          className="py-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Stay in the loop — get product news &amp; exclusive offers
                </p>
              </div>
              <div className="flex items-center gap-3 w-full max-w-md">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(220,38,38,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <button
                  className="btn-shimmer px-5 py-3 rounded-xl text-white text-sm font-semibold active:scale-95 transition-transform flex-shrink-0"
                  style={{ background: '#bb0c15' }}
                >
                  Subscribe →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

            {/* Col 1 — Brand */}
            <div className="col-span-2 md:col-span-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-moticosolutions-white.png"
                alt="Motico Solutions"
                className="h-8 w-auto object-contain mb-4"
              />
              <p className="text-xs leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Premium industrial abrasives &amp; tools distributor. Serving MENA since 2004.
              </p>
              <div className="flex flex-col gap-3 mb-6">
                <a
                  href="tel:+9613741565"
                  className="flex items-center gap-2.5 text-xs transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bb0c15' }} />
                  +961 3 741 565
                </a>
                <a
                  href="tel:+9611558174"
                  className="flex items-center gap-2.5 text-xs transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bb0c15' }} />
                  +961 1 558 174
                </a>
                <a
                  href="mailto:info@moticosolutions.com"
                  className="flex items-center gap-2.5 text-xs transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bb0c15' }} />
                  info@moticosolutions.com
                </a>
                <div className="flex items-center gap-2.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bb0c15' }} />
                  Beirut, Lebanon
                </div>
              </div>
              {/* Social icons */}
              <div className="flex gap-2">
                {[
                  { Icon: Facebook, label: 'Facebook' },
                  { Icon: Instagram, label: 'Instagram' },
                  { Icon: Linkedin, label: 'LinkedIn' },
                  { Icon: Youtube, label: 'YouTube' },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#bb0c15')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </a>
                ))}
              </div>
            </div>

            {/* Cols 2-5 */}
            {[
              {
                heading: 'Products',
                links: ['Grinding Wheels', 'Abrasive Belts', 'Cutting Discs', 'Flap Discs', 'Power Tools', 'Specialty Items'],
              },
              {
                heading: 'Company',
                links: ['About Us', 'Our History', 'Careers', 'Press', 'Partners'],
              },
              {
                heading: 'Support',
                links: ['FAQ', 'Shipping Policy', 'Returns', 'Technical Support', 'Track Order'],
              },
              {
                heading: 'Connect',
                links: ['Contact Us', 'Get a Quote', 'Distributor Portal', 'Newsletter'],
              },
            ].map(col => (
              <div key={col.heading}>
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-5 pl-3"
                  style={{
                    color: 'white',
                    borderLeft: '2px solid #bb0c15',
                  }}
                >
                  {col.heading}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm transition-colors"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="py-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                © 2026 Motico Solutions. All rights reserved.
              </span>
              <span className="hidden sm:inline text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Developed by{' '}
                <a
                  href="https://dbfnexus.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#bb0c15')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >
                  DBF Nexus
                </a>
              </span>
            </div>
            <div className="flex items-center gap-4">
              {['Privacy Policy', 'Terms', 'Cookies'].map((item, i) => (
                <a
                  key={item}
                  href="#"
                  className="text-xs transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  {item}
                </a>
              ))}
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs transition-colors active:scale-95"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════
          WHATSAPP FLOATING BUTTON
      ════════════════════════════════════════ */}
      <a
        href="https://wa.me/9613741565?text=Hello%20Motico%20Solutions!%20I%27m%20interested%20in%20your%20industrial%20products."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn fixed z-50 flex items-center gap-3 group bottom-[140px] md:bottom-[100px] right-4 md:right-6"
        aria-label="Chat on WhatsApp"
      >
        {/* Tooltip */}
        <div
          className="hidden md:flex items-center px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
          style={{
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            color: '#004D8B',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Chat with us!
        </div>

        {/* WhatsApp Button */}
        <div
          className="relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 group-hover:scale-110"
          style={{
            background: '#25D366',
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
          }}
        >
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: '#25D366',
              opacity: 0.3,
              animationDuration: '2s',
            }}
          />

          {/* WhatsApp Icon */}
          <svg
            className="w-7 h-7 text-white relative z-10"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
      </a>

      {/* ════════════════════════════════════════
          STICKY MOBILE CTA BAR
      ════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden"
        style={{
          background: 'rgba(10, 22, 40, 0.98)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Call Button */}
          <a
            href="tel:+9613741565"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
            }}
          >
            <Phone className="w-4 h-4" />
            Call Now
          </a>

          {/* Get Quote Button */}
          <button
            onClick={() => setQuoteFormOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
            style={{
              background: '#bb0c15',
              boxShadow: '0 4px 15px rgba(187,12,21,0.4)',
            }}
          >
            <ArrowRight className="w-4 h-4" />
            Get Quote
          </button>
        </div>
      </div>

      {/* Quote Form Modal */}
      <QuoteForm isOpen={quoteFormOpen} onClose={() => setQuoteFormOpen(false)} />

    </div>
  )
}
