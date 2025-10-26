// src/components/cursos/CursosHero.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AcademicCapIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  totalCursos: number;
}

export default function CursosHero({ totalCursos }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-black overflow-hidden pt-20">
      
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          
          {/* Badge */}
          <div className="flex items-center justify-center space-x-2 text-purple-400 mb-6">
            <AcademicCapIcon className="w-6 h-6" />
            <span className="font-mono text-sm uppercase tracking-wider">
              Aprende paso a paso
            </span>
          </div>
          
          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Rutas de Aprendizaje</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Secuencias estructuradas de artículos para convertirte en desarrollador web profesional.
            <span className="block mt-2 text-cyan-400 font-semibold">
              De principiante a experto, a tu ritmo.
            </span>
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center space-x-2 text-gray-300">
              <AcademicCapIcon className="w-6 h-6 text-purple-400" />
              <span className="text-2xl font-bold text-white">{totalCursos}</span>
              <span>Rutas disponibles</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <ClockIcon className="w-6 h-6 text-cyan-400" />
              <span className="text-2xl font-bold text-white">100%</span>
              <span>Gratis</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-white">Práctico</span>
              <span>Con proyectos reales</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#rutas"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Ver todas las rutas
            </a>
            
            <Link
              href="/blog"
              className="px-8 py-4 border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Ver blog
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}