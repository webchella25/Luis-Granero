// src/app/admin/page.js (actualizado con los nuevos botones)
'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    services: 0,
    packages: 0,
    addons: 0,
    projects: 0
  })

  const quickActions = [
    {
      title: 'Gestionar Servicios',
      description: 'Editar servicios ofrecidos',
      href: '/admin/content/services',
      icon: '🛠️',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Gestionar Paquetes',
      description: 'Paquetes de desarrollo',
      href: '/admin/content/packages',
      icon: '📦',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Gestionar Add-ons',
      description: 'Servicios adicionales',
      href: '/admin/content/addons',
      icon: '🔧',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      title: 'Editar Homepage',
      description: 'Contenido principal',
      href: '/admin/content/homepage',
      icon: '🏠',
      color: 'bg-cyan-600 hover:bg-cyan-700'
    },
    {
      title: 'Gestionar Proyectos',
      description: 'Portfolio y casos',
      href: '/admin/projects',
      icon: '💼',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Gestionar Blog',
      description: 'Artículos y contenido',
      href: '/admin/blog',
      icon: '📝',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ]

  const navigationCards = [
    {
      title: 'Gestión de Contenido',
      description: 'Administra páginas, servicios y contenido del sitio',
      href: '/admin/content',
      icon: '📄',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Portfolio & Proyectos',
      description: 'Gestiona casos de estudio y proyectos destacados',
      href: '/admin/projects',
      icon: '💼',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Blog & Artículos',
      description: 'Crea y edita artículos técnicos',
      href: '/admin/blog',
      icon: '📝',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Configuración',
      description: 'Ajustes generales del sitio y usuario',
      href: '/admin/settings',
      icon: '⚙️',
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
          <p className="text-gray-400">Gestiona tu sitio web profesional</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Servicios</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.services}</p>
              </div>
              <div className="text-3xl">🛠️</div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Paquetes</p>
                <p className="text-2xl font-bold text-purple-400">{stats.packages}</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Add-ons</p>
                <p className="text-2xl font-bold text-orange-400">{stats.addons}</p>
              </div>
              <div className="text-3xl">🔧</div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Proyectos</p>
                <p className="text-2xl font-bold text-green-400">{stats.projects}</p>
              </div>
              <div className="text-3xl">💼</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`${action.color} text-white p-4 rounded-lg transition-all duration-300 hover:transform hover:scale-105 flex items-center space-x-3`}
              >
                <div className="text-2xl">{action.icon}</div>
                <div>
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Secciones Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {navigationCards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="group bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all duration-300 hover:transform hover:scale-105 border border-gray-700 hover:border-gray-600"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center text-2xl mb-4`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-gray-300">Servicios actualizados</span>
              </div>
              <span className="text-sm text-gray-500">Hace 5 min</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Nuevo paquete añadido</span>
              </div>
              <span className="text-sm text-gray-500">Hace 2 horas</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300">Add-ons configurados</span>
              </div>
              <span className="text-sm text-gray-500">Ayer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}