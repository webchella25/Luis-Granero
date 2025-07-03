// src/app/admin/layout.js - MODIFICADO para excluir login
'use client'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { signOut } from 'next-auth/react'

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Si es la página de login, no aplicar el layout admin
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  useEffect(() => {
    console.log('🔍 Admin Layout - Status:', status, 'Session:', !!session)
    
    if (status === 'loading') return
    if (!session) {
      console.log('🔄 No session, redirecting to login')
      router.push('/admin/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">🔍 Verificando sesión admin...</div>
      </div>
    )
  }

  if (!session) {
    return null // Se redirigirá al login
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin header */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl">🎛️ Admin Panel - Luis Granero</h1>
          <div className="flex items-center space-x-4">
            <span>Hola, {session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        {children}
      </div>
    </div>
  )
}