'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft, CheckCircle, ChevronLeft, ChevronRight,
  MessageCircle, Download, ArrowRight, Disc, X, ZoomIn,
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
  'zirconium-grinding-sleeve': {
    title: 'POLY PTX Zirconium Grinding Sleeve',
    subtitle: 'Heavy-Duty Grinding',
    description: 'High-quality zircon fabric for removing deep scratches, rust, scale and weld seams.',
    longDescription: 'Abrasive sleeves made of high-quality zircon fabric for removing deep scratches, rust, scale and weld seams. These professional-grade grinding sleeves deliver a strong line finish and are ideal for stainless steel and steel applications. Only to be used with suitable expansion roller.',
    images: [
      '/product-zirconium-grinding-sleeve-1.jpg',
      '/product-zirconium-grinding-sleeve-2.jpg',
      '/product-zirconium-grinding-sleeve-3.jpg',
    ],
    features: [
      'High-tech zircon fabric construction',
      'Removes deep scratches efficiently',
      'Ideal for rust and scale removal',
      'Weld seam grinding and blending',
      'Creates strong line finish',
      'Compatible with multiple PTX machines',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Grinding Sleeves' },
      { label: 'Dimensions', value: '90 x 50 mm, 90 x 100 mm' },
      { label: 'Available Grits', value: '40, 60, 80, 120, 150, 180' },
      { label: 'Workable Materials', value: 'Stainless Steel, Steel' },
      { label: 'Tool Mount', value: 'Expansion Roller' },
      { label: 'Packing Unit', value: 'Piece' },
      { label: 'Min. Purchase', value: '10 pieces' },
      { label: 'Purchase Steps', value: '10 pieces' },
    ],
    applications: [
      'Removing deep scratches',
      'Rust and scale removal',
      'Weld seam grinding',
      'Surface preparation on steel',
      'Stainless steel finishing',
    ],
    brands: ['Eisenblätter POLY PTX'],
    relatedProducts: [
      { slug: 'trizact-sleeve', title: 'Trizact™ Sleeve', image: '/product-trizact-sleeve-1.jpg' },
      { slug: 'sc-fleece-sleeves', title: 'SC Fleece Sleeves', image: '/product-sc-fleece-sleeves-1.jpg' },
    ],
  },
  'trizact-sleeve': {
    title: 'POLY PTX Trizact™ Sleeve',
    subtitle: 'High Removal & Fine Finish',
    description: 'Pyramid-shaped grain structure for high material removal with very fine grinding.',
    longDescription: 'Saves several work steps thanks to high material removal with very fine grinding and simultaneous removal of scratches and weld spots. The ideal start for a later mirror polish. Features abrasive cloth with pyramid-shaped grain structure and additional heat-insulating layer.',
    images: [
      '/product-trizact-sleeve-1.jpg',
      '/product-trizact-sleeve-2.jpg',
      '/product-trizact-sleeve-3.jpg',
    ],
    features: [
      'Pyramid-shaped grain structure',
      'High material removal with fine finish',
      'Heat-insulating layer',
      'Ideal preparation for mirror polish',
      'Leaves very minor roughness',
      'Multiple work steps in one',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Grinding Sleeves' },
      { label: 'Dimensions', value: '90 x 50 mm, 90 x 100 mm' },
      { label: 'Tool Mount', value: 'Expansion Roller' },
      { label: 'Technology', value: '3M Trizact™' },
    ],
    applications: [
      'Fine grinding with high removal',
      'Scratch and weld spot removal',
      'Preparation for mirror polish',
      'Surface refinement',
    ],
    brands: ['Eisenblätter POLY PTX'],
    relatedProducts: [
      { slug: 'zirconium-grinding-sleeve', title: 'Zirconium Grinding Sleeve', image: '/product-zirconium-grinding-sleeve-1.jpg' },
      { slug: 'superpolish-polishing-sleeve', title: 'SuperPolish Sleeve', image: '/product-superpolish-sleeve-1.jpg' },
    ],
  },
  'sc-fleece-sleeves': {
    title: 'POLY PTX SC Fleece Sleeves',
    subtitle: 'Surface Conditioning',
    description: 'Technical fleece for removing oxide layers, deburring, fine grinding, and decorative satin finishing.',
    longDescription: 'Technical surface conditioning fleece ideally suited for removing oxide layers, deburring and fine grinding. Also excellent for decorative satin and longitudinal sanding while removing slight scratches. High-quality SC fleece material with reinforcing fabric for extremely long service life.',
    images: [
      '/product-sc-fleece-sleeves-1.jpg',
      '/product-sc-fleece-sleeves-2.jpg',
      '/product-sc-fleece-sleeves-3.jpg',
    ],
    features: [
      'Surface conditioning (SC) fleece material',
      'Reinforcing fabric for long service life',
      'Fine sanding in all grit sizes',
      'Achieves matt gloss finish',
      'Removes slight scratches',
      'Ideal for satin finishing',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Fleece Sleeves' },
      { label: 'Dimensions', value: '90 x 50 mm, 90 x 100 mm' },
      { label: 'Tool Mount', value: 'Expansion Roller' },
      { label: 'Material', value: 'SC Fleece with reinforcing fabric' },
    ],
    applications: [
      'Removing oxide layers',
      'Deburring',
      'Fine grinding',
      'Decorative satin finishing',
      'Longitudinal sanding',
    ],
    brands: ['Eisenblätter POLY PTX'],
    relatedProducts: [
      { slug: 'superpolish-polishing-sleeve', title: 'SuperPolish Sleeve', image: '/product-superpolish-sleeve-1.jpg' },
      { slug: 'eco-smart-fleece-wheel', title: 'Eco Smart Fleece Wheel', image: '/product-eco-smart-fleece-wheel-1.jpg' },
    ],
  },
  'superpolish-polishing-sleeve': {
    title: 'POLY PTX SuperPolish Polishing Sleeve',
    subtitle: 'Mirror Shine Finish',
    description: 'Revolutionary special fleece achieving brilliant mirror shine on stainless steel and non-ferrous metals.',
    longDescription: 'Revolutionary special fleece. In combination with polishing pastes and creams, achieves a brilliant mirror shine on VA and non-ferrous metals without streaks and shadows. Ideal for use with polishing machines and hand-held longitudinal sanders. Always use an extra sleeve for each paste/cream to avoid mixing grain sizes.',
    images: [
      '/product-superpolish-sleeve-1.jpg',
      '/product-superpolish-sleeve-2.jpg',
    ],
    features: [
      'Revolutionary special fleece',
      'Brilliant mirror shine results',
      'No streaks or shadows',
      'Works with polishing pastes and creams',
      'For stainless steel and non-ferrous metals',
      'Compatible with polishing machines',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Polishing Sleeve' },
      { label: 'Dimensions', value: '90 x 50 mm, 90 x 100 mm' },
      { label: 'Ideal Speed', value: '1,000–3,000 min⁻¹' },
      { label: 'Max Speed', value: '5,000 min⁻¹' },
      { label: 'Tool Mount', value: 'Expansion Roller' },
    ],
    applications: [
      'Mirror polishing on stainless steel',
      'Non-ferrous metal polishing',
      'Final polish finishing',
      'Streak-free shine',
    ],
    brands: ['Eisenblätter POLY PTX'],
    relatedProducts: [
      { slug: 'cotton-polishing-rings', title: 'Cotton Polishing Rings', image: '/product-cotton-polishing-rings-1.jpg' },
      { slug: 'trizact-sleeve', title: 'Trizact™ Sleeve', image: '/product-trizact-sleeve-1.jpg' },
    ],
  },
  'cotton-polishing-rings': {
    title: 'POLY PTX Cotton & Mirror Finish Polishing Rings',
    subtitle: 'High-Gloss Polishing',
    description: 'Buffing discs for high-gloss polishing with pastes and creams on flat and uneven surfaces.',
    longDescription: 'High-quality polishing rings (buffing discs) for high-gloss polishing with polishing pastes and creams on flat and uneven surfaces without scratches and streaks. Cotton rings (impregnated) are ideal for main polishing of non-ferrous metals; mirror finish rings for stainless steel and final mirror finish.',
    images: [
      '/product-cotton-polishing-rings-1.jpg',
      '/product-cotton-polishing-rings-2.jpg',
      '/product-cotton-polishing-rings-3.jpg',
    ],
    features: [
      'High-quality cotton (impregnated)',
      'Open folding design for shape adaptation',
      'No additional seams',
      'Scratch and streak-free results',
      'Available in cotton and mirror finish versions',
      '8 pieces for full 100mm shaft assembly',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Polishing Rings' },
      { label: 'Dimensions', value: '100 x 10 mm' },
      { label: 'Ideal Speed', value: '1,000–3,000 min⁻¹' },
      { label: 'Max Speed', value: '5,000 min⁻¹' },
      { label: 'Pieces per Shaft', value: '8 pieces for 100mm' },
    ],
    applications: [
      'High-gloss polishing',
      'Aluminum polishing',
      'Brass polishing',
      'Stainless steel mirror finish',
      'Non-ferrous metal finishing',
    ],
    brands: ['Eisenblätter POLY PTX'],
    relatedProducts: [
      { slug: 'superpolish-polishing-sleeve', title: 'SuperPolish Sleeve', image: '/product-superpolish-sleeve-1.jpg' },
      { slug: 'eco-smart-fleece-wheel', title: 'Eco Smart Fleece Wheel', image: '/product-eco-smart-fleece-wheel-1.jpg' },
    ],
  },
  'eco-smart-flap-wheel': {
    title: 'POLY PTX Eco Smart Flap Wheel',
    subtitle: 'Rust & Paint Removal',
    description: 'Elastic abrasive flap wheel for removing rust, oxide layers, paint, scratches and strong structuring.',
    longDescription: 'Elastic abrasive flap wheel (flap sander) with quick-release mount for removing rust, oxide layers, paint, scratches and for strong structuring and satin finishing of metals. High-quality aluminum oxide fabric for high removal rate and long service life.',
    images: [
      '/product-eco-smart-flap-wheel-1.jpg',
    ],
    features: [
      'High-quality aluminum oxide fabric',
      'High removal rate',
      'Long service life',
      'Eco Smart mount for vibration-free work',
      '100% concentricity',
      'Cost-effective (no inner core costs)',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Flap Wheel' },
      { label: 'Material', value: 'Aluminum Oxide Fabric' },
      { label: 'Ideal Speed', value: '1,000–2,000 min⁻¹' },
      { label: 'Max Speed', value: '5,000 min⁻¹' },
      { label: 'Mount', value: 'Eco Smart Holder' },
    ],
    applications: [
      'Rust removal',
      'Oxide layer removal',
      'Paint stripping',
      'Scratch removal',
      'Strong structuring',
      'Satin finishing',
    ],
    brands: ['Eisenblätter POLY PTX'],
    relatedProducts: [
      { slug: 'eco-smart-combi-fleece-wheel', title: 'Eco Smart Combi Wheel', image: '/product-eco-smart-combi-wheel-1.jpg' },
      { slug: 'eco-smart-fleece-wheel', title: 'Eco Smart Fleece Wheel', image: '/product-eco-smart-fleece-wheel-1.jpg' },
    ],
  },
  'eco-smart-combi-fleece-wheel': {
    title: 'POLY PTX Eco Smart Combi-Fleece Mix Wheel',
    subtitle: 'Metal & Wood',
    description: 'Nylon fleece with corundum abrasive for matting, satin finishing, and surface smoothing on metal and wood.',
    longDescription: 'Versatile wheel for both metal and wood applications. Metal: Matting, satin finishing, removal of light scratches, rust, oxide. Wood: Smoothing surfaces, removing old paint and dirt. High-quality nylon fleece with corundum abrasive fabric for even use over entire service life.',
    images: [
      '/product-eco-smart-combi-wheel-1.jpg',
    ],
    features: [
      'Nylon fleece with corundum abrasive',
      'Versatile for metal and wood',
      'Higher removal than pure fleece wheels',
      'Eco Smart mount for vibration-free work',
      '100% concentricity',
      'Even wear over service life',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Combi-Fleece Mix Wheel' },
      { label: 'Material', value: 'Nylon Fleece + Corundum Fabric' },
      { label: 'Ideal Speed', value: '1,000–2,000 min⁻¹' },
      { label: 'Max Speed', value: '5,000 min⁻¹' },
      { label: 'Mount', value: 'Eco Smart Holder' },
      { label: 'Applications', value: 'Metal, Wood' },
    ],
    applications: [
      'Matting and satin finishing',
      'Light scratch removal',
      'Rust and oxide removal',
      'Wood surface smoothing',
      'Old paint removal',
    ],
    brands: ['Eisenblätter POLY PTX'],
    relatedProducts: [
      { slug: 'eco-smart-flap-wheel', title: 'Eco Smart Flap Wheel', image: '/product-eco-smart-flap-wheel-1.jpg' },
      { slug: 'eco-smart-fleece-wheel', title: 'Eco Smart Fleece Wheel', image: '/product-eco-smart-fleece-wheel-1.jpg' },
    ],
  },
  'eco-smart-fleece-wheel': {
    title: 'POLY PTX Eco Smart Fleece Wheel',
    subtitle: 'Industrial Finish',
    description: 'Shadow-free industrial finish for matting, satin finishing, pre-polishing and surface smoothing.',
    longDescription: 'Generates a shadow-free industrial finish (matting, satin finishing). Also for pre-polishing, removing oxide layers, aligning pre-ground sheets and smoothing surfaces. Very high quality non-woven fabric for particularly long service life.',
    images: [
      '/product-eco-smart-fleece-wheel-1.jpg',
      '/product-eco-smart-fleece-wheel-2.jpg',
    ],
    features: [
      'Very high quality non-woven fabric',
      'Shadow-free industrial finish',
      'Particularly long service life',
      'Eco Smart mount for vibration-free work',
      '100% concentricity',
      'Cost-effective design',
    ],
    technicalData: [
      { label: 'Product Type', value: 'Fleece Wheel' },
      { label: 'Material', value: 'High-Quality Non-Woven Fabric' },
      { label: 'Ideal Speed', value: '1,000–2,000 min⁻¹' },
      { label: 'Max Speed', value: '5,000 min⁻¹' },
      { label: 'Mount', value: 'Eco Smart Holder' },
    ],
    applications: [
      'Matting and satin finishing',
      'Pre-polishing',
      'Oxide layer removal',
      'Sheet alignment',
      'Surface smoothing',
    ],
    brands: ['Eisenblätter POLY PTX'],
    relatedProducts: [
      { slug: 'eco-smart-flap-wheel', title: 'Eco Smart Flap Wheel', image: '/product-eco-smart-flap-wheel-1.jpg' },
      { slug: 'sc-fleece-sleeves', title: 'SC Fleece Sleeves', image: '/product-sc-fleece-sleeves-1.jpg' },
    ],
  },
}

// Default product for unknown slugs
const defaultProduct = {
  title: 'Grinding Sleeve',
  subtitle: 'Industrial Quality',
  description: 'High-quality grinding sleeve for industrial applications.',
  longDescription: 'Contact us for detailed product specifications.',
  images: ['/product-grinding-sleeve-wheels.png'],
  features: ['Premium quality', 'Industrial grade'],
  technicalData: [{ label: 'Contact us', value: 'for specifications' }],
  applications: ['Contact us for applications'],
  brands: ['Multiple brands available'],
  relatedProducts: [],
}

export default function GrindingSleeveProductPage() {
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
            href="/products/grinding-sleeves"
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
              <Disc className="w-4 h-4" />
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

            {/* Compatible Machines */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Compatible Machines</h3>
              <div className="flex flex-wrap gap-2">
                {['MULTI MAX', 'POLY-PTX 300', 'POLY-PTX 500', 'POLY-PTX 800', 'POLY-PTX 802 HT', 'POLY-PTX AKKU HT', 'PTX COMPACT HT'].map((machine) => (
                  <span
                    key={machine}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-[#004D8B]"
                  >
                    {machine}
                  </span>
                ))}
              </div>
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

            {/* Applications */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Applications</h3>
              <div className="space-y-2">
                {product.applications.map((app, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#bb0c15]" />
                    <span className="text-gray-600">{app}</span>
                  </div>
                ))}
              </div>
            </div>
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
                  href={`/products/grinding-sleeves/${related.slug}`}
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
          href="/products/grinding-sleeves"
          className="text-sm text-gray-400 hover:text-[#004D8B] transition-colors"
        >
          ← Back to Grinding Sleeves Collection
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
