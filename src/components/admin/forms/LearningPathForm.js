// src/components/admin/forms/LearningPathForm.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

export default function LearningPathForm({ initialData = null, isEditing = false }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration: '4 semanas',
    level: 'Intermedio',
    topics: [''],
    articles: [],
    prerequisites: [''],
    learningObjectives: [''],
    icon: '🎯',
    isPublished: false,
    isFeatured: false,
    isPremium: false
  })

  useEffect(() => {
    fetchPosts()
    if (initialData) {
      setFormData({
        ...initialData,
        topics: initialData.topics?.length > 0 ? initialData.topics : [''],
        prerequisites: initialData.prerequisites?.length > 0 ? initialData.prerequisites : [''],
        learningObjectives: initialData.learningObjectives?.length > 0 ? initialData.learningObjectives : [''],
        articles: initialData.articles || []
      })
    }
  }, [initialData])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing 
        ? `/api/admin/learning-paths/${initialData._id}`
        : '/api/admin/learning-paths'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          topics: formData.topics.filter(t => t.trim()),
          prerequisites: formData.prerequisites.filter(p => p.trim()),
          learningObjectives: formData.learningObjectives.filter(o => o.trim())
        })
      })

      if (response.ok) {
        router.push('/admin/blog/learning-paths')
      } else {
        const error = await response.json()
        alert(error.message || 'Error al guardar la ruta')
      }
    } catch (error) {
      console.error('Error saving learning path:', error)
      alert('Error al guardar la ruta')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => {
      const updates = { ...prev, [field]: value };
      
      // Auto-generar slug desde el título si no existe
      if (field === 'title' && !prev.slug && !isEditing) {
        updates.slug = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // quitar acentos
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      
      return updates;
    });
  }

  const updateArrayField = (field, index, value) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData(prev => ({ ...prev, [field]: newArray }))
  }

  const addArrayField = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }))
  }

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const addArticle = () => {
    setFormData(prev => ({
      ...prev,
      articles: [...prev.articles, {
        postId: '',
        title: '',
        order: prev.articles.length + 1,
        isRequired: true
      }]
    }))
  }

  const updateArticle = (index, field, value) => {
    const newArticles = [...formData.articles]
    newArticles[index] = { ...newArticles[index], [field]: value }
    
    // Si se selecciona un post, actualizar el título automáticamente
    if (field === 'postId' && value) {
      const selectedPost = posts.find(p => p._id === value)
      if (selectedPost) {
        newArticles[index].title = selectedPost.title
      }
    }
    
    setFormData(prev => ({ ...prev, articles: newArticles }))
  }

  const removeArticle = (index) => {
    const newArticles = formData.articles.filter((_, i) => i !== index)
    // Reordenar los índices
    newArticles.forEach((article, i) => {
      article.order = i + 1
    })
    setFormData(prev => ({ ...prev, articles: newArticles }))
  }

  const moveArticle = (index, direction) => {
    const newArticles = [...formData.articles]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < newArticles.length) {
      // Intercambiar elementos
      [newArticles[index], newArticles[newIndex]] = [newArticles[newIndex], newArticles[index]]
      
      // Actualizar orden
      newArticles.forEach((article, i) => {
        article.order = i + 1
      })
      
      setFormData(prev => ({ ...prev, articles: newArticles }))
    }
  }

  const icons = ['🎯', '⚛️', '🚀', '💻', '🔧', '📊', '🎓', '💡', '🌟', '⚡', '📚', '🛠️', '🔥', '✨', '🎨', '📱']

  const levels = [
    'Principiante',
    'Intermedio', 
    'Avanzado',
    'Principiante → Intermedio',
    'Intermedio → Avanzado',
    'Principiante → Avanzado'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Información básica */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-6">Información Básica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Título */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título de la Ruta *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej: React Developer Path"
            />
          </div>

          {/* Slug */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug (URL amigable) *
            </label>
            <input
              type="text"
              required
              value={formData.slug || ''}
              onChange={(e) => updateField('slug', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="react-developer-path"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se genera automáticamente desde el título. URL: /cursos/<strong className="text-purple-400">{formData.slug || 'tu-slug'}</strong>
            </p>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Breve descripción de lo que aprenderán en esta ruta..."
            />
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duración estimada *
            </label>
            <input
              type="text"
              required
              value={formData.duration}
              onChange={(e) => updateField('duration', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej: 8 semanas"
            />
          </div>

          {/* Nivel */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nivel *
            </label>
            <select
              required
              value={formData.level}
              onChange={(e) => updateField('level', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Icono */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icono
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-4xl">{formData.icon}</span>
              <select
                value={formData.icon}
                onChange={(e) => updateField('icon', e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {icons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estado */}
          <div className="md:col-span-2 space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => updateField('isPublished', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Publicar ruta (visible en /cursos)</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => updateField('isFeatured', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">⭐ Destacar ruta (aparecerá primero)</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => updateField('isPremium', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">💎 Marcar como Premium</span>
            </label>
          </div>
        </div>
      </div>

      {/* Temas */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-6">Temas que se cubren</h3>
        
        {formData.topics.map((topic, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => updateArrayField('topics', index, e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej: Fundamentos, Hooks, Context API..."
            />
            <button
              type="button"
              onClick={() => removeArrayField('topics', index)}
              className="text-red-400 hover:text-red-300 p-2"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => addArrayField('topics')}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2"
        >
          + Agregar tema
        </button>
      </div>

      {/* Artículos de la ruta */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-white">Artículos de la Ruta</h3>
            <p className="text-sm text-gray-400 mt-1">
              Añade y ordena los artículos que forman parte de esta ruta
            </p>
          </div>
          <button
            type="button"
            onClick={addArticle}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Agregar artículo</span>
          </button>
        </div>

        {formData.articles.length > 0 ? (
          <div className="space-y-4">
            {formData.articles
              .sort((a, b) => a.order - b.order)
              .map((article, index) => (
                <div
                  key={index}
                  className="bg-gray-700 border border-gray-600 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    
                    {/* Orden y controles */}
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-gray-400 font-mono">#{article.order}</span>
                      <button
                        type="button"
                        onClick={() => moveArticle(index, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover arriba"
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveArticle(index, 'down')}
                        disabled={index === formData.articles.length - 1}
                        className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover abajo"
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Contenido del artículo */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Seleccionar artículo del blog
                        </label>
                        <select
                          value={article.postId}
                          onChange={(e) => updateArticle(index, 'postId', e.target.value)}
                          className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">-- Seleccionar artículo --</option>
                          {posts.filter(post => post.isPublished).map(post => (
                            <option key={post._id} value={post._id}>
                              {post.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Título personalizado (opcional)
                        </label>
                        <input
                          type="text"
                          value={article.title || ''}
                          onChange={(e) => updateArticle(index, 'title', e.target.value)}
                          className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Dejar vacío para usar el título del artículo"
                        />
                      </div>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={article.isRequired}
                          onChange={(e) => updateArticle(index, 'isRequired', e.target.checked)}
                          className="rounded border-gray-500 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-300">Artículo obligatorio</span>
                      </label>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      type="button"
                      onClick={() => removeArticle(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Eliminar artículo"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600">
            <p className="mb-2">No hay artículos en la ruta</p>
            <p className="text-sm">Haz clic en "Agregar artículo" para empezar</p>
          </div>
        )}
      </div>

      {/* Prerrequisitos */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-6">Prerrequisitos</h3>
        <p className="text-sm text-gray-400 mb-4">
          ¿Qué conocimientos previos necesita el estudiante?
        </p>
        
        {formData.prerequisites.map((prereq, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              value={prereq}
              onChange={(e) => updateArrayField('prerequisites', index, e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej: Conocimientos básicos de JavaScript"
            />
            <button
              type="button"
              onClick={() => removeArrayField('prerequisites', index)}
              className="text-red-400 hover:text-red-300 p-2"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => addArrayField('prerequisites')}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2"
        >
          + Agregar prerrequisito
        </button>
      </div>

      {/* Objetivos de aprendizaje */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-6">Objetivos de Aprendizaje</h3>
        <p className="text-sm text-gray-400 mb-4">
          ¿Qué será capaz de hacer el estudiante al terminar?
        </p>
        
        {formData.learningObjectives.map((objective, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              value={objective}
              onChange={(e) => updateArrayField('learningObjectives', index, e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej: Crear componentes React reutilizables"
            />
            <button
              type="button"
              onClick={() => removeArrayField('learningObjectives', index)}
              className="text-red-400 hover:text-red-300 p-2"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => addArrayField('learningObjectives')}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2"
        >
          + Agregar objetivo
        </button>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-700">
        <button
          type="button"
          onClick={() => router.push('/admin/blog/learning-paths')}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-md font-semibold transition-colors flex items-center space-x-2"
        >
          <span>{loading ? 'Guardando...' : (isEditing ? 'Actualizar Ruta' : 'Crear Ruta')}</span>
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