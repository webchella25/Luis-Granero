// src/app/admin/blog/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  AcademicCapIcon 
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

      {/* Filtros y búsqueda */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <div className="flex space-x-2">
          {['all', 'published', 'draft'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === filterType
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filterType === 'all' ? 'Todos' : 
               filterType === 'published' ? 'Publicados' : 'Borradores'}
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-white">{posts.length}</div>
          <div className="text-gray-400 text-sm">Total artículos</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-400">
            {posts.filter(p => p.isPublished).length}
          </div>
          <div className="text-gray-400 text-sm">Publicados</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">
            {posts.filter(p => !p.isPublished).length}
          </div>
          <div className="text-gray-400 text-sm">Borradores</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-cyan-400">
            {[...new Set(posts.flatMap(p => p.tags || []))].length}
          </div>
          <div className="text-gray-400 text-sm">Tags únicos</div>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {posts.length === 0 ? 'No tienes artículos aún' : 'No se encontraron artículos'}
          </div>
          <Link
            href="/admin/blog/new"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-md"
          >
            {posts.length === 0 ? 'Escribir tu primer artículo' : 'Crear nuevo artículo'}
          </Link>
        </div>
      ) : (
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-700">
            {filteredPosts.map((post) => (
              <li key={post._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-white truncate">
                        {post.title}
                      </h3>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        post.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.isPublished ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2">
                      {post.excerpt?.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      {post.category && (
                        <span className="bg-gray-700 px-2 py-1 rounded">
                          {post.category}
                        </span>
                      )}
                      <div className="flex space-x-1">
                        {post.tags?.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-cyan-600 px-2 py-1 rounded text-white">
                            {tag}
                          </span>
                        ))}
                        {post.tags?.length > 3 && (
                          <span className="text-gray-400">+{post.tags.length - 3}</span>
                        )}
                      </div>
                      <span>{post.readTime || '5'} min lectura</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => togglePublished(post._id, post.isPublished)}
                      className={`p-2 rounded-md ${
                        post.isPublished
                          ? 'text-green-400 hover:text-green-300'
                          : 'text-yellow-400 hover:text-yellow-300'
                      }`}
                      title={post.isPublished ? 'Despublicar' : 'Publicar'}
                    >
                      {post.isPublished ? '👁️' : '📝'}
                    </button>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="p-2 text-gray-400 hover:text-cyan-400 rounded-md"
                      title="Ver artículo"
                      target="_blank"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/blog/${post._id}`}
                      className="p-2 text-gray-400 hover:text-cyan-400 rounded-md"
                      title="Editar"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deletePost(post._id)}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-md"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}