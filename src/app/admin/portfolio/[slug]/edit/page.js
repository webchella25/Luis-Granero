// src/app/admin/portfolio/[slug]/edit/page.js - VERSIÓN COMPLETA
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProjectForm from '@/components/admin/forms/ProjectForm'

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const slug = params.slug

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

  const handleSubmit = async (formData) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/projects/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('✅ Proyecto actualizado correctamente')
        router.push('/admin/portfolio')
      } else {
        const error = await response.json()
        alert(`❌ Error: ${error.message || 'Error actualizando proyecto'}`)
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert('❌ Error actualizando proyecto')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-8 max-w-md">
          <h3 className="text-red-400 font-semibold mb-2">❌ {error}</h3>
          <button
            onClick={() => router.push('/admin/portfolio')}
            className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Volver al Portfolio
          </button>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editar Proyecto
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {project.title}
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/portfolio')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          ← Volver
        </button>
      </div>

      <ProjectForm
        initialData={project}
        onSubmit={handleSubmit}
        loading={saving}
        submitText="Guardar Cambios"
      />
    </div>
  )
}