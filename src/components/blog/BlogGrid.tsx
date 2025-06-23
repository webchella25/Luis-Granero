// src/components/blog/BlogGrid.tsx - Versión dinámica corregida
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTime: string;
  publishDate: string;
  views: string;
  difficulty: string;
  featured: boolean;
  slug: string;
}

interface Props {
  posts?: BlogPost[];
  categories?: string[];
  pagination?: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  currentCategory?: string;
}

export default function BlogGrid({ 
  posts = [], 
  categories = [], 
  pagination,
  currentCategory = 'all' 
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Posts de fallback si no hay datos del admin
  const defaultPosts: BlogPost[] = [
    {
      _id: '1',
      title: "React 18: Nuevas funcionalidades que debes conocer",
      excerpt: "Exploramos las características más importantes de React 18: Concurrent Rendering, Automatic Batching, Suspense mejorado y más.",
      category: "React",
      tags: ["React", "Hooks", "Performance"],
      readTime: "8 min",
      publishDate: "12 Enero 2025",
      views: "2,100",
      difficulty: "Intermedio",
      featured: false,
      slug: "react-18-nuevas-funcionalidades"
    },
    {
      _id: '2',
      title: "Next.js 14 App Router: Migración paso a paso",
      excerpt: "Guía completa para migrar de Pages Router a App Router en Next.js 14, con ejemplos prácticos y mejores prácticas.",
      category: "Next.js",
      tags: ["Next.js", "Migration", "App Router"],
      readTime: "12 min",
      publishDate: "10 Enero 2025",
      views: "1,850",
      difficulty: "Avanzado",
      featured: false,
      slug: "nextjs-14-app-router-migracion"
    },
    {
      _id: '3',
      title: "Core Web Vitals: Optimización completa para 2025",
      excerpt: "Todo lo que necesitas saber sobre LCP, FID, CLS y las nuevas métricas INP. Técnicas prácticas con ejemplos reales.",
      category: "Performance",
      tags: ["Performance", "Core Web Vitals", "SEO"],
      readTime: "15 min",
      publishDate: "8 Enero 2025",
      views: "3,200",
      difficulty: "Intermedio",
      featured: true,
      slug: "core-web-vitals-optimizacion-2025"
    }
  ];

  // Usar datos reales si existen, sino fallback
  const displayPosts = posts.length > 0 ? posts : defaultPosts;
  
  // Actualizar filteredPosts cuando cambien los posts o la categoría
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPosts(displayPosts);
    } else {
      const filtered = displayPosts.filter(post => 
        post.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredPosts(filtered);
    }
  }, [selectedCategory, displayPosts]);

  // Categorías dinámicas
  const allCategories = [
    { id: 'all', name: 'Todos', count: displayPosts.length },
    ...categories.map(cat => ({
      id: cat.toLowerCase(),
      name: cat,
      count: displayPosts.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length
    }))
  ];

  // Categorías por defecto si no hay datos
  const defaultCategories = [
    { id: 'all', name: 'Todos', count: displayPosts.length },
    { id: 'react', name: 'React', count: displayPosts.filter(p => p.category === 'React').length },
    { id: 'next.js', name: 'Next.js', count: displayPosts.filter(p => p.category === 'Next.js').length },
    { id: 'performance', name: 'Performance', count: displayPosts.filter(p => p.category === 'Performance').length },
    { id: 'seo', name: 'SEO', count: displayPosts.filter(p => p.category === 'SEO').length }
  ];

  const finalCategories = allCategories.length > 1 ? allCategories : defaultCategories;

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    
    if (categoryId === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    params.delete('page'); // Reset page when changing category
    
    router.push(`/blog?${params.toString()}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'principiante':
      case 'básico':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermedio':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'avanzado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Todos los Artículos
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Tutoriales técnicos, guías prácticas y casos de estudio reales
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {finalCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post._id}
              className={`group bg-gray-900/50 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${
                post.featured 
                  ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                  : 'border-gray-800 hover:border-cyan-500/50'
              }`}
            >
              
              {post.featured && (
                <div className="bg-gradient-to-r from-cyan-400 to-green-400 text-black px-4 py-2 text-sm font-bold text-center">
                  ⭐ Artículo Destacado
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-cyan-400 text-sm font-semibold">
                    {post.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(post.difficulty)}`}>
                    {post.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags?.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{post.readTime}</span>
                  <span>{post.publishDate}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-xs">
                    {post.views} vistas
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="block w-full py-2 px-4 bg-gradient-to-r from-cyan-500/20 to-green-500/20 border border-cyan-500/30 text-cyan-400 font-semibold rounded-lg hover:bg-gradient-to-r hover:from-cyan-500 hover:to-green-500 hover:text-black transition-all duration-300 text-center"
                >
                  Leer artículo
                </Link>
              </div>

            </article>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.total > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-12">
            {pagination.hasPrev && (
              <Link
                href={`/blog?page=${pagination.current - 1}${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Anterior
              </Link>
            )}
            
            <span className="text-gray-400">
              Página {pagination.current} de {pagination.total}
            </span>
            
            {pagination.hasNext && (
              <Link
                href={`/blog?page=${pagination.current + 1}${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Siguiente
              </Link>
            )}
          </div>
        )}

        {/* Empty state */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              No hay artículos en esta categoría
            </div>
            <Link
              href="/admin/blog/new"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Escribir el primer artículo de {selectedCategory}
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}