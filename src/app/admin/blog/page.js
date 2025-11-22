// src/app/admin/blog/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  AcademicCapIcon,
  CalendarIcon // ← AÑADIDO
} from '@heroicons/react/24/outline'

export default function BlogManager() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, published, draft
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return

    try {
      await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      setPosts(posts.filter(p => p._id !== id))
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const togglePublished = async (id, isPublished) => {
    try {
      await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished })
      })
      fetchPosts()
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || 
      (filter === 'published' && post.isPublished) ||
      (filter === 'draft' && !post.isPublished)
    
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Cargando artículos...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Blog</h1>
          <p className="text-gray-400">Administra tus artículos y contenido técnico</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/blog/learning-paths"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <AcademicCapIcon className="w-4 h-4" />
            <span>Rutas</span>
          </Link>
          <Link
            href="/admin/blog/categories"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <span>🏷️</span>
            <span>Categorías</span>
          </Link>
          <Link
            href="/admin/blog/new"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nuevo Artículo</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Todos ({posts.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-md ${
              filter === 'published'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Publicados ({posts.filter(p => p.isPublished).length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-md ${
              filter === 'draft'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Borradores ({posts.filter(p => !p.isPublished).length})
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar artículos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400">No hay artículos que mostrar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div
              key={post._id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{post.title}</h3>
                    {post.isPublished ? (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                        Publicado
                      </span>
                    ) : (
                      <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded">
                        Borrador
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 mb-4">{post.excerpt}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(post.publishDate)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{post.views || 0} vistas</span>
                    </span>
                    <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-xs">
                      {post.category}
                    </span>
                    {post.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-gray-500">#{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                    title="Ver artículo"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </Link>
                  <Link
  href={`/admin/blog/${post._id}/edit`}  // ✅ Debe usar _id
  className="text-blue-400 hover:text-blue-300 transition-colors"
>
  <PencilIcon className="w-5 h-5" />
</Link>
                  <button
                    onClick={() => togglePublished(post._id, post.isPublished)}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      post.isPublished
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {post.isPublished ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button
                    onClick={() => deletePost(post._id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}