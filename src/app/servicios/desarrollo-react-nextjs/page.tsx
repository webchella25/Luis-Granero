// src/app/servicios/desarrollo-react-nextjs/page.tsx
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SchemaOrg from '@/components/seo/SchemaOrg';
import { getBreadcrumbSchema, getServiceSchema } from '@/lib/seo/schemas';
import {
  Code2, Zap, Shield, Globe, ArrowRight, CheckCircle2,
  Layers, TrendingUp, Clock, Star, Users, Rocket
} from 'lucide-react';

export const metadata = {
  title: 'Desarrollo React y Next.js en España — Freelance Senior | Luis Granero',
  description: 'Desarrollo profesional con React y Next.js en España. Aplicaciones web rápidas, escalables y con SEO perfecto. Freelance senior con +10 años de experiencia. Presupuesto sin compromiso.',
  keywords: [
    'desarrollo React Next.js España',
    'programador React freelance',
    'contratar desarrollador Next.js',
    'aplicaciones React a medida',
    'desarrollo web React España',
    'freelance Next.js España',
    'Next.js App Router experto',
    'React Server Components',
  ],
  openGraph: {
    title: 'Desarrollo React & Next.js — Freelance Senior España | Luis Granero',
    description: 'Aplicaciones web modernas con React y Next.js. Rápidas, escalables y optimizadas para SEO. Freelance senior en España.',
    type: 'website',
    url: 'https://www.luisgranero.com/servicios/desarrollo-react-nextjs',
  },
  alternates: {
    canonical: 'https://www.luisgranero.com/servicios/desarrollo-react-nextjs',
  },
};

const benefits = [
  {
    icon: Zap,
    title: 'Rendimiento máximo',
    description: 'SSR, SSG e ISR para tiempos de carga por debajo de 1 segundo. Puntuaciones Core Web Vitals en verde.',
  },
  {
    icon: Globe,
    title: 'SEO técnico perfecto',
    description: 'Next.js genera HTML en servidor, garantizando que Google indexe todo tu contenido desde el primer día.',
  },
  {
    icon: Shield,
    title: 'Arquitectura escalable',
    description: 'Código limpio, tipado con TypeScript y estructura modular que crece con tu negocio sin deuda técnica.',
  },
  {
    icon: Layers,
    title: 'Ecosistema completo',
    description: 'API Routes, autenticación, base de datos, caché y deploys automatizados en un solo proyecto cohesionado.',
  },
];

const techStack = [
  { name: 'React 19', category: 'UI' },
  { name: 'Next.js 15', category: 'Framework' },
  { name: 'TypeScript', category: 'Lenguaje' },
  { name: 'Tailwind CSS', category: 'Estilos' },
  { name: 'Prisma / Mongoose', category: 'Base de datos' },
  { name: 'NextAuth', category: 'Autenticación' },
  { name: 'Vercel / VPS', category: 'Deploy' },
  { name: 'Zustand / React Query', category: 'Estado' },
];

const useCases = [
  {
    title: 'SaaS y dashboards',
    description: 'Paneles de control, métricas en tiempo real, portales de cliente con autenticación y roles.',
    icon: TrendingUp,
  },
  {
    title: 'Portales corporativos',
    description: 'Webs institucionales de alto rendimiento, blogs, landings y páginas de marketing optimizadas.',
    icon: Globe,
  },
  {
    title: 'Plataformas educativas',
    description: 'LMS, cursos online, sistemas de progreso y certificados con experiencia de usuario fluida.',
    icon: Users,
  },
  {
    title: 'Aplicaciones internas',
    description: 'Herramientas de gestión, CRMs, ERPs ligeros y automatizaciones para equipos de trabajo.',
    icon: Layers,
  },
];

const process = [
  { step: '01', title: 'Análisis y arquitectura', desc: 'Definimos juntos el alcance, la arquitectura técnica y los criterios de éxito antes de escribir una sola línea.' },
  { step: '02', title: 'Prototipo interactivo', desc: 'Construyo un MVP funcional rápido para validar flujos y UX antes de escalar.' },
  { step: '03', title: 'Desarrollo iterativo', desc: 'Sprints cortos con demos frecuentes. Siempre sabrás en qué estado está tu proyecto.' },
  { step: '04', title: 'Deploy y documentación', desc: 'Entrega en producción con documentación técnica, tests y handoff completo.' },
];

