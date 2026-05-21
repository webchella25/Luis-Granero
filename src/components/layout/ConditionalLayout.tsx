// src/components/layout/ConditionalLayout.tsx
'use client'
import { usePathname } from 'next/navigation'
import Header from './Header'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Lista de rutas que ya manejan su propio layout
  const hasOwnLayout = [
    '/blog',
    '/portfolio',
    '/servicios',
    '/contacto',
    '/admin'
  ].some(route => pathname?.startsWith(route))
  
  // Si la ruta maneja su propio layout, solo renderizar children
  if (hasOwnLayout) {
    return <>{children}</>
  }
  
  // Para rutas como homepage que no tienen Header/Footer explícito
  // podrías añadirlos aquí si es necesario
  return <>{children}</>

  
  // Para todas las otras rutas, usar Header/Footer normal
  return (
    <>
      <Header />
      {children}
    </>
  )
}