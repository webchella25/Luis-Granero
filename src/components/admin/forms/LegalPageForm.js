// src/components/admin/forms/LegalPageForm.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAvailableVariables } from '@/lib/replaceLegalVariables'

export default function LegalPageForm({ initialData = null, isEditing = false }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showVariables, setShowVariables] = useState(false)
  const [formData, setFormData] = useState({
    pageType: '',
    title: '',
    slug: '',
    metaDescription: '',
    content: '',
    isPublished: false
  })

  const pageTypes = [
    { value: 'aviso-legal', label: '⚖️ Aviso Legal', slug: 'aviso-legal' },
    { value: 'privacidad', label: '🔒 Política de Privacidad', slug: 'privacidad' },
    { value: 'cookies', label: '🍪 Política de Cookies', slug: 'cookies' },
    { value: 'terminos', label: '📜 Términos y Condiciones', slug: 'terminos' }
  ]

  useEffect(() => {
    if (initialData) {
      setFormData({
        pageType: initialData.pageType || '',
        title: initialData.title || '',
        slug: initialData.slug || '',
        metaDescription: initialData.metaDescription || '',
        content: initialData.content || '',
        isPublished: initialData.isPublished || false
      })
    }
  }, [initialData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing 
        ? `/api/admin/legal/${initialData._id}`
        : '/api/admin/legal'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin/legal')
      } else {
        alert(data.error || 'Error al guardar la página')
      }
    } catch (error) {
      console.error('Error saving legal page:', error)
      alert('Error al guardar la página')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => {
      const updates = { ...prev, [field]: value }
      
      // Auto-generar slug cuando se selecciona el tipo
      if (field === 'pageType' && !isEditing) {
        const selectedType = pageTypes.find(t => t.value === value)
        if (selectedType) {
          updates.slug = selectedType.slug
          updates.title = selectedType.label.replace(/[⚖️🔒🍪📜]/g, '').trim()
        }
      }
      
      return updates
    })
  }

  const insertVariable = (variable) => {
    const textarea = document.getElementById('content-textarea')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.content
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    
    setFormData(prev => ({
      ...prev,
      content: before + variable + after
    }))
    
    // Restaurar focus y posición del cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  }

  const loadTemplate = async (pageType) => {
    if (!confirm('¿Cargar template? Esto sobrescribirá el contenido actual.')) return
    
    try {
      const response = await fetch(`/api/admin/legal/templates/${pageType}`)
      const data = await response.json()
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          content: data.template
        }))
      }
    } catch (error) {
      console.error('Error loading template:', error)
      alert('Error al cargar el template')
    }
  }

  const variables = getAvailableVariables()

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Información básica */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-6">Información Básica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tipo de página */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Página Legal *
            </label>
            <select
              required
              disabled={isEditing}
              value={formData.pageType}
              onChange={(e) => updateField('pageType', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white disabled:opacity-50"
            >
              <option value="">Seleccionar tipo</option>
              {pageTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {isEditing && (
              <p className="text-xs text-gray-500 mt-1">
                No se puede cambiar el tipo después de crear la página
              </p>
            )}
          </div>

          {/* Título */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder="Ej: Aviso Legal"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder="aviso-legal"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: /legal/<strong className="text-cyan-400">{formData.slug || 'tu-slug'}</strong>
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meta Descripción
            </label>
            <input
              type="text"
              value={formData.metaDescription}
              onChange={(e) => updateField('metaDescription', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder="Breve descripción para SEO"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.metaDescription.length}/160 caracteres
            </p>
          </div>

          {/* Estado */}
          <div className="md:col-span-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => updateField('isPublished', e.target.checked)}
                className="w-4 h-4 text-cyan-600 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-300">
                Publicar página (visible en el sitio web)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Editor de Contenido */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Contenido Legal</h3>
          <div className="flex items-center space-x-2">
            {formData.pageType && (
              <button
                type="button"
                onClick={() => loadTemplate(formData.pageType)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
              >
                📄 Cargar Template
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowVariables(!showVariables)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            >
              {showVariables ? 'Ocultar' : 'Mostrar'} Variables
            </button>
          </div>
        </div>

        {/* Variables disponibles */}
        {showVariables && (
          <div className="mb-4 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-3">
              Variables Disponibles (clic para insertar):
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {variables.map((variable) => (
                <button
                  key={variable.key}
                  type="button"
                  onClick={() => insertVariable(variable.key)}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-left transition-colors"
                  title={variable.description}
                >
                  <code className="text-xs text-cyan-400">{variable.key}</code>
                  <p className="text-xs text-gray-400 mt-1">{variable.description}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Las variables se reemplazarán automáticamente con los datos configurados en "Datos Legales"
            </p>
          </div>
        )}

        {/* Textarea */}
        <textarea
          id="content-textarea"
          rows={25}
          required
          value={formData.content}
          onChange={(e) => updateField('content', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Escribe el contenido legal en Markdown..."
        />
        
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>
            Markdown soportado: **negrita**, *cursiva*, ## títulos, - listas, [enlaces](url)
          </span>
          <span>
            {formData.content.length} caracteres
          </span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-700">
        <button
          type="button"
          onClick={() => router.push('/admin/legal')}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-md font-semibold transition-colors flex items-center space-x-2"
        >
          <span>{loading ? 'Guardando...' : (isEditing ? 'Actualizar Página' : 'Crear Página')}</span>
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </button>
      </div>
    </form>
  )
}