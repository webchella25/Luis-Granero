// src/app/cursos/page.tsx
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import CursosHero from '../../components/cursos/CursosHero';
import LearningPathsGrid from '../../components/cursos/LearningPathsGrid';
import EmailCoursesGrid from '../../components/cursos/EmailCoursesGrid';
import CursosFeatures from '../../components/cursos/CursosFeatures';
import CursosCTA from '../../components/cursos/CursosCTA';
import SchemaOrg from '../../components/seo/SchemaOrg';
import { getBreadcrumbSchema, getItemListSchema } from '../../lib/seo/schemas';
import dbConnect from '@/lib/mongodb';
import LearningPath from '@/models/LearningPath';
import EmailCourse from '@/models/EmailCourse';
import Link from 'next/link';
import { BookOpen, Code2, Rocket, Users, CheckCircle, ArrowRight } from 'lucide-react';

export const revalidate = 3600;

// Lectura directa a BD — evita circular HTTP fetch en PM2
async function getLearningPaths() {
  try {
    await dbConnect();
    const paths = await LearningPath.find({ isPublished: true })
      .select('title slug description duration level topics articles icon isFeatured isPremium enrollments')
      .populate({ path: 'articles.postId', select: 'title slug' })
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();
    return paths.map((p: any) => ({ ...p, _id: p._id.toString() }));
  } catch {
    return [];
  }
}

async function getEmailCourses() {
  try {
    await dbConnect();
    const courses = await EmailCourse.find({ isPublished: true })
      .select('title slug description duration level tags thumbnail')
      .sort({ createdAt: -1 })
      .lean();
    return courses.map((c: any) => ({ ...c, _id: c._id.toString() }));
  } catch {
    return [];
  }
}

export async function generateMetadata() {
  return {
    title: 'Aprende React desde cero — Cursos y rutas de aprendizaje | Luis Granero',
    description: 'Aprende React, Next.js y desarrollo web moderno gratis. Rutas estructuradas de principiante a avanzado creadas por un desarrollador con SaaS propios en producción.',
    keywords: [
      'aprender React desde cero',
      'curso React gratis español',
      'aprender Next.js',
      'curso desarrollo web gratuito',
      'tutorial React hooks',
      'aprender JavaScript moderno',
      'ruta aprendizaje frontend',
      'curso React principiante',
    ],
    openGraph: {
      title: 'Aprende React desde cero — Cursos gratis | Luis Granero',
      description: 'Rutas de aprendizaje gratuitas para aprender React, Next.js y desarrollo web moderno. De principiante a avanzado.',
      type: 'website',
      url: 'https://www.luisgranero.com/cursos',
    },
    alternates: {
      canonical: 'https://www.luisgranero.com/cursos',
    },
  };
}

const faqs = [
  {
    q: '¿Necesito saber programar para empezar?',
    a: 'Depende del curso. "React desde cero" requiere HTML, CSS y JavaScript básico. "De idea a web" es apto para no programadores — está pensado para founders y emprendedores que quieren tomar decisiones técnicas con criterio.'
  },
  {
    q: '¿Son gratuitos todos los cursos?',
    a: 'Sí, todas las rutas de aprendizaje son gratuitas. Los artículos son públicos y puedes leerlos sin registro. Los cursos por email también son gratuitos: recibes las lecciones en tu bandeja de entrada.'
  },
  {
    q: '¿Cuánto tiempo necesito para aprender React?',
    a: 'Con dedicación de 1-2 horas al día, puedes dominar React en 3-4 semanas siguiendo la ruta estructurada. Lo más importante no es la velocidad sino la práctica: cada artículo incluye ejemplos de código reales.'
  },
  {
    q: '¿Estos cursos sirven para encontrar trabajo?',
    a: 'El contenido está basado en tecnologías que uso a diario en proyectos reales: React, Next.js, TypeScript. Son exactamente las skills que buscan las empresas en 2025. Combínalos con proyectos propios en tu portfolio.'
  },
  {
    q: '¿Qué diferencia estos cursos de YouTube o Udemy?',
    a: 'Están escritos por alguien que tiene SaaS propios en producción — no solo tutoriales. El contenido refleja lo que realmente se usa en proyectos profesionales: patrones reales, decisiones de arquitectura, casos de uso auténticos.'
  },
  {
    q: '¿Puedo contratar a Luis después de aprender con sus cursos?',
    a: 'Claro. Si aprendes y necesitas ayuda para lanzar tu proyecto, puedo encargarlo yo. Si prefieres que lo construya directamente, también. Más info en la página de servicios.'
  }
];

