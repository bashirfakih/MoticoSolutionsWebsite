import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, RotateCcw, CheckCircle, AlertCircle, Phone } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Returns Policy — Motico Solutions',
  description: 'Return and refund policy for Motico Solutions products. Learn about our hassle-free return process.',
}

export default function ReturnsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Returns Policy</h1>

        {/* Return Window Highlight */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-12 flex items-start gap-4">
          <RotateCcw className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-1">14-Day Return Window</h2>
            <p className="text-gray-600">
              Return unused products in original packaging within 14 days of delivery for a full refund or exchange.
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-600">
          <h2>Return Eligibility</h2>
          <div className="not-prose grid gap-3 mb-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Products must be unused and in original packaging</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Return request must be made within 14 days of delivery</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Original invoice or proof of purchase required</span>
            </div>
          </div>

          <h2>Non-Returnable Items</h2>
          <div className="not-prose grid gap-3 mb-6">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span>Custom-cut or special-order products</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span>Used or opened abrasive products</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span>Products with damaged packaging due to customer handling</span>
            </div>
          </div>

          <h2>How to Return</h2>
          <ol>
            <li>Contact our customer service team to initiate a return</li>
            <li>Receive a Return Authorization Number (RAN)</li>
            <li>Pack items securely with all original materials</li>
            <li>Ship to our warehouse or arrange pickup</li>
            <li>Refund processed within 5-7 business days of receipt</li>
          </ol>

          <h2>Contact Us</h2>
          <p>
            For return requests or questions, contact us at{' '}
            <a href="tel:+9613741565" className="text-blue-800 hover:underline">+961 3 741 565</a>
            {' '}or{' '}
            <a href="mailto:info@moticosolutions.com" className="text-blue-800 hover:underline">
              info@moticosolutions.com
            </a>
          </p>
        </div>

        {/* Help CTA */}
        <div className="mt-12 text-center p-6 bg-blue-900 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-3">Need Help With a Return?</h3>
          <a
            href="tel:+9613741565"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Phone className="w-5 h-5" /> Call Our Support Team
          </a>
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
