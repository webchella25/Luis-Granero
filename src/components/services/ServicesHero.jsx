// src/components/services/ServicesHero.jsx
'use client';

import { useState, useEffect } from 'react';

function ServicesHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeService, setActiveService] = useState(0);

  // Servicios rotativos para el subtítulo
  const rotatingServices = [
    "Desarrollo Web Moderno",
    "E-commerce Personalizado", 
    "Aplicaciones React",
    "APIs y Backend",
    "Optimización SEO"
  ];

  useEffect(() => {
    setIsVisible(true);

    // Rotación de servicios cada 2.5 segundos
    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % rotatingServices.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-[#0F172A] relative overflow-hidden">
      
      {/* EFECTOS DE FONDO SUTILES */}
      <div className="absolute inset-0">
        {/* Gradiente base con movimiento */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-transparent to-black/50" />
        
        {/* Efectos de luz sutiles */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Líneas de código flotantes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="font-mono text-cyan-400 text-xs leading-8 animate-float">
            {`const services = ["React", "Next.js", "Node.js"];`}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          
          {/* BREADCRUMB VISUAL */}
          <div className="flex items-center justify-center space-x-2 text-cyan-400 mb-8 font-mono">
            <span className="animate-pulse">{'<'}</span>
            <span className="text-gray-400">luis-granero</span>
            <span className="text-gray-600">/</span>
            <span className="text-cyan-400 font-semibold">servicios</span>
            <span className="animate-pulse">{'/>'}</span>
          </div>

          {/* TÍTULO PRINCIPAL CON EFECTO */}
          <h1 className="mb-6">
            <div className="text-5xl md:text-7xl font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
                Servicios de
              </span>
              <br />
              <span className="text-white relative">
                Desarrollo
                {/* Underline animado */}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-green-400 animate-pulse" />
              </span>
            </div>
          </h1>

          {/* SUBTÍTULO ROTATIVO */}
          <div className="text-xl md:text-2xl mb-8">
            <span className="text-gray-300">Especializado en </span>
            <span className="text-green-400 font-bold animate-pulse">
              {rotatingServices[activeService]}
            </span>
            <span className="animate-blink text-green-400 ml-1">_</span>
          </div>

          {/* DESCRIPCIÓN CON HIGHLIGHTS */}
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            <span className="text-cyan-400 font-semibold">Soluciones web personalizadas</span> que{' '}
            <span className="text-green-400 font-semibold">impulsan tu negocio</span>.
            <br />
            Sin plantillas genéricas, solo{' '}
            <span className="text-purple-400 font-semibold bg-gray-900/50 px-2 py-1 rounded">código a medida</span> que{' '}
            <span className="text-yellow-400 font-semibold">genera resultados</span>.
          </p>

          {/* STATS RÁPIDAS CON ICONOS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { icon: "⚡", label: "Performance", value: "99/100" },
              { icon: "🚀", label: "Deploy", value: "< 2 días" },
              { icon: "🔧", label: "Mantenimiento", value: "Incluido" },
              { icon: "💡", label: "Consultoría", value: "Gratuita" }
            ].map((stat, index) => (
              <div
                key={index}
                className={`group bg-[#1E293B] border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/40 transition-all duration-200`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-cyan-400 font-bold text-lg mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA SUTIL PERO EFECTIVO */}
          <div className="mt-12">
            <button className="btn-secondary">
              <span className="flex items-center">
                Explorar servicios
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesHero;