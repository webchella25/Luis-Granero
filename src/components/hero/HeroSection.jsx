// src/components/hero/HeroSection.jsx
'use client';

import Link from 'next/link';
import { useHomepageData } from '@/hooks/useHomepageData';

function HeroSection() {
  const { data, loading } = useHomepageData();

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-800 rounded w-96 mb-4"></div>
          <div className="h-6 bg-gray-800 rounded w-64 mb-8"></div>
          <div className="h-12 bg-cyan-600 rounded w-48"></div>
        </div>
      </section>
    );
  }

  const hero = data?.hero || {};

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center relative overflow-hidden">
      {/* Partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">
              {hero.title}
            </span>
          </h1>

          {/* Subtítulo */}
          <h2 className="text-2xl md:text-3xl text-gray-300 mb-6">
            {hero.subtitle}
          </h2>

          {/* Descripción */}
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            {hero.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link 
              href={hero.ctaLink || '/portfolio'}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
            >
              {hero.ctaText}
            </Link>
            
            <Link 
              href="/contacto"
              className="border-2 border-cyan-500 text-cyan-500 px-8 py-4 rounded-full font-semibold text-lg hover:bg-cyan-500 hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Hablemos de tu proyecto
            </Link>
          </div>

          {/* Stats */}
          {hero.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {hero.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-600 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;