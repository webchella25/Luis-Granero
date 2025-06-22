// src/components/admin/forms/ProjectForm.js
'use client'
import { useState } from 'react'
import { Editor } from '@monaco-editor/react'

const categories = [
  { value: 'web-app', label: 'Aplicación Web' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'api', label: 'API/Backend' }
]

const commonTechnologies = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
  'MongoDB', 'PostgreSQL', 'Tailwind CSS', 'SCSS', 'Python', 'Django'
]

export default function ProjectForm({ 
  initialData = {}, 
  onSubmit, 
  loading = false, 
  submitText = 'Guardar' 
}) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '# Descripción del Proyecto\n\n## Problema\n\n## Solución\n\n## Tecnologías Utilizadas\n\n## Resultados',
    technologies: [],
    images: [''],
    demoUrl: '',
    githubUrl: '',
    clientName: '',
    category: 'web-app',
    featured: false,
    isPublished: true,
    metrics: {
      performanceImprovement: '',
      loadTimeReduction: '',
      conversionIncrease: ''
    },
    ...initialData
  })

  const [selectedTech, setSelectedTech] = useState('')

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleMetricChange = (metric, value) => {
    setFormData(prev => ({
      ...prev,
      metrics: { ...prev.metrics, [metric]: value }
    }))
  }

  const addTechnology = () => {
    if (selectedTech && !formData.technologies.includes(selectedTech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, selectedTech]
      }))
      setSelectedTech('')
    }
  }

  const removeTechnology = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const updateImage = (index, url) => {
    const newImages = [...formData.images]
    newImages[index] = url
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Información Básica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título del Proyecto *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Ej: E-commerce con React y Stripe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug (URL)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="ecommerce-react-stripe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoría *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cliente
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Nombre del cliente (opcional)"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descripción Corta *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Descripción breve del proyecto para listados..."
          />
        </div>
      </div>

      {/* Tecnologías */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Tecnologías</h3>
        
        <div className="flex items-center space-x-2 mb-4">
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
          >
            <option value="">Seleccionar tecnología</option>
            {commonTechnologies.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addTechnology}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md"
          >
            Agregar
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.technologies.map((tech, index) => (
            <span
              key={index}
              className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
            >
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => removeTechnology(tech)}
                className="text-cyan-200 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Enlaces */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Enlaces</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Demo URL
            </label>
            <input
              type="url"
              value={formData.demoUrl}
              onChange={(e) => handleChange('demoUrl', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="https://proyecto-demo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => handleChange('githubUrl', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="https://github.com/usuario/proyecto"
            />
          </div>
        </div>
      </div>

      {/* Contenido del proyecto con Monaco Editor */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Contenido del Proyecto</h3>
        <div className="border border-gray-600 rounded-md overflow-hidden">
          <Editor
            height="400px"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={formData.content}
            onChange={(value) => handleChange('content', value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'on'
            }}
          />
        </div>
      </div>

      {/* Métricas */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Métricas y Resultados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mejora de Performance
            </label>
            <input
              type="text"
              value={formData.metrics.performanceImprovement}
              onChange={(e) => handleMetricChange('performanceImprovement', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Ej: +40% velocidad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reducción Tiempo de Carga
            </label>
            <input
              type="text"
              value={formData.metrics.loadTimeReduction}
              onChange={(e) => handleMetricChange('loadTimeReduction', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Ej: -2.3s tiempo carga"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Aumento de Conversión
            </label>
            <input
              type="text"
              value={formData.metrics.conversionIncrease}
              onChange={(e) => handleMetricChange('conversionIncrease', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Ej: +25% conversiones"
            />
          </div>
        </div>
      </div>

      {/* Imágenes */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Imágenes del Proyecto</h3>
        
        <div className="space-y-4">
          {formData.images.map((image, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="url"
                value={image}
                onChange={(e) => updateImage(index, e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-red-400 hover:text-red-300 px-3 py-2"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addImageField}
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            + Agregar otra imagen
          </button>
        </div>
      </div>

      {/* Configuración */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Configuración</h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              className="form-checkbox h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
            />
            <span className="text-gray-300">Proyecto destacado</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => handleChange('isPublished', e.target.checked)}
              className="form-checkbox h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
            />
            <span className="text-gray-300">Publicar proyecto</span>
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md"
        >
          {loading ? 'Guardando...' : submitText}
        </button>
      </div>
    </form>
  )
}