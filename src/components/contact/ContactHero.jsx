function ContactHero() {
  const contactMethods = [
    {
      icon: "💬",
      title: "Consulta Gratuita",
      description: "30 minutos para analizar tu proyecto",
      action: "Agendar llamada",
      highlight: true
    },
    {
      icon: "💻",
      title: "Presupuesto Express", 
      description: "Calculadora automática de precios",
      action: "Calcular precio",
      highlight: false
    },
    {
      icon: "📧",
      title: "Contacto Directo",
      description: "Envía los detalles de tu proyecto",
      action: "Escribir mensaje",
      highlight: false
    }
  ];

  const responseTime = [
    { icon: "⚡", text: "Respuesta en 2-4 horas" },
    { icon: "📞", text: "Llamada en 24h si es urgente" },
    { icon: "💡", text: "Consulta inicial gratuita" },
    { icon: "🎯", text: "Propuesta detallada en 48h" }
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
              Hablemos de tu proyecto
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              ¿Tienes una idea increíble? ¿Necesitas modernizar tu web? 
              Cuéntame tu proyecto y te ayudo a hacerlo realidad.
            </p>
          </div>

          {/* Contact methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className={`group bg-gray-900/50 backdrop-blur-sm border rounded-xl p-8 text-center transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${
                  method.highlight 
                    ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                    : 'border-gray-800 hover:border-cyan-500/50'
                }`}
              >
                <div className="text-6xl mb-4">{method.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {method.title}
                </h3>
                <p className="text-gray-400 mb-6">
                  {method.description}
                </p>
                <button className={`w-full py-3 px-6 font-bold rounded-lg transition-all duration-300 ${
                  method.highlight
                    ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-black hover:shadow-xl hover:shadow-cyan-400/25'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}>
                  {method.action}
                </button>
              </div>
            ))}
          </div>

          {/* Response commitments */}
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold gradient-text mb-8 text-center">
              Mi compromiso contigo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {responseTime.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <p className="text-gray-300 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="text-center">
            <h3 className="text-2xl font-bold gradient-text mb-8">
              Proyectos exitosos en números
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">98%</div>
                <div className="text-gray-400 text-sm">Clientes satisfechos</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">24h</div>
                <div className="text-gray-400 text-sm">Tiempo de respuesta</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">50+</div>
                <div className="text-gray-400 text-sm">Proyectos completados</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">100%</div>
                <div className="text-gray-400 text-sm">Proyectos a tiempo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactHero;