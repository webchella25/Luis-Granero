// src/app/admin/layout-client.js
'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { Toaster } from 'react-hot-toast'

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Si es página de login, solo renderizar children
  const isLoginPage = pathname === '/admin/login'
  
  if (isLoginPage) {
    return <>{children}</>
  }
  
  // Layout normal para páginas admin
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={{ email: 'admin@luisgranero.com', role: 'admin' }}
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