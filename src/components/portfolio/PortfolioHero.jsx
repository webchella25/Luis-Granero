// src/components/portfolio/PortfolioHero.jsx - Versión corregida
function PortfolioHero({ projectCount = 50 }) {
  const stats = [
    { number: `${projectCount}+`, label: "Proyectos completados", icon: "🚀" },
    { number: "98%", label: "Satisfacción cliente", icon: "⭐" },
    { number: "300%", label: "ROI promedio", icon: "📈" },
    { number: "1.2s", label: "Tiempo de carga medio", icon: "⚡" }
  ];

  const categories = [
    { name: "E-commerce", count: "15+", color: "from-green-400 to-emerald-500" },
    { name: "Aplicaciones Web", count: "20+", color: "from-cyan-400 to-blue-500" },
    { name: "Dashboards", count: "12+", color: "from-purple-400 to-pink-500" },
    { name: "Landing Pages", count: "18+", color: "from-orange-400 to-red-500" }
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
              Portfolio
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              Casos de éxito que demuestran mi experiencia en desarrollo web moderno. 
              Cada proyecto incluye código, métricas reales y tecnologías utilizadas.
            </p>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`text-2xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent mb-2`}>
                  {category.count}
                </div>
                <div className="text-gray-300 text-sm">{category.name}</div>
              </div>
            ))}
          </div>

          {/* Value proposition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Proyectos que generan resultados
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl mt-1">🎯</span>
                  <div>
                    <h3 className="font-semibold text-white">Enfoque en conversiones</h3>
                    <p className="text-gray-400">Cada proyecto está optimizado para maximizar ROI y conversiones</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-cyan-400 text-xl mt-1">⚡</span>
                  <div>
                    <h3 className="font-semibold text-white">Performance excepcional</h3>
                    <p className="text-gray-400">Velocidad de carga sub-2 segundos y puntuaciones Lighthouse 90+</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Stack tecnológico utilizado</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Métricas y resultados reales</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Screenshots del proyecto</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Fragmentos de código relevantes</span>
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

export default PortfolioHero;