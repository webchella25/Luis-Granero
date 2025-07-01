// src/app/page.tsx
import { Suspense } from 'react';
import HeroSection from '@/components/hero/HeroSection';
import ServicesGrid from '@/components/services/ServicesGrid';
import TechStack from '@/components/home/TechStack';
import ProjectsPreview from '@/components/home/ProjectsPreview';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';
import ProcessSection from '@/components/services/ProcessSection';
import ContactCTA from '@/components/home/ContactCTA';
import FAQSection from '@/components/services/FAQSection';

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
export default function HomePage() {
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
        <TechStack />
      </Suspense>

      {/* Featured Projects */}
      <Suspense fallback={<SectionSkeleton />}>
        <ProjectsPreview />
      </Suspense>

      {/* Testimonials */}
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
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

// Metadata estática por ahora
export const metadata = {
  title: 'Luis Granero - Desarrollador Full Stack',
  description: 'Transformo ideas en aplicaciones web modernas y soluciones personalizadas. Especializado en React, Next.js y arquitecturas escalables.',
  keywords: ['desarrollo web', 'react', 'next.js', 'freelance', 'aplicaciones web', 'e-commerce'],
  authors: [{ name: 'Luis Granero' }],
  creator: 'Luis Granero',
  publisher: 'Luis Granero',
  openGraph: {
    title: 'Luis Granero - Desarrollador Full Stack',
    description: 'Transformo ideas en aplicaciones web modernas y soluciones personalizadas.',
    url: 'https://luisgranero.com',
    siteName: 'Luis Granero - Desarrollador Web',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luis Granero - Desarrollador Full Stack',
    description: 'Transformo ideas en aplicaciones web modernas y soluciones personalizadas.',
  },
  robots: {
    index: true,
    follow: true,
  },
};