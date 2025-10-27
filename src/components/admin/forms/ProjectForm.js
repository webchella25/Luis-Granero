// src/components/admin/forms/ProjectForm.js - VERSIÓN MEJORADA
'use client'
import { useState } from 'react'

const categories = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'webapp', label: 'Aplicación Web' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'api', label: 'API/Backend' },
  { value: 'saas', label: 'SaaS' }
]

const statusOptions = [
  { value: 'En desarrollo', label: '🔨 En desarrollo' },
  { value: 'En producción', label: '✅ En producción' },
  { value: 'Finalizado', label: '🎉 Finalizado' },
  { value: 'Mantenimiento', label: '🔧 Mantenimiento' }
]

// 🔥 LISTA AMPLIADA DE TECNOLOGÍAS
const commonTechnologies = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
  'TypeScript', 'JavaScript', 'HTML', 'CSS', 'SCSS', 'Sass',
  'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI',
  'Node.js', 'Express', 'NestJS', 'Fastify',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite',
  'Firebase', 'Supabase', 'AWS', 'Vercel', 'Netlify', 'Heroku',
  'Docker', 'Kubernetes', 'Git', 'GitHub Actions',
  'Python', 'Django', 'Flask', 'FastAPI',
  'PHP', 'Laravel', 'WordPress',
  'GraphQL', 'REST API', 'tRPC',
  'Redux', 'Zustand', 'Jotai', 'MobX',
  'Jest', 'Vitest', 'Cypress', 'Playwright',
  'Stripe', 'PayPal', 'Shopify',
  'Figma', 'Adobe XD', 'Sketch'
]

