function BlogCategories() {
  const categories = [
    {
      name: "React & Hooks",
      description: "Tutoriales avanzados sobre React 18+, custom hooks, patterns y optimizaciones",
      icon: "⚛️",
      color: "from-cyan-400 to-blue-500",
      posts: 12,
      trending: true,
      topics: ["Custom Hooks", "Performance", "Patterns", "State Management"]
    },
    {
      name: "Next.js",
      description: "Guías completas sobre Next.js 14, App Router, SSR, SSG y deployment",
      icon: "▲",
      color: "from-gray-400 to-gray-600",
      posts: 8,
      trending: true,
      topics: ["App Router", "API Routes", "Middleware", "Deployment"]
    },
    {
      name: "Performance Web",
      description: "Optimización de aplicaciones, Core Web Vitals, bundle analysis y monitoring",
      icon: "⚡",
      color: "from-yellow-400 to-orange-500",
      posts: 10,
      trending: false,
      topics: ["Core Web Vitals", "Bundle Size", "Lazy Loading", "Caching"]
    },
    {
      name: "TypeScript",
      description: "TypeScript para React, tipos avanzados, generics y mejores prácticas",
      icon: "🔷",
      color: "from-blue-400 to-indigo-500",
      posts: 6,
      trending: true,
      topics: ["React Types", "Generics", "Utility Types", "Strict Mode"]
    },
    {
      name: "SEO Técnico",
      description: "SEO moderno, structured data, meta tags dinámicos y Core Web Vitals",
      icon: "📈",
      color: "from-green-400 to-emerald-500",
      posts: 7,
      trending: false,
      topics: ["Structured Data", "Meta Tags", "Sitemaps", "Analytics"]
    },
    {
      name: "DevOps & Deploy",
      description: "CI/CD, Docker, GitHub Actions, Vercel, AWS y automatización de deployments",
      icon: "🚀",
      color: "from-purple-400 to-pink-500",
      posts: 5,
      trending: false,
      topics: ["CI/CD", "Docker", "GitHub Actions", "Monitoring"]
    }
  ];

  const learningPaths = [
    {
      title: "React Developer Path",
      description: "De principiante a experto en React",
      duration: "8 semanas",
      articles: 15,
      difficulty: "Principiante → Avanzado",
      topics: ["Fundamentos", "Hooks", "Context", "Performance", "Testing"]
    },
    {
      title: "Next.js Full Stack",
      description: "Desarrollo completo con Next.js",
      duration: "6 semanas", 
      articles: 12,
      difficulty: "Intermedio → Avanzado",
      topics: ["SSR/SSG", "API Routes", "Database", "Auth", "Deploy"]
    },
    {
      title: "Performance Expert",
      description: "Optimización avanzada de aplicaciones",
      duration: "4 semanas",
      articles: 8,
      difficulty: "Avanzado",
      topics: ["Bundle Analysis", "Core Web Vitals", "Monitoring", "Optimization"]
    }
  ];

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Categories section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Categorías
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Contenido organizado por temas para que encuentres exactamente lo que necesitas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className={`text-lg font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                        {category.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{category.posts} artículos</span>
                        {category.trending && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30">
                            🔥 Trending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {category.description}
                </p>

                {/* Topics */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-cyan-400 mb-2">Temas incluidos:</div>
                  <div className="flex flex-wrap gap-1">
                    {category.topics.map((topic, topicIndex) => (
                      <span
                        key={topicIndex}
                        className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded border border-gray-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button className={`w-full py-2 px-4 bg-gradient-to-r ${category.color} text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity duration-300`}>
                  Explorar categoría
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Learning paths section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-6">
              Rutas de Aprendizaje
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Secuencias estructuradas de artículos para un aprendizaje progresivo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {learningPaths.map((path, index) => (
              <div
                key={index}
                className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{path.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{path.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-lg font-bold gradient-text">{path.duration}</div>
                      <div className="text-xs text-gray-400">Duración</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-lg font-bold gradient-text">{path.articles}</div>
                      <div className="text-xs text-gray-400">Artículos</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-cyan-400 mb-4">
                    Nivel: {path.difficulty}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="text-xs font-semibold text-white">Temas cubiertos:</div>
                  {path.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="flex items-center space-x-2">
                      <span className="text-green-400 text-xs">✓</span>
                      <span className="text-gray-300 text-xs">{topic}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 px-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl transition-all duration-300">
                  Comenzar ruta
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogCategories;