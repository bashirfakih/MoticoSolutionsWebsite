import Link from 'next/link'
import Image from 'next/image'
import { Home, Package, Phone, MessageCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-center">
          <Link href="/">
            <Image src="/logo-motico-solutions.png" alt="Motico Solutions" width={150} height={45} className="h-16 w-auto" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-xl">
          {/* 404 Display */}
          <div className="mb-8">
            <span className="text-[150px] font-black leading-none" style={{
              background: 'linear-gradient(135deg, #004D8B 0%, #0066b3 50%, #bb0c15 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              404
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let us help you find what you need.
          </p>

          {/* Navigation Options */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Link
              href="/"
              className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Home className="w-5 h-5 text-blue-800" />
              <span className="font-semibold text-gray-900">Back to Home</span>
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Package className="w-5 h-5 text-blue-800" />
              <span className="font-semibold text-gray-900">Browse Products</span>
            </Link>
          </div>

          {/* Contact Options */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Need help finding something specific?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/9613741565"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </a>
              <a
                href="tel:+9613741565"
                className="inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                <Phone className="w-4 h-4" /> Call Us
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <Link href="/" className="text-white font-semibold hover:text-red-400 transition-colors">
            ← Motico Solutions
          </Link>
          <p className="text-gray-500">Industrial Abrasives & Tools — Beirut, Lebanon</p>
          <div className="flex gap-6">
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <a href="tel:+9613741565" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