export default function ProjectForm({ 
  initialData = null, 
  onSubmit, 
  loading = false, 
  submitText = 'Guardar' 
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    content: initialData?.content || '',
    technologies: initialData?.technologies || [],
    images: initialData?.images || [''],
    demoUrl: initialData?.demoUrl || '',
    githubUrl: initialData?.githubUrl || '',
    category: initialData?.category || 'ecommerce',
    isFeatured: initialData?.isFeatured || false,
    isPublished: initialData?.isPublished !== false, // 🔥 Por defecto true
    isActive: initialData?.isActive !== false, // 🔥 Por defecto true
    metrics: initialData?.metrics || {},
    features: initialData?.features || [''],
    year: initialData?.year || new Date().getFullYear(),
    status: initialData?.status || 'En producción'
  })

  const [selectedTech, setSelectedTech] = useState('')
  const [customTech, setCustomTech] = useState('')
  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from title
    if (field === 'title' && !initialData) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }

    // Clear error
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

  // 🔥 AÑADIR TECNOLOGÍA DESDE SELECT
  const addTechnology = () => {
    if (selectedTech && !formData.technologies.includes(selectedTech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, selectedTech]
      }))
      setSelectedTech('')
    }
  }

  // 🔥 AÑADIR TECNOLOGÍA PERSONALIZADA
  const addCustomTechnology = () => {
    const tech = customTech.trim()
    if (tech && !formData.technologies.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech]
      }))
      setCustomTech('')
    }
  }

  const removeTechnology = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }

  // 🔥 MANEJO DE FEATURES
  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData(prev => ({ ...prev, features: newFeatures }))
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      setFormData(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }))
    }
  }

  // Imágenes
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

    if (formData.technologies.length === 0) {
      newErrors.technologies = 'Añade al menos una tecnología'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Limpiar arrays vacíos
      const cleanedData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
        images: formData.images.filter(i => i.trim() !== '')
      }
      
      onSubmit(cleanedData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Información Básica */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Información Básica</h3>
        
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título del Proyecto *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full bg-gray-700 border rounded-md px-3 py-2 text-white ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Mi Proyecto Increíble"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className={`w-full bg-gray-700 border rounded-md px-3 py-2 text-white ${
                errors.slug ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="mi-proyecto-increible"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: /portfolio/<strong className="text-cyan-400">{formData.slug || 'slug'}</strong>
            </p>
            {errors.slug && <p className="text-red-400 text-sm mt-1">{errors.slug}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción Breve *
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`w-full bg-gray-700 border rounded-md px-3 py-2 text-white ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Descripción breve del proyecto para listados..."
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Categoría y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Año
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            />
          </div>

          {/* 🔥 CHECKBOXES DE PUBLICACIÓN */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-700">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => handleChange('isPublished', e.target.checked)}
                className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-300">✅ Publicar (visible en web)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleChange('isFeatured', e.target.checked)}
                className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-300">⭐ Proyecto destacado</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-300">🔄 Proyecto activo</span>
            </label>
          </div>
        </div>
      </div>

      {/* 🔥 TECNOLOGÍAS MEJORADAS */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Tecnologías Utilizadas *</h3>
        
        {/* Select de tecnologías comunes */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
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
              Añadir
            </button>
          </div>

          {/* 🔥 Input para tecnología personalizada */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTechnology())}
              placeholder="O escribe una tecnología personalizada..."
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white flex-1"
            />
            <button
              type="button"
              onClick={addCustomTechnology}
              disabled={!customTech.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              + Añadir
            </button>
          </div>
        </div>

        {/* Lista de tecnologías seleccionadas */}
        <div className="flex flex-wrap gap-2 mt-4">
          {formData.technologies.map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30"
            >
              {tech}
              <button
                type="button"
                onClick={() => removeTechnology(tech)}
                className="ml-2 text-cyan-300 hover:text-white"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        {errors.technologies && <p className="text-red-400 text-sm mt-2">{errors.technologies}</p>}
      </div>

      {/* 🔥 CARACTERÍSTICAS/FEATURES MEJORADAS */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Características Principales</h3>
        
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Ej: Sistema de pagos integrado"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
              {formData.features.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="text-red-400 hover:text-red-300 px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addFeature}
            className="text-cyan-400 hover:text-cyan-300 text-sm mt-2"
          >
            + Añadir característica
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Métricas del Proyecto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'performanceImprovement', label: 'Mejora de rendimiento', placeholder: '+40%' },
            { key: 'loadTimeReduction', label: 'Reducción tiempo de carga', placeholder: '-60%' },
            { key: 'conversionIncrease', label: 'Aumento conversiones', placeholder: '+25%' },
            { key: 'userSatisfaction', label: 'Satisfacción usuarios', placeholder: '95%' },
            { key: 'completionTime', label: 'Tiempo de desarrollo', placeholder: '3 meses' },
            { key: 'budget', label: 'Presupuesto', placeholder: '€5,000' }
          ].map(metric => (
            <div key={metric.key}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {metric.label}
              </label>
              <input
                type="text"
                value={formData.metrics[metric.key] || ''}
                onChange={(e) => handleMetricChange(metric.key, e.target.value)}
                placeholder={metric.placeholder}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Contenido Markdown */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Contenido Detallado (Markdown)</h3>
        <textarea
          rows={15}
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="# Descripción del Proyecto&#10;&#10;## Problema&#10;&#10;## Solución&#10;&#10;## Resultados"
          className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white font-mono text-sm"
        />
      </div>

      {/* URLs */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Enlaces</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL Demo / Sitio en vivo
            </label>
            <input
              type="url"
              value={formData.demoUrl}
              onChange={(e) => handleChange('demoUrl', e.target.value)}
              placeholder="https://ejemplo.com"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL GitHub
            </label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => handleChange('githubUrl', e.target.value)}
              placeholder="https://github.com/usuario/repo"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* Imágenes */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Imágenes del Proyecto</h3>
        
        <div className="space-y-2">
          {formData.images.map((image, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-gray-400">{index + 1}.</span>
              <input
                type="url"
                value={image}
                onChange={(e) => updateImage(index, e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-red-400 hover:text-red-300 px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addImageField}
            className="text-cyan-400 hover:text-cyan-300 text-sm mt-2"
          >
            + Añadir imagen
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : submitText}
        </button>
      </div>
    </form>
  )
}