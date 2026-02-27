import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us — 20+ Years of Industrial Excellence | Motico Solutions',
  description: 'Learn about Motico Solutions, Lebanon\'s leading distributor of premium industrial abrasives and tools since 2004. Authorized dealer for Hermes, 3M, Hoffmann, and more.',
  openGraph: {
    title: 'About Motico Solutions — Industrial Abrasives Experts',
    description: 'Discover our 20+ years of expertise in industrial grinding, sanding, and polishing solutions. Serving Lebanon, Middle East, and West Africa.',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
