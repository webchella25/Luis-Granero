// src/app/admin/layout.js - Debe ser INDEPENDIENTE
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

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
      {/* Admin-specific layout here */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl">Admin Panel - Luis Granero</h1>
          <div className="flex items-center space-x-4">
            <span>Hola, {session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="bg-red-600 px-3 py-1 rounded text-sm"
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