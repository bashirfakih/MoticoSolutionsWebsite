'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft, CheckCircle, ChevronLeft, ChevronRight,
  MessageCircle, Download, ArrowRight, Layers, X, ZoomIn,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// PRODUCT DATA
// ═══════════════════════════════════════════════════════════════
const products: Record<string, {
  title: string
  subtitle: string
  description: string
  longDescription: string
  images: string[]
  features: string[]
  technicalData: { label: string; value: string }[]
  applications: string[]
  brands: string[]
  datasheetUrl?: string
  relatedProducts: { slug: string; title: string; image: string }[]
}> = {
  'ceramic-grain': {
    title: 'Ceramic Grain Belts',
    subtitle: 'Maximum Material Removal',
    description: 'Self-sharpening ceramic grains for aggressive stock removal on hardened steels and exotic alloys.',
    longDescription: 'Our premium ceramic grain abrasive belts feature advanced self-sharpening technology that continuously exposes fresh cutting edges during use. This results in consistent cutting performance and significantly longer belt life compared to conventional abrasives. Ideal for high-pressure grinding operations on difficult-to-machine materials including hardened steels, stainless steel, titanium, and nickel-based superalloys.',
    images: ['/slide-1-grinding.png', '/slide-2-belt.png', '/product-abrasive-belts.png'],
    features: [
      'Self-sharpening ceramic grain technology',
      'Up to 3x longer life than conventional belts',
      'Consistent cut rate throughout belt life',
      'Cool grinding - reduces heat buildup',
      'Precision-coated for uniform scratch pattern',
      'Heavy-duty polyester backing',
    ],
    technicalData: [
      { label: 'Grain Type', value: 'Precision-Shaped Ceramic' },
      { label: 'Backing', value: 'Heavy-Duty Polyester Cloth' },
      { label: 'Bond System', value: 'Resin over Resin' },
      { label: 'Coating', value: 'Closed Coat' },
      { label: 'Recommended Speed', value: '20-35 m/s' },
      { label: 'Maximum Speed', value: '45 m/s' },
      { label: 'Operating Pressure', value: 'High (40-80 N)' },
      { label: 'Heat Resistance', value: 'Excellent' },
      { label: 'Available Grits', value: 'P24, P36, P40, P60, P80, P120' },
      { label: 'Storage Conditions', value: '15-25°C, 40-65% RH' },
      { label: 'Shelf Life', value: '3 years' },
    ],
    applications: [
      'Heavy stock removal on hardened materials',
      'Weld grinding and blending',
      'Surface preparation before coating',
      'Deburring thick metal parts',
      'Aerospace component finishing',
    ],
    brands: ['Hermes', '3M Cubitron II', 'Norton Blaze'],
    datasheetUrl: '/datasheets/ceramic-grain-belts.pdf',
    relatedProducts: [
      { slug: 'zirconia-alumina', title: 'Zirconia Alumina Belts', image: '/slide-2-belt.png' },
      { slug: 'compact-grain', title: 'Compact Grain Belts', image: '/slide-3-disc.png' },
    ],
  },
  'zirconia-alumina': {
    title: 'Zirconia Alumina Belts',
    subtitle: 'Versatile Performance',
    description: 'Ideal balance of cut rate and belt life for stainless steel, carbon steel, and aluminum.',
    longDescription: 'Zirconia alumina abrasive belts offer an excellent balance between aggressive cutting action and extended belt life. The tough, self-sharpening zirconia grains fracture during use to expose fresh cutting points, maintaining consistent performance. These versatile belts are the workhorse of metal fabrication shops, suitable for a wide range of materials and applications.',
    images: ['/slide-2-belt.png', '/slide-1-grinding.png', '/product-abrasive-belts.png'],
    features: [
      'Self-sharpening zirconia alumina grains',
      'Excellent heat dissipation',
      'Versatile material compatibility',
      'High stock removal rate',
      'Durable cloth backing',
      'Anti-static treatment available',
    ],
    technicalData: [
      { label: 'Grain Type', value: 'Zirconia Alumina' },
      { label: 'Backing', value: 'Polyester/Cotton Blend' },
      { label: 'Bond System', value: 'Resin over Resin' },
      { label: 'Coating', value: 'Closed Coat' },
      { label: 'Recommended Speed', value: '18-30 m/s' },
      { label: 'Maximum Speed', value: '40 m/s' },
      { label: 'Operating Pressure', value: 'Medium-High (30-60 N)' },
      { label: 'Heat Resistance', value: 'Very Good' },
      { label: 'Available Grits', value: 'P24, P36, P40, P60, P80, P100, P120' },
      { label: 'Storage Conditions', value: '15-25°C, 40-65% RH' },
      { label: 'Shelf Life', value: '3 years' },
    ],
    applications: [
      'General metal grinding and finishing',
      'Pipe and tube grinding',
      'Sheet metal edge finishing',
      'Weld seam removal',
      'Surface preparation',
    ],
    brands: ['Hermes', 'VSM', 'Klingspor'],
    datasheetUrl: '/datasheets/zirconia-alumina-belts.pdf',
    relatedProducts: [
      { slug: 'ceramic-grain', title: 'Ceramic Grain Belts', image: '/slide-1-grinding.png' },
      { slug: 'aluminum-oxide', title: 'Aluminum Oxide Belts', image: '/slide-5-abrasiv.png' },
    ],
  },
  'aluminum-oxide': {
    title: 'Aluminum Oxide Belts',
    subtitle: 'Precision Finishing',
    description: 'Consistent scratch patterns for fine finishing and surface preparation.',
    longDescription: 'Aluminum oxide abrasive belts are the industry standard for precision finishing applications. Available in a wide range of grits from coarse to ultra-fine, these belts produce consistent, uniform scratch patterns essential for achieving specified surface finishes. Ideal for applications where surface appearance and Ra values are critical.',
    images: ['/slide-5-abrasiv.png', '/slide-2-belt.png', '/product-abrasive-belts.png'],
    features: [
      'Precision-graded aluminum oxide grains',
      'Consistent scratch pattern',
      'Wide grit range available',
      'Multiple backing options',
      'Paper or cloth backing',
      'Excellent for fine finishing',
    ],
    technicalData: [
      { label: 'Grain Type', value: 'Aluminum Oxide' },
      { label: 'Backing', value: 'Paper / Cloth Options' },
      { label: 'Bond System', value: 'Resin' },
      { label: 'Coating', value: 'Open / Closed Coat' },
      { label: 'Recommended Speed', value: '15-25 m/s' },
      { label: 'Maximum Speed', value: '35 m/s' },
      { label: 'Operating Pressure', value: 'Low-Medium (15-40 N)' },
      { label: 'Heat Resistance', value: 'Good' },
      { label: 'Available Grits', value: 'P60 - P400' },
      { label: 'Storage Conditions', value: '15-25°C, 40-65% RH' },
      { label: 'Shelf Life', value: '2 years' },
    ],
    applications: [
      'Fine surface finishing',
      'Pre-paint preparation',
      'Wood sanding and finishing',
      'Plastic surface preparation',
      'Light deburring',
    ],
    brands: ['Hermes', '3M', 'Mirka'],
    datasheetUrl: '/datasheets/aluminum-oxide-belts.pdf',
    relatedProducts: [
      { slug: 'surface-conditioning', title: 'Surface Conditioning Belts', image: '/slide-4-brush.png' },
      { slug: 'film-backed', title: 'Film-Backed Belts', image: '/product-abrasive-belts.png' },
    ],
  },
  'compact-grain': {
    title: 'Compact Grain Belts',
    subtitle: 'Extreme Durability',
    description: '3D grain structure for unmatched longevity on demanding production runs.',
    longDescription: 'Compact grain technology features multiple layers of abrasive grains bonded together in a three-dimensional structure. As the top layer wears, fresh grains beneath are exposed, providing consistent cutting action throughout the belt life. These belts excel in high-production environments where belt change frequency significantly impacts productivity.',
    images: ['/slide-3-disc.png', '/slide-1-grinding.png', '/product-abrasive-belts.png'],
    features: [
      '3D multi-layer grain structure',
      'Up to 5x longer life than standard belts',
      'Consistent finish throughout belt life',
      'Reduced belt change downtime',
      'Ideal for automated systems',
      'Premium backing materials',
    ],
    technicalData: [
      { label: 'Grain Type', value: 'Compact Grain (Multi-Layer)' },
      { label: 'Backing', value: 'Heavy Polyester' },
      { label: 'Bond System', value: 'Special Resin System' },
      { label: 'Coating', value: 'Compact Structure' },
      { label: 'Recommended Speed', value: '20-30 m/s' },
      { label: 'Maximum Speed', value: '40 m/s' },
      { label: 'Operating Pressure', value: 'Medium (25-50 N)' },
      { label: 'Heat Resistance', value: 'Very Good' },
      { label: 'Available Grits', value: 'P60, P80, P120, P180, P240' },
      { label: 'Storage Conditions', value: '15-25°C, 40-65% RH' },
      { label: 'Shelf Life', value: '3 years' },
    ],
    applications: [
      'High-volume production grinding',
      'Automated finishing lines',
      'Consistent surface preparation',
      'Cost-per-part optimization',
    ],
    brands: ['Hermes', '3M Trizact', 'VSM Compactgrain'],
    datasheetUrl: '/datasheets/compact-grain-belts.pdf',
    relatedProducts: [
      { slug: 'ceramic-grain', title: 'Ceramic Grain Belts', image: '/slide-1-grinding.png' },
      { slug: 'zirconia-alumina', title: 'Zirconia Alumina Belts', image: '/slide-2-belt.png' },
    ],
  },
  'surface-conditioning': {
    title: 'Surface Conditioning Belts',
    subtitle: 'Non-Woven Excellence',
    description: 'Perfect for deburring, blending, and creating uniform surface textures.',
    longDescription: 'Surface conditioning belts utilize non-woven abrasive technology, combining synthetic fibers with abrasive grains to create a flexible, conformable product. These belts excel at blending, deburring, and finishing operations where maintaining part geometry is critical. They produce a consistent, uniform surface texture without removing significant material.',
    images: ['/slide-4-brush.png', '/slide-2-belt.png', '/product-abrasive-belts.png'],
    features: [
      'Non-woven construction',
      'Conformable to part geometry',
      'Will not alter part dimensions',
      'Produces uniform satin finish',
      'Excellent for blending operations',
      'Available in multiple grades',
    ],
    technicalData: [
      { label: 'Construction', value: 'Non-Woven Synthetic' },
      { label: 'Abrasive Type', value: 'Silicon Carbide / Aluminum Oxide' },
      { label: 'Density', value: 'Medium to High' },
      { label: 'Flexibility', value: 'Very High' },
      { label: 'Recommended Speed', value: '10-20 m/s' },
      { label: 'Maximum Speed', value: '25 m/s' },
      { label: 'Operating Pressure', value: 'Low (10-25 N)' },
      { label: 'Heat Resistance', value: 'Moderate' },
      { label: 'Available Grades', value: 'Very Fine, Fine, Medium, Coarse' },
      { label: 'Storage Conditions', value: '15-25°C, 40-65% RH' },
      { label: 'Shelf Life', value: '2 years' },
    ],
    applications: [
      'Deburring and edge blending',
      'Satin finishing',
      'Surface cleaning',
      'Scratch removal and blending',
      'Pre-polish preparation',
    ],
    brands: ['3M Scotch-Brite', 'Hermes', 'Norton Bear-Tex'],
    datasheetUrl: '/datasheets/surface-conditioning-belts.pdf',
    relatedProducts: [
      { slug: 'aluminum-oxide', title: 'Aluminum Oxide Belts', image: '/slide-5-abrasiv.png' },
      { slug: 'film-backed', title: 'Film-Backed Belts', image: '/product-abrasive-belts.png' },
    ],
  },
  'film-backed': {
    title: 'Film-Backed Belts',
    subtitle: 'Ultra-Fine Finishing',
    description: 'Precision micro-graded abrasives for mirror-finish applications.',
    longDescription: 'Film-backed abrasive belts represent the pinnacle of precision finishing technology. Featuring micro-graded abrasives on a dimensionally stable polyester film backing, these belts produce extremely consistent, fine finishes. They are essential for applications requiring specific Ra values or mirror-like surface appearances.',
    images: ['/product-abrasive-belts.png', '/slide-5-abrasiv.png', '/slide-2-belt.png'],
    features: [
      'Micro-graded precision abrasives',
      'Dimensionally stable film backing',
      'Extremely consistent finish',
      'Available down to 1 micron',
      'Ideal for superfinishing',
      'Low Ra value capability',
    ],
    technicalData: [
      { label: 'Grain Type', value: 'Micro-Graded Aluminum Oxide' },
      { label: 'Backing', value: 'Polyester Film (3 mil)' },
      { label: 'Bond System', value: 'Resin' },
      { label: 'Coating', value: 'Precision Electrostatic' },
      { label: 'Recommended Speed', value: '10-18 m/s' },
      { label: 'Maximum Speed', value: '25 m/s' },
      { label: 'Operating Pressure', value: 'Very Low (5-15 N)' },
      { label: 'Heat Resistance', value: 'Moderate' },
      { label: 'Available Grits', value: 'P400 - P2000, 3µm, 1µm' },
      { label: 'Achievable Ra', value: '< 0.1 µm' },
      { label: 'Shelf Life', value: '2 years' },
    ],
    applications: [
      'Mirror finishing',
      'Superfinishing operations',
      'Roller and cylinder finishing',
      'Medical device finishing',
      'Optical component preparation',
    ],
    brands: ['3M', 'Hermes', 'Mirka'],
    datasheetUrl: '/datasheets/film-backed-belts.pdf',
    relatedProducts: [
      { slug: 'aluminum-oxide', title: 'Aluminum Oxide Belts', image: '/slide-5-abrasiv.png' },
      { slug: 'surface-conditioning', title: 'Surface Conditioning Belts', image: '/slide-4-brush.png' },
    ],
  },
}

