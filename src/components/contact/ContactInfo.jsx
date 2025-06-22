'use client';
function ContactInfo() {
  const contactMethods = [
    {
      icon: "📧",
      title: "Email",
      value: "contacto@luisgranero.com",
      description: "Respuesta en 2-4 horas",
      action: "Enviar email",
      link: "mailto:contacto@luisgranero.com",
      available: "24/7"
    },
    {
      icon: "📞",
      title: "Teléfono",
      value: "+34 XXX XXX XXX",
      description: "Llamadas y WhatsApp",
      action: "Llamar ahora",
      link: "tel:+34XXXXXXXXX",
      available: "Lun-Vie 9:00-18:00"
    },
    {
      icon: "💬",
      title: "WhatsApp",
      value: "Mensaje directo",
      description: "Respuesta rápida",
      action: "Abrir WhatsApp",
      link: "https://wa.me/34XXXXXXXXX",
      available: "Lun-Vie 9:00-20:00"
    },
    {
      icon: "📅",
      title: "Videollamada",
      value: "Consulta gratuita",
      description: "30 minutos sin compromiso",
      action: "Agendar cita",
      link: "#calendar",
      available: "Previa cita"
    }
  ];

  const socialNetworks = [
    {
      name: "LinkedIn",
      icon: "💼",
      username: "@luisgranero",
      description: "Conecta profesionalmente",
      link: "https://linkedin.com/in/luisgranero"
    },
    {
      name: "GitHub",
      icon: "🐱",
      username: "@webchella25",
      description: "Ve mi código",
      link: "https://github.com/webchella25"
    },
    {
      name: "Twitter",
      icon: "🐦",
      username: "@luisgranerodev",
      description: "Sígueme para tips diarios",
      link: "https://twitter.com/luisgranerodev"
    },
    {
      name: "YouTube",
      icon: "📺",
      username: "Luis Granero Dev",
      description: "Tutoriales en video",
      link: "https://youtube.com/@luisgranerodev"
    }
  ];

  const officeInfo = {
    location: "Madrid, España",
    timezone: "CET (UTC+1)",
    languages: ["Español", "Inglés"],
    workingHours: "Lunes a Viernes: 9:00 - 18:00",
    responseTime: "2-4 horas en horario laboral"
  };

  const faqs = [
    {
      question: "¿Cuál es la mejor forma de contactarte?",
      answer: "Para proyectos nuevos, prefiero email o el formulario web. Para consultas rápidas, WhatsApp es perfecto."
    },
    {
      question: "¿Ofreces consultas gratuitas?",
      answer: "Sí, la primera consulta de 30 minutos es completamente gratuita para analizar tu proyecto."
    },
    {
      question: "¿Trabajas con clientes internacionales?",
      answer: "Absolutamente. Trabajo con clientes de España, Europa y Latinoamérica. Manejo horarios flexibles."
    },
    {
      question: "¿Cuánto tardas en responder?",
      answer: "Normalmente respondo en 2-4 horas durante días laborables. Urgencias las atiendo el mismo día."
    }
  ];

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Información de Contacto
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Múltiples formas de contactar conmigo. Elige la que más te convenga.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Contact methods */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-8">Formas de contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactMethods.map((method, index) => (
                  <div
                    key={index}
                    className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-3xl">{method.icon}</div>
                      <div>
                        <h4 className="font-bold text-white">{method.title}</h4>
                        <p className="text-gray-400 text-sm">{method.description}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-cyan-400 font-semibold">{method.value}</p>
                      <p className="text-gray-400 text-xs">Disponible: {method.available}</p>
                    </div>
                    
                    <button 
                      onClick={() => window.open(method.link, '_blank')}
                      className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-green-400 group-hover:text-black transition-all duration-300"
                    >
                      {method.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Office info */}
            <div className="space-y-6">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">📍 Información general</h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-semibold text-white text-sm">Ubicación</div>
                    <div className="text-gray-400">{officeInfo.location}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Zona horaria</div>
                    <div className="text-gray-400">{officeInfo.timezone}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Idiomas</div>
                    <div className="text-gray-400">{officeInfo.languages.join(", ")}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Horario</div>
                    <div className="text-gray-400">{officeInfo.workingHours}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Tiempo de respuesta</div>
                    <div className="text-gray-400">{officeInfo.responseTime}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">⚡ Respuesta rápida</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">🟢</span>
                    <span className="text-gray-300 text-sm">Online ahora</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-400">📧</span>
                    <span className="text-gray-300 text-sm">Email: 2-4h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">💬</span>
                    <span className="text-gray-300 text-sm">WhatsApp: 30min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-400">🚨</span>
                    <span className="text-gray-300 text-sm">Urgencias: Inmediato</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social networks */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Sígueme en redes sociales
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {socialNetworks.map((social, index) => (
                <button
                  key={index}
                  onClick={() => window.open(social.link, '_blank')}
                  className="group bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="text-4xl mb-3">{social.icon}</div>
                  <h4 className="font-bold text-white mb-1">{social.name}</h4>
                  <p className="text-cyan-400 text-sm mb-2">{social.username}</p>
                  <p className="text-gray-400 text-xs">{social.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Preguntas frecuentes sobre contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                >
                  <h4 className="font-bold text-white mb-3">{faq.question}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency contact */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-4xl mb-4">🚨</div>
              <h3 className="text-xl font-bold text-white mb-4">
                ¿Tienes una urgencia?
              </h3>
              <p className="text-gray-300 mb-6">
                Si tu sitio web está caído o tienes un problema crítico, 
                contáctame inmediatamente por WhatsApp o teléfono.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                  🚨 Contacto de urgencia
                </button>
                <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                  💬 WhatsApp directo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactInfo;