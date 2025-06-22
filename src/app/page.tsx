import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection.jsx';
import ServicesPreview from '@/components/home/ServicesPreview.jsx';
import TechStack from '@/components/home/TechStack.jsx';
import ProjectsPreview from '@/components/home/ProjectsPreview.jsx';
import ContactCTA from '@/components/home/ContactCTA.jsx';
import Footer from '@/components/layout/Footer.jsx';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <HeroSection />
      <ServicesPreview />
      <TechStack />
      <ProjectsPreview />
      <ContactCTA />
      <Footer />
    </main>
  );
}