// Default product for unknown slugs
const defaultProduct = {
  title: 'Abrasive Belt',
  subtitle: 'Industrial Quality',
  description: 'High-quality abrasive belt for industrial applications.',
  longDescription: 'Contact us for detailed product specifications.',
  images: ['/product-abrasive-belts.png'],
  features: ['Premium quality', 'Industrial grade'],
  technicalData: [{ label: 'Contact us', value: 'for specifications' }],
  applications: ['Contact us for applications'],
  brands: ['Multiple brands available'],
  relatedProducts: [],
}

export default function BeltProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const product = products[slug] || { ...defaultProduct, title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }

  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const nextImage = () => setActiveImage((prev) => (prev + 1) % product.images.length)
  const prevImage = () => setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/products/abrasive-belts"
            className="flex items-center gap-2 text-sm font-medium transition-all hover:gap-3"
            style={{ color: '#004D8B' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Collection
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 lg:mb-24">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={product.images[activeImage]}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />
              {/* Zoom Indicator */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </div>
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}
              {/* Image Counter */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 text-white text-sm font-medium">
                  {activeImage + 1} / {product.images.length}
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 justify-center">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all ${
                      activeImage === i
                        ? 'ring-2 ring-[#bb0c15] ring-offset-2'
                        : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 w-fit"
              style={{ background: 'linear-gradient(135deg, #bb0c15, #d42a32)', color: 'white' }}
            >
              <Layers className="w-4 h-4" />
              {product.subtitle}
            </div>

            <h1
              className="text-4xl sm:text-5xl font-black text-gray-900 mb-6"
              style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              {product.title}
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8">
              {product.longDescription}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20${encodeURIComponent(product.title)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                style={{ background: '#25D366', boxShadow: '0 10px 40px rgba(37,211,102,0.3)' }}
              >
                <MessageCircle className="w-6 h-6" />
                Request Quote
              </a>
              {product.datasheetUrl && (
                <a
                  href={product.datasheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    color: '#374151',
                  }}
                >
                  <Download className="w-6 h-6" />
                  Datasheet
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Description & Technical Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16 lg:mb-24">
          {/* Description */}
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8"
              style={{ letterSpacing: '-0.01em' }}
            >
              Key Features
            </h2>
            <div className="space-y-4">
              {product.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium pt-1">{feature}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Technical Data */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2
                className="text-2xl sm:text-3xl font-bold text-gray-900"
                style={{ letterSpacing: '-0.01em' }}
              >
                Technical Data
              </h2>
              {product.datasheetUrl && (
                <a
                  href={product.datasheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-[#004D8B] hover:underline"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              )}
            </div>

            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}
            >
              {product.technicalData.map(({ label, value }, i) => (
                <div
                  key={label}
                  className={`flex justify-between items-center px-6 py-4 ${
                    i !== product.technicalData.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <span className="text-gray-500 font-medium">{label}</span>
                  <span className="font-semibold text-gray-900 text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* Download Datasheet CTA */}
            {product.datasheetUrl && (
              <a
                href={product.datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full mt-6 px-8 py-5 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #004D8B, #0066b3)',
                  boxShadow: '0 10px 40px rgba(0,77,139,0.25)'
                }}
              >
                <Download className="w-5 h-5" />
                Download Full Datasheet (PDF)
              </a>
            )}
          </div>
        </div>

        {/* Related Products */}
        {product.relatedProducts.length > 0 && (
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8"
              style={{ letterSpacing: '-0.01em' }}
            >
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.relatedProducts.map(related => (
                <Link
                  key={related.slug}
                  href={`/products/abrasive-belts/${related.slug}`}
                  className="group relative rounded-3xl overflow-hidden bg-gray-100 aspect-[4/3]"
                >
                  <Image
                    src={related.image}
                    alt={related.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 flex items-end p-6"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)'
                    }}
                  >
                    <div>
                      <h3 className="font-bold text-xl text-white mb-2">
                        {related.title}
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                        View Product
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-gray-100">
        <Link
          href="/products/abrasive-belts"
          className="text-sm text-gray-400 hover:text-[#004D8B] transition-colors"
        >
          ← Back to Abrasive Belts Collection
        </Link>
      </footer>

      {/* Image Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.95)' }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image Container */}
          <div
            className="relative w-full max-w-5xl aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={product.images[activeImage]}
              alt={product.title}
              fill
              className="object-contain"
              priority
            />

            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {product.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-black/60 text-white font-medium">
                {activeImage + 1} / {product.images.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all ${
                    activeImage === i
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
