function Methodology() {
  const methodologySteps = [
    {
      step: "01",
      title: "Análisis y Planificación",
      description: "Entiendo tu negocio, objetivos y audiencia. Analizamos la competencia y definimos los requisitos técnicos.",
      icon: "🔍",
      color: "from-cyan-400 to-blue-500",
      deliverables: ["Brief del proyecto", "Análisis técnico", "Cronograma", "Presupuesto detallado"]
    },
    {
      step: "02",
      title: "Diseño y Arquitectura",
      description: "Creo wireframes, prototipos y defino la arquitectura técnica. Diseño pensando en UX y escalabilidad.",
      icon: "📐",
      color: "from-green-400 to-emerald-500",
      deliverables: ["Wireframes", "Prototipos", "Arquitectura técnica", "Stack tecnológico"]
    },
    {
      step: "03",
      title: "Desarrollo Iterativo",
      description: "Desarrollo en sprints cortos con entregas frecuentes. Código limpio, testeable y documentado.",
      icon: "💻",
      color: "from-purple-400 to-pink-500",
      deliverables: ["Código fuente", "Documentación", "Testing", "Revisiones semanales"]
    },
    {
      step: "04",
      title: "Testing y Optimización",
      description: "Pruebas exhaustivas, optimización de performance y SEO técnico. Todo debe ser perfecto antes del lanzamiento.",
      icon: "🧪",
      color: "from-orange-400 to-red-500",
      deliverables: ["Testing completo", "Optimización", "SEO técnico", "Performance 90+"]
    },
    {
      step: "05",
      title: "Deploy y Monitoreo",
      description: "Lanzamiento en producción con monitoreo continuo. Configuración de analytics y métricas clave.",
      icon: "🚀",
      color: "from-indigo-400 to-purple-500",
      deliverables: ["Deploy automático", "Monitoreo", "Analytics", "Backup sistemas"]
    },
    {
      step: "06",
      title: "Soporte y Evolución",
      description: "Soporte técnico continuo y mejoras basadas en datos reales. Tu proyecto siempre actualizado.",
      icon: "🔧",
      color: "from-pink-400 to-red-500",
      deliverables: ["Soporte 24/7", "Actualizaciones", "Mejoras continuas", "Reportes mensuales"]
    }
  ];

  const principles = [
    {
      title: "Código Limpio",
      description: "Escribo código mantenible, escalable y bien documentado",
      icon: "✨"
    },
    {
      title: "Performance First",
      description: "Optimización desde el primer día, no como parche posterior",
      icon: "⚡"
    },
    {
      title: "Mobile First",
      description: "Diseño responsive nativo, no adaptaciones forzadas",
      icon: "📱"
    },
    {
      title: "SEO Técnico",
      description: "Optimización para buscadores integrada en el desarrollo",
      icon: "📈"
    }
  ];

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Metodología */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Mi Metodología
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Un proceso probado que garantiza resultados excepcionales en cada proyecto
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {methodologySteps.map((step, index) => (
            <div
              key={index}
              className="group bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className={`text-2xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                  {step.step}
                </span>
                <span className="text-2xl">{step.icon}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">
                {step.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed mb-4">
                {step.description}
              </p>
              
              <div className="space-y-1">
                <p className="text-sm font-semibold text-cyan-400 mb-2">Entregables:</p>
                {step.deliverables.map((deliverable, delIndex) => (
                  <div key={delIndex} className="flex items-center space-x-2">
                    <span className="text-green-400 text-xs">✓</span>
                    <span className="text-gray-300 text-sm">{deliverable}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Principios */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold gradient-text mb-6">
            Principios de Desarrollo
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((principle, index) => (
            <div
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="text-3xl mb-4">{principle.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">{principle.title}</h4>
              <p className="text-gray-400 text-sm">{principle.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Methodology;