'use client'

import { useParams, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Phone, MessageCircle } from 'lucide-react'

// Badge color mapping
const badgeColorMap: Record<string, string> = {
  "Best Seller": "bg-red-600",
  "Popular": "bg-blue-600",
  "Premium": "bg-amber-500",
  "New": "bg-emerald-600",
}

// Product data for all categories
const categoryData: Record<string, {
  title: string
  heroTitle: string
  heroAccent: string
  heroDescription: string
  heroImage: string
  categories: string[]
  products: {
    slug: string
    name: string
    category: string
    description: string
    image: string
    badge: string | null
  }[]
}> = {
  'air-power-tools': {
    title: 'Air & Power Tools',
    heroTitle: 'Power',
    heroAccent: 'Tools',
    heroDescription: 'Professional-grade pneumatic and electric power tools for industrial applications.',
    heroImage: '/product-air-power-tools.png',
    categories: ['All', 'Angle Grinders', 'Belt Sanders', 'Polishers', 'Pneumatic'],
    products: [
      { slug: 'angle-grinder-125mm', name: '125mm Angle Grinder', category: 'Angle Grinders', description: 'Heavy-duty 125mm angle grinder for cutting and grinding applications.', image: '/product-air-power-tools.png', badge: 'Best Seller' },
      { slug: 'belt-sander-pro', name: 'Professional Belt Sander', category: 'Belt Sanders', description: 'Variable speed belt sander for precision surface finishing.', image: '/product-air-power-tools.png', badge: 'Popular' },
      { slug: 'pneumatic-grinder', name: 'Pneumatic Die Grinder', category: 'Pneumatic', description: 'High-speed pneumatic die grinder for detailed work.', image: '/product-air-power-tools.png', badge: null },
      { slug: 'rotary-polisher', name: 'Rotary Polisher', category: 'Polishers', description: 'Professional rotary polisher for mirror finish results.', image: '/product-air-power-tools.png', badge: null },
    ],
  },
  'belt-disc-sanders': {
    title: 'Belt & Disc Sanders',
    heroTitle: 'Belt & Disc',
    heroAccent: 'Sanders',
    heroDescription: 'Professional belt and disc sanding machines for precision surface finishing.',
    heroImage: '/product-belt-disc-sander.png',
    categories: ['All', 'Combination', 'Belt Sanders', 'Disc Sanders'],
    products: [
      { slug: 'combo-sander-200', name: 'Combination Sander 200mm', category: 'Combination', description: 'Belt and disc combination sander with tilting table.', image: '/product-belt-disc-sander.png', badge: 'Best Seller' },
      { slug: 'belt-sander-150', name: '150mm Belt Sander', category: 'Belt Sanders', description: 'Industrial belt sander with variable speed control.', image: '/product-belt-disc-sander.png', badge: null },
      { slug: 'disc-sander-300', name: '300mm Disc Sander', category: 'Disc Sanders', description: 'Heavy-duty disc sander for flat surface finishing.', image: '/product-belt-disc-sander.png', badge: 'Premium' },
    ],
  },
  'stationery-machines': {
    title: 'Stationery Machines',
    heroTitle: 'Stationery',
    heroAccent: 'Machines',
    heroDescription: 'Industrial stationery grinding, polishing and finishing machines.',
    heroImage: '/product-stationery-machines.png',
    categories: ['All', 'Grinders', 'Polishers', 'Multi-Purpose'],
    products: [
      { slug: 'bench-grinder-200', name: '200mm Bench Grinder', category: 'Grinders', description: 'Heavy-duty bench grinder with dual wheels.', image: '/product-stationery-machines.png', badge: 'Popular' },
      { slug: 'polishing-machine', name: 'Industrial Polishing Machine', category: 'Polishers', description: 'Double-ended polishing machine for metal finishing.', image: '/product-stationery-machines.png', badge: null },
      { slug: 'multi-station', name: 'Multi-Station Finishing Center', category: 'Multi-Purpose', description: 'Versatile finishing center with multiple work stations.', image: '/product-stationery-machines.png', badge: 'Premium' },
    ],
  },
  'abrasive-discs': {
    title: 'Abrasive Discs',
    heroTitle: 'Abrasive',
    heroAccent: 'Discs',
    heroDescription: 'High-performance abrasive discs for angle grinders and sanders.',
    heroImage: '/product-abrasive-discs.png',
    categories: ['All', 'Fiber Discs', 'Flap Discs', 'Quick-Change', 'Velcro'],
    products: [
      { slug: 'fiber-disc-ceramic', name: 'Ceramic Fiber Disc', category: 'Fiber Discs', description: 'Self-sharpening ceramic grain for aggressive material removal.', image: '/product-abrasive-discs.png', badge: 'Best Seller' },
      { slug: 'flap-disc-zirconia', name: 'Zirconia Flap Disc', category: 'Flap Discs', description: 'Long-lasting flap disc for blending and finishing.', image: '/product-abrasive-discs.png', badge: 'Popular' },
      { slug: 'quick-change-disc', name: 'Quick-Change Sanding Disc', category: 'Quick-Change', description: 'Roloc-style disc for fast changeovers.', image: '/product-abrasive-discs.png', badge: null },
      { slug: 'velcro-disc-set', name: 'Velcro Disc Set', category: 'Velcro', description: 'Hook and loop discs in assorted grits.', image: '/product-abrasive-discs.png', badge: null },
    ],
  },
  'cutting-discs': {
    title: 'Cutting Discs',
    heroTitle: 'Cutting',
    heroAccent: 'Discs',
    heroDescription: 'Premium cutting discs for clean, fast cuts in metal, stainless steel, and stone.',
    heroImage: '/product-cutting-discs.png',
    categories: ['All', 'Metal', 'Stainless Steel', 'Stone', 'Multi-Material'],
    products: [
      { slug: 'ultra-thin-metal', name: 'Ultra-Thin Metal Cutting Disc', category: 'Metal', description: '1mm thin disc for minimal material loss and fast cutting.', image: '/product-cutting-discs.png', badge: 'Best Seller' },
      { slug: 'inox-cutting-disc', name: 'INOX Stainless Steel Disc', category: 'Stainless Steel', description: 'Iron-free disc designed for stainless steel applications.', image: '/product-cutting-discs.png', badge: 'Popular' },
      { slug: 'diamond-stone-disc', name: 'Diamond Stone Cutting Disc', category: 'Stone', description: 'Segmented diamond disc for concrete and masonry.', image: '/product-cutting-discs.png', badge: 'Premium' },
      { slug: 'multi-material-disc', name: 'Multi-Material Cutting Disc', category: 'Multi-Material', description: 'Versatile disc for various materials.', image: '/product-cutting-discs.png', badge: null },
    ],
  },
  'mounted-points': {
    title: 'Mounted Points & Burrs',
    heroTitle: 'Mounted Points',
    heroAccent: '& Burrs',
    heroDescription: 'Precision grinding and deburring tools for detailed work.',
    heroImage: '/product-points-burrs.png',
    categories: ['All', 'Aluminum Oxide', 'Silicon Carbide', 'Carbide Burrs', 'Diamond'],
    products: [
      { slug: 'ao-mounted-point-set', name: 'Aluminum Oxide Point Set', category: 'Aluminum Oxide', description: 'Assorted shapes for general purpose grinding.', image: '/product-points-burrs.png', badge: 'Popular' },
      { slug: 'sc-mounted-points', name: 'Silicon Carbide Points', category: 'Silicon Carbide', description: 'For grinding hard materials and ceramics.', image: '/product-points-burrs.png', badge: null },
      { slug: 'carbide-burr-set', name: 'Carbide Burr Set', category: 'Carbide Burrs', description: 'Double-cut carbide burrs for fast material removal.', image: '/product-points-burrs.png', badge: 'Best Seller' },
      { slug: 'diamond-points', name: 'Diamond Mounted Points', category: 'Diamond', description: 'For precision work on hardened materials.', image: '/product-points-burrs.png', badge: 'Premium' },
    ],
  },
  'hand-finishing': {
    title: 'Hand Finishing Products',
    heroTitle: 'Hand',
    heroAccent: 'Finishing',
    heroDescription: 'Manual finishing tools for detailed surface preparation and polishing.',
    heroImage: '/product-hand-finishing-products.png',
    categories: ['All', 'Sanding Blocks', 'Hand Pads', 'Files', 'Specialty'],
    products: [
      { slug: 'sanding-block-kit', name: 'Sanding Block Kit', category: 'Sanding Blocks', description: 'Ergonomic blocks with assorted grit papers.', image: '/product-hand-finishing-products.png', badge: 'Popular' },
      { slug: 'scotch-brite-pads', name: 'Scotch-Brite Hand Pads', category: 'Hand Pads', description: 'Non-woven pads for surface conditioning.', image: '/product-hand-finishing-products.png', badge: 'Best Seller' },
      { slug: 'precision-files', name: 'Precision File Set', category: 'Files', description: 'Swiss-pattern files for detailed work.', image: '/product-hand-finishing-products.png', badge: null },
      { slug: 'emery-cloth-rolls', name: 'Emery Cloth Rolls', category: 'Specialty', description: 'Flexible cloth for hand finishing curves.', image: '/product-hand-finishing-products.png', badge: null },
    ],
  },
  'polish-care': {
    title: 'Polish & Care Products',
    heroTitle: 'Polish &',
    heroAccent: 'Care',
    heroDescription: 'Surface polishing compounds, cleaners, and protective treatments.',
    heroImage: '/product-polish-care-products.png',
    categories: ['All', 'Polishing Compounds', 'Cleaners', 'Protectants'],
    products: [
      { slug: 'metal-polish-cream', name: 'Metal Polish Cream', category: 'Polishing Compounds', description: 'Fine polishing compound for mirror finish.', image: '/product-polish-care-products.png', badge: 'Best Seller' },
      { slug: 'cutting-compound', name: 'Heavy Cut Compound', category: 'Polishing Compounds', description: 'Aggressive compound for scratch removal.', image: '/product-polish-care-products.png', badge: null },
      { slug: 'surface-cleaner', name: 'Industrial Surface Cleaner', category: 'Cleaners', description: 'Degreaser and surface prep solution.', image: '/product-polish-care-products.png', badge: 'Popular' },
      { slug: 'rust-protectant', name: 'Rust Preventive Spray', category: 'Protectants', description: 'Long-lasting corrosion protection.', image: '/product-polish-care-products.png', badge: null },
    ],
  },
  'welding': {
    title: 'Welding',
    heroTitle: 'Welding',
    heroAccent: 'Equipment',
    heroDescription: 'Professional welding equipment and consumables for industrial applications.',
    heroImage: '/product-welding.png',
    categories: ['All', 'Machines', 'Consumables', 'Accessories'],
    products: [
      { slug: 'mig-welder-250', name: 'MIG Welder 250A', category: 'Machines', description: 'Industrial MIG welding machine with digital controls.', image: '/product-welding.png', badge: 'Popular' },
      { slug: 'welding-wire-mild', name: 'Mild Steel Welding Wire', category: 'Consumables', description: 'ER70S-6 welding wire for general fabrication.', image: '/product-welding.png', badge: 'Best Seller' },
      { slug: 'welding-electrodes', name: 'Welding Electrodes', category: 'Consumables', description: '6013 electrodes for stick welding.', image: '/product-welding.png', badge: null },
      { slug: 'welding-helmet-auto', name: 'Auto-Darkening Helmet', category: 'Accessories', description: 'Professional helmet with variable shade.', image: '/product-welding.png', badge: 'Premium' },
    ],
  },
  'accessories': {
    title: 'Accessories',
    heroTitle: 'Industrial',
    heroAccent: 'Accessories',
    heroDescription: 'Essential accessories and consumables for your abrasive operations.',
    heroImage: '/product-accessories.png',
    categories: ['All', 'Backup Pads', 'Mandrels', 'Safety', 'Storage'],
    products: [
      { slug: 'backup-pad-set', name: 'Backup Pad Set', category: 'Backup Pads', description: 'Rubber and foam pads for disc sanders.', image: '/product-accessories.png', badge: 'Popular' },
      { slug: 'mandrel-kit', name: 'Mandrel Assortment Kit', category: 'Mandrels', description: 'Assorted mandrels for mounted points and wheels.', image: '/product-accessories.png', badge: null },
      { slug: 'safety-glasses', name: 'Safety Glasses Set', category: 'Safety', description: 'Impact-resistant safety eyewear.', image: '/product-accessories.png', badge: 'Best Seller' },
      { slug: 'abrasive-organizer', name: 'Abrasive Storage Organizer', category: 'Storage', description: 'Keep your abrasives sorted and protected.', image: '/product-accessories.png', badge: null },
    ],
  },
}

