'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft, ArrowRight, Phone, MessageCircle,
  Layers, Settings, Gauge, Zap, Sparkles, Award,
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

const features = [
  { icon: Sparkles, title: 'Superior Grain Technology', desc: 'Engineered abrasive grains for faster cutting and longer life' },
  { icon: Award, title: 'Premium Brands', desc: 'Exclusive distributor for Hermes, 3M, and Eisenblätter' },
  { icon: Gauge, title: 'All Grit Ranges', desc: 'P24 coarse to P1200 ultra-fine for any finish requirement' },
  { icon: Zap, title: 'Heat Resistant', desc: 'Advanced backing materials prevent warping under load' },
]

const specs = {
  grits: ['P24', 'P36', 'P40', 'P60', 'P80', 'P100', 'P120', 'P150', 'P180', 'P220', 'P320', 'P400', 'P600', 'P800', 'P1000', 'P1200'],
  widths: ['10mm', '25mm', '50mm', '75mm', '100mm', '150mm', '200mm', '300mm', 'Custom'],
  lengths: ['330mm', '457mm', '610mm', '915mm', '1000mm', '1500mm', '2000mm', '2500mm', '3000mm', 'Custom'],
  materials: ['Steel', 'Stainless Steel', 'Aluminum', 'Titanium', 'Inconel', 'Wood', 'Composites', 'Glass', 'Plastics'],
}

const brands = [
  { name: 'Hermes', logo: '/logo-hermes.png' },
  { name: '3M', logo: '/logo-3m.png' },
  { name: 'Eisenblätter', logo: '/logo-eisenblaetter.png' },
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
              src="/logo-moticosolutions.png"
              alt="Motico Solutions"
              width={120}
              height={40}
              className="h-8 w-auto"
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

      {/* Features Bar */}
      <section
        className="py-12 border-b"
        style={{
          background: 'white',
          borderColor: 'rgba(0,0,0,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(187,12,21,0.1), rgba(187,12,21,0.05))',
                    border: '1px solid rgba(187,12,21,0.15)',
                  }}
                >
                  <Icon className="w-6 h-6 text-[#bb0c15]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2
              className="font-black text-gray-900 mb-4"
              style={{ fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-0.02em' }}
            >
              Product Range
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-500">
              Click on any product to view detailed specifications, compatible materials, and technical data.
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

      {/* Specifications */}
      <section
        className="py-20"
        style={{
          background: '#f8fafc',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2
              className="font-black text-gray-900 mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.02em' }}
            >
              Available Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Grit Sizes */}
            <div
              className="rounded-2xl p-6 bg-white"
              style={{
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#bb0c15]" />
                Grit Sizes
              </h3>
              <div className="flex flex-wrap gap-2">
                {specs.grits.map(grit => (
                  <span
                    key={grit}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                    }}
                  >
                    {grit}
                  </span>
                ))}
              </div>
            </div>

            {/* Widths */}
            <div
              className="rounded-2xl p-6 bg-white"
              style={{
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#004D8B]" />
                Belt Widths
              </h3>
              <div className="flex flex-wrap gap-2">
                {specs.widths.map(w => (
                  <span
                    key={w}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                    }}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Lengths */}
            <div
              className="rounded-2xl p-6 bg-white"
              style={{
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-[#bb0c15]" />
                Belt Lengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {specs.lengths.map(l => (
                  <span
                    key={l}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                    }}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div
              className="rounded-2xl p-6 bg-white"
              style={{
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#004D8B]" />
                Compatible Materials
              </h3>
              <div className="flex flex-wrap gap-2">
                {specs.materials.map(m => (
                  <span
                    key={m}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Official Distributor
            </span>
          </div>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            {brands.map(brand => (
              <div
                key={brand.name}
                className="w-32 h-16 relative opacity-70 hover:opacity-100 transition-opacity"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain"
                />
              </div>
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
