// src/app/admin/portfolio/page.js - Gestión de Portfolio
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminPortfolio() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestión de Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra tus proyectos y casos de éxito
          </p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
        >
          + Nuevo Proyecto
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚀</span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {projects.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total proyectos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⭐</span>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {projects.filter(p => p.isFeatured).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Destacados</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔄</span>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {projects.filter(p => p.status === 'En desarrollo').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">En desarrollo</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="text-2xl mr-3">👁️</span>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {projects.reduce((sum, p) => sum + (p.stats?.views || 0), 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total vistas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Proyectos Recientes
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : projects.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map(project => (
              <div key={project._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{project.image || '🚀'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.category} • {project.year}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'En producción' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {project.status}
                    </span>
                    
                    <Link
  href={`/admin/portfolio/${project.slug}/edit`}
  className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
>
  Editar
</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <span className="text-4xl mb-4 block">📂</span>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No hay proyectos aún
            </p>
            <Link
              href="/admin/portfolio/new"
              className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
            >
              Crear tu primer proyecto
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}