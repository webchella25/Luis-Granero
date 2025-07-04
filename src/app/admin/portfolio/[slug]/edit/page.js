// src/app/admin/portfolio/[slug]/edit/page.js - NUEVA PÁGINA
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { use } from 'react'

export default function EditProject() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Resolver params como Promise si es necesario (Next.js 15)
  const resolvedParams = typeof params.then === 'function' ? use(params) : params
  const slug = resolvedParams.slug

  useEffect(() => {
    if (slug) {
      fetchProject()
    }
  }, [slug])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${slug}`)
      
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        setError('Proyecto no encontrado')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      setError('Error cargando proyecto')
    } finally {
      setLoading(false)
    }
  }

  const saveProject = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/projects/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project)
      })

      if (response.ok) {
        alert('Proyecto guardado correctamente')
      } else {
        alert('Error guardando proyecto')
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Error guardando proyecto')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field, value) => {
    setProject(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateArrayField = (field, index, value) => {
    setProject(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field) => {
    setProject(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }))
  }

  const removeArrayItem = (field, index) => {
    setProject(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cargando proyecto...
          </h1>
        </div>
        <div className="animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Error
          </h1>
          <button
            onClick={() => router.push('/admin/portfolio')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Volver al Portfolio
          </button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">
            {error}
          </h3>
          <p className="text-red-600 dark:text-red-400">
            El proyecto con slug "{slug}" no fue encontrado.
          </p>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editar Proyecto
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {project.title}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/admin/portfolio')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={saveProject}
            disabled={saving}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Información Básica
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={project.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={project.subtitle || ''}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  value={project.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={project.category || ''}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="webapp">Web App</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="landing">Landing Page</option>
                    <option value="api">API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={project.status || ''}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="En desarrollo">En desarrollo</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="En producción">En producción</option>
                    <option value="Pausado">Pausado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tecnologías
            </h3>
            
            <div className="space-y-2">
              {(project.technologies || []).map((tech, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={tech}
                    onChange={(e) => updateArrayField('technologies', index, e.target.value)}
                    placeholder="Tecnología"
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => removeArrayItem('technologies', index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('technologies')}
                className="text-cyan-600 hover:text-cyan-700 text-sm"
              >
                + Añadir tecnología
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Características
            </h3>
            
            <div className="space-y-2">
              {(project.features || []).map((feature, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateArrayField('features', index, e.target.value)}
                    placeholder="Característica"
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => removeArrayItem('features', index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('features')}
                className="text-cyan-600 hover:text-cyan-700 text-sm"
              >
                + Añadir característica
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Configuración
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={project.isFeatured || false}
                  onChange={(e) => updateField('isFeatured', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">
                  Proyecto destacado
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={project.isActive !== false}
                  onChange={(e) => updateField('isActive', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">
                  Proyecto activo
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  value={project.year || new Date().getFullYear()}
                  onChange={(e) => updateField('year', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Estadísticas
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Creado:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Actualizado:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vistas:</span>
                <span className="text-gray