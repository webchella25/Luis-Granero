// src/components/home/HeroSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface HeroData {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  stats?: Array<{
    label: string;
    value: string;
  }>;
}

interface Props {
  data?: HeroData;
}

export default function HeroSection({ data }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Datos por defecto si no hay datos del admin
  const heroContent = {
    title: data?.title || "Luis Granero",
    subtitle: data?.subtitle || "Desarrollador Full Stack",
    description: data?.description || "Transformo ideas en aplicaciones web modernas y soluciones personalizadas. Especializado en React, Next.js y arquitecturas escalables.",
    ctaText: data?.ctaText || "Ver mis proyectos",
    ctaLink: data?.ctaLink || "/portfolio",
    stats: data?.stats || [
      { label: "Proyectos", value: "50+" },
      { label: "Años", value: "10+" },
      { label: "Clientes", value: "35+" },
      { label: "Tecnologías", value: "15+" }
    ]
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-green-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          
          {/* Console greeting */}
          <div className="flex items-center justify-center space-x-2 text-cyan-400 mb-8">
            <span className="font-mono text-lg">console.log("Hola mundo!")</span>
          </div>
          
          {/* Título principal */}
          <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-4">
            {heroContent.title}
          </h1>

          {/* Subtítulo */}
          <p className="text-2xl md:text-3xl text-gray-300 font-mono mb-8">
            {heroContent.subtitle}
          </p>

          {/* Descripción */}
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
            {heroContent.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href={heroContent.ctaLink}
              className="group px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <span>{heroContent.ctaText}</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/contacto"
              className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Hablemos
            </Link>
          </div>

          {/* Stats dinámicas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {heroContent.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}