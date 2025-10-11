// src/components/admin/AdminSidebar.jsx - VERSIÓN MEJORADA
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState({
    web: false,
    crm: false,
    analytics: false
  })

  const toggleSection = (section) => {
    setCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const sections = {
    dashboard: {
      title: 'Dashboard',
      icon: '📊',
      items: [
        { name: 'Inicio', href: '/admin', icon: '🏠' }
      ]
    },
    web: {
      title: 'Contenido Web',
      icon: '🌐',
      items: [
        { name: 'Blog', href: '/admin/blog', icon: '📝' },
        { name: 'Portfolio', href: '/admin/portfolio', icon: '💼' },
        { name: 'Proyectos', href: '/admin/projects', icon: '🚀' },
        { name: 'Contactos', href: '/admin/contacts', icon: '📧' },
        { name: 'Configuración', href: '/admin/settings', icon: '⚙️' }
      ]
    },
    crm: {
      title: 'Herramientas CRM',
      icon: '🎯',
      badge: 'PRO',
      items: [
        { name: 'Buscar Leads', href: '/admin/test-scraper', icon: '🔍', badge: 'new' },
        { name: 'Gestión de Leads', href: '/admin/leads', icon: '📊' },
        { name: 'Templates Email', href: '/admin/templates', icon: '📝' },
        { name: 'Citas Agendadas', href: '/admin/appointments', icon: '📅' }
      ]
    },
    analytics: {
      title: 'Analytics & Stats',
      icon: '📈',
      items: [
        { name: 'Métricas', href: '/admin/analytics', icon: '📊' },
        { name: 'Usuarios', href: '/admin/users', icon: '👥' }
      ]
    }
  }

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 h-screen overflow-y-auto sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
          Luis Granero
        </h1>
        <p className="text-xs text-gray-500 mt-1">Panel de Administración</p>
      </div>

      <nav className="px-3 pb-6">
        {/* Dashboard */}
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
            isActive('/admin') && pathname === '/admin'
              ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <span className="text-xl">📊</span>
          <span>Dashboard</span>
        </Link>

        {/* Secciones colapsables */}
        {['web', 'crm', 'analytics'].map((sectionKey) => {
          const section = sections[sectionKey]
          const hasActiveItem = section.items.some(item => isActive(item.href))

          return (
            <div key={sectionKey} className="mb-4">
              {/* Header de sección */}
              <button
                onClick={() => toggleSection(sectionKey)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all mb-1 ${
                  hasActiveItem
                    ? 'bg-gray-800 text-cyan-400'
                    : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-semibold text-sm uppercase tracking-wide">
                    {section.title}
                  </span>
                  {section.badge && (
                    <span className="px-2 py-0.5 bg-cyan-500 text-black text-xs font-bold rounded-full">
                      {section.badge}
                    </span>
                  )}
                </div>
                <span className={`transition-transform ${collapsed[sectionKey] ? '' : 'rotate-180'}`}>
                  ▼
                </span>
              </button>

              {/* Items de la sección */}
              {!collapsed[sectionKey] && (
                <div className="ml-4 space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Divider */}
        <div className="border-t border-gray-800 my-4"></div>

        {/* Acciones rápidas */}
        <div className="px-4 py-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase">
            Accesos Rápidos
          </p>
          <div className="space-y-2">
            <Link
              href="/admin/test-scraper"
              className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
            >
              <span>➕</span> Buscar Leads
            </Link>
            <Link
              href="/admin/templates"
              className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300"
            >
              <span>✏️</span> Editar Templates
            </Link>
          </div>
        </div>

        {/* User info */}
        <div className="mt-6 px-4 py-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center text-black font-bold">
              LG
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Luis Granero</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  )
}