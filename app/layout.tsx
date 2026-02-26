import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ScrollProgress from '@/components/ui/ScrollProgress'
import CookieConsent from '@/components/ui/CookieConsent'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#004D8B',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://moticosolutions.com'),
  title: {
    default: 'Motico Solutions — Industrial Abrasives & Tools | Beirut, Lebanon',
    template: '%s | Motico Solutions',
  },
  description:
    'Premium abrasive belts, grinding tools, industrial machines and finishing equipment. Market leaders in Lebanon and across the Middle East and West Africa since 2004.',
  keywords: [
    'industrial abrasives',
    'grinding tools',
    'abrasive belts',
    'cutting discs',
    'sanding equipment',
    'Lebanon',
    'Beirut',
    'Middle East',
    'industrial tools',
  ],
  authors: [{ name: 'Motico Solutions' }],
  creator: 'Motico Solutions',
  publisher: 'Motico Solutions',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://moticosolutions.com',
    siteName: 'Motico Solutions',
    title: 'Motico Solutions — Industrial Abrasives & Tools',
    description: 'Premium abrasive belts, grinding tools, industrial machines and finishing equipment. Market leaders in Lebanon since 2004.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Motico Solutions - Industrial Abrasives & Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motico Solutions — Industrial Abrasives & Tools',
    description: 'Premium abrasive belts, grinding tools, industrial machines and finishing equipment.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://moticosolutions.com',
  },
}

// JSON-LD structured data for Organization
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Motico Solutions',
  description: 'Premium industrial abrasives and tools distributor serving Lebanon and the Middle East since 2004.',
  url: 'https://moticosolutions.com',
  logo: 'https://moticosolutions.com/logo-motico-solutions.png',
  foundingDate: '2004',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Beirut',
    addressCountry: 'Lebanon',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+961-3-741-565',
    contactType: 'sales',
    availableLanguage: ['English', 'Arabic'],
  },
  sameAs: [],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#004D8B] focus:text-white focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>
        <ScrollProgress />
        {children}
        <CookieConsent />
        <SpeedInsights />
      </body>
    </html>
  )
}
