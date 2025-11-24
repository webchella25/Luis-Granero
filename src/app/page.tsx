// src/app/page.tsx
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/hero/HeroSection';
import FeaturedCourse from '@/components/home/FeaturedCourse';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import LatestPosts from '@/components/home/LatestPosts';
import ServicesPreview from '@/components/home/ServicesPreview';
import TechStackStats from '@/components/home/TechStackStats';
import ContactCTA from '@/components/home/ContactCTA';

// Componente de loading para secciones
function SectionSkeleton() {
  return (
    <div className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-96 mx-auto mb-12"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Función para obtener el curso de React
async function getFeaturedCourse() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/email-courses`, {
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalidar cada hora
    });

    if (!res.ok) return null;

    const data = await res.json();
    const reactCourse = data.courses?.find((c: any) => c.slug === 'react-5-dias');
    return reactCourse || null;
  } catch (error) {
    console.error('Error fetching featured course:', error);
    return null;
  }
}

// Función para obtener proyectos destacados
async function getFeaturedProjects() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/projects`, {
      cache: 'no-store',
      next: { revalidate: 3600 }
    });

    if (!res.ok) return [];

    const projects = await res.json();
    // El endpoint devuelve un array directamente
    return Array.isArray(projects) ? projects.slice(0, 3) : [];
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
}

// Función para obtener últimos posts
async function getLatestPosts() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/blog`, {
      cache: 'no-store',
      next: { revalidate: 3600 }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.posts?.slice(0, 3) || [];
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }
}

// Componente principal de la HomePage
export default async function HomePage() {
  // Obtener datos en paralelo
  const [featuredCourse, featuredProjects, latestPosts] = await Promise.all([
    getFeaturedCourse(),
    getFeaturedProjects(),
    getLatestPosts()
  ]);

  return (
    <main className="min-h-screen bg-black">

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* Featured Course - Curso de React */}
      <FeaturedCourse course={featuredCourse} />

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <FeaturedProjects projects={featuredProjects} />
      )}

      {/* Latest Blog Posts */}
      {latestPosts.length > 0 && (
        <LatestPosts posts={latestPosts} />
      )}

      {/* Services Preview */}
      <Suspense fallback={<SectionSkeleton />}>
        <ServicesPreview />
      </Suspense>

      {/* Tech Stack + Stats */}
      <Suspense fallback={<SectionSkeleton />}>
        <TechStackStats />
      </Suspense>

      {/* Contact CTA */}
      <Suspense fallback={<SectionSkeleton />}>
        <ContactCTA />
      </Suspense>

      {/* Footer */}
      <Footer />

    </main>
  );
}

// Metadata estática
export const metadata = {
  title: 'Luis Granero - Desarrollador Full Stack | React, Next.js & Web Development',
  description: 'Transformo ideas en aplicaciones web modernas. Cursos gratuitos, proyectos reales y soluciones personalizadas. Especializado en React, Next.js y arquitecturas escalables.',
  keywords: ['desarrollo web', 'react', 'next.js', 'freelance', 'aplicaciones web', 'e-commerce', 'cursos react', 'tutorial javascript'],
  authors: [{ name: 'Luis Granero' }],
  creator: 'Luis Granero',
  publisher: 'Luis Granero',
  openGraph: {
    title: 'Luis Granero - Desarrollador Full Stack',
    description: 'Transformo ideas en aplicaciones web modernas. Cursos gratuitos, proyectos reales y soluciones personalizadas.',
    url: 'https://luisgranero.com',
    siteName: 'Luis Granero - Desarrollador Web',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luis Granero - Desarrollador Full Stack',
    description: 'Transformo ideas en aplicaciones web modernas. Cursos gratuitos y soluciones personalizadas.',
  },
  robots: {
    index: true,
    follow: true,
  },
};
