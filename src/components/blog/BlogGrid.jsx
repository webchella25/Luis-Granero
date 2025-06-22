'use client';

import { useState } from 'react';

function BlogGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', count: 25 },
    { id: 'react', name: 'React', count: 8 },
    { id: 'nextjs', name: 'Next.js', count: 6 },
    { id: 'performance', name: 'Performance', count: 5 },
    { id: 'seo', name: 'SEO', count: 4 },
    { id: 'tutorial', name: 'Tutoriales', count: 7 }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "React 18: Nuevas funcionalidades que debes conocer",
      excerpt: "Exploramos las características más importantes de React 18: Concurrent Rendering, Automatic Batching, Suspense mejorado y más.",
      category: "react",
      tags: ["React", "Hooks", "Performance"],
      readTime: "8 min",
      publishDate: "12 Enero 2025",
      views: "2,100",
      difficulty: "Intermedio",
      image: "⚛️",
      featured: false
    },
    {
      id: 2,
      title: "Next.js 14 App Router: Migración paso a paso",
      excerpt: "Guía completa para migrar de Pages Router a App Router en Next.js 14, con ejemplos prácticos y mejores prácticas.",
      category: "nextjs",
      tags: ["Next.js", "Migration", "App Router"],
      readTime: "12 min",
      publishDate: "10 Enero 2025",
      views: "1,850",
      difficulty: "Avanzado",
      image: "▲",
      featured: false
    },
    {
      id: 3,
      title: "Core Web Vitals: Optimización completa para 2025",
      excerpt: "Todo lo que necesitas saber sobre LCP, FID, CLS y las nuevas métricas INP. Técnicas prácticas con ejemplos reales.",
      category: "performance",
      tags: ["Performance", "Core Web Vitals", "SEO"],
      readTime: "15 min",
      publishDate: "8 Enero 2025",
      views: "3,200",
      difficulty: "Intermedio",
      image: "⚡",
      featured: true
    },
    {
      id: 4,
      title: "TypeScript para desarrolladores React: Guía práctica",
      excerpt: "Aprende TypeScript específicamente para React: tipos de props, hooks tipados, context API y patrones avanzados.",
      category: "tutorial",
      tags: ["TypeScript", "React", "Types"],
      readTime: "10 min",
      publishDate: "5 Enero 2025",
      views: "1,950",
      difficulty: "Intermedio",
      image: "🔷",
      featured: false
    },
    {
      id: 5,
      title: "SEO técnico en Next.js: De 0 a Hero",
      excerpt: "Implementa SEO técnico avanzado en Next.js: metadatos dinámicos, structured data, sitemaps automáticos y más.",
      category: "seo",
      tags: ["SEO", "Next.js", "Metadata"],
      readTime: "18 min",
      publishDate: "3 Enero 2025",
      views: "2,750",
      difficulty: "Avanzado",
      image: "📈",
      featured: true
    },
    {
      id: 6,
      title: "Custom Hooks en React: Patrones y casos de uso",
      excerpt: "Crea hooks personalizados reutilizables: useLocalStorage, useDebounce, useAPI y más ejemplos prácticos.",
      category: "react",
      tags: ["React", "Custom Hooks", "Patterns"],
      readTime: "12 min",
      publishDate: "1 Enero 2025",
      views: "1,650",
      difficulty: "Intermedio",
      image: "🔧",
      featured: false
    },
    {
      id: 7,
      title: "Optimización de imágenes en aplicaciones web",
      excerpt: "Técnicas avanzadas de optimización: WebP, AVIF, lazy loading, responsive images y performance budgets.",
      category: "performance",
      tags: ["Images", "Performance", "Optimization"],
      readTime: "14 min",
      publishDate: "28 Diciembre 2024",
      views: "2,400",
      difficulty: "Intermedio",
      image: "🖼️",
      featured: false
    },
    {
      id: 8,
      title: "Estado global en React: Zustand vs Redux Toolkit",
      excerpt: "Comparativa detallada entre Zustand y Redux Toolkit para gestión de estado global en aplicaciones React.",
      category: "react",
      tags: ["React", "State Management", "Zustand", "Redux"],
      readTime: "16 min",
      publishDate: "25 Diciembre 2024",
      views: "3,100",
      difficulty: "Avanzado",
      image: "🗂️",
      featured: true
    },
    {
      id: 9,
      title: "Deployment automático con GitHub Actions y Vercel",
      excerpt: "Configura CI/CD completo: testing, linting, build y deploy automático con GitHub Actions y Vercel.",
      category: "tutorial",
      tags: ["CI/CD", "GitHub Actions", "Vercel"],
      readTime: "20 min",
      publishDate: "22 Diciembre 2024",
      views: "1,800",
      difficulty: "Avanzado",
      image: "🚀",
      featured: false
    }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Básico':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Intermedio':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Avanzado':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
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
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Blog posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
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
                  <div className="text-4xl">{post.image}</div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(post.difficulty)}`}>
                      {post.difficulty}
                    </span>
                  </div>
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
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded border border-cyan-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <span>📅 {post.publishDate}</span>
                    <span>📖 {post.readTime}</span>
                  </div>
                  <span>👀 {post.views}</span>
                </div>

                {/* Read more */}
                <button className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-green-400 group-hover:text-black">
                  Leer artículo
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Load more */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
            Cargar más artículos
          </button>
        </div>
      </div>
    </section>
  );
}

export default BlogGrid;