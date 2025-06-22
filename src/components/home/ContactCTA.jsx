function ContactCTA() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-green-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-8">
            Hablemos de tu proyecto
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            ¿Tienes una idea increíble? ¿Necesitas modernizar tu web actual? 
            ¿Buscas un desarrollador que entienda tu negocio?
          </p>

          {/* Contact options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="group bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">Consulta Gratuita</h3>
              <p className="text-gray-400 mb-4">
                30 minutos para analizar tu proyecto sin compromiso
              </p>
              <button className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                Agendar llamada →
              </button>
            </div>

            <div className="group bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-bold text-white mb-2">Presupuesto Express</h3>
              <p className="text-gray-400 mb-4">
                Calculadora automática para proyectos estándar
              </p>
              <button className="text-green-400 font-semibold hover:text-green-300 transition-colors">
                Calcular precio →
              </button>
            </div>

            <div className="group bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-bold text-white mb-2">Contacto Directo</h3>
              <p className="text-gray-400 mb-4">
                Escríbeme directamente con los detalles de tu proyecto
              </p>
              <button className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                Enviar mensaje →
              </button>
            </div>
          </div>

          {/* Main CTA */}
          <div className="space-y-6">
            <button className="px-12 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg text-lg hover:shadow-2xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
              Empezar mi proyecto ahora
            </button>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Respuesta en 24h</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Sin compromiso</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Consulta gratuita</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactCTA;