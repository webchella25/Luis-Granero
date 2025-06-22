function ServicesHero() {
  const stats = [
    { number: "100%", label: "Código personalizado", icon: "💻" },
    { number: "90+", label: "Performance score", icon: "⚡" },
    { number: "24h", label: "Tiempo de respuesta", icon: "🕐" },
    { number: "∞", label: "Soporte incluido", icon: "🛠️" }
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
              Servicios de Desarrollo
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              Soluciones web personalizadas que impulsan tu negocio. 
              Sin plantillas genéricas, solo código a medida que genera resultados.
            </p>
          </div>

          {/* Value proposition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                ¿Por qué elegir desarrollo personalizado?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <div>
                    <h3 className="font-semibold text-white">Performance Superior</h3>
                    <p className="text-gray-400">Código optimizado desde cero, sin bloatware de plantillas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <div>
                    <h3 className="font-semibold text-white">Escalabilidad Garantizada</h3>
                    <p className="text-gray-400">Arquitectura pensada para crecer con tu negocio</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <div>
                    <h3 className="font-semibold text-white">SEO Integrado</h3>
                    <p className="text-gray-400">Optimización técnica desde el primer día</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <div>
                    <h3 className="font-semibold text-white">Soporte Técnico</h3>
                    <p className="text-gray-400">Mantenimiento y actualizaciones incluidas</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold gradient-text mb-6 text-center">
                Stack Tecnológico
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-cyan-400">Frontend</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div>• React 18+</div>
                    <div>• Next.js 14</div>
                    <div>• TypeScript</div>
                    <div>• Tailwind CSS</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-400">Backend</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div>• Node.js</div>
                    <div>• Express</div>
                    <div>• MongoDB</div>
                    <div>• APIs REST</div>
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

export default ServicesHero;