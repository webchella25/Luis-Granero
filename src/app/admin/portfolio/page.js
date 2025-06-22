// src/app/admin/portfolio/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

export default function PortfolioManager() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/portfolio')
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return

    try {
      await fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' })
      setProjects(projects.filter(p => p._id !== id))
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const toggleFeatured = async (id, featured) => {
    try {
      await fetch(`/api/admin/portfolio/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured })
      })
      fetchProjects()
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Cargando proyectos...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Portfolio</h1>
          <p className="text-gray-400">Administra tus proyectos y casos de estudio</p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Nuevo Proyecto</span>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No tienes proyectos aún</div>
          <Link
            href="/admin/portfolio/new"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-md"
          >
            Crear tu primer proyecto
          </Link>
        </div>
      ) : (
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-700">
            {projects.map((project) => (
              <li key={project._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {project.images?.[0] ? (
                        <img 
                          src={project.images[0]} 
                          alt={project.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📁</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-white truncate">
                          {project.title}
                        </h3>
                        {project.featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Destacado
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          project.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {project.isPublished ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {project.description?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">
                          Categoría: {project.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          Tecnologías: {project.technologies?.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFeatured(project._id, project.featured)}
                      className={`p-2 rounded-md ${
                        project.featured
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-gray-400 hover:text-yellow-400'
                      }`}
                      title={project.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                    >
                      ⭐
                    </button>
                    <Link
                      href={`/portfolio/${project.slug}`}
                      className="p-2 text-gray-400 hover:text-cyan-400 rounded-md"
                      title="Ver proyecto"
                      target="_blank"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/portfolio/${project._id}`}
                      className="p-2 text-gray-400 hover:text-cyan-400 rounded-md"
                      title="Editar"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteProject(project._id)}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-md"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}