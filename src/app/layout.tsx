// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionWrapper from '@/components/providers/SessionWrapper'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Mejora la carga de fuentes
})

export const metadata: Metadata = {
  title: 'Luis Granero - Desarrollador Full Stack',
  description: 'Desarrollo web moderno con React, Next.js y tecnologías de vanguardia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <SessionWrapper>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </SessionWrapper>
      </body>
    </html>
  )
}