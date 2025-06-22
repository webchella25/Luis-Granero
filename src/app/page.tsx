import Header from '../components/layout/Header';
import HeroSection from '../components/home/HeroSection';
import ServicesPreview from '../components/home/ServicesPreview';
import TechStack from '../components/home/TechStack';
import ProjectsPreview from '../components/home/ProjectsPreview';
import ContactCTA from '../components/home/ContactCTA';
import Footer from '../components/layout/Footer';

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