export default async function CursosPage() {
  const [paths, emailCourses] = await Promise.all([
    getLearningPaths(),
    getEmailCourses()
  ]);

  const featuredPaths = paths.filter((p: any) => p.isFeatured);
  const regularPaths = paths.filter((p: any) => !p.isFeatured);
  const totalCourses = paths.length + emailCourses.length;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Cursos', url: '/cursos' }
  ]);

  const courseListSchema = getItemListSchema(
    paths.map((p: any) => ({ name: p.title, url: `/cursos/${p.slug}` })),
    'Cursos y rutas de aprendizaje de desarrollo web'
  );

  return (
    <main className="min-h-screen bg-[#0F172A]">
      <SchemaOrg schema={[breadcrumbSchema, courseListSchema]} />
      <Header />

      <CursosHero totalCursos={totalCourses} />

      {/* Cursos por Email */}
      {emailCourses.length > 0 && (
        <section className="py-20 bg-[#0F172A]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-green-400 font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                <span>📧</span> 100% GRATIS
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
                Cursos por Email
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Recibe lecciones directamente en tu inbox. Sin registro, sin compromisos.
              </p>
            </div>
            <EmailCoursesGrid courses={emailCourses} />
          </div>
        </section>
      )}

      {/* Rutas destacadas */}
      {featuredPaths.length > 0 && (
        <section className="py-20 bg-[#0B1120]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-purple-400 font-mono text-sm uppercase tracking-wider">
                ⭐ Recomendadas
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
                Cursos Completos
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Rutas estructuradas para aprender React, Next.js y desarrollo web moderno
              </p>
            </div>
            <LearningPathsGrid paths={featuredPaths} featured={true} />
          </div>
        </section>
      )}

      {/* Todas las rutas */}
      {regularPaths.length > 0 && (
        <section className="py-20 bg-[#0F172A]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Todas las Rutas
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Elige tu camino según tu nivel y objetivos
              </p>
            </div>
            <LearningPathsGrid paths={regularPaths} />
          </div>
        </section>
      )}

      {/* Sección pilar: Por qué aprender React */}
      <section className="py-24 bg-[#0B1120] border-y border-slate-800">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-14">
            <div className="badge badge-cyan mx-auto mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              Por qué React en 2025
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">
              Aprender React desde cero: la guía honesta
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              React es el framework JavaScript más demandado del mercado. Saber React abre puertas a empresas
              de todos los sectores — y es la base para entender Next.js, el stack que domina el desarrollo web moderno.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {[
              {
                icon: Code2,
                title: 'El más demandado',
                desc: 'React aparece en más del 60% de las ofertas de trabajo frontend en España. Aprenderlo es invertir en empleabilidad real.'
              },
              {
                icon: Rocket,
                title: 'Base para Next.js',
                desc: 'Next.js — el framework que uso en todos mis proyectos — está construido sobre React. Aprende los fundamentos y el resto fluye.'
              },
              {
                icon: Users,
                title: 'Comunidad enorme',
                desc: 'Miles de librerías, documentación excelente y una comunidad activa. Si tienes una duda, alguien ya la resolvió.'
              }
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-slate-100 font-semibold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Ruta recomendada */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8 mb-14">
            <h3 className="text-slate-100 font-bold text-xl mb-4">
              Ruta recomendada para empezar desde cero
            </h3>
            <ol className="space-y-3">
              {[
                { step: '1', text: 'Empieza por "Qué es React" — entiende el concepto antes del código', link: '/blog/que-es-react-guia-completa' },
                { step: '2', text: 'Sigue con la guía de React Hooks — el corazón de React moderno', link: '/blog/react-hooks-guia-completa' },
                { step: '3', text: 'Aprende Next.js — de React puro a aplicaciones web completas', link: '/blog/guia-completa-nextjs' },
                { step: '4', text: 'Construye algo real. Un proyecto con tu propio código vale más que 10 tutoriales.', link: null },
              ].map(({ step, text, link }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold flex-shrink-0 mt-0.5">
                    {step}
                  </span>
                  <span className="text-slate-300 text-sm">
                    {link ? (
                      <Link href={link} className="hover:text-cyan-400 transition-colors">
                        {text} <ArrowRight className="inline w-3 h-3" />
                      </Link>
                    ) : text}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* CTA a servicios */}
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Para los que prefieren delegar</span>
              </div>
              <h3 className="text-slate-100 font-bold text-lg mb-1">¿Prefieres que yo lo construya?</h3>
              <p className="text-slate-400 text-sm">Si tienes un proyecto y necesitas un desarrollador con React y Next.js en producción, puedo ayudarte.</p>
            </div>
            <Link
              href="/servicios"
              className="flex-shrink-0 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#0F172A] font-bold rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              Ver servicios →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-3">
              Preguntas frecuentes
            </h2>
            <p className="text-slate-400">Todo lo que necesitas saber antes de empezar</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-slate-100 font-semibold mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CursosFeatures />
      <CursosCTA />
      <Footer />
    </main>
  );
}
