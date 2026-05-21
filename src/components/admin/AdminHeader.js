'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, Search, Bell, Plus, ExternalLink, FileText, Briefcase } from 'lucide-react'

const quickActions = [
  { name: 'Nuevo artículo', href: '/admin/blog/new', icon: FileText },
  { name: 'Nuevo proyecto', href: '/admin/portfolio/new', icon: Briefcase },
  { name: 'Ver sitio web', href: '/', icon: ExternalLink, target: '_blank' },
]

export default function AdminHeader({ onMenuClick, user }) {
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    // Polling cada 60 segundos
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications?limit=10')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch {}
  }

  const markAllRead = async () => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true })
    })
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const notifIcon = {
    email_opened: '📧',
    email_clicked: '🔗',
    demo_visited: '🔥',
    lead_stale: '⏰',
    appointment_booked: '📅'
  }

  return (
    <header className="bg-[#080E1A] border-b border-slate-800 sticky top-0 z-30">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">

          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">

            {/* Quick add */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
                title="Acciones rápidas"
              >
                <Plus className="w-5 h-5" />
              </button>

              {showQuickActions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowQuickActions(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-[#0B1120] border border-slate-800 rounded-xl shadow-2xl shadow-black/50 z-20 py-1 overflow-hidden">
                    {quickActions.map((action) => {
                      const Icon = action.icon
                      return (
                        <Link
                          key={action.name}
                          href={action.href}
                          target={action.target}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                          onClick={() => setShowQuickActions(false)}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {action.name}
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors relative"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-[#0B1120] border border-slate-800 rounded-xl shadow-2xl shadow-black/50 z-20 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                      <span className="text-sm font-semibold text-slate-200">Notificaciones</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-cyan-400 hover:text-cyan-300">
                          Marcar todas leídas
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">Sin notificaciones nuevas</div>
                      ) : (
                        notifications.map(n => (
                          <Link
                            key={n._id}
                            href={n.leadId ? `/admin/leads/${n.leadId}` : '/admin'}
                            onClick={() => setShowNotifications(false)}
                            className={`flex gap-3 px-4 py-3 border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors ${!n.isRead ? 'bg-cyan-500/5' : ''}`}
                          >
                            <span className="text-lg flex-shrink-0 mt-0.5">{notifIcon[n.type] || '🔔'}</span>
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${n.isRead ? 'text-slate-400' : 'text-slate-200'}`}>{n.title}</p>
                              {n.message && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>}
                              <p className="text-xs text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString('es-ES')}</p>
                            </div>
                            {!n.isRead && <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-2" />}
                          </Link>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-800">
                      <Link href="/admin/leads" className="text-xs text-cyan-400 hover:text-cyan-300" onClick={() => setShowNotifications(false)}>
                        Ver todos los leads →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">L</span>
              </div>
              <span className="text-sm font-medium text-slate-300 hidden sm:block">
                {user?.name || 'Luis'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
