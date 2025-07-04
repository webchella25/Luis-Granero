// src/components/admin/forms/BlogPostForm.jsx - VERSIÓN CORREGIDA
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BlogPostForm({ initialData = null, isEditing = false }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featuredImage: '',
    status: 'draft',
    readingTime: 0,
    difficulty: 'intermedio',
    ...initialData
  })

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await fetch('/api/admin/blog/categories')
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        console.log('✅ Categorías cargadas:', data)
      } else {
        console.error('Error fetching categories:', response.status)
        // Categorías por defecto si falla la API
        setCategories([
          { _id: '1', name: 'Desarrollo Web' },
          { _id: '2', name: 'React & Next.js' },
          { _id: '3', name: 'JavaScript' },
          { _id: '4', name: 'TypeScript' },
          { _id: '5', name: 'Performance' },
          { _id: '6', name: 'SEO' },
          { _id: '7', name: 'Tutoriales' }
        ])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Categorías por defecto en caso de error
      setCategories([
        { _id: '1', name: 'Desarrollo Web' },
        { _id: '2', name: 'React & Next.js' },
        { _id: '3', name: 'JavaScript' },
        { _id: '4', name: 'TypeScript' },
        { _id: '5', name: 'Performance' },
        { _id: '6', name: 'SEO' },
        { _id: '7', name: 'Tutoriales' }
      ])
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Auto-generar slug cuando se escribe el título
    if (name === 'title' && !isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      setFormData(prev => ({ ...prev, slug }))
    }

    // Calcular tiempo de lectura aproximado
    if (name === 'content') {
      const wordsPerMinute = 200
      const wordCount = value.split(' ').length
      const readingTime = Math.ceil(wordCount / wordsPerMinute)
      setFormData(prev => ({ ...prev, readingTime }))
    }

    // Limpiar errores
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es obligatorio'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es obligatorio'
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es obligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const url = isEditing 
        ? `/api/admin/blog/${initialData._id}`
        : '/api/admin/blog'
      
      const method = isEditing ? 'PUT' : 'POST'

      // Procesar tags
      const processedData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData)
      })

      if (response.ok) {
        alert(isEditing ? 'Post actualizado correctamente' : 'Post creado correctamente')
        router.push('/admin/blog')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'No se pudo guardar el post'}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isEditing ? 'Editar Post' : 'Nuevo Post'}
        </h1>
        <p className="text-gray-400">
          {isEditing ? 'Modifica el contenido del post' : 'Crea un nuevo artículo para el blog'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título y Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Título del post"
            />
            {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                errors.slug ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="slug-del-post"
            />
            {errors.slug && <p className="mt-1 text-sm text-red-400">{errors.slug}</p>}
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Extracto *
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              errors.excerpt ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Breve descripción del post"
          />
          {errors.excerpt && <p className="mt-1 text-sm text-red-400">{errors.excerpt}</p>}
        </div>

        {/* Contenido */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contenido *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={15}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              errors.content ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Contenido del post en Markdown"
          />
          {errors.content && <p className="mt-1 text-sm text-red-400">{errors.content}</p>}
        </div>

        {/* Categoría y Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoría *
            </label>
            {loadingCategories ? (
              <div className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-400">
                Cargando categorías...
              </div>
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                  </option>
                ))}
              </select>
            )}
            {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category}</p>}
            
            {/* Botón para crear nueva categoría */}
            <button
              type="button"
              onClick={() => {
                const newCategory = prompt('Nombre de la nueva categoría:')
                if (newCategory) {
                  setCategories(prev => [...prev, { _id: Date.now(), name: newCategory }])
                  setFormData(prev => ({ ...prev, category: newCategory }))
                }
              }}
              className="mt-2 text-sm text-cyan-400 hover:text-cyan-300"
            >
              + Crear nueva categoría
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="react, javascript, tutorial (separados por comas)"
            />
          </div>
        </div>

        {/* Configuración adicional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dificultad
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tiempo de lectura
            </label>
            <input
              type="number"
              name="readingTime"
              value={formData.readingTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="5"
              min="1"
            />
            <p className="mt-1 text-xs text-gray-500">Minutos (se calcula automáticamente)</p>
          </div>
        </div>

        {/* Imagen destacada */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Imagen destacada (URL)
          </label>
          <input
            type="url"
            name="featuredImage"
            value={formData.featuredImage}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={() => router.push('/admin/blog')}
            className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || loadingCategories}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Post' : 'Crear Post')}
          </button>
        </div>
      </form>
    </div>
  )
}