// src/app/portfolio/page.tsx - Versión completa corregida
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import PortfolioHero from '../../components/portfolio/PortfolioHero';
import ProjectsGrid from '../../components/portfolio/ProjectsGrid';
import TechnologiesUsed from '../../components/portfolio/TechnologiesUsed';
import ClientTestimonials from '../../components/portfolio/ClientTestimonials';

// Función para obtener proyectos
async function getPortfolioData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/projects`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Error fetching portfolio data');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error:', error);
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
      throw new Error('Error fetching portfolio settings');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error:', error);
    return { content: {} };
  }
}

// Interface para props si necesitas searchParams en el futuro
interface PortfolioPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: PortfolioPageProps = {}) {
  // Si necesitas searchParams en el futuro:
  // const resolvedSearchParams = searchParams ? await searchParams : {};
  
  const projects = await getPortfolioData();
  
  return {
    title: 'Portfolio - Luis Granero | Casos de Éxito en Desarrollo Web',
    description: `Explora mis ${projects.length} proyectos de desarrollo web: e-commerce, aplicaciones personalizadas, dashboards y más. Casos de estudio con código y resultados reales.`,
  };
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps = {}) {
  // Si en el futuro necesitas usar searchParams (para filtros por ejemplo):
  // const resolvedSearchParams = searchParams ? await searchParams : {};
  
  const [projects, portfolioSettings] = await Promise.all([
    getPortfolioData(),
    getPortfolioSettings()
  ]);

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <PortfolioHero 
        data={portfolioSettings.content} 
        projectCount={projects.length} 
      />
      <ProjectsGrid projects={projects} />
      <TechnologiesUsed />
      <ClientTestimonials />
      <Footer />
    </main>
  );
}