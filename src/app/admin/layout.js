// src/app/admin/layout.js - VERSIÓN CORREGIDA
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminLoadingScreen from '@/components/admin/AdminLoadingScreen'
import { Toaster } from 'react-hot-toast'

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <AdminLoadingScreen />
  }

  if (!session) {
    return null
  }

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