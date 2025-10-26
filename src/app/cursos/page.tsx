// src/app/cursos/page.tsx
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import CursosHero from '../../components/cursos/CursosHero';
import LearningPathsGrid from '../../components/cursos/LearningPathsGrid';
import CursosFeatures from '../../components/cursos/CursosFeatures';
import CursosCTA from '../../components/cursos/CursosCTA';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Función para obtener las rutas de aprendizaje publicadas
async function getLearningPaths() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/learning-paths`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error('Error fetching learning paths:', res.status);
      return [];
    }
    
    const data = await res.json();
    return data.paths || [];
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return [];
  }
}

export async function generateMetadata() {
  const paths = await getLearningPaths();
  
  return {
    title: 'Cursos de Desarrollo Web - Luis Granero | Aprende React, Next.js y más',
    description: `Aprende desarrollo web moderno con ${paths.length} rutas de aprendizaje estructuradas. Desde fundamentos hasta nivel avanzado en React, Next.js, TypeScript y más.`,
    keywords: [
      'cursos desarrollo web',
      'aprender react',
      'tutorial next.js',
      'curso javascript',
      'rutas de aprendizaje',
      'formación programación',
      'luis granero cursos'
    ],
    openGraph: {
      title: 'Cursos de Desarrollo Web - Luis Granero',
      description: 'Rutas de aprendizaje estructuradas para convertirte en desarrollador web profesional',
      type: 'website',
      url: 'https://luisgranero.com/cursos',
    }
  };
}

export default async function CursosPage() {
  const paths = await getLearningPaths();
  
  // Separar rutas destacadas y normales
  const featuredPaths = paths.filter((p: any) => p.isFeatured);
  const regularPaths = paths.filter((p: any) => !p.isFeatured);

  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section */}
      <CursosHero totalCursos={paths.length} />
      
      {/* Rutas destacadas */}
      {featuredPaths.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                ⭐ Recomendadas
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
                Rutas Destacadas
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Las rutas más populares y completas para tu desarrollo profesional
              </p>
            </div>
            <LearningPathsGrid paths={featuredPaths} featured={true} />
          </div>
        </section>
      )}
      
      {/* Todas las rutas */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Todas las Rutas de Aprendizaje
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Elige tu camino según tu nivel y objetivos profesionales
            </p>
          </div>
          <LearningPathsGrid paths={regularPaths} />
        </div>
      </section>
      
      {/* Features de los cursos */}
      <CursosFeatures />
      
      {/* CTA final */}
      <CursosCTA />
      
      <Footer />
    </main>
  );
}