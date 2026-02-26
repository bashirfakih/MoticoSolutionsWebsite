'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, Phone, MessageCircle, Mail, MapPin,
  Target, Shield, Users, Award, Sparkles, Factory,
  Calendar, TrendingUp, Wrench, CheckCircle, Smartphone,
  Menu, X, ChevronDown, Layers, Settings, Package, Disc, Scissors, Star,
  Facebook, Instagram, Linkedin, Youtube, Globe,
} from 'lucide-react'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

/* ─── Hooks ─────────────────────────────────────────────── */
function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])
  return scrolled
}

/* ─── Product Categories Data ───────────────────────────── */
const categories = [
  { id: 'abrasive-belts', title: 'Abrasive Belts', icon: Layers, color: '#bb0c15' },
  { id: 'air-power-tools', title: 'Air & Power Tools', icon: Wrench, color: '#004D8B' },
  { id: 'belt-disc-sanders', title: 'Belt & Disc Sanders', icon: Settings, color: '#bb0c15' },
  { id: 'stationary-machines', title: 'Stationary Machines', icon: Package, color: '#004D8B' },
  { id: 'grinding-sleeves', title: 'Grinding Sleeves & Wheels', icon: Disc, color: '#bb0c15' },
  { id: 'abrasive-discs', title: 'Abrasive Discs', icon: Disc, color: '#004D8B' },
  { id: 'cutting-discs', title: 'Cutting Discs', icon: Scissors, color: '#bb0c15' },
  { id: 'mounted-points', title: 'Mounted Point & Burrs', icon: Star, color: '#004D8B' },
  { id: 'hand-finishing', title: 'Hand Finishing Products', icon: Layers, color: '#bb0c15' },
]

/* ─── Timeline Data ───────────────────────────────────────── */
const milestones = [
  {
    year: '2004',
    title: 'Foundation',
    description: 'Started as a trader and supplier of abrasive solutions, building a strong foundation in the abrasive and surface finishing industry, especially for stainless steel.',
    icon: Calendar,
    color: '#004D8B',
  },
  {
    year: '2009',
    title: 'Belt Converting Expertise',
    description: 'Became professional abrasive belts converters, delivering customized solutions tailored to metal fabrication, stainless steel finishing, and various industrial applications.',
    icon: Factory,
    color: '#bb0c15',
  },
  {
    year: '2022',
    title: 'Wood Industry Expansion',
    description: 'Expanded manufacturing capabilities to produce wide abrasive belts for the wood industry, supporting woodworking factories and carpentry workshops.',
    icon: TrendingUp,
    color: '#004D8B',
  },
  {
    year: 'Today',
    title: 'Complete Solutions Provider',
    description: 'A full-service abrasive solutions company offering belt converting, manufacturing, flap discs, fleece wheels, polishing materials, and finishing machines.',
    icon: Award,
    color: '#bb0c15',
  },
]

/* ─── Values Data ───────────────────────────────────────── */
const values = [
  {
    icon: Shield,
    title: 'Quality Commitment',
    description: 'Quality is not just a standard — it is our commitment. Every product meets the highest performance standards.',
  },
  {
    icon: Target,
    title: 'Precision & Reliability',
    description: 'Our converting expertise ensures precision, durability, and consistent quality in every belt we produce.',
  },
  {
    icon: Users,
    title: 'Long-term Partnerships',
    description: 'We focus on building lasting relationships with our customers, understanding their unique needs and challenges.',
  },
  {
    icon: Sparkles,
    title: 'Exceptional Results',
    description: 'We deliver solutions that improve productivity and guarantee exceptional finishing results every time.',
  },
]

/* ─── Products/Services Data ───────────────────────────────────────── */
const services = [
  'Custom abrasive belt converting',
  'Wide belts for wood industry',
  'Flap discs & fleece wheels',
  'Polishing materials',
  'Stainless steel finishing machines',
  'Flat surface finishing equipment',
  'Round tube finishing solutions',
  'Technical consultation',
]

