import Link from "next/link"
import { Suspense } from "react"
import {
  Code2, Rocket, Shield, Clock, Star, Trophy,
  ArrowRight, Sparkles, Target, CheckCircle2,
  TrendingUp, Award, Heart, Layers
} from "lucide-react"

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SchemaOrg from '@/components/seo/SchemaOrg'
import { getOrganizationSchema, getWebSiteSchema } from '@/lib/seo/schemas'
import {
  getFeaturedCourse,
  getFeaturedProjects,
  getHomeServices,
  getLatestPosts,
} from '@/lib/publicData'
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo/metadata'

export const revalidate = 3600

export async function generateMetadata() {
  const title = 'Luis Granero — Desarrollador Web Freelance en España | React & Next.js'
  const description = 'Desarrollador web freelance en España con +10 años de experiencia. Especializado en React, Next.js y aplicaciones web a medida. Transforma tu idea en un producto digital real.'

  return {
    title,
    description,
    keywords: [
      'desarrollador web freelance España',
      'programador React España',
      'freelance Next.js',
      'desarrollo web a medida',
      'aplicaciones web React',
      'desarrollo e-commerce España',
      'aprender React desde cero',
      'curso React gratis español',
      'tutorial Next.js español',
    ],
    authors: [{ name: 'Luis Granero' }],
    creator: 'Luis Granero',
    publisher: 'Luis Granero',
    openGraph: {
      title,
      description: 'Desarrollo web a medida con React y Next.js. +10 años de experiencia, cursos gratuitos y proyectos reales. Freelance senior en España.',
      url: SITE_URL,
      siteName: 'Luis Granero — Desarrollador Web',
      locale: 'es_ES',
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Luis Granero — Desarrollador Web Freelance | React & Next.js',
      description: 'Desarrollo web a medida con React y Next.js. Freelance senior en España con +10 años de experiencia.',
      images: [DEFAULT_OG_IMAGE],
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: SITE_URL,
    },
  }
}

// ====== LOADING ======
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-slate-800 rounded-xl h-64 skeleton" />
      ))}
    </div>
  )
}

// ====== TECH STACK DATA ======
const techStack = [
  { name: 'React', sub: 'UI Library' },
  { name: 'Next.js', sub: 'Framework' },
  { name: 'TypeScript', sub: 'Language' },
  { name: 'Node.js', sub: 'Backend' },
  { name: 'MongoDB', sub: 'Database' },
  { name: 'Tailwind', sub: 'Styling' },
]

type FeaturedProject = {
  _id: string
  slug: string
  title: string
  description?: string
  image?: string
  images?: string[]
  technologies?: string[]
  isOwnProject?: boolean
}

type HomeService = {
  _id?: string
  title: string
  description?: string
  features?: string[]
  technologies?: string[]
}

type LatestPost = {
  _id: string
  slug: string
  title: string
  excerpt?: string
  category?: string
  featuredImage?: string
}

// ====== PAGE ======
export default async function HomePage() {
  const [featuredProjects, services, latestPosts, featuredCourse] = await Promise.all([
    getFeaturedProjects(),
    getHomeServices(),
    getLatestPosts(),
    getFeaturedCourse()
  ])

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <SchemaOrg schema={[getOrganizationSchema(), getWebSiteSchema()]} />
      <Header />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0F172A] pt-32 pb-24">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60" />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge badge-cyan mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Desarrollo Web · Diseño · Producto</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-slate-50 mb-6">
              Transformo ideas en{' '}
              <span className="gradient-text">productos reales</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Desarrollador Full Stack con más de 10 años de experiencia.
              Especializado en React, Next.js y arquitecturas modernas que escalan.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <Link href="/portfolio" className="btn-primary inline-flex items-center justify-center gap-2">
                Ver proyectos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contacto" className="btn-secondary inline-flex items-center justify-center gap-2">
                Hablemos
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-800">
              {[
                { value: '10+', label: 'Años de experiencia' },
                { value: '50+', label: 'Proyectos completados' },
                { value: '35+', label: 'Clientes satisfechos' },
                { value: '15+', label: 'Tecnologías' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-slate-50 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS BAR ── */}
      <section className="border-y border-slate-800 bg-[#0B1120]">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Rocket, label: 'Entrega rápida', sub: 'En tiempo récord' },
              { icon: Code2, label: 'Código limpio', sub: 'Fácil de mantener' },
              { icon: Shield, label: 'Soporte continuo', sub: 'Siempre disponible' },
              { icon: TrendingUp, label: 'SEO optimizado', sub: 'Máxima visibilidad' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{label}</div>
                  <div className="text-xs text-slate-500">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROYECTOS DESTACADOS ── */}
      {featuredProjects.length > 0 && (
        <section className="py-20 bg-[#0F172A]">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="badge badge-cyan mb-3">
                  <Trophy className="w-3.5 h-3.5" />
                  Proyectos destacados
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-50">
                  Casos de éxito reales
                </h2>
                <p className="text-slate-400 mt-2 max-w-xl">
                  Aplicaciones web que transformaron negocios. Resultados medibles.
                </p>
              </div>
              <Link href="/portfolio" className="hidden md:inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Suspense fallback={<LoadingGrid />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredProjects.map((project: FeaturedProject) => (
                  <Link key={project._id} href={`/portfolio/${project.slug}`}>
                    <article className={`group relative bg-[#1E293B] border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer h-full ${
                      project.isOwnProject
                        ? 'border-cyan-500/20 hover:border-cyan-500/50'
                        : 'border-slate-700/50 hover:border-slate-600'
                    }`}>
                      {project.isOwnProject && (
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/15 border border-cyan-500/30 rounded-full backdrop-blur-sm">
                          <Rocket className="w-3 h-3 text-cyan-400" />
                          <span className="text-xs font-semibold text-cyan-400">Propio</span>
                        </div>
                      )}
                      {(project.images?.[0] || project.image) && (
                        <div className="aspect-video bg-slate-800 overflow-hidden">
                          <img
                            src={project.images?.[0] || project.image}
                            alt={project.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-semibold text-slate-100 mb-1.5 group-hover:text-cyan-400 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                        {!!project.technologies?.length && (
                          <div className="flex flex-wrap gap-1.5">
                            {project.technologies.slice(0, 3).map((tech: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-cyan-400 rounded border border-slate-700">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </Suspense>

            <div className="mt-8 text-center md:hidden">
              <Link href="/portfolio" className="btn-secondary inline-flex items-center gap-2">
                Ver todos los proyectos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── SERVICIOS ── */}
      {services.length > 0 && (
        <section className="py-20 bg-[#0B1120] border-y border-slate-800">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="badge mb-3">
                  <Star className="w-3.5 h-3.5" />
                  Servicios
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-50">
                  Soluciones profesionales
                </h2>
                <p className="text-slate-400 mt-2 max-w-xl">
                  Desde MVPs hasta plataformas complejas. Desarrollo a medida para cada necesidad.
                </p>
              </div>
              <Link href="/servicios" className="hidden md:inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service: HomeService) => (
                <article
                  key={service._id}
                  className="group bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center mb-4">
                    <Layers className="w-5 h-5 text-slate-300" />
                  </div>
                  <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  {!!service.features?.length && (
                    <ul className="space-y-1.5 mb-4">
                      {service.features.slice(0, 3).map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  {!!service.technologies?.length && (
                    <div className="flex flex-wrap gap-1.5">
                      {service.technologies.slice(0, 3).map((tech: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/servicios" className="btn-secondary inline-flex items-center gap-2">
                Ver todos los servicios
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── BLOG RECIENTE ── */}
      {latestPosts.length > 0 && (
        <section className="py-20 bg-[#0F172A]">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="badge mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Blog
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-50">
                  Aprende desarrollo web
                </h2>
                <p className="text-slate-400 mt-2 max-w-xl">
                  Tutoriales, guías y mejores prácticas. Contenido actualizado semanalmente.
                </p>
              </div>
              <Link href="/blog" className="hidden md:inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {latestPosts.map((post: LatestPost) => (
                <Link key={post._id} href={`/blog/${post.slug}`}>
                  <article className="group bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600 transition-all duration-200 cursor-pointer h-full">
                    {post.featuredImage && (
                      <div className="aspect-video bg-slate-800 overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      {post.category && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-300 rounded mb-3">
                          {post.category}
                        </span>
                      )}
                      <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/blog" className="btn-secondary inline-flex items-center gap-2">
                Ver todos los artículos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CURSO DESTACADO ── */}
      {featuredCourse && (
        <section className="py-20 bg-[#0B1120] border-y border-slate-800">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-8 md:p-12">
                <div className="text-center">
                  <div className="badge badge-cyan mx-auto mb-6">
                    <Award className="w-3.5 h-3.5" />
                    Curso gratuito
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">
                    {featuredCourse.title}
                  </h2>
                  <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                    {featuredCourse.description}
                  </p>
                  <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-500" />
                      5 días de contenido
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-500" />
                      100% práctico
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-500" />
                      Gratis para siempre
                    </div>
                  </div>
                  <Link href={`/cursos/${featuredCourse.slug}`} className="btn-primary inline-flex items-center gap-2">
                    Comenzar curso gratis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── STACK TECNOLÓGICO ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-3">
              Stack tecnológico
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Tecnologías modernas para crear soluciones robustas y escalables
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="group bg-[#1E293B] border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-200 text-center"
              >
                <div className="font-semibold text-slate-200 text-sm mb-0.5">{tech.name}</div>
                <div className="text-xs text-slate-500">{tech.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ TRABAJAR CONMIGO ── */}
      <section className="py-20 bg-[#0B1120] border-y border-slate-800">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-10 text-center">
              ¿Por qué trabajar conmigo?
            </h2>

            <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-8 mb-10">
              <ul className="space-y-4">
                {[
                  { strong: 'Más de 10 años de experiencia', rest: ' desarrollando aplicaciones web modernas con React, Next.js y Node.js' },
                  { strong: '+50 proyectos completados', rest: ' desde startups hasta empresas consolidadas. Resultados medibles y clientes satisfechos' },
                  { strong: 'Código limpio y mantenible', rest: ' siguiendo mejores prácticas, principios SOLID y arquitecturas escalables' },
                  { strong: 'SEO y Performance', rest: ' optimizados desde el día uno. Core Web Vitals, accesibilidad y mejores métricas' },
                  { strong: 'Soporte continuo', rest: ' y comunicación transparente durante todo el proyecto y después del lanzamiento' },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm leading-relaxed">
                      <strong className="text-slate-100 font-medium">{item.strong}</strong>{item.rest}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8 text-slate-400 leading-relaxed text-sm">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Tu desarrollador Full Stack de confianza</h3>
                <p>
                  Soy <strong className="text-slate-200 font-medium">Luis Granero</strong>, desarrollador web especializado en{' '}
                  <strong className="text-slate-200 font-medium">React, Next.js y TypeScript</strong>.
                  Con más de una década de experiencia, he ayudado a empresas y emprendedores a transformar sus ideas en aplicaciones reales.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Desarrollo web moderno y escalable</h3>
                <p>
                  Especializado en <strong className="text-slate-200 font-medium">desarrollo frontend con React y Next.js</strong>, creando interfaces
                  rápidas, accesibles y optimizadas para SEO. En el backend, trabajo con{' '}
                  <strong className="text-slate-200 font-medium">Node.js, Express y MongoDB</strong> para APIs robustas y escalables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILARES DE NAVEGACIÓN SEO ── */}
      <section className="py-16 bg-[#0B1120] border-y border-slate-800">
        <div className="container mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-center mb-8">Explora el sitio</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
            {[
              { label: 'Servicios de desarrollo web', href: '/servicios' },
              { label: 'Desarrollo SaaS a medida', href: '/servicios/desarrollo-saas' },
              { label: 'Portfolio de proyectos React', href: '/portfolio' },
              { label: 'Sobre mí — freelance Valencia', href: '/sobre-mi' },
              { label: 'Blog de React y Next.js', href: '/blog' },
              { label: 'Cursos gratuitos de React', href: '/cursos' },
              { label: 'Contacto y presupuesto', href: '/contacto' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 text-xs text-center text-slate-400 hover:text-cyan-400 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/30 rounded-lg transition-all duration-200 leading-snug"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="badge badge-cyan mx-auto mb-6">
              <Heart className="w-3.5 h-3.5" />
              ¿Listo para comenzar?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-6 leading-tight">
              Convirtamos tu idea en realidad
            </h2>
            <p className="text-slate-400 mb-10 text-lg">
              Hablemos de tu proyecto. Te ayudaré a crear una solución web moderna que impulse tu negocio.
            </p>
            <Link href="/contacto" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
              Solicitar presupuesto gratis
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="grid grid-cols-3 gap-8 mt-16 pt-10 border-t border-slate-800">
              {[
                { value: '10+ años', label: 'De experiencia' },
                { value: '50+ proyectos', label: 'Completados' },
                { value: '35+ clientes', label: 'Satisfechos' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-slate-100 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
