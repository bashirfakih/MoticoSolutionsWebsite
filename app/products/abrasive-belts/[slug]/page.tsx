'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Phone, MessageCircle,
  Layers, Settings, Gauge, Zap, Shield, Award, Package, ArrowRight,
  FileText, Download, Star,
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
  specs: { label: string; value: string }[]
  materials: { name: string; rating: 'excellent' | 'good' | 'suitable' }[]
  grits: string[]
  dimensions: { width: string; length: string }[]
  technicalData: { label: string; value: string }[]
  applications: string[]
  brands: string[]
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
    specs: [
      { label: 'Grain Type', value: 'Precision-Shaped Ceramic' },
      { label: 'Backing', value: 'Heavy-Duty Polyester Cloth' },
      { label: 'Bond', value: 'Resin over Resin' },
      { label: 'Coating', value: 'Closed Coat' },
      { label: 'Flexibility', value: 'Y-Weight (Stiff)' },
      { label: 'Color', value: 'Blue/Purple' },
    ],
    materials: [
      { name: 'Hardened Steel', rating: 'excellent' },
      { name: 'Stainless Steel', rating: 'excellent' },
      { name: 'Titanium', rating: 'excellent' },
      { name: 'Inconel / Superalloys', rating: 'excellent' },
      { name: 'Carbon Steel', rating: 'good' },
      { name: 'Tool Steel', rating: 'good' },
      { name: 'Cast Iron', rating: 'suitable' },
    ],
    grits: ['P24', 'P36', 'P40', 'P60', 'P80', 'P120'],
    dimensions: [
      { width: '50mm', length: '2000mm' },
      { width: '75mm', length: '2000mm' },
      { width: '100mm', length: '2000mm' },
      { width: '150mm', length: '2000mm' },
      { width: 'Custom', length: 'Custom' },
    ],
    technicalData: [
      { label: 'Recommended Speed', value: '20-35 m/s' },
      { label: 'Maximum Speed', value: '45 m/s' },
      { label: 'Operating Pressure', value: 'High (40-80 N)' },
      { label: 'Heat Resistance', value: 'Excellent' },
      { label: 'Storage', value: '15-25°C, 40-65% RH' },
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
    specs: [
      { label: 'Grain Type', value: 'Zirconia Alumina' },
      { label: 'Backing', value: 'Polyester/Cotton Blend' },
      { label: 'Bond', value: 'Resin over Resin' },
      { label: 'Coating', value: 'Closed Coat' },
      { label: 'Flexibility', value: 'X-Weight (Medium)' },
      { label: 'Color', value: 'Blue' },
    ],
    materials: [
      { name: 'Stainless Steel', rating: 'excellent' },
      { name: 'Carbon Steel', rating: 'excellent' },
      { name: 'Aluminum', rating: 'good' },
      { name: 'Mild Steel', rating: 'excellent' },
      { name: 'Cast Iron', rating: 'good' },
      { name: 'Brass/Copper', rating: 'suitable' },
    ],
    grits: ['P24', 'P36', 'P40', 'P60', 'P80', 'P100', 'P120'],
    dimensions: [
      { width: '25mm', length: '762mm' },
      { width: '50mm', length: '2000mm' },
      { width: '75mm', length: '2000mm' },
      { width: '100mm', length: '2000mm' },
      { width: '150mm', length: '2000mm' },
    ],
    technicalData: [
      { label: 'Recommended Speed', value: '18-30 m/s' },
      { label: 'Maximum Speed', value: '40 m/s' },
      { label: 'Operating Pressure', value: 'Medium-High (30-60 N)' },
      { label: 'Heat Resistance', value: 'Very Good' },
      { label: 'Storage', value: '15-25°C, 40-65% RH' },
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
    specs: [
      { label: 'Grain Type', value: 'Aluminum Oxide' },
      { label: 'Backing', value: 'Paper / Cloth Options' },
      { label: 'Bond', value: 'Resin' },
      { label: 'Coating', value: 'Open / Closed Coat' },
      { label: 'Flexibility', value: 'J-Weight to Y-Weight' },
      { label: 'Color', value: 'Brown/Tan' },
    ],
    materials: [
      { name: 'Wood', rating: 'excellent' },
      { name: 'Carbon Steel', rating: 'excellent' },
      { name: 'Aluminum', rating: 'good' },
      { name: 'Plastics', rating: 'excellent' },
      { name: 'Composites', rating: 'good' },
      { name: 'Soft Metals', rating: 'excellent' },
    ],
    grits: ['P60', 'P80', 'P100', 'P120', 'P150', 'P180', 'P220', 'P320', 'P400'],
    dimensions: [
      { width: '25mm', length: '762mm' },
      { width: '50mm', length: '1500mm' },
      { width: '75mm', length: '2000mm' },
      { width: '100mm', length: '2000mm' },
      { width: '150mm', length: '2500mm' },
    ],
    technicalData: [
      { label: 'Recommended Speed', value: '15-25 m/s' },
      { label: 'Maximum Speed', value: '35 m/s' },
      { label: 'Operating Pressure', value: 'Low-Medium (15-40 N)' },
      { label: 'Heat Resistance', value: 'Good' },
      { label: 'Storage', value: '15-25°C, 40-65% RH' },
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
    specs: [
      { label: 'Grain Type', value: 'Compact Grain (Multi-Layer)' },
      { label: 'Backing', value: 'Heavy Polyester' },
      { label: 'Bond', value: 'Special Resin System' },
      { label: 'Coating', value: 'Compact Structure' },
      { label: 'Flexibility', value: 'Y-Weight (Stiff)' },
      { label: 'Color', value: 'Dark Blue/Grey' },
    ],
    materials: [
      { name: 'Stainless Steel', rating: 'excellent' },
      { name: 'Carbon Steel', rating: 'excellent' },
      { name: 'Aluminum', rating: 'good' },
      { name: 'Titanium', rating: 'good' },
      { name: 'Hardened Steel', rating: 'good' },
    ],
    grits: ['P60', 'P80', 'P120', 'P180', 'P240'],
    dimensions: [
      { width: '50mm', length: '2000mm' },
      { width: '75mm', length: '2000mm' },
      { width: '100mm', length: '2000mm' },
      { width: '150mm', length: '2500mm' },
    ],
    technicalData: [
      { label: 'Recommended Speed', value: '20-30 m/s' },
      { label: 'Maximum Speed', value: '40 m/s' },
      { label: 'Operating Pressure', value: 'Medium (25-50 N)' },
      { label: 'Heat Resistance', value: 'Very Good' },
      { label: 'Storage', value: '15-25°C, 40-65% RH' },
      { label: 'Shelf Life', value: '3 years' },
    ],
    applications: [
      'High-volume production grinding',
      'Automated finishing lines',
      'Consistent surface preparation',
      'Cost-per-part optimization',
    ],
    brands: ['Hermes', '3M Trizact', 'VSM Compactgrain'],
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
    specs: [
      { label: 'Construction', value: 'Non-Woven Synthetic' },
      { label: 'Backing', value: 'Integrated' },
      { label: 'Abrasive', value: 'Silicon Carbide / Aluminum Oxide' },
      { label: 'Density', value: 'Medium to High' },
      { label: 'Flexibility', value: 'Very High' },
      { label: 'Color', value: 'Maroon / Grey / Blue' },
    ],
    materials: [
      { name: 'Stainless Steel', rating: 'excellent' },
      { name: 'Aluminum', rating: 'excellent' },
      { name: 'Brass/Copper', rating: 'excellent' },
      { name: 'Plastics', rating: 'good' },
      { name: 'Carbon Steel', rating: 'good' },
    ],
    grits: ['Very Fine', 'Fine', 'Medium', 'Coarse'],
    dimensions: [
      { width: '50mm', length: '2000mm' },
      { width: '75mm', length: '2000mm' },
      { width: '100mm', length: '2000mm' },
    ],
    technicalData: [
      { label: 'Recommended Speed', value: '10-20 m/s' },
      { label: 'Maximum Speed', value: '25 m/s' },
      { label: 'Operating Pressure', value: 'Low (10-25 N)' },
      { label: 'Heat Resistance', value: 'Moderate' },
      { label: 'Storage', value: '15-25°C, 40-65% RH' },
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
    specs: [
      { label: 'Grain Type', value: 'Micro-Graded Aluminum Oxide' },
      { label: 'Backing', value: 'Polyester Film (3 mil)' },
      { label: 'Bond', value: 'Resin' },
      { label: 'Coating', value: 'Precision Electrostatic' },
      { label: 'Flexibility', value: 'High' },
      { label: 'Color', value: 'Light Grey / Tan' },
    ],
    materials: [
      { name: 'Hardened Steel', rating: 'excellent' },
      { name: 'Stainless Steel', rating: 'excellent' },
      { name: 'Chrome Plating', rating: 'excellent' },
      { name: 'Glass', rating: 'good' },
      { name: 'Plastics', rating: 'good' },
    ],
    grits: ['P400', 'P600', 'P800', 'P1000', 'P1200', 'P1500', 'P2000', '3µm', '1µm'],
    dimensions: [
      { width: '25mm', length: '762mm' },
      { width: '50mm', length: '1500mm' },
      { width: '75mm', length: '2000mm' },
    ],
    technicalData: [
      { label: 'Recommended Speed', value: '10-18 m/s' },
      { label: 'Maximum Speed', value: '25 m/s' },
      { label: 'Operating Pressure', value: 'Very Low (5-15 N)' },
      { label: 'Heat Resistance', value: 'Moderate' },
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
  specs: [{ label: 'Type', value: 'Abrasive Belt' }],
  materials: [{ name: 'Various', rating: 'good' as const }],
  grits: ['Various'],
  dimensions: [{ width: 'Custom', length: 'Custom' }],
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
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'technical'>('description')

  const nextImage = () => setActiveImage((prev) => (prev + 1) % product.images.length)
  const prevImage = () => setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length)

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
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
            href="/products/abrasive-belts"
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#bb0c15]"
            style={{ color: '#004D8B' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Abrasive Belts
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

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-[#004D8B] transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/#products" className="hover:text-[#004D8B] transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products/abrasive-belts" className="hover:text-[#004D8B] transition-colors">Abrasive Belts</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{product.title}</span>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg mb-4">
              <Image
                src={product.images[activeImage]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all ${
                      activeImage === i ? 'ring-2 ring-[#bb0c15]' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(187,12,21,0.1)', color: '#bb0c15' }}
            >
              <Layers className="w-3.5 h-3.5" />
              {product.subtitle}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {product.longDescription}
            </p>

            {/* Quick Features */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {product.features.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Brands */}
            <div className="mb-8">
              <span className="text-sm font-medium text-gray-500 block mb-2">Available from:</span>
              <div className="flex flex-wrap gap-2">
                {product.brands.map(brand => (
                  <span
                    key={brand}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ background: '#004D8B', color: 'white' }}
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20${encodeURIComponent(product.title)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: '#25D366' }}
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Inquiry
              </a>
              <a
                href="tel:+9613741565"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'white',
                  border: '2px solid #004D8B',
                  color: '#004D8B',
                }}
              >
                <Phone className="w-5 h-5" />
                Call Us
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-1 p-1 rounded-xl bg-gray-100 w-fit">
            {[
              { id: 'description', label: 'Description', icon: FileText },
              { id: 'specs', label: 'Specifications', icon: Settings },
              { id: 'technical', label: 'Technical Data', icon: Gauge },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            {activeTab === 'description' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Product Features</h2>
                <ul className="space-y-4">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6">Applications</h2>
                <ul className="space-y-3">
                  {product.applications.map((app, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <ArrowRight className="w-4 h-4 text-[#bb0c15]" />
                      {app}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Product Specifications</h2>
                <div className="divide-y divide-gray-100">
                  {product.specs.map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-4">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6">Available Grits</h2>
                <div className="flex flex-wrap gap-2">
                  {product.grits.map(grit => (
                    <span
                      key={grit}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700"
                    >
                      {grit}
                    </span>
                  ))}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6">Available Dimensions</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-l-lg">Width</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-r-lg">Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {product.dimensions.map((dim, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 text-gray-600">{dim.width}</td>
                          <td className="px-4 py-3 text-gray-600">{dim.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Technical Data</h2>
                <div className="divide-y divide-gray-100">
                  {product.technicalData.map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-4">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compatible Materials */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#004D8B]" />
                Compatible Materials
              </h3>
              <div className="space-y-3">
                {product.materials.map(({ name, rating }) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{name}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              rating === 'excellent' ? '#10b981' :
                              rating === 'good' && i <= 2 ? '#10b981' :
                              rating === 'suitable' && i <= 1 ? '#10b981' : '#e5e7eb',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Excellent
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="w-2 h-2 rounded-full bg-gray-200" /> Good
                </span>
              </div>
            </div>

            {/* Quick Contact */}
            <div
              className="rounded-2xl p-6"
              style={{ background: '#004D8B' }}
            >
              <h3 className="font-bold text-white mb-2">Need Technical Help?</h3>
              <p className="text-sm text-white/70 mb-4">
                Our experts can help you select the right belt for your application.
              </p>
              <a
                href="https://wa.me/9613741565"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: '#25D366' }}
              >
                <MessageCircle className="w-5 h-5" />
                Chat with Expert
              </a>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product.relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.relatedProducts.map(related => (
                <Link
                  key={related.slug}
                  href={`/products/abrasive-belts/${related.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="relative h-48">
                    <Image
                      src={related.image}
                      alt={related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#004D8B] transition-colors">
                      {related.title}
                    </h3>
                    <span className="text-sm text-[#bb0c15] font-medium flex items-center gap-1 mt-2">
                      View Details <ArrowRight className="w-4 h-4" />
                    </span>
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
    </div>
  )
}
