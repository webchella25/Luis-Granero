// src/components/admin/forms/ProjectForm.js
'use client'
import { useState } from 'react'
import { Editor } from '@monaco-editor/react'

const categories = [
  { value: 'web-app', label: 'Aplicación Web' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'api', label: 'API/Backend' },
  { value: 'mobile', label: 'App Mobile' },
  { value: 'saas', label: 'SaaS' }
]

const commonTechnologies = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
  'MongoDB', 'PostgreSQL', 'Tailwind CSS', 'SCSS', 'Python', 'Django',
  'Vue.js', 'Angular', 'Firebase', 'Supabase', 'Vercel', 'Docker'
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
      conversionIncrease: '',
      userSatisfaction: '',
      completionTime: '',
      budget: ''
    },
    year: new Date().getFullYear(),
    status: 'En producción',
    ...initialData
  })

  const [selectedTech, setSelectedTech] = useState('')
  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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
    if (formData.images.length > 1) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es requerido'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es requerido'
    }

    if (formData.technologies.length === 0) {
      newErrors.technologies = 'Al menos una tecnología es requerida'
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Clean up empty images
    const cleanImages = formData.images.filter(img => img.trim() !== '')
    
    const submitData = {
      ...formData,
      images: cleanImages,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: initialData.createdAt || new Date(),
      updatedAt: new Date()
    }

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información básica */}
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
              className={`w-full bg-gray-700 border rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Ej: E-commerce Avanzado con React"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className={`w-full bg-gray-700 border rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 ${
                errors.slug ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="ecommerce-avanzado-react"
            />
            {errors.slug && <p className="text-red-400 text-sm mt-1">{errors.slug}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoría *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full bg-gray-700 border rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 ${
                errors.category ? 'border-red-500' : 'border-gray-600'
              }`}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Año
            </label>
            <input
              type="number"
              min="2020"
              max="2030"
              value={formData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="En producción">En producción</option>
              <option value="En desarrollo">En desarrollo</option>
              <option value="Completado">Completado</option>
              <option value="Pausado">Pausado</option>
            </select>
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
            className={`w-full bg-gray-700 border rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 ${
              errors.description ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Descripción breve del proyecto para listados..."
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-300">Proyecto destacado</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => handleChange('isPublished', e.target.checked)}
              className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-300">Publicado</span>
          </label>
        </div>
      </div>

      {/* Tecnologías */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Tecnologías *</h3>
        
        <div className="flex items-center space-x-2 mb-4">
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white flex-1"
          >
            <option value="">Seleccionar tecnología</option>
            {commonTechnologies.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addTechnology}
            disabled={!selectedTech}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Agregar
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {formData.technologies.map((tech, index) => (
            <span
              key={index}
              className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
            >
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => removeTechnology(tech)}
                className="text-cyan-200 hover:text-white ml-2"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {errors.technologies && <p className="text-red-400 text-sm">{errors.technologies}</p>}
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Satisfacción del Usuario
            </label>
            <input
              type="text"
              value={formData.metrics.userSatisfaction}
              onChange={(e) => handleMetricChange('userSatisfaction', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Ej: 4.8/5 estrellas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tiempo de Desarrollo
            </label>
            <input
              type="text"
              value={formData.metrics.completionTime}
              onChange={(e) => handleMetricChange('completionTime', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Ej: 6 semanas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Presupuesto
            </label>
            <input
              type="text"
              value={formData.metrics.budget}
              onChange={(e) => handleMetricChange('budget', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Ej: €5,000 - €10,000"
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
                  className="text-red-400 hover:text-red-300 px-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addImageField}
          className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
        >
          + Agregar imagen
        </button>
      </div>

      {/* Contenido del proyecto con Monaco Editor */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Contenido del Proyecto *</h3>
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
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
        </div>
        {errors.content && <p className="text-red-400 text-sm mt-2">{errors.content}</p>}
      </div>

      {/* Errores generales */}
      {errors.submit && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Botón de envío */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-md transition-colors flex items-center space-x-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span>{loading ? 'Guardando...' : submitText}</span>
        </button>
      </div>
    </form>
  )
}