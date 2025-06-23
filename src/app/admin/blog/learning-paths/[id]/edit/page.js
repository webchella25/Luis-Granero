// src/app/admin/blog/learning-paths/[id]/edit/page.js
'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import LearningPathForm from '@/components/admin/forms/LearningPathForm'

export default function EditLearningPath() {
  const [pathData, setPathData] = useState(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    fetchPathData()
  }, [])

  const fetchPathData = async () => {
    try {
      const response = await fetch(`/api/admin/learning-paths/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPathData(data.path)
      }
    } catch (error) {
      console.error('Error fetching path:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando ruta...</div>
      </div>
    )
  }

  if (!pathData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Ruta no encontrada</div>
        <Link href="/admin/blog/learning-paths" className="text-cyan-400">
          Volver a rutas
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Editar Ruta de Aprendizaje</h1>
        <p className="text-gray-400">Modifica la ruta: {pathData.title}</p>
      </div>
      
      <LearningPathForm initialData={pathData} isEditing={true} />
    </div>
  )
}