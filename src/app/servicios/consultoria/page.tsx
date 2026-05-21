// src/app/servicios/consultoria/page.tsx
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SchemaOrg from '@/components/seo/SchemaOrg';
import { getBreadcrumbSchema, getServiceSchema } from '@/lib/seo/schemas';
import {
  MessageSquare, Search, Code2, TrendingUp,
  ArrowRight, Clock, Shield, CheckCircle2, Rocket
} from 'lucide-react';

export const metadata = {
  title: 'Consultoría Técnica Web Freelance — React & Next.js España | Luis Granero',
  description: 'Consultoría técnica freelance en España para proyectos React y Next.js. Code review, auditorías de rendimiento, arquitectura y mentoring para equipos de desarrollo. Sin compromiso.',
  keywords: [
    'consultoría técnica freelance España',
    'consultor React Next.js',
    'code review React profesional',
    'auditoría rendimiento web',
    'arquitectura React Next.js',
    'mentoring desarrolladores React',
    'consultor técnico desarrollo web',
  ],
  openGraph: {
    title: 'Consultoría Técnica React & Next.js — Freelance España | Luis Granero',
    description: 'Consultoría técnica freelance: code review, auditorías, arquitectura y mentoring para proyectos React y Next.js en España.',
    type: 'website',
    url: 'https://www.luisgranero.com/servicios/consultoria',
  },
  alternates: {
    canonical: 'https://www.luisgranero.com/servicios/consultoria',
  },
};

const services = [
  {
    icon: Search,
    title: 'Auditoría técnica',
    description: 'Revisión exhaustiva de tu codebase: rendimiento, seguridad, deuda técnica, patrones problemáticos y oportunidades de mejora. Entrega de informe priorizado.',
    duration: '1-3 días',
  },
  {
    icon: Code2,
    title: 'Code review',
    description: 'Revisión de PRs, arquitectura de componentes, hooks, patrones de estado y nomenclatura. Ideal para equipos que quieren elevar su nivel técnico.',
    duration: 'Por sesión',
  },
  {
    icon: TrendingUp,
    title: 'Optimización de rendimiento',
    description: 'Análisis de Core Web Vitals, bundle size, lazy loading, caché y estrategias de renderizado. Objetivo: Lighthouse 90+ en producción.',
    duration: '1-2 semanas',
  },
  {
    icon: Shield,
    title: 'Arquitectura y diseño técnico',
    description: 'Defino la arquitectura de tu próximo proyecto o refactorización: estructura de carpetas, separación de responsabilidades, patrones de diseño y decisiones de stack.',
    duration: '2-5 días',
  },
  {
    icon: MessageSquare,
    title: 'Mentoring para equipos',
    description: 'Sesiones semanales o quincenales para acompañar a tu equipo en la adopción de React, Next.js, TypeScript y buenas prácticas de desarrollo.',
    duration: 'Mensual',
  },
  {
    icon: Rocket,
    title: 'CTO/Tech Lead fraccional',
    description: 'Apoyo técnico estratégico para startups y pymes sin CTO. Toma de decisiones de stack, gestión de equipo técnico y roadmap de producto.',
    duration: 'Parte del tiempo',
  },
];

const idealFor = [
  'Startups con MVP en desarrollo que necesitan validación técnica antes de escalar',
  'Equipos de desarrollo que quieren adoptar React o Next.js sin errores de arquitectura',
  'Empresas con deuda técnica acumulada que necesitan un plan de acción',
  'Proyectos en producción con problemas de rendimiento o Core Web Vitals en rojo',
  'Founders técnicos que buscan una segunda opinión antes de tomar decisiones importantes',
  'Pymes que quieren tener un experto técnico disponible sin contratar a jornada completa',
];

const process = [
  {
    step: '01',
    title: 'Llamada de diagnóstico',
    desc: 'Sesión gratuita de 30 minutos para entender tu situación, objetivos y definir el alcance exacto de la consultoría.',
  },
  {
    step: '02',
    title: 'Propuesta personalizada',
    desc: 'En 24 horas te envío una propuesta detallada con alcance, metodología, entregables y precio fijo.',
  },
  {
    step: '03',
    title: 'Ejecución y entregables',
    desc: 'Trabajo con las herramientas de tu equipo (GitHub, Slack, Notion). Documentación clara de cada hallazgo y recomendación.',
  },
  {
    step: '04',
    title: 'Seguimiento opcional',
    desc: 'Sesión de cierre para resolver dudas sobre los entregables. Opción de seguimiento mensual para garantizar la implementación.',
  },
];

