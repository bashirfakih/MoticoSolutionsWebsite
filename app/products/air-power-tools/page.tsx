'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Phone, MessageCircle } from 'lucide-react'

// Filter Categories
const categories = ["All", "Linear Grinders", "Belt Grinders", "Angle Grinders", "Power Files", "Multifunctional"]

// Badge color mapping
const badgeColorMap: Record<string, string> = {
  "Best Seller": "bg-red-600",
  "Premium": "bg-amber-500",
  "Popular": "bg-blue-600",
  "New": "bg-emerald-600",
}

// Product Gallery Data - Eisenblätter Power Tools
const products = [
  {
    slug: 'poly-ptx-802-ht-linear-grinder',
    name: 'POLY-PTX 802 HT Linear Grinder',
    category: 'Linear Grinders',
    description: 'The inventor of the hand-held linear grinding machine. Unmatched torque and performance with new planetary gear technology.',
    image: '/poly-ptx-802-ht-linear-grinder_01.jpg',
    badge: 'Best Seller',
  },
  {
    slug: 'rohr-max-802-ht-belt-grinder',
    name: 'ROHR MAX 802 HT Pipe Belt Grinder',
    category: 'Belt Grinders',
    description: 'Multifunctional pipe belt sander for perfect sanding and polishing of closed and open pipe constructions.',
    image: '/rohr-max-802-ht-belt-grinder-for-pipe_01.jpg',
    badge: 'Premium',
  },
  {
    slug: 'gladius-1802-ht-grinding-sword',
    name: 'GLADIUS 1802 HT Grinding Sword',
    category: 'Multifunctional',
    description: 'Unique grinding sword with universal grinding properties. Can be used handheld or as stationary machine.',
    image: '/gladius-1802-ht-multifunctional-grinding-sword_01.jpg',
    badge: 'Popular',
  },
  {
    slug: 'band-it-1100-power-file',
    name: 'BAND-IT 1100 Power File',
    category: 'Power Files',
    description: 'Compact belt file ideal for working in tight spaces - edges, folds and corners in railing and metal construction.',
    image: '/band-it-1100-power-file_01.jpg',
    badge: null,
  },
  {
    slug: 'mini-max-1100-multifunctional-grinder',
    name: 'MINI MAX 1100 Multifunctional Grinder',
    category: 'Multifunctional',
    description: 'Versatile mini grinder with improved dust protection. Perfect longitudinal guidance for shadow-free surfaces.',
    image: '/mini-max-1100-multifunctional-grinder_01.jpg',
    badge: 'New',
  },
  {
    slug: 'varilex-wsf-1100-angle-grinder',
    name: 'VARILEX WSF 1100 Angle Grinder',
    category: 'Angle Grinders',
    description: 'Compact angle grinder with 1,100W variable speed. Smallest handle circumference in its class for fatigue-free grinding.',
    image: '/varilex-wsf-1100-compact-angle-grinder_01.jpg',
    badge: null,
  },
]

export default function AirPowerToolsPage() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filteredProducts = activeFilter === "All"
    ? products
    : products.filter(p => p.category === activeFilter)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
          <Link href="/#products" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-4">
            <Image src="/logo-motico-solutions.png" alt="Motico Solutions" width={180} height={54} className="h-24 w-auto" />
          </Link>
          <a
            href="tel:+9613741565"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-blue-800 border border-blue-800 px-4 py-2 rounded-full hover:bg-blue-800 hover:text-white transition-all"
          >
            <Phone className="w-4 h-4" />
            +961 3 741 565
          </a>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <nav className="bg-gray-50 border-b border-gray-200 px-6 py-2.5 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/#products" className="hover:text-blue-700 transition-colors">Products</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-medium">Air & Power Tools</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-[420px] flex items-center justify-center overflow-hidden">
        <Image
          src="/product-air-power-tools.png"
          alt="Air & Power Tools"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Eisenblätter Germany
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            Air & Power <span className="text-red-500">Tools</span>
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Professional-grade German-engineered power tools for industrial grinding, sanding, and polishing applications.
          </p>
        </div>
      </section>

      {/* Product Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2
              className="font-black mb-4"
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #004D8B 0%, #0066b3 50%, #bb0c15 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Power Tools Collection
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-500">
              Click on any product to view detailed specifications and technical data.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  activeFilter === cat
                    ? "bg-blue-900 text-white border-blue-900"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-900 hover:text-blue-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/products/air-power-tools/${product.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge */}
                  {product.badge && (
                    <span className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full text-white ${badgeColorMap[product.badge]}`}>
                      {product.badge}
                    </span>
                  )}
                  {/* Category tag */}
                  <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-widest text-white/90 bg-black/50 px-2 py-0.5 rounded">
                    {product.category}
                  </span>
                </div>
                {/* Info Panel — always visible */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-800 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-blue-800 font-semibold text-sm group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-full mb-5">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Need Expert Advice?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Our technical team can help you select the perfect power tool for your application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20your%20power%20tools."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-7 py-3.5 rounded-full transition-colors shadow-lg"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp Us
            </a>
            <a
              href="tel:+9613741565"
              className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-7 py-3.5 rounded-full border border-white/30 transition-colors"
            >
              <Phone className="w-5 h-5" /> Call: +961 3 741 565
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6 mt-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <Link href="/" className="text-white font-semibold text-base hover:text-red-400 transition-colors">
            ← Motico Solutions
          </Link>
          <p className="text-gray-500">Industrial Abrasives & Tools — Beirut, Lebanon</p>
          <div className="flex gap-6">
            <a href="/#products" className="hover:text-white transition-colors">All Products</a>
            <a href="tel:+9613741565" className="hover:text-white transition-colors">+961 3 741 565</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
