'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Search, X, ArrowRight, Layers, Wrench, Settings, Package, Disc, Scissors,
  Star, ShieldCheck, Zap, Loader2, Cog, Box, Hammer, Wind, Droplets, Ruler, Shield,
  type LucideIcon,
} from 'lucide-react'

// Icon mapping for dynamic resolution
const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Wrench,
  Disc,
  Cog,
  Settings,
  Package,
  Box,
  Hammer,
  Zap,
  Wind,
  Droplets,
  Ruler,
  Scissors,
  Shield,
  Star,
  ShieldCheck,
}

// Types
interface CategoryData {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
}

interface ProductData {
  id: string
  name: string
  slug: string
  category: {
    slug: string
  }
  brand: {
    name: string
  }
}

// Fallback categories data
const fallbackCategories = [
  { id: 'abrasive-belts', title: 'Abrasive Belts', icon: Layers, keywords: ['belt', 'sanding', 'abrasive', 'hermes'] },
  { id: 'air-power-tools', title: 'Air & Power Tools', icon: Wrench, keywords: ['air', 'power', 'tool', 'pneumatic', 'drill'] },
  { id: 'belt-disc-sanders', title: 'Belt & Disc Sanders', icon: Settings, keywords: ['belt', 'disc', 'sander', 'zat'] },
  { id: 'stationary-machines', title: 'Stationary Machines', icon: Package, keywords: ['machine', 'stationary', 'grinder', 'polisher'] },
  { id: 'grinding-sleeves', title: 'Grinding Sleeves & Wheels', icon: Disc, keywords: ['grinding', 'sleeve', 'wheel', 'eisenblatter'] },
  { id: 'abrasive-discs', title: 'Abrasive Discs', icon: Disc, keywords: ['disc', 'abrasive', 'flap', 'fiber'] },
  { id: 'cutting-discs', title: 'Cutting Discs', icon: Scissors, keywords: ['cutting', 'disc', 'cut-off', 'metal'] },
  { id: 'mounted-points', title: 'Mounted Point & Burrs', icon: Star, keywords: ['mounted', 'point', 'burr', 'carbide'] },
  { id: 'hand-finishing', title: 'Hand Finishing Products', icon: Layers, keywords: ['hand', 'finishing', 'sandpaper', 'sheet'] },
  { id: 'polish-care', title: 'Polish & Care Products', icon: ShieldCheck, keywords: ['polish', 'care', 'compound', 'wax'] },
  { id: 'welding', title: 'Welding', icon: Zap, keywords: ['welding', 'weld', 'electrode', 'wire'] },
  { id: 'accessories', title: 'Accessories', icon: Settings, keywords: ['accessory', 'backup', 'pad', 'holder'] },
]

interface SearchDropdownProps {
  onClose?: () => void
}

export default function SearchDropdown({ onClose }: SearchDropdownProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState(fallbackCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    categories: typeof fallbackCategories
    products: { name: string; category: string; brand: string; slug: string }[]
  }>({ categories: [], products: [] })
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load categories from database on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories?active=true&limit=50')
        if (!response.ok) return
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          const dbCategories = data.data
            .filter((cat: CategoryData) => cat.slug) // Ensure slug exists
            .map((cat: CategoryData) => ({
              id: cat.slug,
              title: cat.name,
              icon: ICON_MAP[cat.icon || 'Layers'] || Layers,
              keywords: [cat.name.toLowerCase(), cat.slug.toLowerCase()],
            }))
          if (dbCategories.length > 0) {
            setCategories(dbCategories)
          }
        }
      } catch (error) {
        console.error('Failed to load categories for search:', error)
      }
    }
    loadCategories()
  }, [])

  // Search logic with debouncing and product API call
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ categories: [], products: [] })
      setIsLoading(false)
      return
    }

    const q = searchQuery.toLowerCase()

    // Search categories locally (instant)
    const matchedCategories = categories.filter(cat =>
      cat.title.toLowerCase().includes(q) ||
      cat.keywords.some(kw => kw.includes(q))
    ).slice(0, 4)

    // Update categories immediately
    setResults(prev => ({ ...prev, categories: matchedCategories }))

    // Search products from API (debounced)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&published=true&limit=5`)
        if (response.ok) {
          const data = await response.json()
          const matchedProducts = (data.data || []).map((p: ProductData) => ({
            name: p.name,
            category: p.category?.slug || '',
            brand: p.brand?.name || '',
            slug: p.slug,
          }))
          setResults(prev => ({ ...prev, products: matchedProducts }))
        }
      } catch (error) {
        console.error('Product search failed:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }, [categories])

  useEffect(() => {
    performSearch(query)
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, performSearch])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleResultClick = () => {
    setIsOpen(false)
    setQuery('')
    onClose?.()
  }

  const hasResults = results.categories.length > 0 || results.products.length > 0

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products..."
          aria-label="Search products"
          aria-expanded={isOpen && hasResults}
          aria-haspopup="listbox"
          className="w-44 pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#004D8B] focus:outline-none focus:ring-1 focus:ring-[#004D8B] transition-all"
          style={{ background: '#f8fafc' }}
        />
        {isLoading ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        {query && (
          <button
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.trim() && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            background: 'white',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e5e7eb',
            minWidth: 320,
          }}
          role="listbox"
        >
          {hasResults ? (
            <div className="max-h-[400px] overflow-y-auto">
              {/* Categories Section */}
              {results.categories.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Categories
                  </div>
                  {results.categories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <Link
                        key={cat.id}
                        href={`/products/${cat.id}`}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: '#004D8B' }}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#004D8B]">
                          {cat.title}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Products Section */}
              {results.products.length > 0 && (
                <div className="p-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Products
                  </div>
                  {results.products.map((product, i) => (
                    <Link
                      key={i}
                      href={`/products/category/${product.category}/${product.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#004D8B] block">
                          {product.name}
                        </span>
                        <span className="text-xs text-gray-400">{product.brand}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              )}

              {/* View All Link */}
              <div className="p-3 border-t border-gray-100">
                <Link
                  href="/products"
                  onClick={handleResultClick}
                  className="flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-colors"
                  style={{ color: '#bb0c15' }}
                >
                  Browse All Products <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  <span className="text-sm text-gray-500">Searching...</span>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-2">No results found for &ldquo;{query}&rdquo;</p>
                  <Link
                    href="/products"
                    onClick={handleResultClick}
                    className="text-sm font-semibold"
                    style={{ color: '#004D8B' }}
                  >
                    Browse all products →
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
