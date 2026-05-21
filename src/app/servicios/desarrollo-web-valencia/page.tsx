// src/app/servicios/desarrollo-web-valencia/page.tsx
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SchemaOrg from '@/components/seo/SchemaOrg';
import { getBreadcrumbSchema, getServiceSchema } from '@/lib/seo/schemas';
import {
  MapPin, Code2, Zap, ArrowRight,
  CheckCircle2, MessageSquare, Star, Rocket
} from 'lucide-react';

export const metadata = {
  title: 'Desarrollador Web Freelance en Valencia — React & Next.js | Luis Granero',
  description: 'Desarrollador web freelance en Valencia con +10 años de experiencia. Aplicaciones web a medida con React y Next.js, tiendas online y consultoría técnica. Reuniones presenciales disponibles. Presupuesto sin compromiso.',
  keywords: [
    'desarrollador web Valencia',
    'freelance desarrollo web Valencia',
    'programador React Valencia',
    'desarrollo web a medida Valencia',
    'freelance Next.js Valencia',
    'contratar desarrollador web Valencia',
    'tienda online Valencia',
    'consultor técnico Valencia',
    'aplicaciones web React Valencia',
  ],
  openGraph: {
    title: 'Desarrollador Web Freelance en Valencia | Luis Granero — React & Next.js',
    description: 'Freelance senior en Valencia: apps web a medida, e-commerce y consultoría React/Next.js. Reuniones presenciales disponibles.',
    type: 'website',
    url: 'https://www.luisgranero.com/servicios/desarrollo-web-valencia',
  },
  alternates: {
    canonical: 'https://www.luisgranero.com/servicios/desarrollo-web-valencia',
  },
};

const servicios = [
  {
    icon: Code2,
    title: 'Aplicaciones React & Next.js',
    desc: 'Desarrollo frontend y full-stack moderno. SPAs, dashboards, plataformas SaaS y portales corporativos con la tecnología más demandada del mercado.',
    href: '/servicios/desarrollo-react-nextjs',
  },
  {
    icon: Zap,
    title: 'Tiendas online a medida',
    desc: 'E-commerce sin comisiones por venta, integrado con tu ERP y optimizado para conversión. Sin restricciones de plantilla ni plugins.',
    href: '/servicios/ecommerce',
  },
  {
    icon: MessageSquare,
    title: 'Consultoría técnica',
    desc: 'Code review, auditorías de rendimiento, arquitectura y acompañamiento técnico para equipos de desarrollo. Presencial o remoto.',
    href: '/servicios/consultoria',
  },
];

const ventajas = [
  'Reuniones presenciales en Valencia disponibles',
  'Respuesta en menos de 24 horas',
  'Contratos claros sin letra pequeña',
  '+10 años de experiencia en proyectos reales',
  'Código limpio, documentado y tuyo',
  'Soporte post-entrega incluido',
];

const faqs = [
  {
    q: '¿Puedes trabajar de forma presencial en Valencia?',
    a: 'Sí. Estoy basado en Valencia y puedo reunirme presencialmente para kickoffs, revisiones o demos. El desarrollo del día a día puede ser remoto o híbrido según prefiera el cliente.',
  },
  {
    q: '¿Cuánto cuesta un proyecto web en Valencia?',
    a: 'Depende del tipo de proyecto: desde 1.500€ para una landing page hasta 15.000€+ para aplicaciones complejas. Siempre envío presupuesto detallado sin compromiso antes de empezar.',
  },
  {
    q: '¿En cuánto tiempo puedes empezar?',
    a: 'Normalmente en 1-2 semanas desde que acordamos el proyecto. Si es urgente, consúltame y vemos alternativas.',
  },
  {
    q: '¿Trabajas solo o con equipo?',
    a: 'Trabajo de forma independiente como freelance. Para proyectos que lo requieran, colaboro con otros freelances de confianza especializados en diseño o backend específico.',
  },
];

export default function DesarrolloWebValenciaPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Servicios', url: '/servicios' },
    { name: 'Desarrollo Web Valencia', url: '/servicios/desarrollo-web-valencia' },
  ]);

  const serviceSchema = getServiceSchema({
    name: 'Desarrollador web freelance en Valencia',
    description: 'Desarrollo web a medida con React y Next.js en Valencia. Aplicaciones web, tiendas online y consultoría técnica. Reuniones presenciales disponibles.',
    areaServed: 'Valencia',
  });

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Luis Granero — Desarrollador Web Freelance Valencia',
    description: 'Desarrollador web freelance en Valencia especializado en React y Next.js. Aplicaciones web a medida, e-commerce y consultoría técnica.',
    url: 'https://www.luisgranero.com',
    areaServed: {
      '@type': 'City',
      name: 'Valencia',
    },
    serviceType: ['Desarrollo Web', 'Aplicaciones React', 'E-commerce', 'Consultoría Técnica'],
    priceRange: '€€',
  };

  return (
    <main className="min-h-screen bg-[#0F172A]">
      <SchemaOrg schema={[breadcrumb, serviceSchema, localBusinessSchema]} />
      <Header />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="bg-grid-fade absolute inset-0" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/servicios" className="hover:text-slate-300 transition-colors">Servicios</Link>
            <span>/</span>
            <span className="text-slate-300">Valencia</span>
          </nav>

          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="badge badge-cyan flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                Valencia
              </span>
              <span className="text-sm text-slate-500">Freelance senior · +10 años</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 leading-tight tracking-tight mb-6">
              Desarrollador web freelance{' '}
              <span className="gradient-text">en Valencia</span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
              Aplicaciones web a medida con React y Next.js. Basado en Valencia, disponible para reuniones
              presenciales y trabajo remoto con comunicación diaria. Sin intermediarios, trato directo con el desarrollador.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/contacto" className="btn-primary">
                Solicitar presupuesto
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/sobre-mi" className="btn-secondary">
                Conocer más sobre mí
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-slate-800">
              {[
                { value: 'Valencia', label: 'Basado aquí' },
                { value: '+10 años', label: 'de experiencia' },
                { value: '< 24h', label: 'tiempo de respuesta' },
                { value: '100%', label: 'código entregado' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-bold text-cyan-400">{s.value}</div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-50 mb-4">
              Servicios de desarrollo web en Valencia
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Especializado en tecnología moderna. Sin WordPress, sin plantillas, sin límites.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {servicios.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="card p-6 hover:border-cyan-500/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ YO ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-50 mb-4">
                Por qué contratar un freelance local en Valencia
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Trabajar con un freelance de Valencia tiene ventajas reales: comunicación sin fricciones,
                disponibilidad para reuniones cara a cara y trato directo con la persona que escribe
                el código — no un account manager que traslada mensajes.
              </p>
              <ul className="space-y-3">
                {ventajas.map((v) => (
                  <li key={v} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
                <Star className="w-8 h-8 text-cyan-400" />
              </div>
              <p className="text-slate-300 leading-relaxed mb-6 text-sm">
                "Trato directo, entregas puntuales y código que mi equipo puede mantener. Exactamente lo que buscaba en un freelance."
              </p>
              <div className="text-sm text-slate-500">Cliente — SaaS B2B, Valencia</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-50 mb-12">Preguntas frecuentes</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="border-b border-slate-800 pb-6">
                  <h3 className="font-semibold text-slate-100 mb-3">{faq.q}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-7 h-7 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-50 mb-4">
              ¿Buscas un desarrollador web en Valencia?
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Cuéntame tu proyecto. En menos de 24 horas tendrás respuesta con un enfoque inicial y presupuesto orientativo sin compromiso.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contacto" className="btn-primary">
                Contactar ahora
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/portfolio" className="btn-secondary">
                Ver mi portfolio
              </Link>
            </div>
            <p className="text-sm text-slate-600 mt-6">
              Basado en Valencia · Reuniones presenciales disponibles · Respuesta en menos de 24h
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
