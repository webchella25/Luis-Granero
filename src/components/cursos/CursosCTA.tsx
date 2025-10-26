// src/components/cursos/CursosCTA.tsx
'use client';

import Link from 'next/link';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function CursosCTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para empezar tu viaje?
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Elige una ruta, sigue los artículos en orden y construye proyectos reales.
            <span className="block mt-2 text-purple-400 font-semibold">
              Tu futuro como desarrollador comienza hoy.
            </span>
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/cursos"
              className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <span>Ver todas las rutas</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/contacto"
              className="px-8 py-4 border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              ¿Tienes dudas? Contáctame
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <span>Contenido práctico</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <span>Siempre actualizado</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span>100% gratis</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}