export default function AboutPage() {
  const scrolled = useScrolled(60)
  const [menuOpen, setMenuOpen] = useState(false)
  const [productsMenuOpen, setProductsMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products', hasMenu: true },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/#cta' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50">
        {/* Top bar */}
        <div style={{ background: '#004D8B' }} className="py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <a href="tel:+9613741565" className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-white/40" />
                +961 3 741 565
              </a>
              <a href="mailto:info@moticosolutions.com" className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-white/40" />
                info@moticosolutions.com
              </a>
            </div>
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
                  style={{ background: 'rgba(255,255,255,0.08)' }}
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
            <Link href="/" className="flex-shrink-0 mt-4">
              <img src="/logo-motico-solutions.png" alt="Motico Solutions" className="h-24 w-auto object-contain" />
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
                        {categories.map(cat => {
                          const Icon = cat.icon
                          return (
                            <Link
                              key={cat.id}
                              href={`/products/${cat.id}`}
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
                            </Link>
                          )
                        })}
                        <Link
                          href="/products"
                          className="col-span-3 mt-2 pt-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                          style={{ borderTop: '1px solid #e5e7eb', color: '#bb0c15' }}
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
                    style={{ color: link.href === '/about' ? '#004D8B' : '#4b5563' }}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>

            {/* Right buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/#cta"
                className="btn-shimmer text-sm font-semibold px-5 py-2 rounded-lg text-white active:scale-95 transition-transform"
                style={{ background: '#bb0c15', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}
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
                  style={{ color: '#004D8B', borderColor: '#f1f5f9' }}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="/#cta"
                onClick={() => setMenuOpen(false)}
                className="mt-4 text-center py-3 rounded-lg text-white font-semibold"
                style={{ background: '#bb0c15' }}
              >
                Get Quote
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/slide-2-belt.png"
            alt="About Motico Solutions"
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,77,139,0.95) 0%, rgba(0,77,139,0.8) 50%, rgba(187,12,21,0.7) 100%)',
            }}
          />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-96 h-96 rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, white 0%, transparent 70%)',
              top: '10%',
              right: '10%',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-64 h-64 rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, white 0%, transparent 70%)',
              bottom: '20%',
              left: '5%',
              animation: 'float 6s ease-in-out infinite reverse',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <RevealOnScroll>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <Users className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">About Us</span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={100}>
            <h1
              className="font-black text-white mb-6"
              style={{
                fontSize: 'clamp(40px, 8vw, 72px)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              Powering Industry
              <br />
              <span style={{ color: '#bb0c15' }}>Since 2004</span>
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <p
              className="text-lg sm:text-xl max-w-2xl leading-relaxed mb-8"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              A leading trader, supplier, and manufacturer of high-performance abrasive solutions serving Lebanon and the regional market.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={300}>
            <div className="flex flex-wrap gap-6">
              {[
                { value: '20+', label: 'Years Experience' },
                { value: '300+', label: 'Happy Clients' },
                { value: '700+', label: 'Products' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="text-center px-6 py-4 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ animation: 'float 2s ease-in-out infinite' }}
        >
          <span className="text-xs text-white/50 uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div
              className="w-1.5 h-3 rounded-full bg-white/60"
              style={{ animation: 'scrollDot 2s ease-in-out infinite' }}
            />
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <RevealOnScroll>
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold mb-6"
                  style={{
                    background: 'rgba(0,77,139,0.08)',
                    border: '1px solid rgba(0,77,139,0.15)',
                    color: '#004D8B',
                  }}
                >
                  Our Story
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={100}>
                <h2
                  className="font-black mb-6"
                  style={{
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    color: '#0a1628',
                    letterSpacing: '-0.02em',
                  }}
                >
                  From Humble Beginnings to
                  <span style={{ color: '#bb0c15' }}> Industry Leaders</span>
                </h2>
              </RevealOnScroll>

              <RevealOnScroll delay={200}>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    <strong className="text-gray-900">Motico Solutions</strong> is a leading trader and supplier of high-performance abrasive solutions serving Lebanon and the regional market.
                  </p>
                  <p>
                    We started our business in <strong className="text-[#004D8B]">2004</strong>, building a strong foundation in the abrasive and surface finishing industry, especially for stainless steel. Since <strong className="text-[#004D8B]">2009</strong>, we have been operating as professional abrasive belts converters, delivering customized abrasive belt solutions tailored to metal fabrication, stainless steel finishing, and various industrial applications.
                  </p>
                  <p>
                    Our converting expertise ensures <strong className="text-gray-900">precision, durability, and consistent quality</strong> in every belt we produce.
                  </p>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={300}>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: '#bb0c15' }}
                  >
                    Get in Touch <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link
                    href="/#products"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      color: '#004D8B',
                    }}
                  >
                    View Products
                  </Link>
                </div>
              </RevealOnScroll>
            </div>

            {/* Image Grid */}
            <div className="relative">
              <RevealOnScroll direction="right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src="/slide-1.png"
                        alt="Industrial grinding"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-600"
                        style={{ objectPosition: '23% center' }}
                      />
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src="/slide-5.png"
                        alt="Abrasive products"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        style={{ objectPosition: '70% center' }}
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src="/slide-3-disc.png"
                        alt="Disc sanders"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        style={{ objectPosition: '55% center' }}
                      />
                    </div>
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src="/slide-4.png"
                        alt="Surface finishing"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        style={{ objectPosition: '55% center' }}
                      />
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Floating Badge */}
              <div
                className="absolute -bottom-4 -left-4 px-6 py-4 rounded-2xl bg-white shadow-xl"
                style={{ border: '1px solid rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: '#bb0c15' }}
                  >
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Premium Quality</div>
                    <div className="text-sm text-gray-500">Guaranteed Products</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our History Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/slide-4.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - History Timeline Cards */}
            <div className="space-y-6">
              <RevealOnScroll>
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold mb-2"
                  style={{
                    background: 'rgba(0,77,139,0.08)',
                    border: '1px solid rgba(0,77,139,0.15)',
                    color: '#004D8B',
                  }}
                >
                  Our Heritage
                </div>
                <h2
                  className="font-black mb-6"
                  style={{
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    color: '#0a1628',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Our History
                </h2>
              </RevealOnScroll>

              {/* History Cards */}
              {[
                {
                  year: '1962',
                  title: 'The Beginning',
                  description: 'Our story began when our father graduated as an engineer from Germany. He built valuable experience working with major companies in Saudi Arabia.',
                  color: '#004D8B',
                },
                {
                  year: '1990s',
                  title: 'Return to Lebanon',
                  description: 'He returned to Lebanon in the early 1990s and established his own business in moulds manufacturing and metal fabrication projects.',
                  color: '#bb0c15',
                },
                {
                  year: '1997',
                  title: 'General Tool Shop',
                  description: 'We expanded by opening a general tool shop, serving workshops and industrial professionals across Lebanon.',
                  color: '#004D8B',
                },
                {
                  year: '2004',
                  title: 'A New Chapter',
                  description: 'We moved into specialized industrial solutions and started cooperation with German companies focused on surface finishing technologies. This marked the beginning of our dedicated journey in the abrasives and finishing industry.',
                  color: '#bb0c15',
                },
              ].map((item, i) => (
                <RevealOnScroll key={item.year} delay={i * 100}>
                  <div
                    className="relative pl-8 pb-6 border-l-2 last:pb-0"
                    style={{ borderColor: item.color }}
                  >
                    {/* Timeline Dot */}
                    <div
                      className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white"
                      style={{ background: item.color }}
                    />

                    <div
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2"
                      style={{ background: item.color }}
                    >
                      {item.year}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            {/* Right - Image & Quote */}
            <RevealOnScroll direction="right" delay={200}>
              <div className="relative">
                {/* Main Image */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/slide-3-disc.png"
                    alt="Our heritage in industrial excellence"
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,77,139,0.8) 0%, transparent 50%)',
                    }}
                  />

                  {/* Quote Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <blockquote className="text-white">
                      <p className="text-lg font-medium italic mb-4 leading-relaxed">
                        &quot;From German engineering roots to becoming Lebanon&apos;s trusted industrial partner — our journey spans over six decades of dedication to quality and excellence.&quot;
                      </p>
                      <footer className="text-white/70 text-sm">
                        — The Motico Family Legacy
                      </footer>
                    </blockquote>
                  </div>
                </div>

                {/* Floating Stats */}
                <div
                  className="absolute -top-6 -right-6 px-6 py-4 rounded-2xl bg-white shadow-xl"
                  style={{ border: '1px solid rgba(0,0,0,0.05)' }}
                >
                  <div className="text-center">
                    <div
                      className="text-4xl font-black mb-1"
                      style={{
                        background: 'linear-gradient(135deg, #004D8B, #bb0c15)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      60+
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Years of Heritage</div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold mb-4"
                style={{
                  background: 'rgba(187,12,21,0.08)',
                  border: '1px solid rgba(187,12,21,0.15)',
                  color: '#bb0c15',
                }}
              >
                Our Journey
              </div>
              <h2
                className="font-black mb-4"
                style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  color: '#0a1628',
                  letterSpacing: '-0.02em',
                }}
              >
                Two Decades of Excellence
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                From a small trading business to a complete abrasive solutions provider, our journey has been marked by continuous growth and innovation.
              </p>
            </div>
          </RevealOnScroll>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-0.5 hidden lg:block"
              style={{ background: 'linear-gradient(to bottom, #004D8B, #bb0c15)', transform: 'translateX(-50%)' }}
            />

            <div className="space-y-12 lg:space-y-0">
              {milestones.map((milestone, i) => {
                const Icon = milestone.icon
                const isLeft = i % 2 === 0
                return (
                  <RevealOnScroll key={milestone.year} delay={i * 100}>
                    <div className={`relative lg:flex ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center`}>
                      {/* Content */}
                      <div className={`lg:w-1/2 ${isLeft ? 'lg:pr-16 lg:text-right' : 'lg:pl-16'}`}>
                        <div
                          className="inline-block px-4 py-2 rounded-full text-sm font-bold text-white mb-4"
                          style={{ background: milestone.color }}
                        >
                          {milestone.year}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                      </div>

                      {/* Center Icon */}
                      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white shadow-xl items-center justify-center z-10 border-4 border-white">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ background: milestone.color }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Empty space for other side */}
                      <div className="hidden lg:block lg:w-1/2" />
                    </div>
                  </RevealOnScroll>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Expansion Section */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #004D8B 0%, #003366 100%)' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <RevealOnScroll>
              <div>
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold mb-6"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: 'white',
                  }}
                >
                  Recent Expansion
                </div>
                <h2
                  className="font-black text-white mb-6"
                  style={{
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Wood Industry
                  <span style={{ color: '#bb0c15' }}> Solutions</span>
                </h2>
                <p className="text-white/80 leading-relaxed mb-8">
                  Over the past two years, we expanded our manufacturing capabilities to produce wide abrasive belts for the wood industry, supporting woodworking factories and carpentry workshops with efficient, high-quality sanding solutions designed for superior surface finishing.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {['Woodworking Factories', 'Carpentry Workshops', 'Wide Belt Production', 'Superior Finishing'].map((item, i) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-white/90 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="right" delay={200}>
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/slide-2-belt.png"
                    alt="Wood industry solutions"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Stats Card */}
                <div
                  className="absolute -bottom-6 -right-6 px-8 py-6 rounded-2xl shadow-xl"
                  style={{ background: 'white' }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #004D8B, #0066b3)' }}
                    >
                      <Factory className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-gray-900">2+</div>
                      <div className="text-sm text-gray-500">Years Manufacturing</div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Products & Services */}
      <section className="py-20" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold mb-4"
                style={{
                  background: 'rgba(0,77,139,0.08)',
                  border: '1px solid rgba(0,77,139,0.15)',
                  color: '#004D8B',
                }}
              >
                What We Offer
              </div>
              <h2
                className="font-black mb-4"
                style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  color: '#0a1628',
                  letterSpacing: '-0.02em',
                }}
              >
                Complete Abrasive Solutions
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                In addition to belt converting and manufacturing, Motico offers a complete range of abrasive products and finishing equipment.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service, i) => (
              <RevealOnScroll key={service} delay={i * 50}>
                <div
                  className="group relative p-6 rounded-2xl bg-white transition-all duration-300 hover:shadow-xl cursor-default"
                  style={{ border: '1px solid rgba(0,0,0,0.05)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.borderColor = 'rgba(187,12,21,0.2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ background: i % 2 === 0 ? '#bb0c15' : '#004D8B' }}
                    >
                      <Wrench className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#bb0c15] transition-colors">
                        {service}
                      </h3>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold mb-4"
                style={{
                  background: 'rgba(187,12,21,0.08)',
                  border: '1px solid rgba(187,12,21,0.15)',
                  color: '#bb0c15',
                }}
              >
                Our Values
              </div>
              <h2
                className="font-black mb-4"
                style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  color: '#0a1628',
                  letterSpacing: '-0.02em',
                }}
              >
                Why Choose Motico
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                At Motico, quality is not just a standard — it is our commitment. We focus on performance, reliability, and long-term partnerships.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, i) => {
              const Icon = value.icon
              return (
                <RevealOnScroll key={value.title} delay={i * 100}>
                  <div
                    className="group relative p-8 rounded-3xl transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, white 100%)',
                      border: '1px solid rgba(0,0,0,0.05)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'
                      e.currentTarget.style.transform = 'translateY(-4px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div className="flex gap-6">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: i % 2 === 0
                            ? 'linear-gradient(135deg, #bb0c15 0%, #d41920 100%)'
                            : 'linear-gradient(135deg, #004D8B 0%, #0066b3 100%)',
                        }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section
        id="contact"
        className="py-20"
        style={{
          background: 'linear-gradient(180deg, #0a1628 0%, #1a2744 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold mb-6"
              style={{
                background: 'rgba(187,12,21,0.2)',
                border: '1px solid rgba(187,12,21,0.3)',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              Get Started Today
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={100}>
            <h2
              className="font-black text-white mb-6"
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                letterSpacing: '-0.02em',
              }}
            >
              Ready to Partner with Us?
            </h2>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Let us help you find the perfect abrasive solutions for your industrial needs. Contact our expert team today.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="https://wa.me/9613741565?text=Hello!%20I'd%20like%20to%20learn%20more%20about%20Motico%20Solutions."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: '#25D366' }}
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Us
              </a>
              <a
                href="tel:+9613741565"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                style={{ background: '#bb0c15', color: 'white' }}
              >
                <Phone className="w-5 h-5" />
                Call: +961 3 741 565
              </a>
              <a
                href="mailto:info@moticosolutions.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  color: 'white',
                }}
              >
                <Mail className="w-5 h-5" />
                Email Us
              </a>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={400}>
            <div className="flex flex-wrap gap-6 justify-center">
              {['Free Consultation', 'Custom Solutions', 'Fast Response'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item}</span>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#080e1a' }} aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">Footer</h2>

        {/* Top gradient border */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

        {/* Main grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            {/* Col 1 — Brand */}
            <div className="col-span-2 md:col-span-1">
              <img src="/logo-moticosolutions-white.png" alt="Motico Solutions" className="h-8 w-auto object-contain mb-4" />
              <p className="text-xs leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Premium industrial abrasives &amp; tools distributor. Serving MENA since 2004.
              </p>
              <div className="flex flex-col gap-3 mb-6">
                <a href="tel:+9613741565" className="flex items-center gap-2.5 text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Smartphone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bb0c15' }} />
                  +961 3 741 565
                </a>
                <a href="tel:+9611558174" className="flex items-center gap-2.5 text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bb0c15' }} />
                  +961 1 558 174
                </a>
                <a href="mailto:info@moticosolutions.com" className="flex items-center gap-2.5 text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bb0c15' }} />
                  info@moticosolutions.com
                </a>
                <div className="flex items-center gap-2.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bb0c15' }} />
                  Beirut, Lebanon
                </div>
              </div>
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

            {/* Footer columns */}
            {[
              {
                heading: 'Products',
                links: [
                  { label: 'Grinding Wheels', href: '/products/grinding-sleeves' },
                  { label: 'Abrasive Belts', href: '/products/abrasive-belts' },
                  { label: 'Cutting Discs', href: '/products/cutting-discs' },
                  { label: 'Flap Discs', href: '/products/abrasive-discs' },
                  { label: 'Power Tools', href: '/products/air-power-tools' },
                ],
              },
              {
                heading: 'Company',
                links: [
                  { label: 'About Us', href: '/about' },
                  { label: 'Our History', href: '/about#history' },
                  { label: 'Blog', href: '/blog' },
                ],
              },
              {
                heading: 'Support',
                links: [
                  { label: 'FAQ', href: '/faq' },
                  { label: 'Shipping Policy', href: '/shipping' },
                  { label: 'Returns', href: '/returns' },
                  { label: 'Contact Us', href: '/#cta' },
                ],
              },
              {
                heading: 'Legal',
                links: [
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Cookie Policy', href: '/cookies' },
                ],
              },
            ].map(col => (
              <div key={col.heading}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-5 pl-3" style={{ color: 'white', borderLeft: '2px solid #bb0c15' }}>
                  {col.heading}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                © 2026 Motico Solutions. All rights reserved.
              </span>
              <span className="hidden sm:inline text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Developed by{' '}
                <a href="https://dbf-nexus.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#bb0c15]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  DBF Nexus
                </a>
              </span>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs transition-colors active:scale-95 hover:text-white"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
