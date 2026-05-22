import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ContactHero from '../../components/contact/ContactHero';
import ContactForm from '../../components/contact/ContactForm';
import SchemaOrg from '../../components/seo/SchemaOrg';
import { getContactPageSchema, getOrganizationSchema } from '../../lib/seo/schemas';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo/metadata';

export const metadata = {
  title: 'Contacto | Presupuesto Desarrollo Web España - Luis Granero',
  description: 'Solicita presupuesto para tu proyecto web. Desarrollador freelance React y Next.js en España. Consulta gratuita, respuesta en 24h.',
  keywords: [
    'contratar desarrollador web España',
    'presupuesto desarrollo web',
    'freelance react España contacto',
    'contratar programador next.js',
    'consulta desarrollo web gratis',
    'presupuesto tienda online',
    'contratar desarrollador e-commerce',
    'freelance desarrollo web',
  ],
  openGraph: {
    title: 'Contacto | Presupuesto Desarrollo Web - Luis Granero',
    description: 'Solicita presupuesto gratis para tu proyecto web. Desarrollador freelance en España.',
    type: 'website',
    url: `${SITE_URL}/contacto`,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto | Presupuesto Desarrollo Web - Luis Granero',
    description: 'Solicita presupuesto gratis para tu proyecto web. Desarrollador freelance en España.',
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: `${SITE_URL}/contacto`,
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0F172A]">
      <SchemaOrg schema={[getContactPageSchema(), getOrganizationSchema()]} />
      <Header />
      <ContactHero />
      <ContactForm />
      <Footer />
    </main>
  );
}
