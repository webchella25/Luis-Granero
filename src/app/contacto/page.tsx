import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer.jsx';
import ContactHero from '@/components/contact/ContactHero.jsx';
import ContactForm from '@/components/contact/ContactForm.jsx';
import BudgetCalculator from '@/components/contact/BudgetCalculator.jsx';
import ContactInfo from '@/components/contact/ContactInfo.jsx';
import ProcessTimeline from '@/components/contact/ProcessTimeline.jsx';

export const metadata = {
  title: 'Contacto - Luis Granero | Solicita tu Presupuesto Web',
  description: 'Contáctame para tu proyecto web. Formulario de contacto, calculadora de presupuestos y consulta gratuita disponible.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <ContactHero />
      <ContactForm />
      <BudgetCalculator />
      <ContactInfo />
      <ProcessTimeline />
      <Footer />
    </main>
  );
}