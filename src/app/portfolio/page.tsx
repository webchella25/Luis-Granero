// src/app/portfolio/page.tsx
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import PortfolioHero from '../../components/portfolio/PortfolioHero';
import ProjectsGrid from '../../components/portfolio/ProjectsGrid';
import TechnologiesUsed from '../../components/portfolio/TechnologiesUsed';
import SchemaOrg from '../../components/seo/SchemaOrg';
import { getItemListSchema, getBreadcrumbSchema } from '../../lib/seo/schemas';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo/metadata';

// ISR - Revalidar cada 24 horas
export const revalidate = 86400;

// Función para obtener proyectos
async function getPortfolioData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/projects`, {
      next: { revalidate: 86400 },
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
      next: { revalidate: 86400 },
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

interface PortfolioProject {
  title: string
  slug: string
  image?: string
  images?: string[]
  mainImage?: string
}

export async function generateMetadata() {
  const projects = await getPortfolioData();
  
  return {
    title: 'Portfolio de Desarrollo Web — Luis Granero | Proyectos React & Next.js en España',
    description: `${projects.length || '+20'} proyectos reales de desarrollo web: tiendas online, aplicaciones React, dashboards y más. Casos de éxito con resultados medibles. Desarrollador freelance senior en España.`,
    keywords: [
      'portfolio desarrollador web España',
      'proyectos React Next.js reales',
      'casos de éxito desarrollo web',
      'tiendas online a medida',
      'aplicaciones web personalizadas',
      'freelance React portfolio',
    ],
    openGraph: {
      title: 'Portfolio — Luis Granero | Proyectos React & Next.js',
      description: 'Proyectos reales de desarrollo web con React, Next.js y tecnologías modernas. Freelance senior en España.',
      type: 'website',
      url: `${SITE_URL}/portfolio`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Portfolio — Luis Granero | Proyectos React & Next.js',
      description: 'Proyectos reales de desarrollo web con React, Next.js y tecnologías modernas.',
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: {
      canonical: `${SITE_URL}/portfolio`,
    },
  };
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  await searchParams;

  const [projects, portfolioSettings] = await Promise.all([
    getPortfolioData(),
    getPortfolioSettings()
  ]);

  console.log('📊 Portfolio Page - Projects:', projects.length);
  console.log('📊 Portfolio Page - Settings:', portfolioSettings);

  // Generar schemas
  const portfolioListSchema = getItemListSchema(
    projects.map((project: PortfolioProject) => ({
      name: project.title,
      url: `/portfolio/${project.slug}`,
      image: project.images?.[0] || project.mainImage || project.image
    })),
    'Proyectos de Portfolio de Desarrollo Web'
  );

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Portfolio', url: '/portfolio' }
  ]);

  return (
    <main className="min-h-screen bg-[#0F172A]">
      {/* Schema.org JSON-LD */}
      <SchemaOrg schema={[portfolioListSchema, breadcrumbSchema]} />

      <Header />
      <PortfolioHero 
        data={portfolioSettings}
        projectCount={projects.length} 
      />
      <ProjectsGrid projects={projects} />
      <TechnologiesUsed />
      <Footer />
    </main>
  );
}
