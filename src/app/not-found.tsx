// src/app/not-found.tsx
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Página no encontrada - 404',
  description: 'La página que buscas no existe o ha sido movida',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <span className="text-9xl">🤔</span>
          </div>

          {/* Title */}
          <h1 className="text-6xl font-bold gradient-text mb-6">
            404
          </h1>

          <h2 className="text-3xl font-bold text-white mb-4">
            Página no encontrada
          </h2>

          <p className="text-xl text-gray-400 mb-12">
            Lo siento, la página que buscas no existe o ha sido movida.
            <br />
            ¿Quizás estabas buscando alguno de estos?
          </p>

          {/* Navigation Links */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <Link
              href="/blog"
              className="block bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500 rounded-lg p-6 transition-all group"
            >
              <div className="text-3xl mb-2">📝</div>
              <div className="text-lg font-bold text-white group-hover:text-cyan-400 mb-2">
                Blog
              </div>
              <div className="text-sm text-gray-400">
                Artículos sobre desarrollo web
              </div>
            </Link>

            <Link
              href="/portfolio"
              className="block bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500 rounded-lg p-6 transition-all group"
            >
              <div className="text-3xl mb-2">💼</div>
              <div className="text-lg font-bold text-white group-hover:text-cyan-400 mb-2">
                Portfolio
              </div>
              <div className="text-sm text-gray-400">
                Proyectos reales desarrollados
              </div>
            </Link>

            <Link
              href="/cursos"
              className="block bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500 rounded-lg p-6 transition-all group"
            >
              <div className="text-3xl mb-2">🎓</div>
              <div className="text-lg font-bold text-white group-hover:text-cyan-400 mb-2">
                Cursos
              </div>
              <div className="text-sm text-gray-400">
                Aprende desarrollo web gratis
              </div>
            </Link>

            <Link
              href="/servicios"
              className="block bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500 rounded-lg p-6 transition-all group"
            >
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-lg font-bold text-white group-hover:text-cyan-400 mb-2">
                Servicios
              </div>
              <div className="text-sm text-gray-400">
                Soluciones web personalizadas
              </div>
            </Link>
          </div>

          {/* Home Button */}
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold px-8 py-4 rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all"
          >
            Volver al inicio
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
