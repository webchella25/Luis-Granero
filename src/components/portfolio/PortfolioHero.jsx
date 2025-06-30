// src/components/portfolio/PortfolioHero.jsx
'use client';

function PortfolioHero({ data = {}, projectCount = 0, categories = {} }) {
  // Datos dinámicos con fallbacks
  const heroContent = {
    title: data.hero?.title || "Portfolio",
    subtitle: data.hero?.subtitle || "Casos de éxito que demuestran mi experiencia en desarrollo web moderno",
    description: data.hero?.description || "Cada proyecto incluye código, métricas reales y tecnologías utilizadas."
  };

  // Stats dinámicas
  const stats = [
    { 
      number: `${projectCount}+`, 
      label: "Proyectos completados", 
      icon: "🚀" 
    },
    { 
      number: data.stats?.clientSatisfaction || "98%", 
      label: "Satisfacción cliente", 
      icon: "⭐" 
    },
    { 
      number: data.stats?.avgROI || "300%", 
      label: "ROI promedio", 
      icon: "📈" 
    },
    { 
      number: data.stats?.avgLoadTime || "1.2s", 
      label: "Tiempo de carga medio", 
      icon: "⚡" 
    }
  ];

  // Categorías dinámicas desde la base de datos
  const defaultCategories = [
    { name: "E-commerce", color: "from-green-400 to-emerald-500" },
    { name: "Aplicaciones Web", color: "from-cyan-400 to-blue-500" },
    { name: "Dashboards", color: "from-purple-400 to-pink-500" },
    { name: "Landing Pages", color: "from-orange-400 to-red-500" }
  ];

  const displayCategories = data.categories || defaultCategories.map(cat => ({
    ...cat,
    count: categories[cat.name] || 0
  }));

  const valuePropositions = data.valuePropositions || [
    {
      icon: "🎯",
      title: "Enfoque en conversiones",
      description: "Cada proyecto está optimizado para maximizar ROI y conversiones"
    },
    {
      icon: "⚡",
      title: "Performance excepcional",
      description: "Velocidad de carga sub-2 segundos y puntuaciones Lighthouse 90+"
    },
    {
      icon: "🔧",
      title: "Código personalizado",
      description: "Desarrollo a medida sin plantillas, adaptado a necesidades específicas"
    },
    {
      icon: "📊",
      title: "Métricas reales",
      description: "Resultados medibles y documentados en cada proyecto"
    }
  ];

  const features = [
    "Stack tecnológico utilizado",
    "Métricas y resultados reales", 
    "Screenshots del proyecto",
    "Fragmentos de código relevantes",
    "Testimonios de clientes",
    "Enlaces a proyectos en vivo"
  ];

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-green-500/5"></div>
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Header dinámico */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-8">
              {heroContent.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              {heroContent.subtitle}
            </p>
            <p className="text-lg text-gray-400 leading-relaxed max-w-3xl mx-auto mt-6">
              {heroContent.description}
            </p>
          </div>

          {/* Stats dinámicas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Categorías dinámicas */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
              Especialidades
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {displayCategories.map((category, index) => (
                <div 
                  key={index}
                  className="group cursor-pointer"
                >
                  <div className={`bg-gradient-to-r ${category.color} p-0.5 rounded-lg`}>
                    <div className="bg-gray-900 rounded-lg p-6 h-full group-hover:bg-gray-800 transition-colors duration-300">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-2">
                          {category.count > 0 ? `${category.count}+` : category.count}
                        </div>
                        <div className="text-gray-300 text-sm">
                          {category.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Value Propositions */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
              ¿Por qué elegir mis proyectos?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {valuePropositions.map((prop, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {prop.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {prop.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {prop.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Qué encontrarás */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Qué encontrarás en cada proyecto
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PortfolioHero;