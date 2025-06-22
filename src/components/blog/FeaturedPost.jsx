function FeaturedPost() {
  const featuredPost = {
    title: "Optimización Avanzada de Performance en React: De 3s a 0.8s de carga",
    excerpt: "Aprende las técnicas que utilizo para optimizar aplicaciones React complejas y conseguir Lighthouse scores 90+. Desde lazy loading hasta code splitting inteligente.",
    category: "Performance",
    readTime: "15 min",
    publishDate: "15 Enero 2025",
    views: "4,200",
    tags: ["React", "Performance", "Webpack", "Core Web Vitals"],
    image: "⚡",
    difficulty: "Avanzado",
    codePreview: `// Lazy loading con Suspense
const LazyComponent = lazy(() => 
  import('./HeavyComponent').then(module => ({
    default: module.HeavyComponent
  }))
);

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}`,
    tableOfContents: [
      "1. Análisis inicial de performance",
      "2. Code splitting estratégico",
      "3. Optimización de re-renders",
      "4. Lazy loading de componentes",
      "5. Bundle analysis y tree shaking",
      "6. Métricas y monitoreo"
    ]
  };

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Artículo Destacado
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            El tutorial más popular de este mes con técnicas avanzadas de optimización
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Meta info */}
                <div className="flex items-center space-x-4 text-sm">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                    {featuredPost.category}
                  </span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                    {featuredPost.difficulty}
                  </span>
                  <span className="text-gray-400">{featuredPost.publishDate}</span>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {featuredPost.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-300 leading-relaxed">
                  {featuredPost.excerpt}
                </p>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <span>📖</span>
                    <span>{featuredPost.readTime} lectura</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>👀</span>
                    <span>{featuredPost.views} vistas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>28 comentarios</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {featuredPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded-full border border-cyan-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
                  Leer artículo completo
                </button>
              </div>

              {/* Code preview and ToC */}
              <div className="p-8 space-y-6">
                {/* Visual indicator */}
                <div className="text-center">
                  <div className="text-8xl mb-4">{featuredPost.image}</div>
                  <div className="text-lg font-bold gradient-text">Caso de estudio real</div>
                </div>

                {/* Code preview */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-mono text-cyan-400">Código de ejemplo</span>
                    <button className="text-xs text-gray-400 hover:text-white transition-colors">
                      Copiar
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>{featuredPost.codePreview}</code>
                  </pre>
                </div>

                {/* Table of contents */}
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                  <h4 className="font-bold text-white mb-3 text-sm">Contenido del artículo:</h4>
                  <div className="space-y-2">
                    {featuredPost.tableOfContents.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-cyan-400 text-xs mt-1">▶</span>
                        <span className="text-gray-300 text-xs">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance metrics */}
                <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-xl p-4 border border-green-500/30">
                  <h4 className="font-bold text-white mb-3 text-sm">Resultados conseguidos:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">0.8s</div>
                      <div className="text-xs text-gray-400">Tiempo de carga</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">98/100</div>
                      <div className="text-xs text-gray-400">Lighthouse</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">-75%</div>
                      <div className="text-xs text-gray-400">Bundle size</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">+180%</div>
                      <div className="text-xs text-gray-400">Conversiones</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedPost;