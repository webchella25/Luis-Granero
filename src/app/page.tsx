// src/app/page.tsx - Versión corregida
import { Suspense } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import ServicesPreview from '../components/home/ServicesPreview';
import TechStack from '../components/home/TechStack';
import ProjectsPreview from '../components/home/ProjectsPreview';
import ContactCTA from '../components/home/ContactCTA';
import Loading, { SectionLoading } from '../components/ui/Loading';

// Función para obtener datos de homepage
async function getHomepageData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/homepage`, {
      cache: 'no-store', // Por ahora sin cache para desarrollo
    });
    
    if (!res.ok) {
      throw new Error('Error fetching homepage data');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error:', error);
    // Fallback a datos estáticos si hay error
    return null;
  }
}

// Función para obtener proyectos destacados
async function getFeaturedProjects() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/projects/featured`, {
      cache: 'no-store', // Por ahora sin cache para desarrollo
    });
    
    return res.ok ? res.json() : [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export default async function Home() {
  // Por ahora obtengamos los datos de forma síncrona para evitar errores
  let homepageData = null;
  let featuredProjects = [];

  try {
    [homepageData, featuredProjects] = await Promise.all([
      getHomepageData(),
      getFeaturedProjects()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
  }

  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      <Suspense fallback={<SectionLoading className="min-h-screen" />}>
        <HeroSection data={homepageData?.content?.hero} />
      </Suspense>
      
      <Suspense fallback={<SectionLoading />}>
        <ServicesPreview data={homepageData?.content?.services} />
      </Suspense>
      
      <Suspense fallback={<SectionLoading />}>
        <TechStack data={homepageData?.content?.techStack} />
      </Suspense>
      
      <Suspense fallback={<SectionLoading />}>
        <ProjectsPreview projects={featuredProjects} />
      </Suspense>
      
      <Suspense fallback={<SectionLoading />}>
        <ContactCTA data={homepageData?.content?.cta} />
      </Suspense>
      
      <Footer />
    </main>
  );
}