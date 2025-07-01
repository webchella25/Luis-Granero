// src/components/home/ServicesPreview.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ServicesPreview() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('/api/homepage');
        const data = await response.json();
        // Solo mostrar los primeros 3 servicios
        setServices(data.services?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback a servicios por defecto
        setServices([
          {
            _id: 1,
            icon: "⚛️",
            title: "Desarrollo Web",
            subtitle: "React & Next.js",
            description: "Aplicaciones modernas y escalables",
            slug: "desarrollo-web",
            color: "from-cyan-400 to-blue-500"
          },
          {
            _id: 2,
            icon: "🛒",
            title: "E-commerce",
            subtitle: "Tiendas personalizadas",
            description: "Sin limitaciones de plantillas",
            slug: "ecommerce",
            color: "from-green-400 to-emerald-500"
          },
          {
            _id: 3,
            icon: "🚀",
            title: "Optimización",
            subtitle: "Performance & SEO",
            description: "Mejora velocidad y posicionamiento",
            slug: "optimizacion",
            color: "from-purple-400 to-pink-500"
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Servicios principales
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Especializado en desarrollo web moderno con tecnologías de vanguardia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <div
              key={service._id || index}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              {/* Icono y gradiente */}
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>

              {/* Contenido */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {service.title}
              </h3>
              <p className="text-cyan-400 font-medium mb-4">
                {service.subtitle}
              </p>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Link a servicio */}
              <Link
                href={`/servicios#${service.slug}`}
                className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Saber más
                <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        {/* Ver todos los servicios */}
        <div className="text-center">
          <Link
            href="/servicios"
            className="inline-flex items-center px-8 py-4 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Ver todos los servicios
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}