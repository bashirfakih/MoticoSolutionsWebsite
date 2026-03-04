'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  ArrowLeft, CheckCircle, ChevronLeft, ChevronRight,
  MessageCircle, Loader2, Package, X, ZoomIn,
} from 'lucide-react'

// Types
interface ProductImage {
  id: string
  url: string
  alt: string | null
  isPrimary: boolean
}

interface Specification {
  id: string
  key: string
  value: string
}

interface Brand {
  id: string
  name: string
  logo: string | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string | null
  shortDescription: string | null
  features: string[]
  price: number | null
  compareAtPrice: number | null
  currency: string
  images: ProductImage[]
  specifications: Specification[]
  brand: Brand | null
  category: Category | null
  // Quick Specs
  showDimensions?: boolean
  dimensions?: string | null
  showSizes?: boolean
  sizes?: string | null
  showGrits?: boolean
  grits?: string | null
}

const DEFAULT_IMAGE = '/images/slides/slide-1.png'

export default function ProductDetailPage() {
  const params = useParams()
  const categorySlug = params.slug as string
  const productSlug = params.product as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Fetch product from database
  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/products/slug/${encodeURIComponent(productSlug)}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found')
          } else {
            setError('Failed to load product')
          }
          return
        }

        const data = await response.json()
        setProduct(data)
      } catch (err) {
        console.error('Failed to load product:', err)
        setError('Failed to load product. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (productSlug) {
      loadProduct()
    }
  }, [productSlug])

  const images = product?.images?.length ? product.images.map(img => img.url) : [DEFAULT_IMAGE]

  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length)
  const prevImage = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-800 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            href={`/products/category/${categorySlug}`}
            className="px-6 py-2.5 rounded-full font-semibold text-white bg-[#004D8B] hover:bg-[#003a6a] transition-all inline-block"
          >
            Back to Category
          </Link>
        </div>
      </div>
    )
  }

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
            href={`/products/category/${categorySlug}`}
            className="flex items-center gap-2 text-sm font-medium transition-all hover:gap-3"
            style={{ color: '#004D8B' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {product.category?.name || 'Products'}
          </Link>
          <Link href="/">
            <Image
              src="/images/logos/company/logo-motico-solutions.png"
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
                src={images[activeImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />
              {/* Zoom Indicator */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </div>
              {/* Navigation Arrows */}
              {images.length > 1 && (
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
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 text-white text-sm font-medium">
                  {activeImage + 1} / {images.length}
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 justify-center">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImage
                        ? 'border-blue-600 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* SKU */}
            <p className="text-sm text-gray-400 mb-2">SKU: {product.sku}</p>

            {/* Brand */}
            {product.brand && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-blue-800">{product.brand.name}</span>
              </div>
            )}

            {/* Title */}
            <h1
              className="font-black leading-tight mb-4"
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {product.shortDescription || product.description || 'Contact us for product details.'}
            </p>

            {/* Quick Specs - Dropdown Selectors */}
            {(product.showDimensions || product.showSizes || product.showGrits) && (
              <div className="mb-8 space-y-4">
                {product.showDimensions && product.dimensions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Dimensions:
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#004D8B] focus:border-[#004D8B] cursor-pointer"
                      defaultValue={product.dimensions.split(',')[0]?.trim()}
                    >
                      {product.dimensions.split(',').map((dim, idx) => (
                        <option key={idx} value={dim.trim()}>
                          {dim.trim()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {product.showSizes && product.sizes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Size:
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#004D8B] focus:border-[#004D8B] cursor-pointer"
                      defaultValue={product.sizes.split(',')[0]?.trim()}
                    >
                      {product.sizes.split(',').map((size, idx) => (
                        <option key={idx} value={size.trim()}>
                          {size.trim()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {product.showGrits && product.grits && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Grit:
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#004D8B] focus:border-[#004D8B] cursor-pointer"
                      defaultValue={product.grits.split(',')[0]?.trim()}
                    >
                      {product.grits.split(',').map((grit, idx) => (
                        <option key={idx} value={grit.trim()}>
                          {grit.trim()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Key Features</h3>
                <ul className="grid grid-cols-1 gap-3">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Price */}
            {product.price && (
              <div className="mb-8">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-[#004D8B]">
                    {product.currency === 'USD' ? '$' : product.currency} {product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-xl text-gray-400 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20${encodeURIComponent(product.name)}%20(${product.sku}).`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-6 h-6" />
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <section className="mb-16">
            <h2
              className="font-bold text-2xl mb-8"
              style={{ color: '#004D8B' }}
            >
              Technical Specifications
            </h2>
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="divide-y divide-gray-200">
                {product.specifications.map((spec) => (
                  <div key={spec.id} className="flex">
                    <div className="w-1/3 px-6 py-4 bg-gray-100 font-medium text-gray-700">
                      {spec.key}
                    </div>
                    <div className="w-2/3 px-6 py-4 text-gray-900">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Full Description */}
        {product.description && (
          <section className="mb-16">
            <h2
              className="font-bold text-2xl mb-6"
              style={{ color: '#004D8B' }}
            >
              Product Description
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          </section>
        )}
      </main>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative w-full max-w-5xl aspect-[4/3] mx-4">
            <Image
              src={images[activeImage]}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Contact CTA */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-3">Need More Information?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Our technical team can help you with specifications and applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/9613741565?text=Hello!%20I%20have%20a%20question%20about%20${encodeURIComponent(product.name)}.`}
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
              Call: +961 3 741 565
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <Link href="/" className="text-white font-semibold text-base hover:text-red-400 transition-colors">
            Motico Solutions
          </Link>
          <p className="text-gray-500">Industrial Abrasives & Tools — Beirut, Lebanon</p>
          <div className="flex gap-6">
            <Link href="/products" className="hover:text-white transition-colors">All Products</Link>
            <a href="tel:+9613741565" className="hover:text-white transition-colors">+961 3 741 565</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
