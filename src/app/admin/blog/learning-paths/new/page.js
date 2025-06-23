// src/app/admin/blog/learning-paths/new/page.js
'use client'
import LearningPathForm from '@/components/admin/forms/LearningPathForm'

export default function NewLearningPath() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nueva Ruta de Aprendizaje</h1>
        <p className="text-gray-400">Crea una secuencia estructurada de artículos</p>
      </div>
      
      <LearningPathForm />
    </div>
  )
}