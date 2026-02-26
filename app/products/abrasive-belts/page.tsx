'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft, ArrowRight, Phone, MessageCircle, Layers,
} from 'lucide-react'

// Product Gallery Data
const products = [
  {
    slug: 'ceramic-grain',
    title: 'Ceramic Grain Belts',
    subtitle: 'Maximum Material Removal',
    desc: 'Self-sharpening ceramic grains for aggressive stock removal on hardened steels and exotic alloys.',
    image: '/slide-1-grinding.png',
    highlight: 'Best Seller',
    highlightColor: '#bb0c15',
  },
  {
    slug: 'zirconia-alumina',
    title: 'Zirconia Alumina Belts',
    subtitle: 'Versatile Performance',
    desc: 'Ideal balance of cut rate and belt life for stainless steel, carbon steel, and aluminum.',
    image: '/slide-2-belt.png',
    highlight: 'Most Popular',
    highlightColor: '#004D8B',
  },
  {
    slug: 'aluminum-oxide',
    title: 'Aluminum Oxide Belts',
    subtitle: 'Precision Finishing',
    desc: 'Consistent scratch patterns for fine finishing and surface preparation.',
    image: '/slide-5-abrasiv.png',
    highlight: null,
    highlightColor: null,
  },
  {
    slug: 'compact-grain',
    title: 'Compact Grain Belts',
    subtitle: 'Extreme Durability',
    desc: '3D grain structure for unmatched longevity on demanding production runs.',
    image: '/slide-3-disc.png',
    highlight: 'Premium',
    highlightColor: '#d97706',
  },
  {
    slug: 'surface-conditioning',
    title: 'Surface Conditioning Belts',
    subtitle: 'Non-Woven Excellence',
    desc: 'Perfect for deburring, blending, and creating uniform surface textures.',
    image: '/slide-4-brush.png',
    highlight: null,
    highlightColor: null,
  },
  {
    slug: 'film-backed',
    title: 'Film-Backed Belts',
    subtitle: 'Ultra-Fine Finishing',
    desc: 'Precision micro-graded abrasives for mirror-finish applications.',
    image: '/product-abrasive-belts.png',
    highlight: 'Specialty',
    highlightColor: '#059669',
  },
]

export default function AbrasiveBeltsPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/#products"
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#bb0c15]"
            style={{ color: '#004D8B' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <Link href="/">
            <Image
              src="/logo-motico-solutions.png"
              alt="Motico Solutions"
              width={200}
              height={60}
              className="h-16 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Hero Section - Compact with Image */}
      <section className="relative h-[40vh] min-h-[280px] max-h-[400px] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/product-abrasive-belts.png"
            alt="Abrasive Belts"
            fill
            className="object-cover object-center"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)',
            }}
          />
        </div>

        {/* Content - Title Only */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{
                background: 'rgba(187,12,21,0.9)',
              }}
            >
              <Layers className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Premium Collection</span>
            </div>

            {/* Title */}
            <h1
              className="font-black"
              style={{
                fontSize: 'clamp(40px, 7vw, 72px)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              <span className="text-white">Abrasive </span>
              <span style={{ color: '#bb0c15' }}>Belts</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Description Section - Below Hero */}
      <section
        className="py-10 sm:py-12"
        style={{
          background: '#f8fafc',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-xl sm:text-2xl font-medium mb-3 text-gray-900">
              Premium Surface Finishing Solutions
            </p>
            <p className="text-base sm:text-lg leading-relaxed text-gray-600">
              From coarse stock removal to mirror-finish polishing, our belts deliver consistent performance across every application. We offer a complete range of abrasive belts for metal fabrication, woodworking, and specialty finishing applications.
            </p>
          </div>
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
              Abrasive Belts
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-500">
              Click on any product to view detailed specifications and technical data.
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <Link
                key={product.slug}
                href={`/products/abrasive-belts/${product.slug}`}
                className="group relative rounded-3xl overflow-hidden block shadow-lg"
                style={{
                  aspectRatio: '4/5',
                }}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image */}
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover transition-all duration-700"
                  style={{
                    transform: hoveredCard === i ? 'scale(1.1)' : 'scale(1)',
                  }}
                />

                {/* Highlight Badge */}
                {product.highlight && (
                  <div
                    className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{ background: product.highlightColor || '#bb0c15' }}
                  >
                    {product.highlight}
                  </div>
                )}

                {/* Content Overlay */}
                <div
                  className="absolute inset-0 flex flex-col justify-end p-6 transition-all duration-500"
                  style={{
                    background: hoveredCard === i
                      ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
                      : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                  }}
                >
                  <div
                    className="transition-all duration-500"
                    style={{
                      transform: hoveredCard === i ? 'translateY(0)' : 'translateY(20px)',
                      opacity: hoveredCard === i ? 1 : 0.9,
                    }}
                  >
                    <span
                      className="text-xs font-semibold uppercase tracking-wider block mb-2"
                      style={{ color: '#bb0c15' }}
                    >
                      {product.subtitle}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
                    <p
                      className="text-sm leading-relaxed transition-all duration-500"
                      style={{
                        color: 'rgba(255,255,255,0.8)',
                        maxHeight: hoveredCard === i ? '100px' : '0',
                        opacity: hoveredCard === i ? 1 : 0,
                        overflow: 'hidden',
                      }}
                    >
                      {product.desc}
                    </p>
                    <div
                      className="flex items-center gap-2 mt-4 text-sm font-semibold transition-all duration-500"
                      style={{
                        color: '#bb0c15',
                        opacity: hoveredCard === i ? 1 : 0,
                        transform: hoveredCard === i ? 'translateY(0)' : 'translateY(10px)',
                      }}
                    >
                      View Details <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Hover Border */}
                <div
                  className="absolute inset-0 rounded-3xl transition-all duration-500 pointer-events-none"
                  style={{
                    boxShadow: hoveredCard === i
                      ? 'inset 0 0 0 3px rgba(187,12,21,0.6)'
                      : 'none',
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section
        className="py-20"
        style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="font-black text-gray-900 mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.02em' }}
          >
            Need Expert Advice?
          </h2>
          <p className="text-lg mb-8 text-gray-600">
            Our technical team can help you select the perfect belt for your application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20your%20abrasive%20belts."
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
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                background: '#004D8B',
                color: 'white',
              }}
            >
              <Phone className="w-5 h-5" />
              Call: +961 3 741 565
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 text-center bg-white"
        style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
      >
        <Link
          href="/"
          className="text-sm transition-colors hover:text-[#bb0c15] text-gray-500"
        >
          ← Return to Motico Solutions
        </Link>
      </footer>
    </div>
  )
}
