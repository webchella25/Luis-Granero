// src/app/portfolio/page.tsx - Versión corregida
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

// Definir PageProps correctamente según Next.js 14
interface PageProps {
  params?: { [key: string]: string | string[] }
  searchParams?: { [key: string]: string | string[] | undefined }
}

// Corregir la interfaz para que extienda PageProps
interface PortfolioPageProps extends PageProps {
  // Puedes añadir propiedades específicas aquí si es necesario
}

export async function generateMetadata(props: PortfolioPageProps) {
  const projects = await getPortfolioData();
  
  return {
    title: 'Portfolio - Luis Granero | Casos de Éxito en Desarrollo Web',
    description: `Explora mis ${projects.length} proyectos de desarrollo web: e-commerce, aplicaciones personalizadas, dashboards y más. Casos de estudio con código y resultados reales.`,
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
      description: `${projects.length} proyectos reales con métricas y tecnologías detalladas`,
      type: 'website',
      images: [
        {
          url: '/images/portfolio-og.jpg',
          width: 1200,
          height: 630,
          alt: 'Portfolio de Luis Granero - Desarrollador Web'
        }
      ]
    }
  };
}

export default async function PortfolioPage(props: PortfolioPageProps) {
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