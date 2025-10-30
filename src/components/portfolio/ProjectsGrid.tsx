// src/components/portfolio/ProjectsGrid.tsx - ACTUALIZADO
'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProjectCard from './ProjectCard'; // 🔥 IMPORTANTE: Import del ProjectCard

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  status: string;
  metrics?: Record<string, string>;
  features?: string[];
  images?: string[]; // 🔥 Array de imágenes
  image?: string;    // Imagen antigua
  isFeatured?: boolean;
  slug?: string;
  year?: string | number;
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
    { id: 'ecommerce', name: 'E-commerce', count: 0 },
    { id: 'webapp', name: 'Web Apps', count: 0 },
    { id: 'dashboard', name: 'Dashboards', count: 0 },
    { id: 'landing', name: 'Landing Pages', count: 0 }
  ];

  const finalCategories = categories.length > 1 ? categories : defaultCategories;

  // Filtrar proyectos por categoría
  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => 
        project.category?.toLowerCase() === selectedCategory.toLowerCase()
      );

  // MOSTRAR MENSAJE SI NO HAY PROYECTOS
  if (projects.length === 0) {
    return (
      <section id="projects" className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Portfolio
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Próximamente casos de estudio detallados de proyectos reales.
            </p>
            
            <div className="max-w-md mx-auto bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <div className="text-6xl mb-4">📂</div>
              <p className="text-gray-300 mb-6">
                Actualmente no hay proyectos publicados en el portfolio.
              </p>
              <Link
                href="/contacto"
                className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105"
              >
                Conversemos sobre tu proyecto
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 bg-gray-950">
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

        {/* 🔥 PROJECTS GRID CON PROJECTCARD */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={String(project._id)} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">
              No hay proyectos en esta categoría aún.
            </p>
          </div>
        )}

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