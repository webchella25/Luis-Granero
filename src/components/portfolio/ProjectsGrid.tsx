// src/components/portfolio/ProjectsGrid.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  status: string;
  metrics?: Record<string, string>;
  features?: string[];
  images?: string[];
  isFeatured?: boolean;
  slug?: string;
  year?: string;
}

interface Props {
  projects?: Project[];
}

export default function ProjectsGrid({ projects = [] }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Obtener categorías dinámicamente de los proyectos
  const categories = [
    { id: 'all', name: 'Todos', count: projects.length },
    ...Array.from(new Set(projects.map(p => p.category)))
      .filter(Boolean)
      .map(cat => ({
        id: cat.toLowerCase(),
        name: cat,
        count: projects.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length
      }))
  ];

  // Si no hay categorías dinámicas, usar por defecto
  const defaultCategories = [
    { id: 'all', name: 'Todos', count: projects.length },
    { id: 'e-commerce', name: 'E-commerce', count: 0 },
    { id: 'dashboard', name: 'Dashboards', count: 0 },
    { id: 'landing', name: 'Landing Pages', count: 0 },
    { id: 'app', name: 'Web Apps', count: 0 }
  ];

  const finalCategories = categories.length > 1 ? categories : defaultCategories;

  // Filtrar proyectos por categoría
  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => 
        project.category?.toLowerCase() === selectedCategory.toLowerCase()
      );

  // Proyectos de fallback si no hay datos del admin
  const defaultProjects: Project[] = [
    {
      _id: '1',
      title: "E-commerce Avanzado",
      description: "Plataforma completa de comercio electrónico con gestión de inventarios, múltiples métodos de pago y analytics en tiempo real.",
      technologies: ["Next.js", "Node.js", "MongoDB", "Stripe"],
      category: "E-commerce",
      status: "En producción",
      metrics: {
        performance: "98/100",
        conversions: "+35%",
        loadTime: "1.2s"
      },
      features: [
        "Gestión avanzada de inventarios",
        "Múltiples pasarelas de pago",
        "Dashboard administrativo",
        "Analytics en tiempo real",
        "SEO optimizado"
      ],
      slug: "ecommerce-avanzado",
      year: "2024"
    },
    {
      _id: '2',
      title: "Dashboard Corporativo",
      description: "Sistema de gestión empresarial con visualización de datos, reportes automatizados y integración con APIs externas.",
      technologies: ["React", "TypeScript", "Express", "PostgreSQL"],
      category: "Dashboard",
      status: "En desarrollo",
      metrics: {
        performance: "96/100",
        users: "500+",
        dataPoints: "10M+"
      },
      features: [
        "Visualización de datos en tiempo real",
        "Reportes automatizados",
        "Integración con múltiples APIs",
        "Gestión de usuarios y roles",
        "Exportación de datos"
      ],
      slug: "dashboard-corporativo",
      year: "2024"
    }
  ];

  const displayProjects = projects.length > 0 ? filteredProjects : defaultProjects;

  if (projects.length === 0) {
    return (
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Portfolio
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Proyectos en desarrollo. Próximamente casos de estudio detallados.
            </p>
            
            {/* Mostrar proyectos de ejemplo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {defaultProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Casos de Estudio Detallados
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explora proyectos reales con métricas, tecnologías y resultados de negocio
          </p>
        </div>

        {/* Category filters */}
        {finalCategories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {finalCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        )}

        {/* Projects grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {displayProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              ¿Quieres ser el próximo caso de éxito?
            </h3>
            <p className="text-gray-400 mb-6">
              Hablemos sobre tu proyecto y cómo puedo ayudarte a conseguir resultados similares.
            </p>
            <Link
              href="/contacto"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105"
            >
              Iniciar mi proyecto
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Componente separado para la tarjeta de proyecto
function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105">
      
      {/* Project header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
              {project.title}
            </h3>
            <p className="text-gray-500 text-sm">{project.category} • {project.year}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            project.status === 'En producción' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {project.status}
          </span>
        </div>
        
        <p className="text-gray-300 leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies?.map((tech, techIndex) => (
            <span
              key={techIndex}
              className="px-2 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded border border-cyan-500/30"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Metrics */}
      {project.metrics && Object.keys(project.metrics).length > 0 && (
        <div className="px-6 pb-4">
          <h4 className="font-semibold text-white mb-3">Métricas clave:</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(project.metrics).slice(0, 4).map(([key, value], index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold gradient-text">{value}</div>
                <div className="text-xs text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      {project.features && project.features.length > 0 && (
        <div className="px-6 pb-4">
          <h4 className="font-semibold text-white mb-3">Características principales:</h4>
          <div className="space-y-1">
            {project.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-green-400 text-xs">✓</span>
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
            {project.features.length > 3 && (
              <div className="text-cyan-400 text-sm">
                +{project.features.length - 3} características más
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="p-6 pt-0">
        <Link
          href={`/portfolio/${project.slug || project._id}`}
          className="block w-full py-3 px-6 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl transition-all duration-300 text-center"
        >
          Ver caso completo
        </Link>
      </div>
    </div>
  );
}