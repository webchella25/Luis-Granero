function ServicesGrid() {
  const services = [
    {
      id: "desarrollo-web",
      title: "Desarrollo Web Moderno",
      subtitle: "React, Next.js, TypeScript",
      description: "Aplicaciones web de última generación con tecnologías modernas. Código limpio, escalable y mantenible.",
      icon: "💻",
      color: "from-cyan-400 to-blue-500",
      features: [
        "React 18+ con Hooks avanzados",
        "Next.js 14 con App Router",
        "TypeScript para type safety",
        "Responsive design nativo",
        "Performance optimizada",
        "SEO técnico integrado"
      ],
      technologies: ["React", "Next.js", "TypeScript", "Tailwind"],
      startingPrice: "1,500€",
      deliveryTime: "2-4 semanas",
      examples: [
        "Landing pages corporativas",
        "Portales web empresariales",
        "Aplicaciones SPA complejas"
      ]
    },
    {
      id: "ecommerce",
      title: "E-commerce Personalizado",
      subtitle: "Sin plantillas, máximo rendimiento",
      description: "Tiendas online a medida con gestión avanzada, múltiples pasarelas de pago y panel administrativo completo.",
      icon: "🛒",
      color: "from-green-400 to-emerald-500",
      features: [
        "Catálogo de productos avanzado",
        "Gestión de inventarios",
        "Múltiples métodos de pago",
        "Panel de administración",
        "Analytics e informes",
        "Integración con ERP/CRM"
      ],
      technologies: ["Next.js", "Stripe", "MongoDB", "APIs"],
      startingPrice: "3,500€",
      deliveryTime: "4-8 semanas",
      examples: [
        "Tiendas de moda y lifestyle",
        "E-commerce B2B",
        "Marketplaces especializados"
      ]
    },
    {
      id: "aplicaciones-web",
      title: "Aplicaciones Web Personalizadas",
      subtitle: "SPA, PWA, Dashboards",
      description: "Herramientas web específicas para tu negocio. Desde dashboards corporativos hasta aplicaciones de gestión.",
      icon: "⚡",
      color: "from-purple-400 to-pink-500",
      features: [
        "Dashboards interactivos",
        "Progressive Web Apps",
        "Gestión de usuarios",
        "Reportes en tiempo real",
        "Integraciones API",
        "Workflow automatizado"
      ],
      technologies: ["React", "Node.js", "PostgreSQL", "Charts"],
      startingPrice: "2,500€",
      deliveryTime: "3-6 semanas",
      examples: [
        "CRM personalizado",
        "Sistema de reservas",
        "Plataforma educativa"
      ]
    },
    {
      id: "apis-backend",
      title: "APIs y Backend",
      subtitle: "Node.js, Bases de datos, Integración",
      description: "Desarrollo de APIs robustas y backends escalables. Integración con servicios externos y bases de datos optimizadas.",
      icon: "🔧",
      color: "from-orange-400 to-red-500",
      features: [
        "APIs REST documentadas",
        "Autenticación y autorización",
        "Base de datos optimizada",
        "Integración con terceros",
        "Monitoreo y logs",
        "Escalabilidad automática"
      ],
      technologies: ["Node.js", "Express", "MongoDB", "JWT"],
      startingPrice: "1,800€",
      deliveryTime: "2-5 semanas",
      examples: [
        "API para mobile app",
        "Microservicios",
        "Integración con CRM"
      ]
    },
    {
      id: "seo-optimizacion",
      title: "SEO Técnico y Optimización",
      subtitle: "Performance, Core Web Vitals, Rankings",
      description: "Optimización técnica completa para mejorar rankings y experiencia de usuario. Análisis profundo y mejoras medibles.",
      icon: "📈",
      color: "from-indigo-400 to-purple-500",
      features: [
        "Auditoría técnica completa",
        "Optimización de velocidad",
        "Core Web Vitals",
        "Estructura de datos",
        "Meta tags avanzados",
        "Monitoreo continuo"
      ],
      technologies: ["Lighthouse", "GTM", "Analytics", "Search Console"],
      startingPrice: "800€",
      deliveryTime: "1-2 semanas",
      examples: [
        "Auditoría web completa",
        "Optimización de performance",
        "Estrategia SEO técnico"
      ]
    },
    {
      id: "auditoria-mejoras",
      title: "Auditorías y Mejoras",
      subtitle: "Análisis, Optimización, Modernización",
      description: "Evaluación completa de tu web actual con plan de mejoras. Modernización de código legacy y optimizaciones.",
      icon: "🔍",
      color: "from-pink-400 to-red-500",
      features: [
        "Análisis de código",
        "Reporte de vulnerabilidades",
        "Plan de modernización",
        "Optimización de BD",
        "Mejoras de UX/UI",
        "Documentación técnica"
      ],
      technologies: ["Code Analysis", "Security", "Performance", "UX"],
      startingPrice: "600€",
      deliveryTime: "1 semana",
      examples: [
        "Auditoría de aplicación",
        "Migración a tecnologías modernas",
        "Optimización de infraestructura"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Servicios Especializados
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Cada servicio está diseñado para resolver problemas específicos de tu negocio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-4xl">{service.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                    <p className={`text-sm bg-gradient-to-r ${service.color} bg-clip-text text-transparent font-semibold`}>
                      {service.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-white mb-3">Incluye:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <span className="text-green-400 text-sm">✓</span>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {service.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded-full border border-cyan-500/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing and delivery */}
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-400">Desde</div>
                    <div className={`text-xl font-bold bg-gradient-to-r ${service.color} bg-clip-text text-transparent`}>
                      {service.startingPrice}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Entrega</div>
                    <div className="text-white font-semibold">{service.deliveryTime}</div>
                  </div>
                </div>

                {/* Examples */}
                <div className="mb-6">
                  <h4 className="font-semibold text-white mb-2">Ejemplos:</h4>
                  <div className="text-sm text-gray-400">
                    {service.examples.join(" • ")}
                  </div>
                </div>

                {/* CTA */}
                <button className={`w-full py-3 px-6 bg-gradient-to-r ${service.color} text-white font-bold rounded-lg hover:shadow-xl transition-all duration-300`}>
                  Solicitar información
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesGrid;