// src/components/admin/AdminSidebar.js - VERSION OPTIMIZADA
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
        // 🗑️ ELIMINADO: { name: 'Proyectos', href: '/admin/projects', icon: '🚀' },
        { name: 'Mensajes', href: '/admin/messages', icon: '📬' }, // ← RENOMBRADO de "Contactos"
        { name: 'Calculadora', href: '/admin/calculator', icon: '🧮', badge: 'new' },
        { name: 'Configuracion', href: '/admin/settings', icon: '⚙️' }
      ]
    },
    crm: {
      title: 'Herramientas CRM',
      icon: '🎯',
      badge: 'PRO',
      items: [
        { name: 'Buscar Leads', href: '/admin/test-scraper', icon: '🔍', badge: 'new' },
        { name: 'Gestion de Leads', href: '/admin/leads', icon: '📊' },
        { name: 'Secuencias', href: '/admin/sequences', icon: '🚀', badge: 'new' },
        { name: 'Templates Email', href: '/admin/templates', icon: '📧' },
        { name: 'Citas Agendadas', href: '/admin/appointments', icon: '📅' }
      ]
    },
    analytics: {
      title: 'Analytics',
      icon: '📈',
      items: [
        { name: 'Email Analytics', href: '/admin/email-analytics', icon: '📊', badge: 'new' },
        { name: 'Metricas', href: '/admin/analytics', icon: '📈' },
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
    `}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="font-bold text-white">Admin Panel</span>
        </Link>
        
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
        
        {/* Dashboard Link */}
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === '/admin'
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <span className="text-xl">📊</span>
          <span className="font-medium">Dashboard</span>
        </Link>

        {/* Sections */}
        {Object.entries(sections).map(([key, section]) => (
          <div key={key}>
            <button
              onClick={() => toggleSection(key)}
              className="flex items-center justify-between w-full px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{section.icon}</span>
                <span className="font-semibold">{section.title}</span>
                {section.badge && (
                  <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">
                    {section.badge}
                  </span>
                )}
              </div>
              <span className={`transform transition-transform ${collapsed[key] ? '' : 'rotate-180'}`}>
                ▼
              </span>
            </button>
            
            {!collapsed[key] && (
              <div className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between gap-3 px-8 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}