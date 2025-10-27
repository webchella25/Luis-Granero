// src/app/legal/[slug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ReactMarkdown from 'react-markdown';

interface LegalPageProps {
  params: Promise<{ slug: string }>;
}

async function getLegalPage(slug: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/legal/${slug}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.page;
  } catch (error) {
    console.error('Error fetching legal page:', error);
    return null;
  }
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await getLegalPage(resolvedParams.slug);
  
  if (!page) {
    return {
      title: 'Página no encontrada',
    };
  }
  
  return {
    title: `${page.title} - Luis Granero`,
    description: page.metaDescription || page.title,
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const resolvedParams = await params;
  const page = await getLegalPage(resolvedParams.slug);
  
  if (!page) {
    return (
      <main className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Página no encontrada
            </h1>
            <p className="text-gray-400 mb-8">
              La página legal que buscas no existe.
            </p>
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {page.title}
            </h1>
            <p className="text-gray-400">
              Última actualización: {new Date(page.lastUpdated).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Legal Pages Navigation */}
            <div className="mb-12 p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                Otras páginas legales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link 
                  href="/legal/aviso-legal"
                  className={`p-3 rounded-lg border transition-colors ${
                    resolvedParams.slug === 'aviso-legal'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  ⚖️ Aviso Legal
                </Link>
                <Link 
                  href="/legal/privacidad"
                  className={`p-3 rounded-lg border transition-colors ${
                    resolvedParams.slug === 'privacidad'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  🔒 Política de Privacidad
                </Link>
                <Link 
                  href="/legal/cookies"
                  className={`p-3 rounded-lg border transition-colors ${
                    resolvedParams.slug === 'cookies'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  🍪 Política de Cookies
                </Link>
                <Link 
                  href="/legal/terminos"
                  className={`p-3 rounded-lg border transition-colors ${
                    resolvedParams.slug === 'terminos'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  📜 Términos y Condiciones
                </Link>
              </div>
            </div>
            
            {/* Legal Content */}
            <div className="prose prose-invert prose-cyan max-w-none">
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-8">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-white mb-6 pb-4 border-b border-gray-800">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold text-white mt-8 mb-4">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold text-white mt-6 mb-3">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4 ml-4">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-4 ml-4">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-300">
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-white font-semibold">
                        {children}
                      </strong>
                    ),
                    a: ({ href, children }) => (
                      <a 
                        href={href}
                        className="text-cyan-400 hover:text-cyan-300 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {page.content}
                </ReactMarkdown>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="mt-12 p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">
                ¿Tienes alguna pregunta?
              </h3>
              <p className="text-gray-400 mb-4">
                Si tienes dudas sobre nuestras políticas legales, no dudes en contactarnos.
              </p>
              <Link
                href="/contacto"
                className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Contactar
              </Link>
            </div>
            
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}