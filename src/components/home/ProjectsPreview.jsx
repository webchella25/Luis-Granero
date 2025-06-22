function ProjectsPreview() {
  const projects = [
    {
      title: "E-commerce Avanzado",
      description: "Plataforma de comercio electrónico con gestión avanzada de inventarios, múltiples métodos de pago y dashboard administrativo.",
      image: "🛍️",
      technologies: ["Next.js", "Node.js", "MongoDB", "Stripe"],
      metrics: {
        performance: "98/100",
        conversions: "+35%",
        loadTime: "1.2s"
      },
      status: "En producción",
      link: "#"
    },
    {
      title: "Dashboard Corporativo",
      description: "Sistema de gestión empresarial con análisis en tiempo real, reportes automatizados y integración con múltiples APIs.",
      image: "📊",
      technologies: ["React", "TypeScript", "Express", "PostgreSQL"],
      metrics: {
        performance: "96/100",
        users: "500+",
        dataPoints: "10M+"
      },
      status: "En desarrollo",
      link: "#"
    },
    {
      title: "App de Reservas",
      description: "Aplicación web para gestión de reservas con calendario dinámico, notificaciones y sistema de pagos integrado.",
      image: "📅",
      technologies: ["Next.js", "Tailwind", "Firebase", "PayPal"],
      metrics: {
        performance: "99/100",
        bookings: "1000+",
        satisfaction: "4.9/5"
      },
      status: "En producción",
      link: "#"
    }
  ];

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Proyectos Destacados
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Casos de éxito que demuestran mi experiencia en desarrollo web. 
            Cada proyecto incluye métricas reales y código optimizado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Header del proyecto */}
              <div className="p-6 pb-4">
                <div className="text-6xl text-center mb-4">{project.image}</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {project.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  {project.description}
                </p>
                
                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'En producción' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Tecnologías */}
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded border border-cyan-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Métricas */}
              <div className="px-6 pb-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {Object.entries(project.metrics).map(([key, value], metricIndex) => (
                    <div key={metricIndex} className="text-center">
                      <div className="text-sm font-bold text-cyan-400">{value}</div>
                      <div className="text-xs text-gray-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-semibold rounded-lg opacity-90 hover:opacity-100 transition-opacity duration-300">
                  Ver caso de estudio
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
            Ver todo el portfolio
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProjectsPreview;