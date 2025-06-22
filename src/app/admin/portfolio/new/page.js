// src/app/admin/portfolio/new/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProjectForm from '@/components/admin/forms/ProjectForm'

export default function NewProject() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (projectData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      })

      if (response.ok) {
        router.push('/admin/portfolio')
      }
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nuevo Proyecto</h1>
        <p className="text-gray-400">Crea un nuevo proyecto para tu portfolio</p>
      </div>

      <ProjectForm
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Crear Proyecto"
      />
    </div>
  )
}