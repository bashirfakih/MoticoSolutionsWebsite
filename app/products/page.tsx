'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Phone, MessageCircle, Layers, Wrench, Settings, Package, Disc, Scissors, Star, Zap, ShieldCheck, Search, X, Download } from 'lucide-react'

// Product Categories Data with types
const categories = [
  { id: 'abrasive-belts', title: 'Abrasive Belts', icon: Layers, color: '#bb0c15', bg: '/product-abrasive-belts.png', description: 'Premium sanding belts for metal, wood, and composite finishing.', type: 'abrasive', brand: 'Hermes' },
  { id: 'air-power-tools', title: 'Air & Power Tools', icon: Wrench, color: '#004D8B', bg: '/product-air-power-tools.png', description: 'Professional-grade power tools for industrial applications.', type: 'tools', brand: 'DCA' },
  { id: 'belt-disc-sanders', title: 'Belt & Disc Sanders', icon: Settings, color: '#bb0c15', bg: '/product-belt-disc-sander.png', description: 'Heavy-duty sanding machines for production environments.', type: 'machines', brand: 'ZAT' },
  { id: 'stationary-machines', title: 'Stationary Machines', icon: Package, color: '#004D8B', bg: '/product-stationery-machines.png', description: 'Industrial grinding and polishing stations.', type: 'machines', brand: 'Hoffmann' },
  { id: 'grinding-sleeves', title: 'Grinding Sleeves & Wheels', icon: Disc, color: '#bb0c15', bg: '/product-grinding-sleeve-wheels.png', description: 'High-performance grinding consumables for precision work.', type: 'abrasive', brand: 'Eisenblätter' },
  { id: 'abrasive-discs', title: 'Abrasive Discs', icon: Disc, color: '#004D8B', bg: '/product-abrasive-discs.png', description: 'Flap discs, fiber discs, and specialty abrasive discs.', type: 'abrasive', brand: 'Sandwox' },
  { id: 'cutting-discs', title: 'Cutting Discs', icon: Scissors, color: '#bb0c15', bg: '/product-cutting-discs.png', description: 'Precision cutting wheels for metal and masonry.', type: 'abrasive', brand: 'Egeli' },
  { id: 'mounted-points', title: 'Mounted Points & Burrs', icon: Star, color: '#004D8B', bg: '/product-points-burrs.png', description: 'Precision grinding tools for detail work and deburring.', type: 'tools', brand: 'NS' },
  { id: 'hand-finishing', title: 'Hand Finishing Products', icon: Layers, color: '#bb0c15', bg: '/product-hand-finishing-products.png', description: 'Sandpaper, hand pads, and manual finishing tools.', type: 'finishing', brand: '3M' },
  { id: 'polish-care', title: 'Polish & Care Products', icon: ShieldCheck, color: '#004D8B', bg: '/product-polish-care-products.png', description: 'Polishing compounds, waxes, and surface care products.', type: 'finishing', brand: '3M' },
  { id: 'welding', title: 'Welding', icon: Zap, color: '#bb0c15', bg: '/product-welding.png', description: 'Welding consumables and accessories.', type: 'tools', brand: 'Sandwox' },
  { id: 'accessories', title: 'Accessories', icon: Settings, color: '#004D8B', bg: '/product-accessories.png', description: 'Backing pads, adapters, and tool accessories.', type: 'tools', brand: 'Osborn' },
]

// Filter types
const filterTypes = [
  { id: 'all', label: 'All Products' },
  { id: 'abrasive', label: 'Abrasives' },
  { id: 'tools', label: 'Tools' },
  { id: 'machines', label: 'Machines' },
  { id: 'finishing', label: 'Finishing' },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    let result = categories

    // Apply type filter
    if (activeFilter !== 'all') {
      result = result.filter(cat => cat.type === activeFilter)
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(cat =>
        cat.title.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.brand.toLowerCase().includes(q)
      )
    }

    return result
  }, [searchQuery, activeFilter])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
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
          <span className="text-gray-800 font-medium">All Products</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-[320px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#004D8B] to-[#002d52]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/slide-1.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            700+ Products
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Industrial Abrasives & Tools
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-6">
            Browse our complete catalog of premium grinding, sanding, polishing, and cutting solutions.
          </p>
          <a
            href="/catalogs/motico-solutions-catalog-2025.pdf"
            download
            className="inline-flex items-center gap-2 bg-white text-[#004D8B] font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download Full Catalog (PDF)
          </a>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
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

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              {filterTypes.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  style={{
                    background: activeFilter === filter.id ? '#004D8B' : 'white',
                    color: activeFilter === filter.id ? 'white' : '#4b5563',
                    border: activeFilter === filter.id ? '2px solid #004D8B' : '2px solid #e5e7eb',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredCategories.length} of {categories.length} categories
            {searchQuery && <span> for &ldquo;{searchQuery}&rdquo;</span>}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Link
                    key={category.id}
                    href={`/products/${category.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                    style={{
                      animation: 'fadeIn 0.3s ease-out',
                    }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <Image
                        src={category.bg}
                        alt={category.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Icon Badge */}
                      <div
                        className="absolute top-3 left-3 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: category.color }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {/* Brand Badge */}
                      <div
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase"
                        style={{ background: 'rgba(255,255,255,0.95)', color: '#004D8B' }}
                      >
                        {category.brand}
                      </div>
                    </div>
                    {/* Info Panel */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-800 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed flex-1">
                        {category.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-blue-800 font-semibold text-sm group-hover:underline">
                          Browse Products →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActiveFilter('all')
                }}
                className="px-6 py-2.5 rounded-full font-semibold text-white transition-all"
                style={{ background: '#004D8B' }}
              >
                Clear filters
              </button>
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
          <h2 className="text-3xl font-extrabold text-white mb-3">Can&apos;t Find What You Need?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Our team can help you find the right product for your specific application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/9613741565?text=Hello!%20I'm%20looking%20for%20a%20specific%20product."
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
