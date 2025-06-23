// src/components/home/ServicesPreview.tsx
'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface Service {
  id?: number;
  title: string;
  description: string;
  icon: string;
  technologies?: string[];
  color?: string;
  features?: string[];
  startingPrice?: string;
  deliveryTime?: string;
}

interface Props {
  data?: Service[];
}

export default function ServicesPreview({ data }: Props) {
  // Servicios por defecto SOLO si no hay datos del admin
  const defaultServices: Service[] = [
    {
      id: 1,
      title: "Desarrollo Web Moderno",
      description: "Aplicaciones web con React, Next.js y TypeScript. Código limpio, escalable y mantenible.",
      icon: "💻",
      technologies: ["React", "Next.js", "TypeScript"],
      color: "from-cyan-400 to-blue-500",
      features: ["SPA & PWA", "SSR/SSG", "Performance optimizado"]
    },
    {
      id: 2,
      title: "E-commerce Personalizado",
      description: "Tiendas online a medida sin limitaciones de plantillas genéricas.",
      icon: "🛒",
      technologies: ["E-commerce", "Pagos", "APIs"],
      color: "from-green-400 to-emerald-500",
      features: ["Payments integrados", "Dashboard admin", "SEO optimizado"]
    },
    {
      id: 3,
      title: "Optimización & SEO",
      description: "Mejoro la velocidad y posicionamiento de sitios existentes.",
      icon: "🚀",
      technologies: ["SEO", "Performance", "Analytics"],
      color: "from-purple-400 to-pink-500",
      features: ["Core Web Vitals", "Technical SEO", "Performance audit"]
    }
  ];

  // Usar datos del admin SI existen, sino usar defaults
  const services = (data && data.length > 0) ? data.slice(0, 6) : defaultServices;

  return (
    <section id="servicios" className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Servicios Especializados
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Desarrollo web moderno enfocado en resultados. Sin plantillas genéricas, 
            solo soluciones personalizadas que impulsan tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <div
              key={service.id || index}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Icon */}
              <div className="text-4xl mb-4">{service.icon}</div>
              
              {/* Título */}
              <h3 className={`text-xl font-bold mb-3 bg-gradient-to-r ${service.color || 'from-cyan-400 to-blue-500'} bg-clip-text text-transparent`}>
                {service.title}
              </h3>
              
              {/* Descripción */}
              <p className="text-gray-400 mb-4 leading-relaxed">
                {service.description}
              </p>
              
              {/* Features si existen */}
              {service.features && service.features.length > 0 && (
                <div className="mb-4">
                  <ul className="space-y-1">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-300">
                        <span className="text-green-400 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Technologies */}
              {service.technologies && service.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.technologies.slice(0, 3).map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded-full border border-cyan-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                  {service.technologies.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded-full">
                      +{service.technologies.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Precio si existe */}
              {service.startingPrice && (
                <div className="text-sm text-green-400 font-semibold mb-4">
                  Desde {service.startingPrice}
                </div>
              )}
              
              {/* CTA Button */}
              <button className={`w-full py-2 px-4 bg-gradient-to-r ${service.color || 'from-cyan-400 to-blue-500'} text-white font-semibold rounded-lg opacity-90 hover:opacity-100 transition-opacity duration-300`}>
                Más información
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/servicios"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105"
          >
            <span>Ver todos los servicios</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}