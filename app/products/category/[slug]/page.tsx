'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Phone, MessageCircle, Package, Search, X, Loader2, Filter } from 'lucide-react'

// Types
interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
}

interface Brand {
  id: string
  name: string
  slug: string
}

interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

interface Product {
  id: string
  sku: string
  name: string
  slug: string
  shortDescription: string | null
  description: string
  price: number | null
  compareAtPrice: number | null
  currency: string
  isPublished: boolean
  isFeatured: boolean
  isNew: boolean
  category: Category
  brand: Brand
  images: ProductImage[]
}

// Default images
const DEFAULT_PRODUCT_IMAGE = '/slide-1-grinding.png'
const DEFAULT_CATEGORY_IMAGE = '/slide-1-grinding.png'

export default function CategoryProductsPage() {
  const params = useParams()
  const categorySlug = params.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'newest'>('newest')

  // Fetch category and products
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch category by slug
        const catResponse = await fetch(`/api/categories/slug/${encodeURIComponent(categorySlug)}`)

        if (catResponse.status === 404) {
          setError('Category not found')
          setIsLoading(false)
          return
        }

        if (!catResponse.ok) throw new Error('Failed to load category')

        const foundCategory = await catResponse.json()
        setCategory(foundCategory)

        // Fetch products for this category
        const productsResponse = await fetch(
          `/api/products?categoryId=${foundCategory.id}&published=true&limit=100`
        )
        if (!productsResponse.ok) throw new Error('Failed to load products')

        const productsData = await productsResponse.json()
        setProducts(productsData.data || [])
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load products. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (categorySlug) {
      loadData()
    }
  }, [categorySlug])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(product =>
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(q)) ||
        product.brand.name.toLowerCase().includes(q)
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'newest':
      default:
        // Keep original order (newest first from API)
        break
    }

    return result
  }, [products, searchQuery, sortBy])

  // Get primary image for a product
  const getPrimaryImage = (product: Product): string => {
    const primary = product.images.find(img => img.isPrimary)
    return primary?.url || product.images[0]?.url || DEFAULT_PRODUCT_IMAGE
  }

  // Format price
  const formatPrice = (price: number | null, currency: string): string => {
    if (price === null) return 'Contact for Price'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            All Categories
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
      <nav className="bg-gray-50 border-b border-gray-200 px-6 py-2.5 text-sm text-gray-500" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/products" className="hover:text-blue-700 transition-colors">Products</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-medium">{category?.name || 'Loading...'}</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-[320px] flex items-center justify-center overflow-hidden">
        <Image
          src={category?.image || DEFAULT_CATEGORY_IMAGE}
          alt={category?.name || 'Category'}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            {products.length} Products
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {category?.name || 'Products'}
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            {category?.description || 'Browse our selection of quality products.'}
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                aria-label="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004D8B] focus:border-transparent transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              >
                <option value="newest">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-500">
            {isLoading ? (
              'Loading products...'
            ) : (
              <>
                Showing {filteredProducts.length} of {products.length} products
                {searchQuery && <span> for &ldquo;{searchQuery}&rdquo;</span>}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-[#004D8B] animate-spin mb-4" />
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {error === 'Category not found' ? 'Category Not Found' : 'Failed to Load'}
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                href="/products"
                className="px-6 py-2.5 rounded-full font-semibold text-white transition-all bg-[#004D8B] hover:bg-[#003a6a] inline-block"
              >
                Browse All Categories
              </Link>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <Image
                      src={getPrimaryImage(product)}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.isNew && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                          New
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                      {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
                        <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                          Sale
                        </span>
                      )}
                    </div>
                    {/* Brand Badge */}
                    <div
                      className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase"
                      style={{ background: 'rgba(255,255,255,0.95)', color: '#004D8B' }}
                    >
                      {product.brand.name}
                    </div>
                  </div>

                  {/* Info Panel */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-gray-400 mb-1">{product.sku}</p>
                    <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-blue-800 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-2">
                      {product.shortDescription || product.description}
                    </p>

                    {/* Price */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="font-bold text-[#004D8B]">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.compareAtPrice, product.currency)}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-4">
                      <a
                        href={`https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20${encodeURIComponent(product.name)}%20(${product.sku}).`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg transition-colors text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Inquire Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? 'Try adjusting your search criteria.'
                  : 'No products are currently available in this category.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2.5 rounded-full font-semibold text-white transition-all bg-[#004D8B] hover:bg-[#003a6a]"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
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
            Our technical team can help you select the perfect product for your application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20your%20${encodeURIComponent(category?.name || 'products')}.`}
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
            <Link href="/products" className="hover:text-white transition-colors">All Products</Link>
            <a href="tel:+9613741565" className="hover:text-white transition-colors">+961 3 741 565</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
