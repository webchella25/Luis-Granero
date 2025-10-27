// src/app/portfolio/[slug]/not-found.tsx
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ProjectNotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            
            {/* Emoji grande */}
            <div className="text-8xl mb-8">
              🔍
            </div>

            {/* Título */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Proyecto no encontrado
            </h1>

            {/* Descripción */}
            <p className="text-xl text-gray-400 mb-8">
              El proyecto que buscas no existe o ha sido eliminado del portfolio.
            </p>

            {/* Error 404 */}
            <div className="inline-block px-6 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg mb-8">
              <span className="text-cyan-400 font-mono text-lg">
                Error 404: Project Not Found
              </span>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/portfolio"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl transition-all"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Volver al Portfolio</span>
              </Link>

              <Link
                href="/contacto"
                className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                <span>Contactar</span>
              </Link>
            </div>

            {/* Sugerencia */}
            <div className="mt-12 p-6 bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl">
              <p className="text-gray-400">
                <span className="text-cyan-400 font-semibold">Sugerencia:</span> 
                {' '}Verifica que la URL esté correctamente escrita o explora otros proyectos en mi portfolio.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}