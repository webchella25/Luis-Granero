// src/components/admin/forms/BlogPostForm.js
'use client'
import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import { Editor as MonacoEditor } from '@monaco-editor/react'

const categories = [
  'Desarrollo Web',
  'React/Next.js',
  'TypeScript',
  'Node.js',
  'Performance',
  'SEO',
  'UI/UX',
  'DevOps',
  'Tutoriales',
  'Casos de Estudio'
]

const commonTags = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'CSS', 'HTML',
  'Node.js', 'MongoDB', 'PostgreSQL', 'API', 'Performance', 'SEO',
  'Responsive', 'Mobile', 'PWA', 'Testing', 'Git', 'Docker'
]

export default function BlogPostForm({ 
  initialData = {}, 
  onSubmit, 
  loading = false, 
  submitText = 'Guardar' 
}) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    featuredImage: '',
    isPublished: false,
    publishDate: new Date().toISOString().split('T')[0],
    readTime: 5,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    },
    ...initialData
  })

  const [editMode, setEditMode] = useState('visual') // visual, markdown
  const [selectedTag, setSelectedTag] = useState('')

  // Editor TipTap para modo visual
  const editor = useEditor({
    extensions: [StarterKit, Typography],
    content: formData.content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setFormData(prev => ({ ...prev, content: html }))
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none p-4 min-h-[400px]',
      },
    },
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
      
      // Auto-fill SEO metaTitle if empty
      if (!formData.seo.metaTitle) {
        setFormData(prev => ({
          ...prev,
          seo: { ...prev.seo, metaTitle: value }
        }))
      }
    }

    // Auto-fill SEO metaDescription from excerpt
    if (field === 'excerpt' && !formData.seo.metaDescription) {
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, metaDescription: value }
      }))
    }
  }

  const handleSeoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }))
  }

  const addTag = () => {
    if (selectedTag && !formData.tags.includes(selectedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, selectedTag]
      }))
      setSelectedTag('')
    }
  }

  const addCustomTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Calculate estimated read time
    const wordCount = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200) // Average reading speed
    
    onSubmit({
      ...formData,
      readTime,
      updatedAt: new Date()
    })
  }

  const switchToMarkdown = () => {
    if (editor) {
      const markdown = editor.getHTML() // You'd need a HTML to Markdown converter
      setFormData(prev => ({ ...prev, content: markdown }))
    }
    setEditMode('markdown')
  }

  const switchToVisual = () => {
    setEditMode('visual')
    if (editor) {
      editor.commands.setContent(formData.content)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información básica */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Información del Artículo</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título del Artículo *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Ej: Cómo optimizar React para mejor performance"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="optimizar-react-performance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Extracto/Resumen *
            </label>
            <textarea
              required
              rows={3}
              value={formData.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Breve descripción del artículo para listados y SEO..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Imagen Destacada (URL)
            </label>
            <input
              type="url"
              value={formData.featuredImage}
              onChange={(e) => handleChange('featuredImage', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="https://ejemplo.com/imagen-destacada.jpg"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Tags</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            >
              <option value="">Seleccionar tag</option>
              {commonTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addTag}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md"
            >
              Agregar
            </button>
            <input
              type="text"
              placeholder="O escribe un tag personalizado"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomTag(e.target.value)
                  e.target.value = ''
                }
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-cyan-200 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Editor de contenido */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Contenido del Artículo</h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={switchToVisual}
              className={`px-3 py-1 rounded text-sm ${
                editMode === 'visual' 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Visual
            </button>
            <button
              type="button"
              onClick={switchToMarkdown}
              className={`px-3 py-1 rounded text-sm ${
                editMode === 'markdown' 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Markdown
            </button>
          </div>
        </div>

        {editMode === 'visual' ? (
          <div className="border border-gray-600 rounded-md overflow-hidden bg-gray-900">
            {/* Toolbar del editor */}
            <div className="border-b border-gray-600 p-2 flex space-x-2">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`px-2 py-1 rounded text-sm ${
                  editor?.isActive('bold') ? 'bg-cyan-600 text-white' : 'text-gray-300'
                }`}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`px-2 py-1 rounded text-sm italic ${
                  editor?.isActive('italic') ? 'bg-cyan-600 text-white' : 'text-gray-300'
                }`}
              >
                I
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 rounded text-sm ${
                  editor?.isActive('heading', { level: 2 }) ? 'bg-cyan-600 text-white' : 'text-gray-300'
                }`}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1 rounded text-sm ${
                  editor?.isActive('heading', { level: 3 }) ? 'bg-cyan-600 text-white' : 'text-gray-300'
                }`}
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 rounded text-sm ${
                  editor?.isActive('bulletList') ? 'bg-cyan-600 text-white' : 'text-gray-300'
                }`}
              >
                • Lista
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={`px-2 py-1 rounded text-sm ${
                  editor?.isActive('codeBlock') ? 'bg-cyan-600 text-white' : 'text-gray-300'
                }`}
              >
                Código
              </button>
            </div>
            <EditorContent editor={editor} />
          </div>
        ) : (
          <div className="border border-gray-600 rounded-md overflow-hidden">
            <MonacoEditor
              height="500px"
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
        )}
      </div>

      {/* SEO */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Configuración SEO</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meta Título
            </label>
            <input
              type="text"
              value={formData.seo.metaTitle}
              onChange={(e) => handleSeoChange('metaTitle', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Título para motores de búsqueda"
            />
            <div className="text-xs text-gray-400 mt-1">
              {formData.seo.metaTitle.length}/60 caracteres
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meta Descripción
            </label>
            <textarea
              rows={3}
              value={formData.seo.metaDescription}
              onChange={(e) => handleSeoChange('metaDescription', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Descripción para motores de búsqueda"
            />
            <div className="text-xs text-gray-400 mt-1">
              {formData.seo.metaDescription.length}/160 caracteres
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de publicación */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Configuración de Publicación</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha de Publicación
            </label>
            <input
              type="date"
              value={formData.publishDate}
              onChange={(e) => handleChange('publishDate', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tiempo de Lectura (minutos)
            </label>
            <input
              type="number"
              min="1"
              value={formData.readTime}
              onChange={(e) => handleChange('readTime', parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>
		<div className="mt-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => handleChange('isPublished', e.target.checked)}
              className="form-checkbox h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
            />
            <span className="text-gray-300">Publicar artículo inmediatamente</span>
          </label>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md"
        >
          Guardar Borrador
        </button>
        <button
          type="button"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md"
        >
          Vista Previa
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