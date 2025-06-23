// src/app/blog/[slug]/not-found.tsx
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';

export default function BlogNotFound() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            
            <div className="text-8xl mb-8">📝</div>
            
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Artículo no encontrado
            </h1>
            
            <p className="text-xl text-gray-400 mb-8">
              Lo siento, el artículo que buscas no existe o ha sido movido.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/blog"
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Ver todos los artículos
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-cyan-500 text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
            
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}