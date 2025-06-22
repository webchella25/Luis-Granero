// src/components/home/TechStack.tsx
'use client';

import { useState } from 'react';

interface Technology {
  name: string;
  level: number;
  color: string;
  category?: string;
}

interface Props {
  data?: Technology[];
}

export default function TechStack({ data }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Tech stack por defecto
  const defaultTechStack: Technology[] = [
    { name: "React", level: 95, color: "#61DAFB", category: "frontend" },
    { name: "Next.js", level: 90, color: "#000000", category: "frontend" },
    { name: "TypeScript", level: 85, color: "#3178C6", category: "frontend" },
    { name: "Node.js", level: 80, color: "#339933", category: "backend" },
    { name: "MongoDB", level: 75, color: "#47A248", category: "backend" },
    { name: "Tailwind CSS", level: 90, color: "#06B6D4", category: "frontend" },
    { name: "Python", level: 70, color: "#3776AB", category: "backend" },
    { name: "Docker", level: 65, color: "#2496ED", category: "tools" }
  ];

  const techStack = data || defaultTechStack;

  const categories = [
    { id: 'all', name: 'Todas', count: techStack.length },
    { id: 'frontend', name: 'Frontend', count: techStack.filter(t => t.category === 'frontend').length },
    { id: 'backend', name: 'Backend', count: techStack.filter(t => t.category === 'backend').length },
    { id: 'tools', name: 'Herramientas', count: techStack.filter(t => t.category === 'tools').length }
  ];

  const filteredTech = selectedCategory === 'all' 
    ? techStack 
    : techStack.filter(tech => tech.category === selectedCategory);

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Stack Tecnológico
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Tecnologías modernas que utilizo para crear soluciones robustas y escalables.
            Siempre actualizado con las últimas tendencias del desarrollo web.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Tech grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTech.map((tech, index) => (
            <div
              key={tech.name}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Tech name */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{tech.name}</h3>
                <span className="text-sm text-gray-400">{tech.level}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className="h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${tech.level}%`,
                    backgroundColor: tech.color,
                    boxShadow: `0 0 10px ${tech.color}40`
                  }}
                />
              </div>

              {/* Category badge */}
              {tech.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 capitalize">
                  {tech.category}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Experience note */}
        <div className="text-center mt-16">
          <p className="text-gray-400 text-lg">
            <span className="text-cyan-400 font-semibold">10+ años</span> de experiencia 
            combinando estas tecnologías para crear{' '}
            <span className="text-green-400 font-semibold">soluciones excepcionales</span>
          </p>
        </div>
      </div>
    </section>
  );
}