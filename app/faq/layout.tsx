import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | Motico Solutions',
  description: 'Find answers to common questions about Motico Solutions products, shipping, payment methods, technical support, and return policies.',
  openGraph: {
    title: 'Frequently Asked Questions — Motico Solutions',
    description: 'Get answers about our products, shipping, payments, and support services.',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
