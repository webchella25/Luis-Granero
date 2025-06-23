// src/components/blog/LearningPaths.tsx
'use client';

import Link from 'next/link';

interface LearningPath {
  _id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  topics: string[];
  articles: any[];
  icon: string;
  color: string;
  enrollments: number;
}

interface Props {
  paths?: LearningPath[];
}

export default function LearningPaths({ paths = [] }: Props) {
  const defaultPaths: LearningPath[] = [
    {
      _id: '1',
      title: "React Developer Path",
      description: "De principiante a experto en React",
      duration: "8 semanas",
      level: "Principiante → Avanzado",
      topics: ["Fundamentos", "Hooks", "Context", "Performance", "Testing"],
      articles: Array(15).fill({}),
      icon: "⚛️",
      color: "#61DAFB",
      enrollments: 234
    },
    {
      _id: '2',
      title: "Next.js Full Stack",
      description: "Desarrollo completo con Next.js",
      duration: "6 semanas",
      level: "Intermedio → Avanzado",
      topics: ["SSR/SSG", "API Routes", "Database", "Auth", "Deploy"],
      articles: Array(12).fill({}),
      icon: "▲",
      color: "#000000",
      enrollments: 189
    },
    {
      _id: '3',
      title: "Performance Expert",
      description: "Optimización avanzada de aplicaciones",
      duration: "4 semanas",
      level: "Avanzado",
      topics: ["Bundle Analysis", "Core Web Vitals", "Monitoring", "Optimization"],
      articles: Array(8).fill({}),
      icon: "⚡",
      color: "#F59E0B",
      enrollments: 156
    }
  ];

  const displayPaths = paths.length > 0 ? paths : defaultPaths;

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Rutas de Aprendizaje
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Secuencias estructuradas de artículos para un aprendizaje progresivo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPaths.map((path) => (
            <div
              key={path._id}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{path.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {path.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {path.description}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">{path.duration}</div>
                  <div className="text-xs text-gray-500">Duración</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{path.articles.length}</div>
                  <div className="text-xs text-gray-500">Artículos</div>
                </div>
              </div>

              {/* Level */}
              <div className="text-center mb-4">
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                  Nivel: {path.level}
                </span>
              </div>

              {/* Topics */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3">Temas cubiertos:</h4>
                <div className="space-y-1">
                  {path.topics.slice(0, 5).map((topic, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-300">
                      <span className="text-green-400 mr-2">✓</span>
                      {topic}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/learning-paths/${path._id}`}
                className="block w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold rounded-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                Comenzar ruta
              </Link>

              {/* Enrollment count */}
              <div className="text-center mt-3">
                <span className="text-xs text-gray-500">
                  {path.enrollments} personas siguiendo esta ruta
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}