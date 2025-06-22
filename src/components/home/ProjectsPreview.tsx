// src/components/home/ProjectsPreview.tsx
'use client';

import Link from 'next/link';
import { ArrowRightIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface Project {
  _id?: string;
  title: string;
  description: string;
  technologies: string[];
  metrics?: {
    performance?: string;
    conversions?: string;
    loadTime?: string;
    users?: string;
    satisfaction?: string;
    bookings?: string;
    dataPoints?: string;
  };
  images?: string[];
  slug?: string;
  status?: string;
}

interface Props {
  projects?: Project[];
}

export default function ProjectsPreview({ projects = [] }: Props) {
  // Proyectos por defecto si no hay datos
  const defaultProjects: Project[] = [
    {
      title: "E-commerce Avanzado",
      description: "Plataforma de comercio electrónico con gestión avanzada de inventarios, múltiples métodos de pago y dashboard administrativo.",
      technologies: ["Next.js", "Node.js", "MongoDB", "Stripe"],
      metrics: {
        performance: "98/100",
        conversions: "+35%",
        loadTime: "1.2s"
      },
      status: "En producción",
      slug: "ecommerce-avanzado"
    },
    {
      title: "Dashboard Corporativo",
      description: "Sistema de gestión empresarial con análisis en tiempo real, reportes automatizados y integración con múltiples APIs.",
      technologies: ["React", "TypeScript", "Express", "PostgreSQL"],
      metrics: {
        performance: "96/100",
        users: "500+",
        dataPoints: "10M+"
      },
      status: "En desarrollo",
      slug: "dashboard-corporativo"
    },
    {
      title: "App de Reservas",
      description: "Aplicación web para gestión de reservas con calendario dinámico, notificaciones y sistema de pagos integrado.",
      technologies: ["Next.js", "Tailwind", "Firebase", "PayPal"],
      metrics: {
        performance: "99/100",
        bookings: "1000+",
        satisfaction: "4.9/5"
      },
      status: "En producción",
      slug: "app-reservas"
    }
  ];

  const displayProjects = projects.length > 0 ? projects.slice(0, 3) : defaultProjects;

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Proyectos Destacados
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Casos de éxito que demuestran mi experiencia en desarrollo web. 
            Cada proyecto incluye métricas reales y código optimizado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {displayProjects.map((project, index) => (
            <div
              key={project._id || index}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h3>
                  {project.status && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'En producción' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {project.status}
                    </span>
                  )}
                </div>

                <p className="text-gray-400 leading-relaxed mb-6">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded border border-cyan-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {project.metrics && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {Object.entries(project.metrics).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-bold text-cyan-400">{value}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Link
                    href={`/portfolio/${project.slug || ''}`}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-semibold flex items-center space-x-1"
                  >
                    <span>Ver detalles</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                  
                  {project.status === 'En producción' && (
                    <button className="text-gray-400 hover:text-white transition-colors" title="Ver sitio web">
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
          >
            <span>Ver todos los proyectos</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}