'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BadgeCheck, Zap, Headphones, Package, Users, Globe,
  Clock, Truck, ShieldCheck, Phone, Mail, MapPin,
  Menu, X, ChevronRight, ArrowRight, CircleCheck,
  Facebook, Instagram, Linkedin, Youtube,
  Star, Layers, Scissors, Wrench, Disc, Settings,
  Smartphone,
} from 'lucide-react'
import CountUp from '@/components/ui/CountUp'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

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
  {
    id: 'grinding',
    title: 'Grinding Wheels',
    count: '350+',
    desc: 'Precision grinding solutions for metal, stone, and composite materials.',
    icon: Disc,
    color: '#bb0c15',
    wide: true,
  },
  {
    id: 'abrasive-belts',
    title: 'Abrasive Belts',
    count: '280+',
    desc: 'High-performance belts for surface finishing and stock removal.',
    icon: Layers,
    color: '#f97316',
    wide: false,
    tall: true,
  },
  {
    id: 'cutting-discs',
    title: 'Cutting Discs',
    count: '190+',
    desc: 'Ultra-thin cutting discs for steel, stainless, and non-ferrous metals.',
    icon: Scissors,
    color: '#004560',
    wide: false,
  },
  {
    id: 'power-tools',
    title: 'Power Tools',
    count: '120+',
    desc: 'Professional-grade angle grinders, sanders, and drilling equipment.',
    icon: Wrench,
    color: '#bb0c15',
    wide: false,
  },
  {
    id: 'flap-discs',
    title: 'Flap Discs',
    count: '160+',
    desc: 'Versatile flap discs for grinding and finishing in one operation.',
    icon: Settings,
    color: '#f97316',
    wide: false,
  },
  {
    id: 'specialty',
    title: 'Specialty Abrasives',
    count: '220+',
    desc: 'Custom and specialty abrasive solutions for unique industrial needs.',
    icon: Star,
    color: '#004560',
    wide: false,
  },
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
  { name: 'Hermes', logo: '/logo-hermes.svg' },
  { name: 'Eisenblätter', logo: null },
  { name: 'Hoffmann', logo: '/logo-hoffmann.png' },
  { name: 'Osborn', logo: '/logo-osborn.svg' },
  { name: 'ZAT (OEM)', logo: null },
  { name: 'Sandwox', logo: '/logo-sandwox.png' },
  { name: 'DCA', logo: '/logo-dca.png' },
]

