// src/app/sobre-mi/page.tsx - Versión con mejor manejo de errores
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AboutHero from '../../components/about/AboutHero';
import AboutStory from '../../components/about/AboutStory';
import ExperienceTimeline from '../../components/about/ExperienceTimeline';
import SkillsDetail from '../../components/about/SkillsDetail';
import Methodology from '../../components/about/Methodology';
import Values from '../../components/about/Values';

// Función para obtener datos de About con mejor manejo de errores
async function getAboutData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/about`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('About API response not ok:', res.status, res.statusText);
      return null;
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('About API did not return JSON:', contentType);
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching about data:', error);
    return null;
  }
}

export async function generateMetadata() {
  const aboutData = await getAboutData();
  
  return {
    title: aboutData?.seo?.metaTitle || 'Sobre mí - Luis Granero | Desarrollador Web Freelance',
    description: aboutData?.seo?.metaDescription || 'Conoce mi historia, experiencia y metodología de trabajo como desarrollador web especializado en React y Next.js.',
    keywords: [
      'desarrollador freelance',
      'react developer',
      'nextjs developer',
      'full stack developer',
      'luis granero'
    ],
    openGraph: {
      title: 'Sobre Luis Granero - Desarrollador Web Freelance',
      description: 'Conoce mi historia y experiencia en desarrollo web moderno',
      type: 'website'
    }
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