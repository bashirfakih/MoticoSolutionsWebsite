import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Motico Solutions',
  description: 'Terms and conditions for using Motico Solutions services and website.',
}

export default function TermsPage() {
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
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="lead">Last updated: February 2025</p>

          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using our website and services, you agree to be bound by these Terms of Service.
            If you disagree with any part of the terms, you may not access our services.
          </p>

          <h2>Products and Services</h2>
          <p>
            Motico Solutions provides industrial abrasives, grinding tools, and related equipment.
            All products are subject to availability and we reserve the right to discontinue any product at any time.
          </p>

          <h2>Pricing and Payment</h2>
          <p>
            Prices are subject to change without notice. Payment terms will be agreed upon at the time of order.
            All sales are final unless otherwise specified.
          </p>

          <h2>Warranty</h2>
          <p>
            Products are covered by manufacturer warranties where applicable.
            Motico Solutions does not provide additional warranties beyond those provided by the manufacturer.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            Motico Solutions shall not be liable for any indirect, incidental, special, consequential, or punitive damages
            resulting from your use of our products or services.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these Terms, contact us at{' '}
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
