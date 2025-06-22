import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer.jsx';
import PortfolioHero from '@/components/portfolio/PortfolioHero.jsx';
import ProjectsGrid from '@/components/portfolio/ProjectsGrid.jsx';
import TechnologiesUsed from '@/components/portfolio/TechnologiesUsed.jsx';
import ClientTestimonials from '@/components/portfolio/ClientTestimonials.jsx';

export const metadata = {
  title: 'Portfolio - Luis Granero | Casos de Éxito en Desarrollo Web',
  description: 'Explora mis proyectos de desarrollo web: e-commerce, aplicaciones personalizadas, dashboards y más. Casos de estudio con código y resultados reales.',
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <PortfolioHero />
      <ProjectsGrid />
      <TechnologiesUsed />
      <ClientTestimonials />
      <Footer />
    </main>
  );
}