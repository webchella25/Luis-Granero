// src/app/portfolio/page.js
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import ProjectsGrid from '@/components/portfolio/ProjectsGrid';
import TechnologiesUsed from '@/components/portfolio/TechnologiesUsed';
import ClientTestimonials from '@/components/portfolio/ClientTestimonials';
import Loading, { SectionLoading } from '@/components/ui/Loading';

// Función para obtener proyectos desde MongoDB
async function getPortfolioData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/projects?limit=12&sort=createdAt&order=desc`, {
      next: { revalidate: 1800 }, // Revalidar cada 30 minutos
    });
    
    if (!res.ok) {
      throw new Error('Error fetching portfolio data');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error loading portfolio:', error);
    return {
      projects: [],
      pagination: { total: 0, totalPages: 0 },
      categories: {}
    };
  }
}

// Función para obtener configuración del portfolio
async function getPortfolioSettings() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/portfolio/settings`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      throw new Error('Error fetching portfolio settings');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error loading portfolio settings:', error);
    return {
      content: {
        hero: {
          title: "Portfolio",
          subtitle: "Casos de éxito que demuestran mi experiencia en desarrollo web moderno",
          description: "Cada proyecto incluye código, métricas reales y tecnologías utilizadas."
        },
        stats: {
          clientSatisfaction: "98%",
          avgROI: "300%",
          avgLoadTime: "1.2s"
        }
      }
    };
  }
}

// Función para obtener testimonios del portfolio
async function getPortfolioTestimonials() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/testimonials?featured=true&limit=3`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      throw new Error('Error fetching testimonials');
    }
    
    const data = await res.json();
    return data.testimonials || [];
  } catch (error) {
    console.error('Error loading testimonials:', error);
    return [];
  }
}

// Función para obtener tecnologías únicas
async function getTechnologiesData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/projects?limit=100`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      throw new Error('Error fetching technologies');
    }
    
    const data = await res.json();
    const technologies = new Map();
    
    data.projects.forEach(project => {
      project.technologies?.forEach(tech => {
        technologies.set(tech, (technologies.get(tech) || 0) + 1);
      });
    });
    
    return Array.from(technologies.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
      
  } catch (error) {
    console.error('Error loading technologies:', error);
    return [];
  }
}

// Componente de loading específico para portfolio
function PortfolioSkeleton() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          {/* Hero skeleton */}
          <div className="text-center mb-16">
            <div className="h-16 bg-gray-700 rounded w-96 mx-auto mb-6"></div>
            <div className="h-6 bg-gray-700 rounded w-2/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
          
          {/* Projects grid skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal del Portfolio
export default async function PortfolioPage() {
  // Obtener todos los datos en paralelo
  const [portfolioData, portfolioSettings, testimonials, technologies] = await Promise.all([
    getPortfolioData(),
    getPortfolioSettings(),
    getPortfolioTestimonials(),
    getTechnologiesData()
  ]);

  const { projects, pagination, categories } = portfolioData;
  const { content: settings } = portfolioSettings;

  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      {/* Portfolio Hero */}
      <Suspense fallback={<PortfolioSkeleton />}>
        <PortfolioHero 
          data={settings}
          projectCount={pagination.total}
          categories={categories}
        />
      </Suspense>

      {/* Projects Grid */}
      <Suspense fallback={<SectionLoading />}>
        <ProjectsGrid 
          projects={projects}
          pagination={pagination}
          categories={categories}
        />
      </Suspense>

      {/* Technologies Used */}
      <Suspense fallback={<SectionLoading />}>
        <TechnologiesUsed technologies={technologies} />
      </Suspense>

      {/* Client Testimonials */}
      <Suspense fallback={<SectionLoading />}>
        <ClientTestimonials testimonials={testimonials} />
      </Suspense>

      <Footer />
    </main>
  );
}

// Metadata dinámica basada en datos de MongoDB
export async function generateMetadata() {
  try {
    const portfolioData = await getPortfolioData();
    const portfolioSettings = await getPortfolioSettings();
    
    const projectCount = portfolioData.pagination?.total || 0;
    const settings = portfolioSettings.content || {};
    
    return {
      title: `${settings.hero?.title || 'Portfolio'} - Luis Granero | ${projectCount} Casos de Éxito`,
      description: settings.hero?.description || 'Explora mis casos de éxito en desarrollo web: e-commerce, aplicaciones personalizadas, dashboards y más. Proyectos con código y resultados reales.',
      keywords: ['portfolio', 'proyectos web', 'casos de éxito', 'desarrollo web', 'react', 'next.js', 'e-commerce', 'aplicaciones web'],
      authors: [{ name: 'Luis Granero' }],
      openGraph: {
        title: `Portfolio - Luis Granero | ${projectCount} Proyectos`,
        description: settings.hero?.description,
        url: 'https://luisgranero.com/portfolio',
        siteName: 'Luis Granero - Desarrollador Web',
        images: [
          {
            url: '/images/portfolio-og.jpg',
            width: 1200,
            height: 630,
            alt: 'Portfolio Luis Granero - Desarrollador Web',
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Portfolio - Luis Granero | ${projectCount} Proyectos`,
        description: settings.hero?.description,
        images: ['/images/portfolio-og.jpg'],
      },
      alternates: {
        canonical: 'https://luisgranero.com/portfolio',
      },
    };
  } catch (error) {
    console.error('Error generating portfolio metadata:', error);
    
    return {
      title: 'Portfolio - Luis Granero | Casos de Éxito en Desarrollo Web',
      description: 'Explora mis proyectos de desarrollo web con tecnologías modernas. Casos de estudio detallados con código y métricas reales.',
    };
  }
}

// Configuración de revalidación para ISR
export const revalidate = 1800; // Revalidar cada 30 minutos

// Configuración de runtime
export const runtime = 'nodejs';

// Configuración de segmentos dinámicos
export const dynamic = 'force-dynamic'; // Para permitir filtros dinámicos