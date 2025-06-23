// src/app/page.tsx - Actualizado para usar servicios del admin
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
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Error fetching homepage data');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// NUEVA: Función para obtener servicios del admin
async function getServicesData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/services`, {
      cache: 'no-store',
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

async function getFeaturedProjects() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/projects/featured`, {
      cache: 'no-store',
    });
    
    return res.ok ? res.json() : [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export default async function Home() {
  let homepageData = null;
  let servicesData = [];
  let featuredProjects = [];

  try {
    [homepageData, servicesData, featuredProjects] = await Promise.all([
      getHomepageData(),
      getServicesData(), // ← NUEVA llamada para servicios
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
        <ServicesPreview data={servicesData} />
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