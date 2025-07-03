// src/components/admin/QuickStats.js
'use client'
import { useState, useEffect } from 'react'

export default function QuickStats() {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuickStats()
  }, [])

  const fetchQuickStats = async () => {
    try {
      const response = await fetch('/api/admin/quick-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching quick stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Estadísticas Rápidas
        </h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Estadísticas Rápidas
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Proyectos Activos
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {stats.activeProjects || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Artículos Publicados
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {stats.publishedPosts || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Mensajes Sin Leer
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {stats.unreadMessages || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Visitas Esta Semana
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {stats.weeklyVisits || 0}
          </span>
        </div>
      </div>
    </div>
  )
}