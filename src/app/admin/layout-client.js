'use client'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { Toaster } from 'react-hot-toast'

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  const toggleCollapse = () => {
    setCollapsed(prev => {
      localStorage.setItem('sidebar-collapsed', String(!prev))
      return !prev
    })
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const sidebarWidth = collapsed ? 'lg:ml-16' : 'lg:ml-64'

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main */}
      <div className={`flex-1 ${sidebarWidth} min-h-screen flex flex-col transition-all duration-300`}>
        <AdminHeader
          onMenuClick={() => setMobileOpen(!mobileOpen)}
          user={{ name: 'Luis' }}
        />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0B1120',
            color: '#e2e8f0',
            border: '1px solid #1e293b',
          },
        }}
      />
    </div>
  )
}
