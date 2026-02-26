'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ChevronDown, Phone, MessageCircle } from 'lucide-react'

const faqs = [
  {
    question: 'What brands do you distribute?',
    answer: 'We are official distributors for Hermes, Eisenblätter, Hoffmann, Osborn, 3M, ZAT, Sandwox, DCA, Egeli, and NS. All products are 100% genuine with full manufacturer warranty.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes, we provide reliable logistics across Lebanon, the Middle East, and West Africa. Most orders are delivered within 24-72 hours depending on location.',
  },
  {
    question: 'What is your minimum order quantity?',
    answer: 'Minimum order quantities vary by product. Contact our sales team for specific requirements. We accommodate both small workshops and large manufacturing operations.',
  },
  {
    question: 'Do you offer technical support?',
    answer: 'Absolutely! Our team of industrial specialists provides expert guidance on product selection and application techniques, both before and after the sale.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept bank transfers, cash on delivery (for local orders), and offer credit terms for established business accounts. Contact us for specific payment arrangements.',
  },
  {
    question: 'Can you source products not listed on your website?',
    answer: 'Yes, we can source specific products through our supplier network. Contact us with your requirements and we will do our best to fulfill your needs.',
  },
  {
    question: 'Do you offer volume discounts?',
    answer: 'Yes, we offer competitive pricing for bulk orders. Contact our sales team for a customized quote based on your volume requirements.',
  },
  {
    question: 'What is your return policy?',
    answer: 'Products may be returned within 14 days of delivery if unused and in original packaging. Some items may be subject to restocking fees. Contact us for specific return procedures.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our products and services.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center p-8 bg-gray-50 rounded-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Still Have Questions?</h2>
          <p className="text-gray-600 mb-6">Our team is here to help you find the right solutions.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/9613741565"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp Us
            </a>
            <a
              href="tel:+9613741565"
              className="inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <Phone className="w-5 h-5" /> Call Us
            </a>
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
        </div>
      </footer>
    </div>
  )
}
