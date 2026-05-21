function ProcessSection() {
  const processSteps = [
    {
      step: "01",
      title: "Consulta Inicial",
      duration: "1-2 días",
      description: "Analizamos tu proyecto, objetivos y requisitos técnicos. Definimos alcance y cronograma.",
      deliverables: ["Brief detallado", "Propuesta técnica", "Cronograma", "Presupuesto final"],
      icon: "🔍"
    },
    {
      step: "02", 
      title: "Planificación y Diseño",
      duration: "3-5 días",
      description: "Creamos wireframes, prototipos y definimos la arquitectura técnica del proyecto.",
      deliverables: ["Wireframes", "Prototipos", "Arquitectura", "Stack tecnológico"],
      icon: "📐"
    },
    {
      step: "03",
      title: "Desarrollo Sprint 1",
      duration: "1-2 semanas", 
      description: "Configuración inicial, estructura base y funcionalidades core del proyecto.",
      deliverables: ["Setup inicial", "Estructura base", "Funciones principales", "Primera demo"],
      icon: "💻"
    },
    {
      step: "04",
      title: "Desarrollo Sprint 2",
      duration: "1-2 semanas",
      description: "Implementación de funcionalidades avanzadas, integraciones y optimizaciones.",
      deliverables: ["Funciones avanzadas", "Integraciones", "Optimizaciones", "Segunda demo"],
      icon: "⚡"
    },
    {
      step: "05",
      title: "Testing y Pulido", 
      duration: "3-5 días",
      description: "Pruebas exhaustivas, corrección de bugs y optimización final del rendimiento.",
      deliverables: ["Testing completo", "Bug fixes", "Performance", "SEO técnico"],
      icon: "🧪"
    },
    {
      step: "06",
      title: "Deploy y Lanzamiento",
      duration: "1-2 días",
      description: "Configuración de producción, deploy final y entrega de documentación completa.",
      deliverables: ["Deploy producción", "Documentación", "Capacitación", "Monitoreo"],
      icon: "🚀"
    }
  ];

  return (
    <section className="py-20 bg-[#0B1120]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Proceso de Desarrollo
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Metodología ágil y transparente que garantiza resultados excepcionales en cada proyecto
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-green-400 to-purple-400 transform md:-translate-x-0.5"></div>

            {processSteps.map((step, index) => (
              <div key={index} className={`relative flex items-center mb-16 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}>
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-green-400 transform md:-translate-x-2 z-10 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-white absolute top-1 left-1"></div>
                </div>

                {/* Content */}
                <div className={`w-full md:w-5/12 ml-12 md:ml-0 ${
                  index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
                }`}>
                  <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="text-3xl">{step.icon}</span>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="text-2xl font-bold gradient-text">{step.step}</span>
                          <span className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                            {step.duration}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Deliverables */}
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-3">Entregables:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {step.deliverables.map((deliverable, delIndex) => (
                          <div key={delIndex} className="flex items-center space-x-2">
                            <span className="text-green-400 text-xs">✓</span>
                            <span className="text-gray-300 text-sm">{deliverable}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step number for desktop */}
                <div className={`hidden md:block w-5/12 ${
                  index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'
                }`}>
                  <div className="text-8xl font-bold text-gray-800/30">
                    {step.step}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Process highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-bold text-white mb-2">Transparencia Total</h3>
              <p className="text-gray-400 text-sm">Acceso a herramientas de seguimiento y demos semanales</p>
            </div>
            <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="font-bold text-white mb-2">Comunicación Directa</h3>
              <p className="text-gray-400 text-sm">Canal directo conmigo, sin intermediarios</p>
            </div>
            <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="font-bold text-white mb-2">Metodología Ágil</h3>
              <p className="text-gray-400 text-sm">Entregas frecuentes y ajustes sobre la marcha</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProcessSection;