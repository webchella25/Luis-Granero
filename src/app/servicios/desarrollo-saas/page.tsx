// src/app/servicios/desarrollo-saas/page.tsx
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SchemaOrg from '@/components/seo/SchemaOrg';
import { getBreadcrumbSchema, getServiceSchema } from '@/lib/seo/schemas';
import {
  Rocket, Code2, Users, CreditCard, Shield, Zap,
  ArrowRight, CheckCircle2, BarChart3, Layers, Globe,
  Database, Lock, TrendingUp, Cpu, ExternalLink
} from 'lucide-react';

export const metadata = {
  title: 'Desarrollo de SaaS a Medida en España — Plataformas Web B2B/B2C | Luis Granero',
  description: 'Desarrollo de plataformas SaaS a medida con React, Next.js y arquitectura multi-tenant. Yo mismo he construido y lanzado dos SaaS propios (Hellolia y Granero.io). Freelance senior en España con +10 años de experiencia.',
  keywords: [
    'desarrollo saas a medida España',
    'desarrollar plataforma saas',
    'saas multi-tenant Next.js',
    'crear saas propio freelance',
    'desarrollo plataforma web b2b',
    'programador saas react españa',
    'arquitectura multi-tenant postgresql',
    'mvp saas desarrollo rápido',
    'freelance saas españa',
  ],
  openGraph: {
    title: 'Desarrollo SaaS a Medida — Plataformas Web Escalables | Luis Granero',
    description: 'Construyo SaaS con arquitectura multi-tenant, pagos recurrentes y paneles de gestión. He lanzado mis propios SaaS — sé lo que hace falta para que funcionen.',
    type: 'website',
    url: 'https://www.luisgranero.com/servicios/desarrollo-saas',
  },
  alternates: {
    canonical: 'https://www.luisgranero.com/servicios/desarrollo-saas',
  },
};

const pillars = [
  {
    icon: Users,
    title: 'Multi-tenant real',
    description: 'Cada cliente tiene sus propios datos aislados. Arquitectura probada en producción con PostgreSQL y schemas separados por tenant.',
  },
  {
    icon: CreditCard,
    title: 'Pagos recurrentes integrados',
    description: 'Stripe o PayPal con planes mensuales/anuales, trials gratuitos, upgrades, cancelaciones y webhooks de facturación.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard de analíticas',
    description: 'Panel para que tus clientes vean sus métricas en tiempo real. Y superadmin para que tú controles todos los tenants.',
  },
  {
    icon: Layers,
    title: 'Módulos y permisos por plan',
    description: 'Activa funcionalidades según el plan contratado. Sistema de feature flags nativo sin dependencias externas.',
  },
  {
    icon: Globe,
    title: 'API pública documentada',
    description: 'REST API con autenticación por tokens, rate limiting, webhooks y documentación OpenAPI para que tus clientes integren.',
  },
  {
    icon: Shield,
    title: 'Seguridad y RGPD',
    description: 'Encriptación de datos sensibles, cumplimiento RGPD, almacenamiento en servidores EU, auditoría de accesos.',
  },
];

const process = [
  {
    step: '01',
    title: 'Arquitectura y MVP',
    description: 'Diseñamos juntos la arquitectura técnica, el modelo de datos y el flujo core del producto. Prioridad: que el MVP llegue a producción pronto.',
  },
  {
    step: '02',
    title: 'Core del producto',
    description: 'Desarrollamos la funcionalidad central: autenticación, multi-tenancy, onboarding, dashboard y pagos. Lo que hace único a tu SaaS.',
  },
  {
    step: '03',
    title: 'Landing y conversión',
    description: 'Página de marketing optimizada para SEO y conversión, con pricing claro, testimonios y llamadas a la acción.',
  },
  {
    step: '04',
    title: 'Lanzamiento y escala',
    description: 'Deploy en producción, monitoring, analíticas y soporte post-lanzamiento. Iteramos sobre el feedback real de usuarios.',
  },
];

const ownProjects = [
  {
    name: 'Hellolia',
    slug: 'hellolia',
    url: 'https://hellolia.es',
    tagline: 'Chatbot IA para E-commerce',
    description: 'SaaS B2B multi-tenant. Cada tienda online despliega su propio chatbot IA (Claude, GPT o Gemini) con un snippet de código. Incluye análisis de sentimiento, escalado a humanos, dashboard y webhooks.',
    stack: ['Next.js 15', 'PostgreSQL', 'Claude API', 'Stripe', 'PayPal'],
    apps: 5,
    status: 'En producción',
  },
  {
    name: 'Granero.io',
    slug: 'granero-io',
    url: 'https://granero.io',
    tagline: 'Plataforma E-commerce Multi-tenant',
    description: 'Alternativa a Shopify para marcas serias. Cada tenant tiene su tienda con datos propios. Marketplace de 30+ módulos nativos: IA, marketing, ventas, logística y analytics. Sin comisiones en Pro+.',
    stack: ['Next.js 15', 'React 19', 'PostgreSQL', 'Prisma', 'Stripe'],
    apps: 2,
    status: 'En producción',
  },
];

const faqs = [
  {
    q: '¿Cuánto cuesta desarrollar un SaaS a medida?',
    a: 'Depende de la complejidad. Un MVP funcional con autenticación, multi-tenancy básico y pagos puede estar entre 8.000€ y 15.000€. Un SaaS completo con todas las integraciones, 20.000€–40.000€+. La ventaja es que construimos lo que necesitas, sin pagar por lo que no usas.',
  },
  {
    q: '¿Cuánto tiempo tarda en estar en producción?',
    a: 'Un MVP bien definido puede estar en producción en 6–10 semanas. Hellolia tardó 3 meses y Granero.io 4 meses desde la idea hasta producción con tenants reales.',
  },
  {
    q: '¿Qué es la arquitectura multi-tenant?',
    a: 'Es la base de cualquier SaaS: un solo sistema que sirve a múltiples clientes (tenants) con datos completamente aislados entre sí. Cada cliente ve solo sus datos, aunque estén en la misma infraestructura.',
  },
  {
    q: '¿Puedo lanzar primero sin pagos y añadirlos después?',
    a: 'Sí. Diseñamos la arquitectura pensando en la evolución del producto. Podemos lanzar un MVP gratuito, validar y añadir pagos en una segunda fase sin reescribir todo.',
  },
  {
    q: '¿El código es mío al final?',
    a: 'Totalmente. Recibes el código fuente completo, el repositorio privado y toda la documentación técnica. No hay lock-in conmigo.',
  },
];

export default function DesarrolloSaasPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Servicios', url: '/servicios' },
    { name: 'Desarrollo SaaS', url: '/servicios/desarrollo-saas' },
  ]);

  const serviceSchema = getServiceSchema({
    name: 'Desarrollo de SaaS a Medida',
    description: 'Desarrollo de plataformas SaaS con arquitectura multi-tenant, pagos recurrentes y paneles de gestión. Especializado en React, Next.js y PostgreSQL.',
  });

  return (
    <main className="min-h-screen bg-[#0F172A]">
      <SchemaOrg schema={[breadcrumb, serviceSchema]} />
      <Header />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0F172A] pt-32 pb-20">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/servicios" className="hover:text-slate-300 transition-colors">Servicios</Link>
            <span>/</span>
            <span className="text-slate-400">Desarrollo SaaS</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 badge badge-cyan mb-6">
              <Rocket className="w-3.5 h-3.5" />
              <span>Desarrollo SaaS a medida</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight text-slate-50 mb-6">
              Construyo tu SaaS.{' '}
              <span className="gradient-text">Ya construí los míos.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl leading-relaxed">
              He lanzado dos SaaS propios en producción — Hellolia y Granero.io.
              Sé exactamente lo que necesita un producto web escalable: arquitectura multi-tenant,
              pagos recurrentes, onboarding, dashboards y API pública.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contacto" className="btn-primary inline-flex items-center justify-center gap-2">
                Hablemos de tu SaaS
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#mis-saas" className="btn-secondary inline-flex items-center justify-center gap-2">
                Ver mis productos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MIS SAAS PROPIOS ── */}
      <section id="mis-saas" className="py-20 bg-[#0B1120] border-y border-slate-800">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <div className="badge badge-cyan mb-3">
              <Rocket className="w-3.5 h-3.5" />
              Productos propios en producción
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-3">
              No solo construyo SaaS — tengo los míos
            </h2>
            <p className="text-slate-400 max-w-2xl">
              Dos plataformas SaaS multi-tenant que he diseñado, desarrollado y lanzado desde cero.
              Con usuarios reales, pagos reales y problemas reales resueltos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ownProjects.map(project => (
              <div key={project.slug} className="bg-[#1E293B] border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                        {project.status}
                      </span>
                      <span className="text-xs text-slate-500">{project.apps} apps</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-50">{project.name}</h3>
                    <p className="text-sm text-cyan-400">{project.tagline}</p>
                  </div>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                    title={`Ver ${project.name}`}
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                </div>

                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.stack.map(tech => (
                    <span key={tech} className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-cyan-400 rounded border border-slate-700">
                      {tech}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/portfolio/${project.slug}`}
                  className="text-sm text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  Ver caso completo
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUÉ INCLUYE ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-3">
              Qué necesita cualquier SaaS
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Los pilares técnicos que hacen funcionar un SaaS escalable.
              Todo desarrollado e integrado de fábrica.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section className="py-20 bg-[#0B1120] border-y border-slate-800">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-3">
              De la idea a producción
            </h2>
            <p className="text-slate-400">
              Un proceso probado para lanzar un SaaS sin desperdiciar tiempo ni presupuesto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            {process.map(({ step, title, description }) => (
              <div key={step} className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
                <div className="text-4xl font-bold text-slate-800 mb-3 font-mono">{step}</div>
                <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STACK ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-50 mb-8 text-center">
              Stack tecnológico para SaaS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  icon: Code2,
                  layer: 'Frontend',
                  techs: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS'],
                },
                {
                  icon: Database,
                  layer: 'Backend & Base de datos',
                  techs: ['Node.js', 'PostgreSQL', 'Prisma ORM', 'REST API'],
                },
                {
                  icon: CreditCard,
                  layer: 'Pagos y suscripciones',
                  techs: ['Stripe', 'PayPal', 'Webhooks', 'Facturación automática'],
                },
                {
                  icon: Lock,
                  layer: 'Auth y seguridad',
                  techs: ['NextAuth', 'JWT', 'RBAC', 'Encriptación AES-256'],
                },
                {
                  icon: Cpu,
                  layer: 'Inteligencia Artificial',
                  techs: ['Claude API', 'OpenAI GPT', 'Google Gemini', 'Embeddings'],
                },
                {
                  icon: TrendingUp,
                  layer: 'Deploy e infraestructura',
                  techs: ['VPS + PM2', 'Vercel', 'PostgreSQL managed', 'Cloudinary'],
                },
              ].map(({ icon: Icon, layer, techs }) => (
                <div key={layer} className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{layer}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {techs.map(t => (
                      <span key={t} className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-[#0B1120] border-y border-slate-800">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-50 mb-10 text-center">
              Preguntas frecuentes
            </h2>

            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-100 mb-2 text-sm">{q}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ENLACES INTERNOS SEO ── */}
      <section className="py-12 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-center mb-6">
            Otros servicios
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {[
              { label: 'Desarrollo React & Next.js', href: '/servicios/desarrollo-react-nextjs' },
              { label: 'Tiendas E-commerce a medida', href: '/servicios/ecommerce' },
              { label: 'Consultoría técnica', href: '/servicios/consultoria' },
              { label: 'Ver todos los servicios', href: '/servicios' },
              { label: 'Portfolio de proyectos', href: '/portfolio' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-xs text-slate-400 hover:text-cyan-400 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/30 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 bg-[#0B1120] border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="badge badge-cyan mx-auto mb-6">
              <Rocket className="w-3.5 h-3.5" />
              ¿Tienes una idea de SaaS?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-6 leading-tight">
              Construyamos tu plataforma
            </h2>
            <p className="text-slate-400 mb-10 text-lg">
              Cuéntame tu idea. Te diré qué necesita técnicamente y cómo llevarla
              a producción de forma eficiente.
            </p>
            <Link
              href="/contacto"
              className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5"
            >
              Solicitar presupuesto SaaS
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-slate-600 mt-4">
              Respondo en menos de 24h · Sin compromiso
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
