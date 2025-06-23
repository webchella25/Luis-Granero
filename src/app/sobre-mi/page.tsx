// src/app/sobre-mi/page.tsx
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AboutHero from '../../components/about/AboutHero';
import AboutStory from '../../components/about/AboutStory';
import ExperienceTimeline from '../../components/about/ExperienceTimeline';
import SkillsDetail from '../../components/about/SkillsDetail';
import Methodology from '../../components/about/Methodology';
import Values from '../../components/about/Values';

// Función para obtener datos de About
async function getAboutData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/about`, {
      cache: 'no-store', // Por ahora sin cache para desarrollo
    });
    
    if (!res.ok) {
      throw new Error('Error fetching about data');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function generateMetadata() {
  const aboutData = await getAboutData();
  
  return {
    title: aboutData?.seo?.metaTitle || 'Sobre mí - Luis Granero | Desarrollador Web Freelance',
    description: aboutData?.seo?.metaDescription || 'Conoce mi historia, experiencia y metodología de trabajo como desarrollador web especializado en React y Next.js.',
  };
}

export default async function AboutPage() {
  const aboutData = await getAboutData();
  const content = aboutData?.content;

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <AboutHero data={content?.hero} />
      <AboutStory data={content?.story} />
      <ExperienceTimeline data={content?.experience} />
      <SkillsDetail data={content?.skills} />
      <Methodology data={content?.methodology} />
      <Values data={content?.values} />
      <Footer />
    </main>
  );
}