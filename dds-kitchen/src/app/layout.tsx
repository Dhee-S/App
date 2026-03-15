import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Arima, Trirong, Merriweather } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })
const arima = Arima({ subsets: ['latin'], variable: '--font-arima' })
const trirong = Trirong({ subsets: ['latin'], weight: ['100','200','300','400','500','600','700','800','900'], variable: '--font-trirong' })
const merriweather = Merriweather({ subsets: ['latin'], weight: ['300', '400', '700', '900'], variable: '--font-merriweather' })

export const metadata: Metadata = {
  title: "DD's Kitchen",
  description: "Gourmet Marketplace & Kitchen Schedule",
}

import { Providers } from '@/components/Providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${arima.variable} ${trirong.variable} ${merriweather.variable} font-body bg-background text-foreground antialiased mesh-bg min-h-screen noise-overlay`}>
        <main className="max-w-md mx-auto min-h-screen relative pb-20 overflow-x-hidden">
          <Providers>
            {children}
            <Navigation />
          </Providers>
        </main>
      </body>
    </html>
  )
}
