// src/app/layout.tsx - MODIFICADO para excluir admin
import type { Metadata } from 'next'
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import './globals.css'
import SessionWrapper from '@/components/providers/SessionWrapper'
import ConditionalLayout from '@/components/layout/ConditionalLayout'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['300', '400', '500', '600', '700'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://luisgranero.com'),
  title: {
    default: 'Luis Granero - Desarrollador Full Stack',
    template: '%s | Luis Granero'
  },
  description: 'Desarrollo web moderno con React, Next.js y tecnologías de vanguardia',
  openGraph: {
    siteName: 'Luis Granero',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@luisgranero',
  },
  robots: {
    index: true,
    follow: true,
  },
  // Verificación por DNS configurada en Google Search Console
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} font-body`}>
        <SessionWrapper>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SessionWrapper>
      </body>
    </html>
  )
}