// src/app/portfolio/page.tsx
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import PortfolioHero from '../../components/portfolio/PortfolioHero';
import ProjectsGrid from '../../components/portfolio/ProjectsGrid';
import TechnologiesUsed from '../../components/portfolio/TechnologiesUsed';
import ClientTestimonials from '../../components/portfolio/ClientTestimonials';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Función para obtener proyectos
async function getPortfolioData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/projects`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error('Error fetching portfolio data:', res.status);
      return [];
    }
    
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return [];
  }
}

// Función para obtener configuración del portfolio
async function getPortfolioSettings() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/portfolio/settings`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error('Portfolio settings fetch failed:', res.status);
      return {
        hero: { 
          title: "Portfolio", 
          subtitle: "Casos de éxito en desarrollo web", 
          description: "Proyectos profesionales con tecnologías modernas" 
        },
        stats: {
          totalProjects: 0,
          featuredProjects: 0,
          technologies: 0,
          clientSatisfaction: "98%"
        },
        categories: [],
        valuePropositions: []
      };
    }
    
    const data = await res.json();
    
    // La API devuelve { content: {...} }, extraemos content
    return data?.content || {
      hero: { 
        title: "Portfolio", 
        subtitle: "Casos de éxito en desarrollo web", 
        description: "" 
      },
      stats: {
        totalProjects: 0,
        clientSatisfaction: "98%"
      },
      categories: [],
      valuePropositions: []
    };
    
  } catch (error) {
    console.error('Error fetching portfolio settings:', error);
    return {
      hero: { 
        title: "Portfolio", 
        subtitle: "Casos de éxito en desarrollo web", 
        description: "" 
      },
      stats: {
        totalProjects: 0,
        clientSatisfaction: "98%"
      },
      categories: [],
      valuePropositions: []
    };
  }
}

interface PortfolioPageProps {
  params: Promise<{ [key: string]: string | string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: PortfolioPageProps) {
  const resolvedSearchParams = await searchParams;
  const projects = await getPortfolioData();
  
  return {
    title: 'Portfolio - Luis Granero | Casos de Éxito en Desarrollo Web',
    description: `Explora mis ${projects.length || 25} proyectos de desarrollo web: e-commerce, aplicaciones personalizadas, dashboards y más. Casos de estudio con código y resultados reales.`,
    keywords: [
      'portfolio desarrollo web',
      'casos de éxito',
      'proyectos react',
      'aplicaciones personalizadas',
      'ecommerce desarrollo',
      'dashboards corporativos'
    ],
    openGraph: {
      title: 'Portfolio - Luis Granero | Casos de Éxito en Desarrollo Web',
      description: `${projects.length || 25} proyectos reales con métricas y tecnologías detalladas`,
      type: 'website'
    }
  };
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const resolvedSearchParams = await searchParams;
  
  const [projects, portfolioSettings] = await Promise.all([
    getPortfolioData(),
    getPortfolioSettings()
  ]);

  console.log('📊 Portfolio Page - Projects:', projects.length);
  console.log('📊 Portfolio Page - Settings:', portfolioSettings);

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <PortfolioHero 
        data={portfolioSettings}
        projectCount={projects.length} 
      />
      <ProjectsGrid projects={projects} />
      <TechnologiesUsed />
      <ClientTestimonials />
      <Footer />
    </main>
  );
}