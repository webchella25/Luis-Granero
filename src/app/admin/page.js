// src/app/admin/page.js
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
    messages: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/admin/login')
      return
    }
    
    // Cargar estadísticas
    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const dashboardCards = [
    {
      title: 'Proyectos',
      value: stats.projects,
      icon: '🚀',
      color: 'bg-cyan-600',
      link: '/admin/portfolio'
    },
    {
      title: 'Artículos',
      value: stats.posts,
      icon: '📝',
      color: 'bg-green-600',
      link: '/admin/blog'
    },
    {
      title: 'Mensajes',
      value: stats.messages,
      icon: '💬',
      color: 'bg-purple-600',
      link: '/admin/messages'
    },
    {
      title: 'Visitas',
      value: '2.4k',
      icon: '📊',
      color: 'bg-blue-600',
      link: '/admin/analytics'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="text-gray-400">
          Bienvenido, {session.user.name}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Link
            key={index}
            href={card.link}
            className={`${card.color} rounded-lg p-6 text-white hover:opacity-90 transition-opacity`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <div className="text-2xl">{card.icon}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Link
              href="/admin/portfolio/new"
              className="block w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-md text-center font-medium"
            >
              + Nuevo Proyecto
            </Link>
            <Link
              href="/admin/blog/new"
              className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-center font-medium"
            >
              + Nuevo Artículo
            </Link>
            <Link
              href="/admin/content/homepage"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-center font-medium"
            >
              ✏️ Editar Homepage
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Actividad Reciente</h3>
          <div className="space-y-3 text-gray-400">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span>Homepage actualizada</span>
              <span className="text-sm">Hace 2 horas</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span>Nuevo proyecto agregado</span>
              <span className="text-sm">Ayer</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Artículo publicado</span>
              <span className="text-sm">Hace 3 días</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}