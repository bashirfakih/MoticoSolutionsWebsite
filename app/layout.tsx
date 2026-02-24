import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ScrollProgress from '@/components/ui/ScrollProgress'
import CustomCursor from '@/components/ui/CustomCursor'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#004D8B',
}

export const metadata: Metadata = {
  title: 'Motico Solutions — Industrial Abrasives & Tools | Beirut, Lebanon',
  description:
    'Premium abrasive belts, grinding tools, industrial machines and finishing equipment. Market leaders in Lebanon and across the Middle East and West Africa since 2004.',
  openGraph: {
    title: 'Motico Solutions — Industrial Abrasives & Tools',
    description: 'Market leaders in Lebanon and across the Middle East and West Africa since 2004.',
    siteName: 'Motico Solutions',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ScrollProgress />
        {/* CustomCursor disabled - causes floating red dot visual artifact */}
        {/* <CustomCursor /> */}
        {children}
      </body>
    </html>
  )
}
