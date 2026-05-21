function ProcessTimeline() {
  const processSteps = [
    {
      step: "01",
      title: "Primer Contacto",
      duration: "Día 0",
      description: "Recibo tu mensaje y analizo los detalles iniciales de tu proyecto.",
      actions: [
        "Respuesta en 2-4 horas",
        "Análisis inicial de requisitos",
        "Aclaración de dudas básicas",
        "Programación de consulta gratuita"
      ],
      icon: "📧",
      color: "from-cyan-400 to-blue-500"
    },
    {
      step: "02",
      title: "Consulta Gratuita",
      duration: "Días 1-2",
      description: "Videollamada de 30 minutos para entender tu proyecto en profundidad.",
      actions: [
        "Análisis detallado de objetivos",
        "Revisión de referencias y competencia",
        "Definición de alcance técnico",
        "Identificación de challenges"
      ],
      icon: "💬",
      color: "from-green-400 to-emerald-500"
    },
    {
      step: "03",
      title: "Propuesta Técnica",
      duration: "Días 2-3",
      description: "Desarrollo de propuesta completa con especificaciones técnicas y presupuesto.",
      actions: [
        "Arquitectura técnica detallada",
        "Stack tecnológico recomendado",
        "Cronograma de desarrollo",
        "Presupuesto final y condiciones"
      ],
      icon: "📋",
      color: "from-purple-400 to-pink-500"
    },
    {
      step: "04",
      title: "Revisión y Ajustes",
      duration: "Días 3-4",
      description: "Refinamos la propuesta basándose en tu feedback y ajustamos detalles.",
      actions: [
        "Revisión de propuesta",
        "Ajustes según feedback",
        "Negociación de términos",
        "Clarificación de especificaciones"
      ],
      icon: "🔄",
      color: "from-orange-400 to-red-500"
    },
    {
      step: "05",
      title: "Firma de Contrato",
      duration: "Día 5",
      description: "Firma del contrato y pago inicial para comenzar el desarrollo.",
      actions: [
        "Firma de contrato",
        "Pago inicial (50%)",
        "Setup de herramientas de proyecto",
        "Inicio oficial del desarrollo"
      ],
      icon: "✅",
      color: "from-indigo-400 to-purple-500"
    },
    {
      step: "06",
      title: "Desarrollo",
      duration: "2-8 semanas",
      description: "Desarrollo del proyecto con actualizaciones semanales y demos regulares.",
      actions: [
        "Desarrollo en sprints semanales",
        "Demos cada viernes",
        "Comunicación constante",
        "Ajustes sobre la marcha"
      ],
      icon: "💻",
      color: "from-pink-400 to-red-500"
    }
  ];

  const commitments = [
    {
      icon: "⚡",
      title: "Respuesta rápida",
      description: "Máximo 4 horas en días laborables"
    },
    {
      icon: "💬",
      title: "Comunicación transparente",
      description: "Updates regulares sobre el progreso"
    },
    {
      icon: "🎯",
      title: "Sin sorpresas",
      description: "Presupuesto y timeline claros desde el inicio"
    },
    {
      icon: "🔧",
      title: "Flexibilidad",
      description: "Ajustes durante el desarrollo cuando sea necesario"
    }
  ];

  const nextSteps = [
    {
      action: "Envía tu consulta",
      description: "Usa el formulario o envíame un email con los detalles de tu proyecto",
      time: "2 minutos"
    },
    {
      action: "Recibe mi respuesta",
      description: "Te responderé con algunas preguntas adicionales y programaremos una llamada",
      time: "2-4 horas"
    },
    {
      action: "Consulta gratuita",
      description: "Videollamada de 30 minutos para conocer tu proyecto en detalle",
      time: "30 minutos"
    },
    {
      action: "Propuesta personalizada",
      description: "Recibirás una propuesta técnica completa con presupuesto y cronograma",
      time: "24-48 horas"
    }
  ];

  return (
    <section className="py-20 bg-[#0F172A]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              ¿Cómo trabajamos juntos?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Proceso transparente desde el primer contacto hasta la entrega final
            </p>
          </div>

          {/* Process timeline */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-white mb-12 text-center">
              Timeline del proyecto
            </h3>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-green-400 to-purple-400 transform md:-translate-x-0.5"></div>

              {processSteps.map((step, index) => (
                <div key={index} className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}>
                  {/* Timeline dot */}
                  <div className={`absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-gradient-to-r ${step.color} transform md:-translate-x-2 z-10 shadow-lg`}>
                    <div className="w-2 h-2 rounded-full bg-white absolute top-1 left-1"></div>
                  </div>

                  {/* Content */}
                  <div className={`w-full md:w-5/12 ml-12 md:ml-0 ${
                    index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
                  }`}>
                    <div className="bg-[#1E293B]/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300">
                      {/* Header */}
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="text-3xl">{step.icon}</span>
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <span className={`text-2xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                              {step.step}
                            </span>
                            <span className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                              {step.duration}
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-white">{step.title}</h4>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {step.description}
                      </p>

                      {/* Actions */}
                      <div>
                        <h5 className="font-semibold text-cyan-400 mb-3">Qué incluye:</h5>
                        <div className="space-y-1">
                          {step.actions.map((action, actionIndex) => (
                            <div key={actionIndex} className="flex items-center space-x-2">
                              <span className="text-green-400 text-xs">✓</span>
                              <span className="text-gray-300 text-sm">{action}</span>
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
          </div>

          {/* Commitments */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Mis compromisos contigo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {commitments.map((commitment, index) => (
                <div
                  key={index}
                  className="bg-[#1E293B]/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{commitment.icon}</div>
                  <h4 className="font-bold text-white mb-2">{commitment.title}</h4>
                  <p className="text-gray-400 text-sm">{commitment.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Next steps */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Próximos pasos
            </h3>
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {nextSteps.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full flex items-center justify-center text-black font-bold text-lg mb-4 mx-auto">
                      {index + 1}
                    </div>
                    <h4 className="font-bold text-white mb-2">{step.action}</h4>
                    <p className="text-gray-400 text-sm mb-2">{step.description}</p>
                    <div className="text-cyan-400 text-xs font-semibold">⏱️ {step.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              ¿Listo para empezar?
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              El primer paso es una conversación. No hay compromiso, solo una oportunidad 
              de conocer tu proyecto y ver cómo puedo ayudarte.
            </p>
            <button className="px-12 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
              Empezar mi proyecto ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProcessTimeline;