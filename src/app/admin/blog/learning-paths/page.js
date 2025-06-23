// src/app/admin/blog/learning-paths/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  AcademicCapIcon,
  EyeIcon 
} from '@heroicons/react/24/outline'

export default function LearningPathsManager() {
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchPaths()
  }, [])

  const fetchPaths = async () => {
    try {
      const response = await fetch('/api/admin/learning-paths')
      const data = await response.json()
      setPaths(data.paths || [])
    } catch (error) {
      console.error('Error fetching paths:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePath = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta ruta de aprendizaje?')) return
    
    try {
      await fetch(`/api/admin/learning-paths/${id}`, { method: 'DELETE' })
      setPaths(paths.filter(p => p._id !== id))
    } catch (error) {
      console.error('Error deleting path:', error)
    }
  }

  const togglePublished = async (id, isPublished) => {
    try {
      await fetch(`/api/admin/learning-paths/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished })
      })
      fetchPaths()
    } catch (error) {
      console.error('Error updating path:', error)
    }
  }

  const toggleFeatured = async (id, isFeatured) => {
    try {
      await fetch(`/api/admin/learning-paths/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured })
      })
      fetchPaths()
    } catch (error) {
      console.error('Error updating path:', error)
    }
  }

  const filteredPaths = paths.filter(path => {
    if (filter === 'all') return true
    if (filter === 'published') return path.isPublished
    if (filter === 'draft') return !path.isPublished
    if (filter === 'featured') return path.isFeatured
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando rutas de aprendizaje...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Rutas de Aprendizaje</h1>
          <p className="text-gray-400">Crea secuencias de artículos para enseñar step-by-step</p>
        </div>
        <Link
          href="/admin/blog/learning-paths/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Nueva Ruta</span>
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex space-x-2">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'published', label: 'Publicadas' },
          { id: 'draft', label: 'Borradores' },
          { id: 'featured', label: 'Destacadas' }
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === filterOption.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-white">{paths.length}</div>
          <div className="text-gray-400 text-sm">Total rutas</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-400">
            {paths.filter(p => p.isPublished).length}
          </div>
          <div className="text-gray-400 text-sm">Publicadas</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">
            {paths.filter(p => !p.isPublished).length}
          </div>
          <div className="text-gray-400 text-sm">Borradores</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">
            {paths.reduce((total, path) => total + (path.enrollments || 0), 0)}
          </div>
          <div className="text-gray-400 text-sm">Total inscritos</div>
        </div>
      </div>

      {/* Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaths.map((path) => (
          <div
            key={path._id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{path.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-white line-clamp-1">
                    {path.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {path.articles?.length || 0} artículos • {path.duration}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Link
                  href={`/learning-paths/${path.slug}`}
                  target="_blank"
                  className="text-gray-400 hover:text-white p-1"
                  title="Ver públicamente"
                >
                  <EyeIcon className="w-4 h-4" />
                </Link>
                <Link
                  href={`/admin/blog/learning-paths/${path._id}/edit`}
                  className="text-cyan-400 hover:text-cyan-300 p-1"
                >
                  <PencilIcon className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => deletePath(path._id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
              {path.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                {path.level}
              </span>
              <span className="text-xs text-gray-500">
                {path.enrollments || 0} inscritos
              </span>
            </div>

            {/* Topics preview */}
            <div className="flex flex-wrap gap-1 mb-4">
              {path.topics?.slice(0, 3).map((topic, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-700 text-cyan-400 rounded"
                >
                  {topic}
                </span>
              ))}
              {path.topics?.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded">
                  +{path.topics.length - 3}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => togglePublished(path._id, path.isPublished)}
                  className={`text-xs px-3 py-1 rounded ${
                    path.isPublished
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {path.isPublished ? 'Publicada' : 'Borrador'}
                </button>
                
                {path.isPublished && (
                  <button
                    onClick={() => toggleFeatured(path._id, path.isFeatured)}
                    className={`text-xs px-3 py-1 rounded ${
                      path.isFeatured
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {path.isFeatured ? '⭐ Destacada' : 'Destacar'}
                  </button>
                )}
              </div>

              {path.isPremium && (
                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                  💎 Premium
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredPaths.length === 0 && (
          <div className="col-span-full text-center py-12">
            <AcademicCapIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 mb-4">
              {filter === 'all' ? 'No hay rutas de aprendizaje' : `No hay rutas ${filter}`}
            </div>
            <Link
              href="/admin/blog/learning-paths/new"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md"
            >
              Crear tu primera ruta
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}