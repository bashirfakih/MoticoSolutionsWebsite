import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ScrollProgress from '@/components/ui/ScrollProgress'
import CookieConsent from '@/components/ui/CookieConsent'
import BackToTop from '@/components/ui/BackToTop'
import NavigationProgress from '@/components/ui/NavigationProgress'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Suspense } from 'react'
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration'
import { ClientProviders } from '@/components/providers/ClientProviders'
import { getSettings } from '@/lib/settings/server'
import StructuredData from '@/components/seo/StructuredData'

const inter = Inter({ subsets: ['latin'] })

// Generate dynamic viewport based on settings
export async function generateViewport(): Promise<Viewport> {
  const settings = await getSettings();

  return {
    themeColor: settings.primaryColor || '#004D8B',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  };
}

// Generate dynamic metadata based on settings
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  const baseUrl = settings.companyWebsite || 'https://example.com';
  const siteName = settings.companyName;
  const defaultTitle = settings.metaTitle || `${siteName}`;
  const description = settings.metaDescription || settings.companyDescription || 'Premium Products';
  const keywords = settings.metaKeywords?.split(',').map(k => k.trim()) || [];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: settings.defaultLanguage === 'en' ? 'en_US' : 'ar_AR',
      url: baseUrl,
      siteName,
      title: defaultTitle,
      description,
      images: settings.logo ? [
        {
          url: settings.logo,
          width: 1200,
          height: 630,
          alt: `${siteName} Logo`,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description,
      images: settings.logo ? [settings.logo] : [],
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
      canonical: baseUrl,
    },
    icons: {
      icon: settings.favicon || '/favicon.ico',
      apple: '/icons/icon-192x192.png',
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang={settings.defaultLanguage || 'en'}>
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.live" />

        {/* PWA Manifest and Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={settings.companyName} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content={settings.companyName} />
        <meta name="msapplication-TileColor" content={settings.primaryColor} />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Sitemap link */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className={`${inter.className} bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 transition-colors`}>
        <ClientProviders>
          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:text-white focus:rounded-lg focus:font-semibold"
            style={{ backgroundColor: settings.primaryColor }}
          >
            Skip to main content
          </a>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <ScrollProgress />
          <StructuredData />
          {children}
          <CookieConsent />
          <BackToTop />
          <SpeedInsights />
          <ServiceWorkerRegistration />
        </ClientProviders>
      </body>
    </html>
  )
}
