// src/app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'
import SessionWrapper from '@/components/providers/SessionWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Luis Granero - Desarrollador Web Freelance',
  description: 'Desarrollador web especializado en React, Next.js y soluciones personalizadas',
  keywords: ['desarrollador web', 'freelance', 'React', 'Next.js', 'TypeScript', 'frontend', 'backend'],
  authors: [{ name: 'Luis Granero' }],
  creator: 'Luis Granero',
  publisher: 'Luis Granero',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.luisgranero.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Luis Granero - Desarrollador Web Freelance',
    description: 'Desarrollador web especializado en React, Next.js y soluciones personalizadas',
    url: 'https://www.luisgranero.com',
    siteName: 'Luis Granero',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luis Granero - Desarrollador Web Freelance',
    description: 'Desarrollador web especializado en React, Next.js y soluciones personalizadas',
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white antialiased`}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  )
}