// src/app/admin/layout.js - SIMPLIFICADO
'use client'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Si es login page, no usar admin layout
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-gray-900">{children}</div>
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">🔍 Cargando...</div>
      </div>
    )
  }

  // Si no hay sesión, el middleware se encargará del redirect
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">🔄 Verificando acceso...</div>
      </div>
    )
  }

  // Layout normal para admin autenticado
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl">🎛️ Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <span>{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="bg-red-600 px-3 py-1 rounded text-sm"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
      <div className="p-8">{children}</div>
    </div>
  )
}