const faqs = [
  {
    q: '¿Necesito tener un proyecto ya iniciado?',
    a: 'No. La consultoría de arquitectura es especialmente valiosa en fase de diseño, antes de escribir código. Ayuda a evitar errores costosos desde el principio.',
  },
  {
    q: '¿Cuál es el precio de una sesión de consultoría?',
    a: 'Las sesiones puntuales de code review o consulta técnica parten desde 150€/hora. Las auditorías completas y el mentoring mensual tienen precios fijos según alcance. Siempre con presupuesto previo.',
  },
  {
    q: '¿Trabajas con equipos remotos?',
    a: 'Sí, trabajo 100% en remoto. Utilizo videollamadas, screen sharing, GitHub y Notion para documentar todo. No hay barrera geográfica.',
  },
  {
    q: '¿Puedes ayudarme aunque mi proyecto no sea React/Next.js?',
    a: 'Tengo experiencia amplia en el ecosistema JavaScript/TypeScript. Si tu proyecto usa Vue, Angular, Node.js o tecnologías relacionadas, puedo ayudar aunque no sea mi especialización principal.',
  },
];

export default function ConsultoriaPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Servicios', url: '/servicios' },
    { name: 'Consultoría técnica', url: '/servicios/consultoria' },
  ]);
  const serviceSchema = getServiceSchema({
    name: 'Consultoría técnica de desarrollo web',
    description: 'Code review, auditorías de rendimiento y arquitectura, acompañamiento técnico para equipos. Consultor senior React y Next.js en España.',
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
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/servicios" className="hover:text-slate-300 transition-colors">Servicios</Link>
            <span>/</span>
            <span className="text-slate-300">Consultoría técnica</span>
          </nav>

          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="badge badge-cyan">Servicio</span>
              <span className="text-sm text-slate-500">Consultoría · Remoto</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 leading-tight tracking-tight mb-6">
              Consultoría técnica{' '}
              <span className="gradient-text">React & Next.js</span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
              Apoyo técnico experto sin contratar a jornada completa. Auditorías, code review,
              arquitectura y mentoring para que tu equipo y tu producto avancen con confianza.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/contacto" className="btn-primary">
                Pedir llamada de diagnóstico
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/sobre-mi" className="btn-secondary">
                Conocer mi experiencia
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-slate-800">
              {[
                { value: '+10 años', label: 'experiencia React' },
                { value: '100% remoto', label: 'España y LATAM' },
                { value: '< 24h', label: 'respuesta inicial' },
                { value: 'Precio fijo', label: 'sin sorpresas' },
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
            <h2 className="text-3xl font-bold text-slate-50 mb-4">Modalidades de consultoría</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Desde una revisión puntual hasta acompañamiento mensual continuo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.map((s) => (
              <div key={s.title} className="card p-6 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {s.duration}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IDEAL PARA ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-50 mb-3">¿Para quién es esta consultoría?</h2>
            <p className="text-slate-400 mb-10">No es para todos. Es para equipos y proyectos que ya tienen algo construido y quieren hacerlo bien.</p>
            <div className="space-y-4">
              {idealFor.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-50 mb-3">Cómo funciona</h2>
            <p className="text-slate-400 mb-12">Proceso simple para empezar rápido y entregar valor desde el primer día.</p>
            <div className="space-y-6">
              {process.map((p) => (
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
      <section className="py-20 bg-[#0F172A]">
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
      <section className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-7 h-7 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-50 mb-4">
              Empieza con una llamada gratuita
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              30 minutos para entender tu situación y decirte honestamente si puedo ayudarte y cómo.
              Sin venta, sin compromiso.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contacto" className="btn-primary">
                Reservar llamada gratuita
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/servicios" className="btn-secondary">
                Ver todos los servicios
              </Link>
            </div>
            <p className="text-sm text-slate-600 mt-6">Gratuita y sin compromiso · 30 minutos</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
