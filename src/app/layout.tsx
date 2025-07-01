// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionWrapper from '@/components/providers/SessionWrapper'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="es">
      <body className={inter.className}>
        <SessionWrapper>
          <Header />
          {children}
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  )
}