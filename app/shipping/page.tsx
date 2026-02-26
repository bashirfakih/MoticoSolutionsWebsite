import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Truck, Clock, Globe, Package } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Policy — Motico Solutions',
  description: 'Shipping information and delivery policies for Motico Solutions. Fast delivery across Lebanon, Middle East, and West Africa.',
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image src="/logo-motico-solutions.png" alt="Motico Solutions" width={150} height={45} className="h-16 w-auto" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Shipping Policy</h1>

        {/* Shipping Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-blue-50 rounded-xl">
            <Truck className="w-8 h-8 text-blue-800 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Most orders delivered within 24-72 hours across our service areas.</p>
          </div>
          <div className="p-6 bg-blue-50 rounded-xl">
            <Globe className="w-8 h-8 text-blue-800 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Regional Coverage</h3>
            <p className="text-gray-600">We ship to Lebanon, Middle East, and West Africa.</p>
          </div>
          <div className="p-6 bg-blue-50 rounded-xl">
            <Clock className="w-8 h-8 text-blue-800 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Order Processing</h3>
            <p className="text-gray-600">Orders placed before 2 PM are processed same day.</p>
          </div>
          <div className="p-6 bg-blue-50 rounded-xl">
            <Package className="w-8 h-8 text-blue-800 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Secure Packaging</h3>
            <p className="text-gray-600">All items carefully packaged to ensure safe delivery.</p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-600">
          <h2>Delivery Times</h2>
          <ul>
            <li><strong>Beirut & Mount Lebanon:</strong> 24-48 hours</li>
            <li><strong>Other Lebanese regions:</strong> 48-72 hours</li>
            <li><strong>Middle East:</strong> 3-7 business days</li>
            <li><strong>West Africa:</strong> 7-14 business days</li>
          </ul>

          <h2>Shipping Costs</h2>
          <p>
            Shipping costs are calculated based on order weight, dimensions, and delivery location.
            Contact our sales team for accurate shipping quotes for your specific order.
          </p>

          <h2>Order Tracking</h2>
          <p>
            Once your order ships, you will receive tracking information via email or WhatsApp.
            Contact our support team if you need assistance tracking your order.
          </p>

          <h2>Questions?</h2>
          <p>
            Contact us at{' '}
            <a href="tel:+9613741565" className="text-blue-800 hover:underline">+961 3 741 565</a>
            {' '}or{' '}
            <a href="mailto:info@moticosolutions.com" className="text-blue-800 hover:underline">
              info@moticosolutions.com
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <Link href="/" className="text-white font-semibold hover:text-red-400 transition-colors">
            ← Motico Solutions
          </Link>
          <p className="text-gray-500">Industrial Abrasives & Tools — Beirut, Lebanon</p>
        </div>
      </footer>
    </div>
  )
}
