import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ScrollProgress from '@/components/ui/ScrollProgress'
import CustomCursor from '@/components/ui/CustomCursor'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#0a1628',
}

export const metadata: Metadata = {
  title: 'Motico Solutions — Industrial Abrasives & Tools | Beirut, Lebanon',
  description:
    'Premium industrial abrasives, cutting tools, and equipment. Authorized distributor for Norton, 3M, Bosch, Makita & more. Serving MENA since 2009.',
  openGraph: {
    title: 'Motico Solutions — Industrial Abrasives & Tools',
    description: 'Powering manufacturing excellence across the Middle East & North Africa since 2009.',
    siteName: 'Motico Solutions',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ScrollProgress />
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
