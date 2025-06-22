function BlogHero() {
  const stats = [
    { number: "25+", label: "Artículos técnicos", icon: "📝" },
    { number: "10K+", label: "Lectores mensuales", icon: "👥" },
    { number: "50+", label: "Tutoriales", icon: "🎓" },
    { number: "100%", label: "Contenido gratuito", icon: "💡" }
  ];

  const topics = [
    { name: "React & Next.js", color: "from-cyan-400 to-blue-500", posts: 12 },
    { name: "Performance Web", color: "from-green-400 to-emerald-500", posts: 8 },
    { name: "SEO Técnico", color: "from-purple-400 to-pink-500", posts: 6 },
    { name: "Best Practices", color: "from-orange-400 to-red-500", posts: 10 }
  ];

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-green-500/5"></div>
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-8">
              Blog Técnico
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              Tutoriales, artículos técnicos y mejores prácticas de desarrollo web. 
              Contenido práctico para desarrolladores que buscan mejorar sus habilidades.
            </p>
          </div>

          {/* Topics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
              >
                <div className={`text-xl font-bold bg-gradient-to-r ${topic.color} bg-clip-text text-transparent mb-2`}>
                  {topic.posts} posts
                </div>
                <div className="text-gray-300 text-sm">{topic.name}</div>
              </div>
            ))}
          </div>

          {/* Value proposition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Aprende desarrollo web moderno
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-cyan-400 text-xl mt-1">💻</span>
                  <div>
                    <h3 className="font-semibold text-white">Tutoriales paso a paso</h3>
                    <p className="text-gray-400">Guías detalladas con código real y ejemplos prácticos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl mt-1">⚡</span>
                  <div>
                    <h3 className="font-semibold text-white">Performance tips</h3>
                    <p className="text-gray-400">Técnicas de optimización y mejores prácticas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-purple-400 text-xl mt-1">🚀</span>
                  <div>
                    <h3 className="font-semibold text-white">Casos de uso reales</h3>
                    <p className="text-gray-400">Problemas y soluciones del mundo real</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-orange-400 text-xl mt-1">📚</span>
                  <div>
                    <h3 className="font-semibold text-white">Recursos actualizados</h3>
                    <p className="text-gray-400">Contenido actualizado con las últimas tendencias</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold gradient-text mb-6 text-center">
                Últimos artículos populares
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer">
                  <span className="text-2xl">⚛️</span>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Optimización de React con useMemo y useCallback</h4>
                    <p className="text-gray-400 text-xs">2,300 lecturas • 5 min</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer">
                  <span className="text-2xl">▲</span>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Next.js 14: App Router vs Pages Router</h4>
                    <p className="text-gray-400 text-xs">1,850 lecturas • 8 min</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Core Web Vitals: Guía completa 2024</h4>
                    <p className="text-gray-400 text-xs">3,100 lecturas • 12 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogHero;