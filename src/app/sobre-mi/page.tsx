import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutHero from '@/components/about/AboutHero';
import ExperienceTimeline from '@/components/about/ExperienceTimeline';
import SkillsDetail from '@/components/about/SkillsDetail';
import Methodology from '@/components/about/Methodology';

export const metadata = {
  title: 'Sobre mí - Luis Granero | Desarrollador Web Freelance',
  description: 'Conoce mi historia, experiencia y metodología de trabajo como desarrollador web especializado en React y Next.js.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <AboutHero />
      <ExperienceTimeline />
      <SkillsDetail />
      <Methodology />
      <Footer />
    </main>
  );
}