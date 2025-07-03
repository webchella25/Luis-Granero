// src/app/admin/page.js - VERSIÓN SIMPLIFICADA SIN ERRORES
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    projects: 0,
    posts: 0,
    messages: 0,
    views: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/admin/login')
      return
    }
    
    // Cargar stats básicos
    fetchBasicStats()
  }, [session, status, router])

  const fetchBasicStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
      // Usar valores por defecto
      setStats({
        projects: 5,
        posts: 3,
        messages: 2,
        views: 150
      })
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Bienvenido, {session.user?.name || 'Luis'}! 👋
        </h1>
        <p className="text-cyan-100">
          Panel de administración de tu sitio web profesional
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyectos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.projects}</p>
            </div>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-full">
              <span className="text-white text-xl">🚀</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Artículos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.posts}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
              <span className="text-white text-xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mensajes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.messages}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
              <span className="text-white text-xl">💬</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Visitas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.views}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
              <span className="text-white text-xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/portfolio"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-colors group"
        >
          <div className="flex items-center">
            <span className="text-2xl mr-4">🚀</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-cyan-600">
                Gestionar Portfolio
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Administra tus proyectos
              </p>
            </div>
          </div>
        </Link>
        
        <Link
          href="/admin/services"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 transition-colors group"
        >
          <div className="flex items-center">
            <span className="text-2xl mr-4">⚡</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600">
                Editar Servicios
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Actualiza tus servicios
              </p>
            </div>
          </div>
        </Link>
        
        <Link
          href="/admin/settings"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-colors group"
        >
          <div className="flex items-center">
            <span className="text-2xl mr-4">⚙️</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600">
                Configuración
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ajustes del sitio
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}