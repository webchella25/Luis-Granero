function PricingSection() {
  const packages = [
    {
      name: "Starter",
      description: "Perfecto para freelancers y pequeños negocios",
      price: "1,500€",
      duration: "2-3 semanas",
      color: "from-cyan-400 to-blue-500",
      popular: false,
      features: [
        "Landing page moderna",
        "Diseño responsive",
        "Formulario de contacto",
        "SEO básico",
        "Analytics integrado",
        "1 mes de soporte"
      ],
      technologies: ["Next.js", "Tailwind CSS", "Vercel"],
      ideal: "Freelancers, consultores, pequeños servicios"
    },
    {
      name: "Business",
      description: "Para empresas que buscan una presencia web sólida",
      price: "3,500€",
      duration: "4-6 semanas",
      color: "from-green-400 to-emerald-500",
      popular: true,
      features: [
        "Sitio web completo (hasta 8 páginas)",
        "Panel de administración",
        "Blog integrado",
        "SEO avanzado",
        "Formularios avanzados",
        "Integración con CRM",
        "3 meses de soporte",
        "Analytics avanzado"
      ],
      technologies: ["Next.js", "CMS Personalizado", "APIs", "MongoDB"],
      ideal: "Empresas medianas, servicios profesionales"
    },
    {
      name: "Enterprise",
      description: "Soluciones a medida para proyectos complejos",
      price: "Desde 8,000€",
      duration: "8-12 semanas",
      color: "from-purple-400 to-pink-500",
      popular: false,
      features: [
        "Aplicación web personalizada",
        "Arquitectura escalable",
        "Integraciones múltiples",
        "Dashboard administrativo",
        "Sistema de usuarios",
        "APIs personalizadas",
        "Testing automatizado",
        "6 meses de soporte",
        "Documentación completa"
      ],
      technologies: ["Full Stack", "Microservicios", "CI/CD", "Seguridad"],
      ideal: "Startups, empresas tech, proyectos complejos"
    }
  ];

  const addons = [
    { name: "E-commerce básico", price: "+1,500€", description: "Tienda online con hasta 50 productos" },
    { name: "E-commerce avanzado", price: "+3,000€", description: "Tienda completa con gestión avanzada" },
    { name: "Aplicación móvil", price: "+2,500€", description: "PWA optimizada para móviles" },
    { name: "Integraciones API", price: "+800€", description: "Conexión con servicios externos" },
    { name: "Multi-idioma", price: "+600€", description: "Soporte para múltiples idiomas" },
    { name: "Soporte prioritario", price: "+200€/mes", description: "Soporte 24/7 con respuesta inmediata" }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Paquetes de Desarrollo
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Soluciones adaptadas a diferentes necesidades y presupuestos. 
            Todos incluyen código personalizado y soporte técnico.
          </p>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`relative bg-gray-900/50 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105 ${
                pkg.popular 
                  ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
                  : 'border-gray-800 hover:border-cyan-500/50'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold bg-gradient-to-r ${pkg.color} bg-clip-text text-transparent mb-2`}>
                  {pkg.name}
                </h3>
                <p className="text-gray-400 mb-4">{pkg.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">{pkg.price}</span>
                </div>
                <div className="text-gray-400 text-sm">{pkg.duration}</div>
              </div>

              <div className="space-y-4 mb-8">
                {pkg.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">Tecnologías:</h4>
                <div className="flex flex-wrap gap-2">
                  {pkg.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded border border-cyan-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-white mb-2">Ideal para:</h4>
                <p className="text-gray-400 text-sm">{pkg.ideal}</p>
              </div>

              <button className={`w-full py-3 px-6 bg-gradient-to-r ${pkg.color} text-white font-bold rounded-lg hover:shadow-xl transition-all duration-300`}>
                Empezar proyecto
              </button>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold gradient-text mb-4">
              Servicios Adicionales
            </h3>
            <p className="text-gray-400">
              Amplía tu proyecto con funcionalidades específicas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addons.map((addon, index) => (
              <div
                key={index}
                className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{addon.name}</h4>
                  <span className="text-cyan-400 font-bold">{addon.price}</span>
                </div>
                <p className="text-gray-400 text-sm">{addon.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              ¿No encuentras lo que buscas?
            </h3>
            <p className="text-gray-400 mb-6">
              Cada proyecto es único. Cuéntame tu idea y crearemos una propuesta personalizada.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
              Solicitar presupuesto personalizado
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;