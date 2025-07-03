// src/components/layout/ConditionalLayout.tsx
'use client'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Si es una ruta admin, no renderizar Header/Footer
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }
  
  // Para todas las otras rutas, usar Header/Footer normal
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}