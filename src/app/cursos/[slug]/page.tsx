// src/app/cursos/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LearningPathDetail from '@/components/cursos/LearningPathDetail';
import EmailCourseLanding from '@/components/cursos/EmailCourseLanding';
import EnrollButton from '@/components/courses/EnrollButton';
import SchemaOrg from '@/components/seo/SchemaOrg';
import { getCourseSchema, getBreadcrumbSchema } from '@/lib/seo/schemas';
import CoursePurchaseGate from '@/components/cursos/CoursePurchaseGate';
import CourseStartButton from '@/components/cursos/CourseStartButton';

// ISR - Revalidar cada 24 horas
export const revalidate = 86400;

async function getCourseData(slug: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // Intentar buscar en email courses primero
  try {
    const emailRes = await fetch(`${baseUrl}/api/public/email-courses/${slug}`, {
      next: { revalidate: 86400 },
    });
    if (emailRes.ok) {
      const data = await emailRes.json();
      return { type: 'email', data: data.course };
    }
  } catch (error) {
    console.error('Error fetching email course:', error);
  }

  // Si no es email course, buscar en learning paths
  try {
    const pathRes = await fetch(`${baseUrl}/api/public/learning-paths/${slug}`, {
      next: { revalidate: 86400 },
    });
    if (pathRes.ok) {
      const data = await pathRes.json();
      return { type: 'learning-path', data: data.path };
    }
  } catch (error) {
    console.error('Error fetching learning path:', error);
  }

  return null;
}

async function getLearningPath(slug: string) {
  const courseData = await getCourseData(slug);
  if (courseData?.type === 'learning-path') {
    return courseData.data;
  }
  return null;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const path = await getLearningPath(resolvedParams.slug);
  
  if (!path) {
    return {
      title: 'Ruta no encontrada - Luis Granero',
    };
  }
  
  return {
    title: `${path.title} - Cursos Luis Granero`,
    description: path.description,
    keywords: path.topics?.join(', '),
    openGraph: {
      title: path.title,
      description: path.description,
      type: 'article',
    }
  };
}

export default async function LearningPathPage({ params }: Props) {
  const resolvedParams = await params;
  const courseData = await getCourseData(resolvedParams.slug);

  if (!courseData) {
    notFound();
  }

  // Si es un email course, renderizar EmailCourseLanding
  if (courseData.type === 'email') {
    const course = courseData.data;
    const courseSchema = getCourseSchema({
      title: course.title,
      description: course.description,
      slug: resolvedParams.slug,
      thumbnail: course.thumbnail,
      level: course.level,
      duration: course.duration
    });

    const breadcrumbSchema = getBreadcrumbSchema([
      { name: 'Inicio', url: '/' },
      { name: 'Cursos', url: '/cursos' },
      { name: course.title, url: `/cursos/${resolvedParams.slug}` }
    ]);

    return (
      <>
        <SchemaOrg schema={[courseSchema, breadcrumbSchema]} />
        <Header />
        <EmailCourseLanding course={course} />
        <Footer />
      </>
    );
  }

  // Si es un learning path, renderizar la UI completa
  const path = courseData.data;

  // Generar schemas para learning path
  const courseSchema = getCourseSchema({
    title: path.title,
    description: path.description,
    slug: resolvedParams.slug,
    thumbnail: path.thumbnail,
    level: path.level,
    duration: path.estimatedTime || path.duration,
    numberOfLessons: path.articles?.length || path.modules?.length
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Cursos', url: '/cursos' },
    { name: path.title, url: `/cursos/${resolvedParams.slug}` }
  ]);

  return (
    <main className="min-h-screen bg-[#0F172A]">
      {/* Schema.org JSON-LD */}
      <SchemaOrg schema={[courseSchema, breadcrumbSchema]} />

      <Header />
      
      {/* Hero Section del Curso */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-950 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
              <a href="/cursos" className="hover:text-cyan-400 transition-colors">
                Cursos
              </a>
              <span>/</span>
              <span className="text-white">{path.title}</span>
            </nav>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                path.level === 'Principiante' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : path.level === 'Intermedio'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {path.level}
              </span>
              
              {path.isPremium && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  Premium
                </span>
              )}
              
              {path.isFeatured && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Destacado
                </span>
              )}
              
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {path.duration}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {path.icon} {path.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              {path.description}
            </p>

            <div className="mb-8">
              <CourseStartButton
                courseSlug={path.slug}
                isPremium={path.isPremium}
                firstArticleSlug={path.articles?.[0]?.postId?.slug}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  {path.articles?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Lecciones</div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {path.duration}
                </div>
                <div className="text-sm text-gray-400">Duración</div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {path.level}
                </div>
                <div className="text-sm text-gray-400">Nivel</div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {path.isPremium ? 'Premium' : 'Gratis'}
                </div>
                <div className="text-sm text-gray-400">Acceso</div>
              </div>
            </div>

            {/* Topics */}
            {path.topics && path.topics.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                  Tecnologías
                </h3>
                <div className="flex flex-wrap gap-2">
                  {path.topics.map((topic: string) => (
                    <span 
                      key={topic}
                      className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {path.prerequisites && path.prerequisites.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-400 mb-3">
                  📋 Requisitos previos
                </h3>
                <ul className="space-y-2">
                  {path.prerequisites.map((prereq: string, index: number) => (
                    <li key={index} className="text-gray-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contenido del curso — con gate de pago si es premium */}
      {path.isPremium ? (
        <CoursePurchaseGate course={path} anchorId="comprar">
          <LearningPathDetail path={path} />
        </CoursePurchaseGate>
      ) : (
        <LearningPathDetail path={path} />
      )}

      <Footer />
    </main>
  );
}