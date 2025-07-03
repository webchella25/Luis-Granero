// src/components/admin/AdminHeader.js
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminHeader({ onMenuClick, user }) {
  const [showQuickActions, setShowQuickActions] = useState(false)

  const quickActions = [
    { name: 'Nuevo Proyecto', href: '/admin/portfolio/new', icon: '🚀' },
    { name: 'Nuevo Artículo', href: '/admin/blog/new', icon: '📝' },
    { name: 'Ver Sitio', href: '/', icon: '🌐', target: '_blank' },
  ]

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="text-xl">☰</span>
          </button>
          
          {/* Search */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="text-xl">⚡</span>
              </button>
              
              {showQuickActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  {quickActions.map((action) => (
                    <Link
                      key={action.name}
                      href={action.href}
                      target={action.target}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => setShowQuickActions(false)}
                    >
                      <span className="mr-3">{action.icon}</span>
                      {action.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
              <span className="text-xl">🔔</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0) || 'L'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 hidden sm:block">
                {user?.name || 'Luis Granero'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}