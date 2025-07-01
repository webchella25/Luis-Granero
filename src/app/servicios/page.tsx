// src/app/servicios/page.tsx
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ServicesHero from '../../components/services/ServicesHero';
import ServicesGrid from '../../components/services/ServicesGrid';
import PricingSection from '../../components/services/PricingSection';
import ProcessSection from '../../components/services/ProcessSection';
import FAQSection from '../../components/services/FAQSection';
import TestimonialsSection from '../../components/testimonials/TestimonialsSection';

export const metadata = {
  title: 'Servicios - Luis Granero | Desarrollo Web Personalizado',
  description: 'Servicios de desarrollo web moderno: React, Next.js, e-commerce, APIs y soluciones personalizadas. Sin plantillas genéricas.',
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <ServicesHero />
      <ServicesGrid />
      <PricingSection />
      
      {/* Contenido movido desde la homepage */}
      <ProcessSection />
      <TestimonialsSection />
      <FAQSection />
      
      <Footer />
    </main>
  );
}