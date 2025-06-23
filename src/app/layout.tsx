// src/app/layout.tsx - Versión corregida
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionWrapper from '@/components/providers/SessionWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Luis Granero - Desarrollador Web Freelance',
    template: '%s | Luis Granero'
  },
  description: 'Desarrollador web freelance especializado en React, Next.js y soluciones personalizadas. Más de 10 años creando aplicaciones web de alto rendimiento.',
  keywords: [
    'desarrollador web freelance',
    'react developer',
    'nextjs developer',
    'desarrollo web personalizado',
    'aplicaciones web',
    'ecommerce personalizado'
  ],
  authors: [{ name: 'Luis Granero' }],
  creator: 'Luis Granero',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://luisgranero.com',
    title: 'Luis Granero - Desarrollador Web Freelance',
    description: 'Especializado en React, Next.js y soluciones web personalizadas',
    siteName: 'Luis Granero',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Luis Granero - Desarrollador Web Freelance'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luis Granero - Desarrollador Web Freelance',
    description: 'Especializado en React, Next.js y soluciones web personalizadas',
    creator: '@luisgranero'
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
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SessionWrapper>
          <div className="min-h-screen bg-black text-white">
            {children}
          </div>
        </SessionWrapper>
      </body>
    </html>
  )
}
