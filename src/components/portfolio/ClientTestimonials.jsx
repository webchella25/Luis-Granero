'use client';

import { useState, useEffect } from 'react';

function ClientTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "María González",
      role: "CEO",
      company: "TechStartup Solutions",
      project: "SaaS Platform",
      rating: 5,
      avatar: "👩‍💼",
      testimonial: "Luis transformó completamente nuestra visión en una plataforma SaaS robusta y escalable. Su conocimiento técnico y atención al detalle son excepcionales. El proyecto se entregó a tiempo y superó nuestras expectativas.",
      metrics: {
        "Performance": "98/100",
        "Tiempo entrega": "A tiempo",
        "Bugs post-launch": "0",
        "ROI": "+250%"
      },
      technologies: ["React", "Node.js", "PostgreSQL", "AWS"]
    },
    {
      id: 2,
      name: "Carlos Mendoza",
      role: "Fundador",
      company: "EcoCommerce",
      project: "E-commerce Sostenible",
      rating: 5,
      avatar: "👨‍💻",
      testimonial: "Increíble el nivel de personalización que logró en nuestra tienda online. No solo es visualmente impactante, sino que las conversiones han aumentado un 180%. Luis entiende tanto la parte técnica como el negocio.",
      metrics: {
        "Conversiones": "+180%",
        "Velocidad": "1.2s",
        "Ventas": "+340%",
        "SEO": "Top 3"
      },
      technologies: ["Next.js", "Stripe", "MongoDB", "Tailwind"]
    },
    {
      id: 3,
      name: "Ana Ruiz",
      role: "Directora de Operaciones",
      company: "MedHealth Corp",
      project: "Healthcare Dashboard",
      rating: 5,
      avatar: "👩‍⚕️",
      testimonial: "El dashboard que desarrolló Luis revolucionó nuestra gestión de pacientes. La interfaz es intuitiva y los reportes en tiempo real nos han permitido optimizar nuestros procesos. Profesionalismo y calidad excepcionales.",
      metrics: {
        "Eficiencia": "+65%",
        "Usuarios": "500+",
        "Satisfacción": "4.9/5",
        "Uptime": "99.9%"
      },
      technologies: ["React", "TypeScript", "Real-time APIs", "Chart.js"]
    },
    {
      id: 4,
      name: "Roberto Silva",
      role: "Director de Marketing",
      company: "Digital Agency Pro",
      project: "Corporate Website",
      rating: 5,
      avatar: "👨‍💼",
      testimonial: "Luis no solo creó una web espectacular, sino que implementó una estrategia SEO que nos posicionó en primera página para nuestras keywords principales. Los leads han aumentado exponencialmente.",
      metrics: {
        "Leads": "+280%",
        "Ranking SEO": "Posición 1-3",
        "Performance": "96/100",
        "Conversión": "8.5%"
      },
      technologies: ["Next.js", "SEO", "Analytics", "CMS"]
    },
    {
      id: 5,
      name: "Elena Torres",
      role: "Product Manager",
      company: "EduTech Innovations",
      project: "Learning Platform",
      rating: 5,
      avatar: "👩‍🎓",
      testimonial: "La plataforma educativa que desarrolló Luis ha transformado cómo nuestros estudiantes aprenden. La gamificación y el seguimiento de progreso han mejorado significativamente las tasas de finalización.",
      metrics: {
        "Finalización": "85%",
        "Estudiantes": "2000+",
        "Satisfacción": "4.8/5",
        "Engagement": "+120%"
      },
      technologies: ["React", "Video.js", "Gamification", "Progress Tracking"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const currentClient = testimonials[currentTestimonial];

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Lo que dicen mis clientes
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Testimonios reales de clientes satisfechos con resultados medibles
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Testimonial content */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">{currentClient.avatar}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{currentClient.name}</h3>
                    <p className="text-cyan-400 font-semibold">{currentClient.role}</p>
                    <p className="text-gray-400">{currentClient.company}</p>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  {[...Array(currentClient.rating)].map((_, index) => (
                    <span key={index} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                
                <blockquote className="text-gray-300 text-lg leading-relaxed italic">
                  "{currentClient.testimonial}"
                </blockquote>
                
                <div className="flex flex-wrap gap-2">
                  {currentClient.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded-full border border-cyan-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project metrics */}
              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-4 text-center">
                    Proyecto: {currentClient.project}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(currentClient.metrics).map(([key, value], index) => (
                      <div key={index} className="text-center">
                        <div className="text-xl font-bold gradient-text">{value}</div>
                        <div className="text-xs text-gray-400">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial navigation */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial 
                    ? 'bg-cyan-400 scale-125' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Client logos/companies */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold gradient-text mb-8">
            Empresas que confían en mi trabajo
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
          {testimonials.map((client, index) => (
            <div
              key={index}
              className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
              onClick={() => setCurrentTestimonial(index)}
            >
              <div className="text-3xl mb-2">{client.avatar}</div>
              <div className="font-semibold text-white text-sm">{client.company}</div>
              <div className="text-gray-400 text-xs">{client.project}</div>
            </div>
          ))}
        </div>

        {/* Overall stats */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          <h3 className="text-2xl font-bold gradient-text mb-8 text-center">
            Resultados Globales de mis Proyectos
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">98%</div>
              <div className="text-gray-400 text-sm">Satisfacción cliente</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">+280%</div>
              <div className="text-gray-400 text-sm">ROI promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">95+</div>
              <div className="text-gray-400 text-sm">Performance score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">24h</div>
              <div className="text-gray-400 text-sm">Respuesta media</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold gradient-text mb-4">
            ¿Quieres ser mi próximo cliente satisfecho?
          </h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Únete a empresas que han transformado su presencia digital y aumentado sus resultados
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
            Empezar mi proyecto ahora
          </button>
        </div>
      </div>
    </section>
  );
}

export default ClientTestimonials;