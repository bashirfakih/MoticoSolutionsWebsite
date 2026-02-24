'use client'

import { useParams, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, MessageCircle } from 'lucide-react'

// Product data for other categories
const products: Record<string, {
  title: string
  category: string
  image: string
  description: string
  features: string[]
}> = {
  'air-power-tools': {
    title: 'Air & Power Tools',
    category: 'Power Equipment',
    image: '/product-air-power-tools.png',
    description: 'Professional-grade pneumatic and electric power tools for industrial applications. From angle grinders to belt sanders, we supply tools that meet the demands of heavy-duty manufacturing.',
    features: [
      'Industrial-grade motors for continuous operation',
      'Ergonomic design reduces operator fatigue',
      'Variable speed control for precision work',
      'Dust extraction compatibility',
      'Full manufacturer warranty',
    ],
  },
  'cutting-discs': {
    title: 'Cutting Discs',
    category: 'Cutting & Grinding',
    image: '/product-cutting-discs.png',
    description: 'Premium cutting discs for clean, fast cuts in metal, stainless steel, and stone. Reinforced construction ensures safety and long service life.',
    features: [
      'Ultra-thin design for minimal material loss',
      'Reinforced with fiberglass mesh',
      'Cool cutting reduces heat-affected zones',
      'EN 12413 certified for safety',
      'Balanced for vibration-free operation',
    ],
  },
  'belt-disc-sanders': {
    title: 'Belt & Disc Sanders',
    category: 'Machines',
    image: '/product-belt-disc-sander.png',
    description: 'Professional belt and disc sanding machines for precision surface finishing. Robust construction for industrial environments.',
    features: [
      'Heavy-duty cast iron construction',
      'Precision-ground tables for accuracy',
      'Variable speed drives',
      'Quick-change belt systems',
      'Integrated dust collection ports',
    ],
  },
  'abrasive-discs': {
    title: 'Abrasive Discs',
    category: 'Grinding',
    image: '/product-abrasive-discs.png',
    description: 'High-performance abrasive discs for angle grinders and sanders. Available in fiber, flap, and quick-change formats.',
    features: [
      'Multiple abrasive types available',
      'Fiber-backed for durability',
      'Flap discs for blending operations',
      'Quick-change mounting options',
      'Full grit range from coarse to fine',
    ],
  },
  'accessories': {
    title: 'Accessories',
    category: 'Consumables',
    image: '/product-accessories.png',
    description: 'Essential accessories and consumables for your abrasive and power tool operations.',
    features: [
      'Backup pads and mandrels',
      'Safety equipment',
      'Dust extraction accessories',
      'Replacement parts',
      'Storage and organization',
    ],
  },
}

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string

  // Redirect abrasive-belts to dedicated page
  if (productId === 'abrasive-belts') {
    redirect('/products/abrasive-belts')
  }

  const product = products[productId] || {
    title: productId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: 'Industrial Supplies',
    image: '/slide-1-grinding.png',
    description: 'High-quality industrial product from Motico Solutions. Contact us for detailed specifications and pricing.',
    features: [
      'Premium quality materials',
      'Industrial-grade durability',
      'Expert technical support',
      'Fast delivery across MENA region',
    ],
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-lg">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
            <div
              className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(0,77,139,0.9)', color: 'white' }}
            >
              {product.category}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Key Features</h2>
              <ul className="space-y-3">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20${encodeURIComponent(product.title)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: '#25D366' }}
              >
                <MessageCircle className="w-5 h-5" />
                Contact Us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-gray-100">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-[#004D8B] transition-colors"
        >
          ← Return to Motico Solutions
        </Link>
      </footer>
    </div>
  )
}