/* ─── Carousel Slides ───────────────────────────────────── */
const carouselSlides = [
  {
    image: '/slide-1-grinding.png',
    category: 'Grinding Solutions',
    desc: 'Precision grinding wheels & cutting discs for every surface',
    tag: 'Best Seller',
    tagColor: '#bb0c15',
  },
  {
    image: '/slide-2-belt.png',
    category: 'Abrasive Belts',
    desc: 'High-performance sanding belts in all grits & sizes',
    tag: 'New Arrivals',
    tagColor: '#f97316',
  },
  {
    image: '/slide-3-disc.png',
    category: 'Power Tools & Machines',
    desc: 'Professional belt sanders, disc grinders & more',
    tag: 'ZAT Brand',
    tagColor: '#004560',
  },
  {
    image: '/slide-4-brush.png',
    category: 'Wire Brushes',
    desc: 'Surface preparation & finishing tools for all metals',
    tag: 'Industrial Grade',
    tagColor: '#059669',
  },
  {
    image: '/slide-5-abrasiv.png',
    category: 'Specialty Abrasives',
    desc: 'Custom ceramic & zirconia solutions for demanding jobs',
    tag: 'MENA Stocked',
    tagColor: '#7c3aed',
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
  const heroRef = useRef<HTMLDivElement>(null)
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => { setMounted(true) }, [])

  /* Auto-advance carousel */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % carouselSlides.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

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
    { label: 'Products', href: '#products' },
    { label: 'Abrasive Belts', href: '#abrasive-belts' },
    { label: 'About Us', href: '#about' },
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
        <div style={{ background: '#004560' }} className="py-2">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="flex-shrink-0">
              <div className="flex items-baseline gap-0.5">
                <span
                  className="text-2xl font-black"
                  style={{ color: '#004560', letterSpacing: '-0.03em' }}
                >
                  Motico
                </span>
                <span
                  className="text-2xl font-black"
                  style={{ color: '#bb0c15', letterSpacing: '-0.03em' }}
                >
                  Solutions
                </span>
              </div>
              <div
                className="text-[9px] tracking-[0.15em] uppercase mt-0.5"
                style={{ color: '#9ca3af' }}
              >
                Est. 2004 · Beirut, Lebanon
              </div>
            </a>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="nav-link text-sm font-medium pb-0.5"
                  style={{ color: '#4b5563' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#004560')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* App icons - Coming Soon */}
              <div className="flex items-center gap-1.5 mr-2">
                <div
                  className="group relative flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all"
                  style={{ background: 'rgba(0,69,96,0.08)' }}
                  title="iOS App Coming Soon"
                >
                  <svg className="w-4 h-4" style={{ color: '#004560' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Coming Soon" />
                </div>
                <div
                  className="group relative flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all"
                  style={{ background: 'rgba(0,69,96,0.08)' }}
                  title="Android App Coming Soon"
                >
                  <svg className="w-4 h-4" style={{ color: '#004560' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Coming Soon" />
                </div>
              </div>
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
                  background: 'linear-gradient(135deg, #bb0c15, #f97316)',
                  boxShadow: '0 4px 14px rgba(220,38,38,0.3)',
                }}
              >
                Get Quote
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: '#004560' }}
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
                    color: '#004560',
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
                style={{ color: '#004560', borderColor: '#f1f5f9', animation: `lineReveal 0.4s cubic-bezier(0.16,1,0.3,1) ${4 * 60}ms both` }}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </a>
              <a
                href="#cta"
                onClick={() => setMenuOpen(false)}
                className="mt-4 text-center font-bold text-white py-4 rounded-xl active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #bb0c15, #f97316)' }}
              >
                Get Quote →
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: '#f8fafc',
          paddingTop: '104px',
        }}
        aria-labelledby="hero-heading"
      >
        {/* Dot grid bg */}
        <div
          className="dot-grid absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        />
        {/* Soft orbs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-10%',
            right: '-5%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220,38,38,0.10) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-10%',
            left: '-5%',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(10,22,40,0.08) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
        {/* Curved morphing decorative lines */}
        <svg
          className="absolute hidden lg:block pointer-events-none"
          style={{
            top: '10%',
            right: '5%',
            width: '55%',
            height: '80%',
            zIndex: 1,
          }}
          viewBox="0 0 600 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Red curve - outer */}
          <path
            d="M50 50 Q 150 0, 200 80 T 350 120 Q 500 150, 550 300 T 500 450 Q 400 500, 300 480"
            stroke="#bb0c15"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
            className="morph-line"
          />
          {/* Blue/Navy curve - inner */}
          <path
            d="M80 80 Q 180 30, 230 110 T 380 150 Q 530 180, 520 330 T 470 420 Q 370 470, 270 450"
            stroke="#1e3a5f"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
            className="morph-line-delayed"
          />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT COLUMN */}
            <div className="flex flex-col justify-center gap-6" style={{ minHeight: 620 }}>
              {/* H1 */}
              <h1
                id="hero-heading"
                style={{
                  fontSize: 'clamp(48px, 6vw, 86px)',
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: '-0.03em',
                }}
              >
                <div className="clip-reveal-parent">
                  <div
                    className="line-reveal"
                    style={{ color: '#004560', animationDelay: '0.2s' }}
                  >
                    Industr<span style={{ color: '#bb0c15' }}>i</span>al
                  </div>
                </div>
                <div className="clip-reveal-parent">
                  <div
                    className="line-reveal gradient-text"
                    style={{ animationDelay: '0.4s' }}
                  >
                    Excellence
                  </div>
                </div>
                <div className="clip-reveal-parent">
                  <div
                    className="line-reveal"
                    style={{ color: '#004560', animationDelay: '0.6s' }}
                  >
                    Del<span style={{ color: '#bb0c15' }}>i</span>vered
                  </div>
                </div>
              </h1>

              {/* Subheadline */}
              <p
                className="text-lg max-w-md leading-relaxed"
                style={{
                  color: '#6b7280',
                  animation: 'lineReveal 0.6s cubic-bezier(0.16,1,0.3,1) 0.8s both',
                }}
              >
                Premium abrasive belts, grinding tools, industrial machines and finishing equipment.
                Market leaders in Lebanon and across the Middle East and West Africa since 2004.
              </p>

              {/* CTA buttons */}
              <div
                className="flex flex-wrap gap-4"
                style={{ animation: 'lineReveal 0.6s cubic-bezier(0.16,1,0.3,1) 1.1s both' }}
              >
                <a
                  href="#products"
                  className="btn-shimmer inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base active:scale-95 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #bb0c15, #f97316)',
                    boxShadow: '0 8px 30px rgba(220,38,38,0.3)',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.boxShadow = '0 12px 40px rgba(220,38,38,0.45)')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.boxShadow = '0 8px 30px rgba(220,38,38,0.3)')
                  }
                >
                  Explore Products <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#cta"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base border-2 active:scale-95 transition-all"
                  style={{ borderColor: '#d1d5db', color: '#374151' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#bb0c15'
                    e.currentTarget.style.color = '#bb0c15'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.color = '#374151'
                  }}
                >
                  Request Quote
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN — Product Image Carousel */}
            <div className="relative hidden lg:flex flex-col items-center gap-5">

              {/* Carousel container */}
              <div
                className="relative w-full overflow-hidden"
                style={{
                  borderRadius: 32,
                  height: 620,
                  boxShadow: '0 32px 64px rgba(10,22,40,0.18), 0 0 0 1px rgba(10,22,40,0.06)',
                  background: '#004560',
                }}
              >
                {carouselSlides.map((slide, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute', inset: 0,
                      opacity: i === activeSlide ? 1 : 0,
                      transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1)',
                      pointerEvents: i === activeSlide ? 'auto' : 'none',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.image}
                      alt={slide.category}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transform: i === activeSlide ? 'scale(1.03)' : 'scale(1)',
                        transition: 'transform 4s ease',
                      }}
                    />
                    {/* Dark gradient overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(10,22,40,0.85) 0%, rgba(10,22,40,0.25) 50%, rgba(10,22,40,0.05) 100%)',
                    }} />
                    {/* Slide counter top-left */}
                    <div style={{
                      position: 'absolute', top: 20, left: 20,
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(8px)',
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: 11, fontWeight: 600,
                      padding: '5px 12px', borderRadius: 99,
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}>
                      {String(i + 1).padStart(2,'0')} / {String(carouselSlides.length).padStart(2,'0')}
                    </div>
                    {/* Tag pill top-right */}
                    <div style={{
                      position: 'absolute', top: 20, right: 20,
                      background: slide.tagColor, color: 'white',
                      fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '5px 12px', borderRadius: 99,
                    }}>
                      {slide.tag}
                    </div>
                    {/* Bottom content */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px' }}>
                      <div style={{
                        fontSize: 22, fontWeight: 800, color: 'white',
                        letterSpacing: '-0.02em', marginBottom: 6,
                      }}>
                        {slide.category}
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                        {slide.desc}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Progress bar at bottom of card */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 3, background: 'rgba(255,255,255,0.1)', zIndex: 10,
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #bb0c15, #f97316)',
                    width: `${((activeSlide + 1) / carouselSlides.length) * 100}%`,
                    transition: 'width 3.5s linear',
                    borderRadius: '0 2px 2px 0',
                  }} />
                </div>
              </div>

              {/* Dot indicators */}
              <div className="flex items-center gap-3">
                {carouselSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    style={{
                      width: i === activeSlide ? 28 : 8,
                      height: 8, borderRadius: 99,
                      background: i === activeSlide
                        ? 'linear-gradient(90deg, #bb0c15, #f97316)'
                        : '#d1d5db',
                      border: 'none', cursor: 'pointer',
                      transition: 'all 0.4s ease', padding: 0,
                    }}
                  />
                ))}
              </div>

              {/* Mini stats strip */}
              <div className="w-full grid grid-cols-3 gap-3">
                {[
                  { value: '700+', label: 'Products', icon: Package },
                  { value: '300+', label: 'Clients',  icon: Users   },
                  { value: '20+',  label: 'Years',    icon: Clock   },
                ].map(({ value, label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center py-3 rounded-2xl"
                    style={{
                      background: 'white',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <Icon className="w-4 h-4 mb-1" style={{ color: '#bb0c15' }} />
                    <div className="font-black text-base" style={{ color: '#004560' }}>{value}</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-16">
            <div className="relative flex flex-col items-center" style={{ height: 56 }}>
              <div
                className="w-px"
                style={{ height: 56, background: 'rgba(10,22,40,0.15)' }}
              />
              <div
                className="scroll-dot absolute top-0 w-1.5 h-1.5 rounded-full"
                style={{ background: '#bb0c15' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          DISTRIBUTED BRANDS
      ════════════════════════════════════════ */}
      <div
        style={{
          background: 'linear-gradient(135deg, #004560 0%, #002d3d 100%)',
          borderTop: '3px solid #bb0c15',
        }}
        className="py-12"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            className="text-center text-xs tracking-[0.2em] uppercase mb-8 font-semibold"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Distributed Brands
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {brands.map((brand, i) => (
              <div
                key={i}
                className="group flex items-center justify-center px-6 py-4 rounded-2xl transition-all duration-300 cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  minWidth: 140,
                  minHeight: 70,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {brand.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-10 md:max-h-12 w-auto object-contain"
                    style={{ filter: 'grayscale(0%)' }}
                  />
                ) : (
                  <span
                    className="font-bold tracking-wide text-sm md:text-base"
                    style={{ color: '#004560' }}
                  >
                    {brand.name}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Premium quality products from trusted manufacturers
            </span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          STATS COUNTER
      ════════════════════════════════════════ */}
      <section
        style={{ background: 'white' }}
        className="py-20 relative"
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
                    style={{ fontSize: 'clamp(48px, 5vw, 72px)', color: '#004560' }}
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
        className="py-24"
        aria-labelledby="products-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <RevealOnScroll className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold mb-5"
              style={{
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.15)',
                color: '#bb0c15',
              }}
            >
              Product Catalog
            </div>
            <h2
              id="products-heading"
              className="font-black leading-none"
              style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', color: '#004560', letterSpacing: '-0.02em' }}
            >
              Built for Every
              <br />
              Industrial <span className="gradient-text">Challenge</span>
            </h2>
            <p className="text-gray-500 mt-5 max-w-xl mx-auto leading-relaxed">
              From grinding to finishing, cutting to drilling — we stock the full range
              of industrial abrasives and tools your operation demands.
            </p>
          </RevealOnScroll>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Full width dark card — Grinding Wheels */}
            <RevealOnScroll delay={0} className="md:col-span-3">
              <div
                className="group relative rounded-3xl p-8 overflow-hidden h-64 flex flex-col justify-between cursor-pointer"
                style={{ background: '#004560' }}
              >
                {/* Background image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/slide-1-grinding.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                />
                {/* Dark overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(10,22,40,0.6) 100%)',
                  }}
                />
                {/* Decorative circle bg */}
                <div
                  className="absolute right-[-60px] top-[-60px] pointer-events-none"
                  style={{
                    width: 280,
                    height: 280,
                    border: '50px solid rgba(220,38,38,0.08)',
                    borderRadius: '50%',
                    transition: 'all 0.5s ease',
                  }}
                />
                <div
                  className="absolute right-[-20px] top-[-20px] pointer-events-none"
                  style={{
                    width: 160,
                    height: 160,
                    border: '2px solid rgba(220,38,38,0.15)',
                    borderRadius: '50%',
                  }}
                />
                <div className="relative z-10">
                  <div
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-4"
                    style={{
                      background: 'rgba(220,38,38,0.2)',
                      color: '#fff',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Disc className="w-3 h-3" /> 350+ Products
                  </div>
                  <h3
                    className="font-bold text-white leading-tight"
                    style={{ fontSize: 32 }}
                  >
                    Grinding Wheels
                  </h3>
                  <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Precision solutions for metal, stone &amp; composite materials.
                  </p>
                </div>
                <div className="relative z-10">
                  <button
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white rounded-xl px-5 py-2.5 active:scale-95 transition-all"
                    style={{ background: 'rgba(220,38,38,0.9)', backdropFilter: 'blur(8px)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#bb0c15')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.9)')}
                  >
                    Browse All <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                  style={{ boxShadow: 'inset 0 0 60px rgba(220,38,38,0.2)' }}
                />
              </div>
            </RevealOnScroll>

            {/* Abrasive Belts — now in row below Grinding Wheels */}
            <RevealOnScroll delay={80} id="abrasive-belts">
              <div
                className="group rounded-3xl p-6 h-full flex flex-col cursor-pointer transition-all duration-300"
                style={{ background: 'white', border: '1px solid #f1f5f9' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)'
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#f1f5f9'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(249,115,22,0.1)' }}
                >
                  <Layers className="w-7 h-7" style={{ color: '#f97316' }} />
                </div>
                <div
                  className="inline-flex self-start items-center px-2.5 py-1 rounded-full text-xs font-medium mb-3"
                  style={{ background: '#f9fafb', color: '#6b7280' }}
                >
                  280+ Products
                </div>
                <h3 className="font-bold text-xl mb-2" style={{ color: '#004560' }}>
                  Abrasive Belts
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: '#6b7280' }}>
                  High-performance belts for surface finishing and stock removal.
                  Available in all grits, widths, and lengths for every machine type.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm font-semibold mt-4 transition-all group-hover:gap-2"
                  style={{ color: '#bb0c15' }}
                >
                  Browse <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </RevealOnScroll>

            {/* Remaining category cards */}
            {categories.slice(2, 5).map(({ id, title, count, desc, icon: Icon, color }, i) => (
              <RevealOnScroll key={id} delay={(i + 2) * 80}>
                <div
                  className="group rounded-3xl p-6 cursor-pointer transition-all duration-300"
                  style={{ background: 'white', border: '1px solid #f1f5f9' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)'
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#f1f5f9'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${color}18` }}
                  >
                    <Icon className="w-7 h-7" style={{ color }} />
                  </div>
                  <div
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-2"
                    style={{ background: '#f9fafb', color: '#6b7280' }}
                  >
                    {count} Products
                  </div>
                  <h3 className="font-bold text-lg mb-1.5" style={{ color: '#004560' }}>
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                    {desc}
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-sm font-semibold mt-4 transition-all group-hover:gap-2"
                    style={{ color: '#bb0c15' }}
                  >
                    Browse <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          WHY MOTICO
      ════════════════════════════════════════ */}
      <section
        id="about"
        style={{ background: 'white' }}
        className="py-24 lg:py-32"
        aria-labelledby="why-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* LEFT sticky */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <RevealOnScroll>
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
              <RevealOnScroll delay={100}>
                <h2
                  id="why-heading"
                  className="font-black leading-none mb-6"
                  style={{ fontSize: 'clamp(40px, 4vw, 56px)', color: '#004560', letterSpacing: '-0.02em' }}
                >
                  Your Trusted
                  <br />
                  Partner in
                  <br />
                  Industrial
                  <br />
                  <span className="gradient-text">Excellence</span>
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
                              ? 'linear-gradient(135deg, #bb0c15, #f97316)'
                              : '#004560',
                          }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2" style={{ color: '#004560' }}>
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
        className="relative py-32 overflow-hidden hero-grain"
        style={{ background: '#004560' }}
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
              className="btn-shimmer inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold mb-8"
              style={{ background: 'linear-gradient(135deg, #bb0c15, #f97316)' }}
            >
              Get Started Today
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={100}>
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
              <span className="gradient-text">Your Operations?</span>
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={200}>
            <p className="text-lg mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Join 300+ businesses across Lebanon and the Middle East who trust Motico Solutions
              for their industrial abrasive and tooling needs.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <a
                href="mailto:info@moticosolutions.com"
                className="btn-shimmer inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full text-white font-bold text-lg active:scale-95 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #bb0c15, #f97316)',
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
              </a>
              <a
                href="tel:+9613741565"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full font-semibold text-lg text-white border-2 active:scale-95 transition-all hover:bg-white/10"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
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

          {/* Mobile App Coming Soon */}
          <RevealOnScroll delay={500}>
            <div className="mt-14 pt-10" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Smartphone className="w-5 h-5" style={{ color: '#bb0c15' }} />
                <span className="text-sm font-semibold text-white">Mobile App</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: 'rgba(220,38,38,0.2)', color: '#bb0c15' }}
                >
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-center mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Order abrasives on the go. Browse products, track orders, and get instant quotes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {/* App Store Button */}
                <div
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-xl cursor-not-allowed opacity-60"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Download on the</div>
                    <div className="text-sm font-semibold text-white -mt-0.5">App Store</div>
                  </div>
                </div>
                {/* Google Play Button */}
                <div
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-xl cursor-not-allowed opacity-60"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Get it on</div>
                    <div className="text-sm font-semibold text-white -mt-0.5">Google Play</div>
                  </div>
                </div>
              </div>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Stay in the loop — get product news &amp; exclusive offers.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 sm:w-72 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
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
                style={{ background: 'linear-gradient(135deg, #bb0c15, #f97316)' }}
              >
                Subscribe →
              </button>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

            {/* Col 1 — Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-baseline gap-0.5 mb-2">
                <span className="text-xl font-black text-white">Motico</span>
                <span className="text-xl font-black" style={{ color: '#bb0c15' }}>Solutions</span>
              </div>
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
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              © 2026 Motico Solutions. All rights reserved.
            </span>
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

    </div>
  )
}
