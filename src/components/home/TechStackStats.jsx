// src/components/home/TechStackStats.jsx
'use client';

import { useState, useEffect } from 'react';

export default function TechStackStats() {
  const [techStack, setTechStack] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTechStack() {
      try {
        const response = await fetch('/api/homepage');
        const data = await response.json();
        setTechStack(data.techStack || []);
      } catch (error) {
        console.error('Error fetching tech stack:', error);
        // Fallback a tecnologías por defecto
        setTechStack([
          { name: "React", category: "frontend", level: 95 },
          { name: "Next.js", category: "frontend", level: 90 },
          { name: "TypeScript", category: "frontend", level: 85 },
          { name: "Node.js", category: "backend", level: 88 },
          { name: "MongoDB", category: "database", level: 80 },
          { name: "Tailwind", category: "frontend", level: 90 }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchTechStack();
  }, []);

  const mainTechnologies = techStack.slice(0, 6);

  if (loading) {
    return (
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-12"></div>
            <div className="flex justify-center items-center space-x-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-16 h-16 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        
        {/* Tech Stack visual */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-8">
            Stack Tecnológico
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Tecnologías modernas para crear soluciones robustas y escalables
          </p>
          
          {/* Logos en línea */}
          <div className="flex justify-center items-center space-x-6 md:space-x-12 flex-wrap gap-y-8">
            {mainTechnologies.map((tech, index) => (
              <div
                key={tech._id || index}
                className="group flex flex-col items-center"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-center group-hover:border-cyan-500/50 transition-all duration-300 group-hover:scale-110">
                  <span className="text-2xl md:text-3xl font-bold text-gray-400 group-hover:text-cyan-400 transition-colors">
                    {tech.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-gray-500 mt-2 group-hover:text-gray-300 transition-colors">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Availability status */}
        <div className="flex justify-center mt-12">
          <div className="inline-flex flex-col items-center">
            <div className="flex items-center space-x-3 bg-green-900/20 border border-green-500/30 rounded-full px-6 py-4 mb-4">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold text-lg">
                Disponible para nuevos proyectos
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="text-xl">⚡</span>
                <span>Respuesta en 24 horas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">💬</span>
                <span>Consulta gratuita</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">🚀</span>
                <span>Inicio inmediato</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}