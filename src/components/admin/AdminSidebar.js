'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, Briefcase, Wrench, Mail,
  MessageSquare, Calculator, Scale, Settings,
  Users, Calendar,
  TrendingUp, UserCircle, GraduationCap, Award,
  ChevronDown, Globe, X, Layers, Star, BookOpen,
  ChevronsLeft, ChevronsRight
} from 'lucide-react'

const sections = [
  {
    key: 'web',
    title: 'Contenido Web',
    icon: Globe,
    items: [
      { name: 'Blog', href: '/admin/blog', icon: FileText },
      { name: 'Portfolio', href: '/admin/portfolio', icon: Briefcase },
      { name: 'Servicios', href: '/admin/services', icon: Wrench },
      { name: 'Testimonios', href: '/admin/testimonials', icon: Star },
      { name: 'Mensajes', href: '/admin/messages', icon: MessageSquare },
      { name: 'Citas Agendadas', href: '/admin/appointments', icon: Calendar },
      { name: 'Calculadora', href: '/admin/calculator', icon: Calculator },
      { name: 'Páginas Legales', href: '/admin/legal', icon: Scale },
      { name: 'Configuración', href: '/admin/settings', icon: Settings },
    ]
  },
  {
    key: 'analytics',
    title: 'Analytics',
    icon: TrendingUp,
    items: [
      { name: 'Métricas Web', href: '/admin/analytics', icon: TrendingUp },
      { name: 'Usuarios', href: '/admin/users', icon: UserCircle },
    ]
  },
  {
    key: 'students',
    title: 'Estudiantes',
    icon: GraduationCap,
    items: [
      { name: 'Dashboard', href: '/admin/estudiantes', icon: LayoutDashboard },
      { name: 'Lista', href: '/admin/estudiantes/lista', icon: Users },
      { name: 'Certificados', href: '/admin/certificados', icon: Award },
      { name: 'Rutas de Aprendizaje', href: '/admin/learning-paths', icon: BookOpen },
      { name: 'Cursos Email', href: '/admin/email-courses', icon: Mail },
    ]
  }
]

export default function AdminSidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const pathname = usePathname()
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    web: false, analytics: false, students: false
  })

  const toggle = (key) => setSectionsCollapsed(prev => ({ ...prev, [key]: !prev[key] }))

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className={`
      fixed top-0 left-0 z-50 h-screen
      bg-[#080E1A] border-r border-slate-800
      transform transition-all duration-300 ease-in-out
      lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between px-3 h-14 border-b border-slate-800 flex-shrink-0">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-semibold text-slate-100 text-sm truncate">Luis Granero</span>
            <span className="text-[10px] text-slate-500 font-mono bg-slate-800 px-1.5 py-0.5 rounded shrink-0">admin</span>
          </Link>
        )}

        {collapsed && (
          <Link href="/admin" className="mx-auto">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
          </Link>
        )}

        <div className="flex items-center gap-1 ml-1">
          {/* Mobile close */}
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex text-slate-600 hover:text-slate-300 transition-colors p-1 rounded"
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-3 overflow-y-auto h-[calc(100vh-56px)] flex flex-col gap-0.5">

        {/* Dashboard */}
        <Link
          href="/admin"
          title={collapsed ? 'Dashboard' : undefined}
          className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all text-sm font-medium ${
            pathname === '/admin'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        <div className="h-px bg-slate-800 my-2" />

        {/* Sections */}
        {sections.map((section) => {
          const SIcon = section.icon
          return (
            <div key={section.key}>
              {collapsed ? (
                // Collapsed: just show icons with tooltip
                <div className="mb-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.name}
                        className={`flex items-center justify-center px-2.5 py-2.5 rounded-lg transition-all mb-0.5 ${
                          active
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                      </Link>
                    )
                  })}
                  <div className="h-px bg-slate-800/50 my-1" />
                </div>
              ) : (
                // Expanded: show full section
                <>
                  <button
                    onClick={() => toggle(section.key)}
                    className="flex items-center justify-between w-full px-2.5 py-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <SIcon className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold uppercase tracking-wider">{section.title}</span>
                      {section.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-cyan-500/10 text-cyan-400 rounded font-mono leading-none">
                          {section.badge}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${sectionsCollapsed[section.key] ? '-rotate-90' : ''}`} />
                  </button>

                  {!sectionsCollapsed[section.key] && (
                    <div className="mt-0.5 mb-1 space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all text-sm ml-1 ${
                              active
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span>{item.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}

        {/* Footer */}
        <div className="mt-auto pt-2 border-t border-slate-800">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? 'Ver sitio web' : undefined}
            className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Ver sitio web</span>}
          </a>
        </div>
      </nav>
    </aside>
  )
}
