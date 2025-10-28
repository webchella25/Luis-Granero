// src/app/portfolio/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Función simple para renderizar Markdown a HTML
function renderMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Code blocks
    .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>')
    // Lists
    .replace(/^\* (.+)$/gim, '<li>$1</li>')
    .replace(/^- (.+)$/gim, '<li>$1</li>');
  
  // Wrap consecutive list items in ul tags
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  
  // Line breaks - convert double newlines to paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  
  // Wrap in paragraphs if not already wrapped
  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<blockquote')) {
    html = `<p>${html}</p>`;
  }
  
  return html;
}

// Función para obtener un proyecto por slug
async function getProjectBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/projects/${slug}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error('Project fetch failed:', res.status);
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

// Función para obtener proyectos relacionados
async function getRelatedProjects(category: string, currentSlug: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/projects?category=${category}&limit=3`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.filter((project: any) => project.slug !== currentSlug);
  } catch (error) {
    console.error('Error fetching related projects:', error);
    return [];
  }
}

interface ProjectPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);
  
  if (!project) {
    return {
      title: 'Proyecto no encontrado - Luis Granero Portfolio',
    };
  }
  
  return {
    title: `${project.title} - Luis Granero Portfolio`,
    description: project.description,
    keywords: project.technologies?.join(', '),
    openGraph: {
      title: project.title,
      description: project.description,
      type: 'website',
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);
  
  if (!project) {
    notFound();
  }

  const relatedProjects = await getRelatedProjects(project.category, project.slug);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950">
        
        {/* Breadcrumb y botón volver */}
        <div className="bg-gray-900/50 border-b border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <Link
              href="/portfolio"
              className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Volver al Portfolio</span>
            </Link>
          </div>
        </div>

        {/* Hero del proyecto */}
        <section className="py-16 bg-gradient-to-b from-gray-900/50 to-gray-950">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              
              {/* Título y estado */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {project.title}
                  </h1>
                  {project.subtitle && (
                    <p className="text-xl text-gray-400">
                      {project.subtitle}
                    </p>
                  )}
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                  project.status === 'En producción' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {project.status}
                </span>
              </div>

              {/* Categoría y año */}
              <div className="flex items-center space-x-4 mb-8 text-gray-400">
                <span className="px-3 py-1 bg-gray-800 rounded-lg text-sm">
                  {project.category}
                </span>
                {project.year && (
                  <span className="text-sm">
                    {project.year}
                  </span>
                )}
              </div>

              {/* Descripción */}
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                {project.description}
              </p>

              {/* Enlaces externos */}
              {(project.urls?.live || project.urls?.github) && (
                <div className="flex flex-wrap gap-4 mb-12">
                  {project.urls?.live && (
                    <a
                      href={project.urls.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl transition-all"
                    >
                      <span>Ver proyecto en vivo</span>
                      <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    </a>
                  )}
                  {project.urls?.github && (
                    <a
                      href={project.urls.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
                    >
                      <span>Ver código en GitHub</span>
                      <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stack tecnológico */}
        {project.technologies && project.technologies.length > 0 && (
          <section className="py-12 bg-gray-900/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Stack Tecnológico
                </h2>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-800 text-cyan-400 rounded-lg border border-cyan-500/30 font-mono text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Métricas */}
        {project.metrics && Object.keys(project.metrics).length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8">
                  Métricas y Resultados
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(project.metrics).map(([key, value], index) => (
                    <div key={index} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold gradient-text mb-2">
                        {String(value)}
                      </div>
                      <div className="text-sm text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Características principales */}
        {project.features && project.features.length > 0 && (
          <section className="py-12 bg-gray-900/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8">
                  Características Principales
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {project.features.map((feature: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4"
                    >
                      <span className="text-green-400 text-xl mt-1">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contenido detallado en Markdown */}
        {project.content && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
                  <div 
                    className="prose prose-invert prose-cyan max-w-none
                      prose-headings:text-white prose-headings:font-bold
                      prose-h1:text-3xl prose-h1:mb-6 prose-h1:gradient-text
                      prose-h2:text-2xl prose-h2:mb-4 prose-h2:text-cyan-400
                      prose-h3:text-xl prose-h3:mb-3 prose-h3:text-cyan-300
                      prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                      prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:text-cyan-300
                      prose-strong:text-white prose-strong:font-semibold
                      prose-code:text-cyan-400 prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                      prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg
                      prose-ul:text-gray-300 prose-ul:list-disc prose-ul:pl-6
                      prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:pl-6
                      prose-li:mb-2
                      prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
                      prose-img:rounded-lg prose-img:shadow-xl"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdown(project.content) 
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Desafíos técnicos */}
        {project.challenges && project.challenges.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8">
                  Desafíos Técnicos
                </h2>
                <div className="space-y-4">
                  {project.challenges.map((challenge: string, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6"
                    >
                      <p className="text-gray-300 leading-relaxed">{challenge}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Resultados */}
        {project.results && (
          <section className="py-12 bg-gray-900/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8">
                  Resultados
                </h2>
                <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {project.results}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Aprendizajes */}
        {project.learnings && project.learnings.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8">
                  Aprendizajes Clave
                </h2>
                <div className="space-y-4">
                  {project.learnings.map((learning: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6"
                    >
                      <span className="text-cyan-400 text-xl mt-1">💡</span>
                      <span className="text-gray-300 leading-relaxed">{learning}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Código destacado */}
        {project.codeSnippet && (
          <section className="py-12 bg-gray-900/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8">
                  Código Destacado
                </h2>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-x-auto">
                  <pre className="text-sm text-gray-300 font-mono">
                    <code>{project.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Cliente y testimonial */}
        {project.client?.testimonial && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8">
                  Testimonio del Cliente
                </h2>
                <div className="bg-gradient-to-r from-cyan-500/10 to-green-500/10 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-8">
                  <p className="text-lg text-gray-300 leading-relaxed italic mb-6">
                    "{project.client.testimonial}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-semibold text-white">
                        {project.client.name}
                      </p>
                      {project.client.company && (
                        <p className="text-gray-400 text-sm">
                          {project.client.company}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Proyectos relacionados */}
        {relatedProjects.length > 0 && (
          <section className="py-16 bg-gray-900/50">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8">
                  Proyectos Relacionados
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedProjects.map((relatedProject: any) => (
                    <Link
                      key={relatedProject._id}
                      href={`/portfolio/${relatedProject.slug}`}
                      className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
                    >
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                        {relatedProject.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {relatedProject.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA final */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center">
                <h3 className="text-3xl font-bold gradient-text mb-4">
                  ¿Tienes un proyecto similar en mente?
                </h3>
                <p className="text-gray-400 mb-8 text-lg">
                  Conversemos sobre cómo puedo ayudarte a conseguir resultados como estos.
                </p>
                <Link
                  href="/contacto"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105"
                >
                  Iniciar conversación
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}