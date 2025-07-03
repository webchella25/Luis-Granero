// src/components/admin/AdminSidebar.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Portfolio', href: '/admin/portfolio', icon: '🚀' },
  { name: 'Blog', href: '/admin/blog', icon: '📝' },
  { name: 'Servicios', href: '/admin/services', icon: '⚡' },
  { name: 'Homepage', href: '/admin/homepage', icon: '🏠' },
  { name: 'Mensajes', href: '/admin/messages', icon: '💬' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { name: 'Configuración', href: '/admin/settings', icon: '⚙️' },
]

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-cyan-600 to-blue-600">
          <h1 className="text-xl font-bold text-white">Luis Granero</h1>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-lg
                      transition-all duration-200 group
                      ${isActive 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {item.name}
                    {isActive && (
                      <span className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span className="mr-3">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  )
}