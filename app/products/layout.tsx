import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products — Industrial Abrasives & Tools Catalog | Motico Solutions',
  description: 'Browse 700+ industrial products: abrasive belts, grinding wheels, power tools, sanders, and finishing products. Premium brands including Hermes, 3M, Hoffmann, and more.',
  openGraph: {
    title: 'Industrial Abrasives & Tools Catalog — Motico Solutions',
    description: 'Explore our complete range of grinding, sanding, polishing, and cutting solutions for industrial applications.',
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
