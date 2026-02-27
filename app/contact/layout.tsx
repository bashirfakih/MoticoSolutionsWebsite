import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us — Get Expert Support | Motico Solutions',
  description: 'Contact Motico Solutions for industrial abrasives and tools. Call +961 3 741 565, email info@moticosolutions.com, or visit our Beirut showroom. Expert technical support available.',
  openGraph: {
    title: 'Contact Motico Solutions — Industrial Abrasives & Tools',
    description: 'Get in touch with our team for product inquiries, technical support, and quotes. Fast response guaranteed.',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
