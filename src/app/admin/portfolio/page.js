// src/app/admin/portfolio/page.js - CON MINIATURAS DE IMÁGENES
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminPortfolio() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

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

  const deleteProject = async (slug) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return
    }

    setDeleting(slug)
    try {
      const response = await fetch(`/api/admin/projects/${slug}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProjects(projects.filter(p => p.slug !== slug))
        alert('✅ Proyecto eliminado correctamente')
      } else {
        alert('❌ Error al eliminar proyecto')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('❌ Error al eliminar proyecto')
    } finally {
      setDeleting(null)
    }
  }

  // 🔥 FUNCIÓN PARA OBTENER LA IMAGEN PRINCIPAL
  const getMainImage = (project) => {
    // Si tiene array de images, retornar la primera
    if (project.images && project.images.length > 0) {
      return project.images[0]
    }
    // Sino, retornar el campo image antiguo
    return project.image || null
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
          <div className="p-6 text-center text-gray-500">
            Cargando proyectos...
          </div>
        ) : projects.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay proyectos todavía. Crea tu primer proyecto.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Imagen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {projects.map((project) => {
                  const mainImage = getMainImage(project)
                  
                  return (
                    <tr key={project._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {/* 🔥 MINIATURA DE IMAGEN */}
                      <td className="px-6 py-4">
                        {mainImage ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={mainImage}
                              alt={project.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl">
                            {project.title.charAt(0)}
                          </div>
                        )}
                      </td>
                      
                      {/* Información del proyecto */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {project.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {project.category} • {project.year}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {project.category}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.status === 'En producción' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : project.status === 'En desarrollo'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/admin/portfolio/${project.slug}/edit`}
                          className="text-cyan-600 hover:text-cyan-900 dark:hover:text-cyan-400 text-sm font-medium"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => deleteProject(project.slug)}
                          disabled={deleting === project.slug}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400 text-sm font-medium disabled:opacity-50"
                        >
                          {deleting === project.slug ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}