import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — Motico Solutions',
  description: 'Cookie policy for Motico Solutions website. Learn about how we use cookies and similar technologies.',
}

export default function CookiesPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>

        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="lead">Last updated: February 2025</p>

          <h2>What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit our website.
            They help us provide you with a better experience and allow certain features to work.
          </p>

          <h2>How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
          </ul>

          <h2>Third-Party Cookies</h2>
          <p>
            We may use third-party services such as Google Analytics and Vercel Analytics that place cookies on your device.
            These help us analyze website traffic and improve our services.
          </p>

          <h2>Managing Cookies</h2>
          <p>
            You can control and manage cookies through your browser settings. Please note that removing or blocking
            cookies may impact your user experience and parts of our website may no longer be fully accessible.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about our use of cookies, contact us at{' '}
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
