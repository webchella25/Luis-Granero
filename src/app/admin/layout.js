// src/app/admin/layout.js - VERSIÓN CORREGIDA
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminLoadingScreen from '@/components/admin/AdminLoadingScreen'
import { Toaster } from 'react-hot-toast'

export default function AdminLayout({ children }) {
  // // useSession() // TODO: Auth manual // TODO: Auth manual
  const session = null; const status = "unauthenticated"
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ⚡ CRÍTICO: Si estamos en /admin/login, NO aplicar protección
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login-test'
  
  useEffect(() => {
    // Si es página de login, no hacer nada
    if (isLoginPage) return
    
    // Para otras páginas admin, verificar sesión
    if (status === 'loading') return
    if (!session) {
      router.push('/admin/login')
      return
    }
  }, [session, status, router, isLoginPage])

  // Si es página de login, solo renderizar children sin layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Mostrar loading mientras verifica sesión
  if (status === 'loading') {
    return <AdminLoadingScreen />
  }

  // Si no hay sesión y no es login, no mostrar nada (redirige arriba)
  if (!session) {
    return null
  }

  // Layout normal para páginas admin autenticadas
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar - FIXED POSITION */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area - CON MARGIN PARA EL SIDEBAR */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={session.user}
        />
        
        {/* Page Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}