const faqs = [
  {
    q: '¿Por qué Next.js y no otro framework?',
    a: 'Next.js combina el mejor DX de React con renderizado en servidor, SEO optimizado, rutas automáticas y un ecosistema maduro. Para la gran mayoría de proyectos web es la elección más sólida en 2025.',
  },
  {
    q: '¿Cuánto tiempo lleva desarrollar una aplicación React?',
    a: 'Un MVP funcional suele estar listo en 4-8 semanas dependiendo de la complejidad. Proyectos más grandes se planifican en fases con entregas parciales.',
  },
  {
    q: '¿Puedo contratar solo consultoría o revisión de código?',
    a: 'Sí. Ofrezco sesiones de code review, auditorías de rendimiento y consultoría técnica por horas. Ideal si ya tienes equipo pero necesitas apoyo senior.',
  },
  {
    q: '¿Migras proyectos desde otros frameworks?',
    a: 'Sí, tengo experiencia migrando desde Create React App, Vue, Angular y WordPress a Next.js. El proceso es incremental para no interrumpir el negocio.',
  },
];

export default function DesarrolloReactNextjsPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Servicios', url: '/servicios' },
    { name: 'Desarrollo React & Next.js', url: '/servicios/desarrollo-react-nextjs' },
  ]);
  const serviceSchema = getServiceSchema({
    name: 'Desarrollo de aplicaciones con React y Next.js',
    description: 'Desarrollo profesional de aplicaciones web modernas con React y Next.js. SPAs, dashboards, plataformas SaaS y portales corporativos. Freelance senior en España.',
    areaServed: 'España',
  });

  return (
    <main className="min-h-screen bg-[#0F172A]">
      <SchemaOrg schema={[breadcrumb, serviceSchema]} />
      <Header />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="bg-grid-fade absolute inset-0" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Breadcrumb visual */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/servicios" className="hover:text-slate-300 transition-colors">Servicios</Link>
            <span>/</span>
            <span className="text-slate-300">React & Next.js</span>
          </nav>

          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="badge badge-cyan">Servicio</span>
              <span className="text-sm text-slate-500">Freelance senior · España</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 leading-tight tracking-tight mb-6">
              Desarrollo con{' '}
              <span className="gradient-text">React & Next.js</span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
              Construyo aplicaciones web modernas, rápidas y escalables con React y Next.js.
              Desde MVPs en semanas hasta plataformas enterprise que resisten el crecimiento.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/contacto" className="btn-primary">
                Solicitar presupuesto
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/portfolio" className="btn-secondary">
                Ver proyectos React
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-slate-800">
              {[
                { value: '+10 años', label: 'con React' },
                { value: '100/100', label: 'Lighthouse score' },
                { value: '< 4 sem', label: 'primer entregable' },
                { value: 'TypeScript', label: 'por defecto' },
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

      {/* ── BENEFICIOS ── */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-50 mb-4">
              Por qué React & Next.js para tu proyecto
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              No elijo estas tecnologías por moda. Las elijo porque resuelven los problemas reales de los negocios digitales.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((b) => (
              <div key={b.title} className="card p-6 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 mb-2">{b.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{b.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STACK ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-50 mb-3">Stack tecnológico</h2>
            <p className="text-slate-400 mb-10">Cada herramienta elegida por solidez, mantenibilidad y ecosistema activo.</p>
            <div className="flex flex-wrap gap-3">
              {techStack.map((t) => (
                <div key={t.name} className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] border border-slate-700/50 rounded-lg">
                  <span className="text-slate-200 font-medium text-sm">{t.name}</span>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{t.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CASOS DE USO ── */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-50 mb-4">¿Para qué tipo de proyectos?</h2>
            <p className="text-slate-400 max-w-lg mx-auto">React y Next.js son la elección correcta para una amplia variedad de productos digitales.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((u) => (
              <div key={u.title} className="card p-6 hover:border-cyan-500/40 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <u.icon className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-slate-100">{u.title}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-50 mb-3">Cómo trabajo</h2>
            <p className="text-slate-400 mb-12">Proceso probado para entregar con calidad y sin sorpresas.</p>
            <div className="space-y-6">
              {process.map((p, i) => (
                <div key={p.step} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold text-sm">{p.step}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold text-slate-100 mb-1">{p.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
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
            <h2 className="text-3xl font-bold text-slate-50 mb-4">¿Tienes un proyecto en mente?</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Cuéntame qué quieres construir. En 24 horas tendrás una respuesta con un enfoque inicial y un presupuesto orientativo.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contacto" className="btn-primary">
                Solicitar presupuesto gratuito
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/portfolio" className="btn-secondary">
                Ver casos de éxito
              </Link>
            </div>
            <p className="text-sm text-slate-600 mt-6">Sin compromiso · Respuesta en menos de 24h</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
