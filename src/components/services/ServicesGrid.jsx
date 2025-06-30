// src/components/services/ServicesGrid.jsx
'use client';

import { useHomepageData } from '@/hooks/useHomepageData';

function ServicesGrid() {
  const { data, loading } = useHomepageData();

  if (loading) {
    return (
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const services = data?.services || [];

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Servicios Profesionales
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Desarrollo web moderno con tecnologías de vanguardia para proyectos que requieren calidad y escalabilidad
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service._id || service.slug}
              className="relative group cursor-pointer"
            >
              <div className="bg-gray-800 rounded-lg p-8 h-full border border-gray-700 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10">
                
                {/* Icon */}
                <div className="text-4xl mb-4">
                  {service.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-3">
                  {service.title}
                </h3>

                {/* Subtitle */}
                {service.subtitle && (
                  <p className="text-cyan-400 text-sm font-medium mb-4">
                    {service.subtitle}
                  </p>
                )}

                {/* Description */}
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3">Incluye:</h4>
                    <ul className="space-y-2">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-gray-400 text-sm flex items-center">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3"></span>
                          {feature}
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-cyan-400 text-sm">
                          +{service.features.length - 3} más...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Technologies */}
                {service.technologies && service.technologies.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {service.technologies.map((tech, index) => (
                        <span 
                          key={index}
                          className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  {service.pricing?.startingPrice && (
                    <div className="text-cyan-400 font-bold text-lg">
                      Desde {service.pricing.startingPrice}
                    </div>
                  )}
                  
                  {service.deliveryTime && (
                    <div className="text-gray-500 text-sm">
                      {service.deliveryTime}
                    </div>
                  )}
                </div>

                {/* Hover effect gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a 
            href="/contacto"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
          >
            Solicitar presupuesto personalizado
          </a>
        </div>
      </div>
    </section>
  );
}

export default ServicesGrid;