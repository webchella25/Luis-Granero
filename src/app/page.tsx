// src/app/page.tsx
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/hero/HeroSection';
import ServicesGrid from '@/components/services/ServicesGrid';
import TechStack from '@/components/home/TechStack';
import ProjectsPreview from '@/components/home/ProjectsPreview';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';
import ProcessSection from '@/components/services/ProcessSection';
import ContactCTA from '@/components/home/ContactCTA';
import FAQSection from '@/components/services/FAQSection';

// Función para obtener datos de homepage desde MongoDB
async function getHomepageData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/homepage`, {
      next: { revalidate: 3600 }, // Revalidar cada hora
    });
    
    if (!res.ok) {
      throw new Error('Error fetching homepage data');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error loading homepage data:', error);
    // Fallback a datos por defecto
    return {
      hero: {
        title: "Luis Granero",
        subtitle: "Desarrollador Full Stack",
        description: "Transformo ideas en aplicaciones web modernas y soluciones personalizadas.",
        ctaText: "Ver mis proyectos",
        ctaLink: "/portfolio",
        stats: [
          { label: "Proyectos", value: "50+" },
          { label: "Años", value: "10+" },
          { label: "Clientes", value: "35+" },
          { label: "Tecnologías", value: "15+" }
        ]
      },
      services: [],
      techStack: [],
      testimonials: []
    };
  }
}

// Función para obtener servicios desde MongoDB
async function getServicesData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/services`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      throw new Error('Error fetching services data');
    }
    
    const data = await res.json();
    return data.services || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

// Función para obtener proyectos destacados
async function getFeaturedProjects() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/projects?featured=true&limit=3`, {
      next: { revalidate: 1800 }, // Revalidar cada 30 minutos
    });
    
    if (!res.ok) {
      throw new Error('Error fetching featured projects');
    }
    
    const data = await res.json();
    return data.projects || [];
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
}

// Función para obtener testimonios destacados
async function getFeaturedTestimonials() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/testimonials?featured=true&limit=4`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      throw new Error('Error fetching testimonials');
    }
    
    const data = await res.json();
    return data.testimonials || [];
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

// Componente de loading para secciones
function SectionSkeleton() {
  return (
    <div className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-96 mx-auto mb-12"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal de la HomePage
export default async function HomePage() {
  // Obtener todos los datos en paralelo
  const [homepageData, servicesData, projectsData, testimonialsData] = await Promise.all([
    getHomepageData(),
    getServicesData(),
    getFeaturedProjects(),
    getFeaturedTestimonials()
  ]);

  return (
    <main className="min-h-screen bg-black">
      
      {/* Hero Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* Services Grid */}
      <Suspense fallback={<SectionSkeleton />}>
        <ServicesGrid />
      </Suspense>

      {/* Tech Stack */}
      <Suspense fallback={<SectionSkeleton />}>
        <TechStack techStack={homepageData.techStack} />
      </Suspense>

      {/* Featured Projects */}
      <Suspense fallback={<SectionSkeleton />}>
        <ProjectsPreview projects={projectsData} />
      </Suspense>

      {/* Testimonials */}
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection testimonials={testimonialsData} />
      </Suspense>

      {/* Process Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <ProcessSection />
      </Suspense>

      {/* FAQ Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <FAQSection />
      </Suspense>

      {/* Contact CTA */}
      <Suspense fallback={<SectionSkeleton />}>
        <ContactCTA />
      </Suspense>

    </main>
  );
}

// Metadata dinámica basada en datos de MongoDB
export async function generateMetadata() {
  try {
    const homepageData = await getHomepageData();
    
    return {
      title: `${homepageData.hero?.title || 'Luis Granero'} - ${homepageData.hero?.subtitle || 'Desarrollador Full Stack'}`,
      description: homepageData.hero?.description || 'Transformo ideas en aplicaciones web modernas y soluciones personalizadas. Especializado en React, Next.js y arquitecturas escalables.',
      keywords: ['desarrollo web', 'react', 'next.js', 'freelance', 'aplicaciones web', 'e-commerce'],
      authors: [{ name: 'Luis Granero' }],
      creator: 'Luis Granero',
      publisher: 'Luis Granero',
      openGraph: {
        title: `${homepageData.hero?.title} - ${homepageData.hero?.subtitle}`,
        description: homepageData.hero?.description,
        url: 'https://luisgranero.com',
        siteName: 'Luis Granero - Desarrollador Web',
        images: [
          {
            url: '/images/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'Luis Granero - Desarrollador Full Stack',
          },
        ],
        locale: 'es_ES',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${homepageData.hero?.title} - ${homepageData.hero?.subtitle}`,
        description: homepageData.hero?.description,
        images: ['/images/og-image.jpg'],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      verification: {
        google: 'tu-codigo-de-verificacion-google',
      },
      alternates: {
        canonical: 'https://luisgranero.com',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Metadata por defecto si hay error
    return {
      title: 'Luis Granero - Desarrollador Full Stack',
      description: 'Desarrollo web moderno con React, Next.js y tecnologías de vanguardia. Especializado en aplicaciones web personalizadas y e-commerce.',
      keywords: ['desarrollo web', 'react', 'next.js', 'freelance'],
    };
  }
}

// Configuración de revalidación para ISR
export const revalidate = 3600; // Revalidar cada hora

// Configuración de runtime (opcional)
export const runtime = 'nodejs';

// Configuración de segmentos dinámicos (opcional)
export const dynamic = 'force-static';