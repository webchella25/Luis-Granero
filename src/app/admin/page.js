// src/app/admin/page.js - DASHBOARD MEJORADO
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardCard from '@/components/admin/DashboardCard'
import RecentActivity from '@/components/admin/RecentActivity'
import QuickStats from '@/components/admin/QuickStats'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    projects: 0,
    posts: 0,
    messages: 0,
    views: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/admin/login')
      return
    }
    
    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
    </div>
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
          Aquí tienes un resumen de tu sitio web y las métricas más importantes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Proyectos"
          value={stats.projects}
          icon="🚀"
          color="bg-gradient-to-r from-cyan-500 to-blue-500"
          link="/admin/portfolio"
          change="+2 este mes"
        />
        <DashboardCard
          title="Artículos"
          value={stats.posts}
          icon="📝"
          color="bg-gradient-to-r from-green-500 to-emerald-500"
          link="/admin/blog"
          change="+1 esta semana"
        />
        <DashboardCard
          title="Mensajes"
          value={stats.messages}
          icon="💬"
          color="bg-gradient-to-r from-purple-500 to-pink-500"
          link="/admin/messages"
          change="+5 hoy"
        />
        <DashboardCard
          title="Visitas"
          value={stats.views}
          icon="📊"
          color="bg-gradient-to-r from-orange-500 to-red-500"
          link="/admin/analytics"
          change="+12% vs mes anterior"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickStats />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/portfolio/new"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-colors group"
        >
          <div className="flex items-center">
            <span className="text-2xl mr-4">🚀</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-cyan-600">
                Nuevo Proyecto
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Añade un nuevo proyecto al portfolio
              </p>
            </div>
          </div>
        </Link>
        
        <Link
          href="/admin/blog/new"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 transition-colors group"
        >
          <div className="flex items-center">
            <span className="text-2xl mr-4">📝</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600">
                Nuevo Artículo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Escribe un nuevo artículo técnico
              </p>
            </div>
          </div>
        </Link>
        
        <Link
          href="/admin/homepage"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-colors group"
        >
          <div className="flex items-center">
            <span className="text-2xl mr-4">🏠</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600">
                Editar Homepage
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Personaliza la página principal
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}