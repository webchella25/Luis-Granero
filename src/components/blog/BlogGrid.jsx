// src/components/blog/BlogGrid.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBlogData } from '@/hooks/useBlogData';

function BlogGrid({ 
  posts: initialPosts = [], 
  pagination: initialPagination = {},
  categories: initialCategories = {},
  filters: initialFilters = {}
}) {
  // Si vienen datos server-side, usarlos; sino usar hook para datos client-side
  const shouldUseFetch = !initialPosts.length;
  
  const {
    posts: fetchedPosts,
    pagination: fetchedPagination,
    categories: fetchedCategories,
    filters: fetchedFilters,
    loading,
    error,
    updateFilters,
    changePage
  } = useBlogData(shouldUseFetch ? {} : initialFilters);

  // Usar datos server-side si están disponibles, sino usar datos fetched
  const posts = shouldUseFetch ? fetchedPosts : initialPosts;
  const pagination = shouldUseFetch ? fetchedPagination : initialPagination;
  const categories = shouldUseFetch ? fetchedCategories : initialCategories;
  const filters = shouldUseFetch ? fetchedFilters : initialFilters;

  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [sortBy, setSortBy] = useState(filters.sort || 'publishedAt');

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (shouldUseFetch) {
      updateFilters({ category });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (shouldUseFetch) {
      updateFilters({ search: searchTerm });
    }
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    if (shouldUseFetch) {
      updateFilters({ sort });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Principiante': return 'bg-green-500';
      case 'Intermedio': return 'bg-yellow-500';
      case 'Avanzado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading && shouldUseFetch) {
    return (
      <div className="space-y-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-64 bg-gray-800 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Error cargando posts: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-md"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros y búsqueda */}
      <div className="mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar artículos..."
                className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Ordenar */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="publishedAt">Más recientes</option>
            <option value="views">Más populares</option>
            <option value="title">Alfabético</option>
          </select>
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Todos ({pagination.total || 0})
          </button>
          
          {Object.entries(categories).map(([category, count]) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid de posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No se encontraron artículos</div>
          <p className="text-gray-500">Intenta cambiar los filtros o buscar otro término</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {posts.map((post) => (
              <article 
                key={post._id}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Imagen destacada */}
                {post.featuredImage && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Meta información */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      
                      {post.difficulty && (
                        <span className={`${getDifficultyColor(post.difficulty)} text-white px-2 py-1 rounded text-xs font-medium`}>
                          {post.difficulty}
                        </span>
                      )}
                      
                      {post.isFeatured && (
                        <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                          ⭐ Destacado
                        </span>
                      )}
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      {post.readingTime} min
                    </div>
                  </div>

                  {/* Título */}
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{post.tags.length - 3} más
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>•</span>
                      <span>{post.stats?.views || 0} vistas</span>
                    </div>
                    
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-cyan-400 hover:text-cyan-300 font-medium text-sm flex items-center space-x-1"
                    >
                      <span>Leer más</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <div className="flex space-x-1">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  const isCurrentPage = page === pagination.page;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => changePage(page)}
                      className={`px-3 py-2 rounded-md text-sm ${
                        isCurrentPage
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BlogGrid;