export default function ProductCategoryPage() {
  const params = useParams()
  const productId = params.id as string
  const [activeFilter, setActiveFilter] = useState("All")

  // Redirect to dedicated pages
  if (productId === 'abrasive-belts') {
    redirect('/products/abrasive-belts')
  }
  if (productId === 'grinding-sleeves') {
    redirect('/products/grinding-sleeves')
  }

  const category = categoryData[productId] || {
    title: productId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    heroTitle: productId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    heroAccent: 'Products',
    heroDescription: 'High-quality industrial products from Motico Solutions.',
    heroImage: '/slide-1-grinding.png',
    categories: ['All'],
    products: [],
  }

  const filteredProducts = activeFilter === "All"
    ? category.products
    : category.products.filter(p => p.category === activeFilter)

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
          <span className="text-gray-800 font-medium">{category.title}</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-[420px] flex items-center justify-center overflow-hidden">
        <Image
          src={category.heroImage}
          alt={category.title}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Premium Collection
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            {category.heroTitle} <span className="text-red-500">{category.heroAccent}</span>
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            {category.heroDescription}
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
              {category.title}
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-500">
              Click on any product to view detailed specifications and technical data.
            </p>
          </div>

          {/* Category Filter Buttons */}
          {category.categories.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {category.categories.map((cat) => (
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
          )}

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.slug}
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
                      <span className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full text-white ${badgeColorMap[product.badge] || 'bg-gray-600'}`}>
                        {product.badge}
                      </span>
                    )}
                    {/* Category tag */}
                    <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-widest text-white/90 bg-black/50 px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                  </div>
                  {/* Info Panel */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-800 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <a
                        href={`https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20${encodeURIComponent(product.name)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-800 font-semibold text-sm hover:underline"
                      >
                        Inquire Now →
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  Contact us for product availability and specifications.
                </p>
                <a
                  href={`https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20${encodeURIComponent(category.title)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-400 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Us on WhatsApp
                </a>
              </div>
            )}
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
            Our technical team can help you select the perfect product for your application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/9613741565?text=Hello!%20I'm%20interested%20in%20your%20${encodeURIComponent(category.title.toLowerCase())}.`}
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
