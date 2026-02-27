import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ScrollProgress from '@/components/ui/ScrollProgress'
import CookieConsent from '@/components/ui/CookieConsent'
import BackToTop from '@/components/ui/BackToTop'
import NavigationProgress from '@/components/ui/NavigationProgress'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Suspense } from 'react'
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration'
import { socialLinks } from '@/lib/constants/social'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#004D8B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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

// JSON-LD structured data for Organization and LocalBusiness
const organizationJsonLd = {
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
  sameAs: [
    socialLinks.facebook,
    socialLinks.instagram,
    socialLinks.linkedin,
    socialLinks.youtube,
  ],
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://moticosolutions.com/#localbusiness',
  name: 'Motico Solutions',
  description: 'Premium industrial abrasives and tools distributor',
  url: 'https://moticosolutions.com',
  telephone: '+961-3-741-565',
  email: 'info@moticosolutions.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Beirut',
    addressCountry: 'LB',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 33.8938,
    longitude: 35.5018,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:00',
      closes: '14:00',
    },
  ],
  priceRange: '$$',
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Motico Solutions',
  url: 'https://moticosolutions.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://moticosolutions.com/products?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.live" />

        {/* Preload critical assets */}
        <link rel="preload" href="/logo-motico-solutions.png" as="image" />

        {/* PWA Manifest and Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Motico" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Motico Solutions" />
        <meta name="msapplication-TileColor" content="#004D8B" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Sitemap link */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 transition-colors`}>
        <AuthProvider>
          <ToastProvider>
            <ThemeProvider>
              {/* Skip to content link for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#004D8B] focus:text-white focus:rounded-lg focus:font-semibold"
              >
                Skip to main content
              </a>
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              <ScrollProgress />
              {children}
              <CookieConsent />
              <BackToTop />
              <SpeedInsights />
              <ServiceWorkerRegistration />
            </ThemeProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
