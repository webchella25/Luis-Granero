// src/app/servicios/page.tsx
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ServicesHero from '../../components/services/ServicesHero';
import ServicesGrid from '../../components/services/ServicesGrid';
import PricingSection from '../../components/services/PricingSection';
import ProcessSection from '../../components/services/ProcessSection';
import FAQSection from '../../components/services/FAQSection';
import TestimonialsSection from '../../components/testimonials/TestimonialsSection';
import SchemaOrg from '../../components/seo/SchemaOrg';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../lib/seo/schemas';
import { ArrowRight, Rocket, ShoppingCart, Code2, MessageSquare } from 'lucide-react';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo/metadata';

export const metadata = {
  title: 'Servicios de Desarrollo Web Freelance en España | React, Next.js, E-commerce',
  description: 'Contrata un desarrollador web freelance senior en España. Especializado en React, Next.js, tiendas online a medida y aplicaciones web personalizadas. +10 años de experiencia, presupuesto sin compromiso.',
  keywords: [
    'desarrollador web freelance España',
    'contratar programador React',
    'desarrollo React Next.js España',
    'tienda online a medida España',
    'desarrollo web a medida presupuesto',
    'aplicaciones web personalizadas',
    'freelance Next.js España',
    'consultor técnico freelance',
    'programador full stack freelance',
    'desarrollo e-commerce a medida',
  ],
  openGraph: {
    title: 'Servicios de Desarrollo Web Freelance | Luis Granero — España',
    description: 'Freelance senior en React y Next.js: apps a medida, tiendas online, consultoría técnica. Presupuesto sin compromiso.',
    type: 'website',
    url: `${SITE_URL}/servicios`,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Servicios de Desarrollo Web Freelance | Luis Granero',
    description: 'Freelance senior en React y Next.js: apps a medida, tiendas online, consultoría técnica.',
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: `${SITE_URL}/servicios`,
  },
};

export default function ServicesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Servicios', url: '/servicios' }
  ]);

  return (
    <main className="min-h-screen bg-[#0F172A]">
      {/* Schema.org JSON-LD */}
      <SchemaOrg schema={[breadcrumbSchema, getOrganizationSchema()]} />

      <Header />
      <ServicesHero />
      <ServicesGrid />

      {/* ── SERVICIOS PILARES ── */}
      <section className="py-14 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-center mb-6">
            Especialidades
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Code2, label: 'React & Next.js', href: '/servicios/desarrollo-react-nextjs', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
              { icon: ShoppingCart, label: 'E-commerce a medida', href: '/servicios/ecommerce', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { icon: Rocket, label: 'Desarrollo SaaS', href: '/servicios/desarrollo-saas', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
              { icon: MessageSquare, label: 'Consultoría técnica', href: '/servicios/consultoria', color: 'text-slate-300 bg-slate-700 border-slate-600' },
            ].map(({ icon: Icon, label, href, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-4 bg-[#1E293B] border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all duration-200 group"
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">
                  {label}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 ml-auto transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />
      
      {/* Contenido movido desde la homepage */}
      <ProcessSection />
      <TestimonialsSection />

      {/* ── ENLACE AL PORTFOLIO — Regla SEO: /servicios → portfolio ── */}
      <section className="py-14 bg-[#0B1120] border-y border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-400 mb-2">¿Quieres ver resultados reales antes de decidir?</p>
          <h2 className="text-2xl font-bold text-slate-50 mb-6">
            Proyectos web desarrollados con React y Next.js
          </h2>
          <Link href="/portfolio" className="inline-flex items-center gap-2 btn-primary">
            Ver portfolio completo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <FAQSection />
      
      <Footer />
    </main>
  );
}
