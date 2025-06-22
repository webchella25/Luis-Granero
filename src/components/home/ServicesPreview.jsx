function ServicesPreview() {
  const services = [
    {
      title: "Desarrollo Web Moderno",
      description: "Aplicaciones web con React, Next.js y TypeScript. Código limpio, escalable y mantenible.",
      icon: "💻",
      technologies: ["React", "Next.js", "TypeScript"],
      color: "from-cyan-400 to-blue-500"
    },
    {
      title: "Aplicaciones Personalizadas",
      description: "SPA, PWA y dashboards a medida. Soluciones únicas para necesidades específicas.",
      icon: "⚡",
      technologies: ["SPA", "PWA", "Dashboard"],
      color: "from-green-400 to-emerald-500"
    },
    {
      title: "E-commerce Avanzado",
      description: "Tiendas online personalizadas sin plantillas. Integración con pagos y gestión avanzada.",
      icon: "🛒",
      technologies: ["E-commerce", "Pagos", "APIs"],
      color: "from-purple-400 to-pink-500"
    },
    {
      title: "APIs y Backend",
      description: "Desarrollo de APIs REST, bases de datos y arquitectura backend robusta.",
      icon: "🔧",
      technologies: ["Node.js", "MongoDB", "APIs"],
      color: "from-orange-400 to-red-500"
    },
    {
      title: "SEO Técnico",
      description: "Optimización técnica, performance y posicionamiento web profesional.",
      icon: "📈",
      technologies: ["SEO", "Performance", "Analytics"],
      color: "from-indigo-400 to-cyan-500"
    },
    {
      title: "Auditorías Web",
      description: "Análisis completo de performance, UX y optimizaciones técnicas.",
      icon: "🔍",
      technologies: ["Auditoría", "UX", "Performance"],
      color: "from-pink-400 to-purple-500"
    }
  ];

  return (
    <section id="servicios" className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Servicios Especializados
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Desarrollo web moderno enfocado en resultados. Sin plantillas genéricas, 
            solo soluciones personalizadas que impulsan tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              
              <h3 className="text-xl font-bold text-white mb-3">
                {service.title}
              </h3>
              
              <p className="text-gray-400 mb-4 leading-relaxed">
                {service.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {service.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded-full border border-cyan-500/30"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              
              <button className={`w-full py-2 px-4 bg-gradient-to-r ${service.color} text-white font-semibold rounded-lg opacity-90 hover:opacity-100 transition-opacity duration-300`}>
                Más información
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
            Ver todos los servicios
          </button>
        </div>
      </div>
    </section>
  );
}

export default ServicesPreview;