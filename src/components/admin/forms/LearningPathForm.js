// src/components/admin/forms/LearningPathForm.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, TrashIcon, GripVerticalIcon } from '@heroicons/react/24/outline'

export default function LearningPathForm({ initialData = null, isEditing = false }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'Principiante',
    topics: [''],
    articles: [],
    prerequisites: [''],
    learningObjectives: [''],
    estimatedHours: 0,
    color: '#06B6D4',
    icon: '🎯',
    isPublished: false,
    isFeatured: false,
    price: 0,
    isPremium: false
  })

  useEffect(() => {
    fetchPosts()
    if (initialData) {
      setFormData({
        ...initialData,
        topics: initialData.topics || [''],
        prerequisites: initialData.prerequisites || [''],
        learningObjectives: initialData.learningObjectives || [''],
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
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const colors = [
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Green', value: '#10B981' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Indigo', value: '#6366F1' }
  ]

  const icons = ['🎯', '⚛️', '🚀', '💻', '🔧', '📊', '🎓', '💡', '🌟', '⚡', '📚', '🛠️']

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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título de la Ruta *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder="React Developer Path"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder="De principiante a experto en React"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duración *
            </label>
            <input
              type="text"
              required
              value={formData.duration}
              onChange={(e) => updateField('duration', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder="8 semanas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nivel *
            </label>
            <select
              required
              value={formData.level}
              onChange={(e) => updateField('level', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Horas Estimadas
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimatedHours}
              onChange={(e) => updateField('estimatedHours', parseInt(e.target.value) || 0)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder="40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Precio (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder="0 = Gratis"
            />
          </div>
        </div>

        {/* Icono y Color */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icono
            </label>
            <div className="flex flex-wrap gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => updateField('icon', icon)}
                  className={`w-10 h-10 text-xl border rounded-md ${
                    formData.icon === icon 
                      ? 'border-cyan-500 bg-cyan-500/20' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => updateField('color', color.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color.value ? 'border-white' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap gap-6 mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => updateField('isPublished', e.target.checked)}
              className="rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="ml-2 text-sm text-gray-300">Publicar ruta</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => updateField('isFeatured', e.target.checked)}
              className="rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="ml-2 text-sm text-gray-300">Ruta destacada</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPremium}
              onChange={(e) => updateField('isPremium', e.target.checked)}
              className="rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="ml-2 text-sm text-gray-300">Ruta premium</span>
          </label>
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
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder="Fundamentos, Hooks, Context..."
            />
            <button
              type="button"
              onClick={() => removeArrayField('topics', index)}
              className="text-red-400 hover:text-red-300 p-2"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => addArrayField('topics')}
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          + Agregar tema
        </button>
      </div>

      {/* Artículos de la ruta */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-white">Artículos de la Ruta</h3>
          <button
            type="button"
            onClick={addArticle}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Agregar artículo</span>
          </button>
        </div>

        {formData.articles.map((article, index) => (
          <div key={index} className="border border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-white font-medium">Artículo #{article.order}</h4>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => moveArticle(index, 'up')}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveArticle(index, 'down')}
                  disabled={index === formData.articles.length - 1}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeArticle(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Artículo
                </label>
                <select
                  value={article.postId || ''}
                  onChange={(e) => updateArticle(index, 'postId', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Seleccionar artículo existente</option>
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  placeholder="O escribe un título personalizado"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={article.isRequired}
                  onChange={(e) => updateArticle(index, 'isRequired', e.target.checked)}
                  className="rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="ml-2 text-sm text-gray-300">Artículo obligatorio</span>
              </label>
            </div>
          </div>
        ))}

        {formData.articles.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No hay artículos en la ruta. Agrega el primer artículo.
          </div>
        )}
      </div>

      {/* Prerrequisitos */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-6">Prerrequisitos</h3>
        
        {formData.prerequisites.map((prereq, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              value={prereq}
              onChange={(e) => updateArrayField('prerequisites', index, e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder="Conocimientos básicos de JavaScript"
            />
            <button
              type="button"
              onClick={() => removeArrayField('prerequisites', index)}
              className="text-red-400 hover:text-red-300 p-2"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => addArrayField('prerequisites')}
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          + Agregar prerrequisito
        </button>
      </div>

      {/* Objetivos de aprendizaje */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-6">Objetivos de Aprendizaje</h3>
        
        {formData.learningObjectives.map((objective, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              value={objective}
              onChange={(e) => updateArrayField('learningObjectives', index, e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              placeholder="Crear componentes React reutilizables"
            />
            <button
              type="button"
              onClick={() => removeArrayField('learningObjectives', index)}
              className="text-red-400 hover:text-red-300 p-2"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => addArrayField('learningObjectives')}
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          + Agregar objetivo
        </button>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/admin/blog/learning-paths')}
          className="px-6 py-2 text-gray-400 hover:text-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md"
        >
          {loading ? 'Guardando...' : (isEditing ? 'Actualizar Ruta' : 'Crear Ruta')}
        </button>
      </div>
    </form>
  )
}