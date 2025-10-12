// src/components/admin/AdminSidebar.jsx - ACTUALIZADO CON SECUENCIAS
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar({ isOpen, onClose }) {
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
        { name: 'Secuencias', href: '/admin/sequences', icon: '🚀', badge: 'new' }, // 👈 NUEVO
        { name: 'Templates Email', href: '/admin/email-templates', icon: '📧' }, // 👈 NUEVO
        { name: 'Citas Agendadas', href: '/admin/appointments', icon: '📅' }
      ]
    },
    analytics: {
      title: 'Analytics',
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
    <aside className={`
      fixed top-0 left-0 z-50 h-screen w-64 
      bg-gray-900 dark:bg-gray-900 border-r border-gray-800 dark:border-gray-700
      transform transition-transform duration-300 ease-in-out
      lg:translate-x-0 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      overflow-y-auto
      flex flex-col
    `}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800 dark:border-gray-700 flex-shrink-0">
        <Link href="/admin" className="block">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
            Luis Granero
          </h1>
          <p className="text-xs text-gray-500 mt-1">Panel de Admin</p>
        </Link>
        
        {/* Botón cerrar mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Navigation - flex-1 para que ocupe el espacio disponible */}
      <nav className="p-3 flex-1 overflow-y-auto">
        {/* Dashboard */}
        <Link
          href="/admin"
          onClick={() => onClose?.()}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-4 transition-all ${
            pathname === '/admin'
              ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <span className="text-xl">📊</span>
          <span>Dashboard</span>
        </Link>

        {/* Secciones colapsables */}
        {Object.entries(sections).map(([sectionKey, section]) => {
          const hasActiveItem = section.items.some(item => isActive(item.href))

          return (
            <div key={sectionKey} className="mb-3">
              {/* Header de sección */}
              <button
                onClick={() => toggleSection(sectionKey)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all mb-1 ${
                  hasActiveItem
                    ? 'bg-gray-800 text-cyan-400'
                    : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-semibold text-xs uppercase tracking-wide">
                    {section.title}
                  </span>
                  {section.badge && (
                    <span className="px-2 py-0.5 bg-cyan-500 text-black text-[10px] font-bold rounded-full">
                      {section.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs transition-transform ${collapsed[sectionKey] ? '' : 'rotate-180'}`}>
                  ▼
                </span>
              </button>

              {/* Items de la sección */}
              {!collapsed[sectionKey] && (
                <div className="ml-2 space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose?.()}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-sm ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto px-1.5 py-0.5 bg-green-500 text-black text-[10px] font-bold rounded-full">
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

        {/* Accesos rápidos */}
        <div className="px-3 py-3 bg-gray-800/50 rounded-lg">
          <p className="text-[10px] text-gray-500 font-semibold mb-2 uppercase tracking-wider">
            Accesos Rápidos
          </p>
          <div className="space-y-1.5">
            <Link
              href="/admin/test-scraper"
              onClick={() => onClose?.()}
              className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 py-1.5 px-2 rounded hover:bg-gray-800 transition-colors"
            >
              <span>➕</span> Buscar Leads
            </Link>
            <Link
              href="/admin/sequences"
              onClick={() => onClose?.()}
              className="flex items-center gap-2 text-xs text-green-400 hover:text-green-300 py-1.5 px-2 rounded hover:bg-gray-800 transition-colors"
            >
              <span>🚀</span> Nueva Secuencia
            </Link>
            <Link
              href="/admin/email-templates"
              onClick={() => onClose?.()}
              className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 py-1.5 px-2 rounded hover:bg-gray-800 transition-colors"
            >
              <span>✏️</span> Editar Templates
            </Link>
          </div>
        </div>
      </nav>

      {/* User info - En flujo normal, al final */}
      <div className="p-3 border-t border-gray-800 bg-gray-900 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-800/50 rounded-lg">
          <div className="w-9 h-9 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
            LG
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">Luis Granero</p>
            <p className="text-[10px] text-gray-500">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  )
}