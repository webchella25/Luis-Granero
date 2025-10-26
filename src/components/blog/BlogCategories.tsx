// src/components/blog/BlogCategories.tsx
'use client';

import Link from 'next/link';

interface Category {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  posts: number;
  trending: boolean;
  topics: string[];
}

interface LearningPath {
  title: string;
  description: string;
  duration: string;
  articles: number;
  difficulty: string;
  topics: string[];
}

interface Props {
  data?: {
    categories?: Category[];
    learningPaths?: LearningPath[];
  };
}

export default function BlogCategories({ data }: Props) {
  
  const defaultCategories: Category[] = [
    {
      name: "React & Next.js",
      slug: "react",
      description: "Frameworks modernos de JavaScript",
      icon: "⚛️",
      color: "from-cyan-400 to-blue-500",
      posts: 12,
      trending: true,
      topics: ["Hooks", "SSR", "Performance", "Best Practices"]
    },
    {
      name: "JavaScript/TypeScript",
      slug: "javascript",
      description: "Fundamentos y características avanzadas",
      icon: "📜",
      color: "from-yellow-400 to-orange-500",
      posts: 8,
      trending: false,
      topics: ["ES6+", "Async/Await", "Types", "Patterns"]
    },
    {
      name: "Frontend",
      slug: "frontend",
      description: "UI/UX, CSS, animaciones y más",
      icon: "🎨",
      color: "from-purple-400 to-pink-500",
      posts: 10,
      trending: false,
      topics: ["CSS", "Tailwind", "Responsive", "Animations"]
    },
    {
      name: "Backend",
      slug: "backend",
      description: "APIs, bases de datos y arquitectura",
      icon: "⚙️",
      color: "from-green-400 to-emerald-500",
      posts: 6,
      trending: true,
      topics: ["Node.js", "APIs REST", "MongoDB", "Authentication"]
    },
    {
      name: "Performance",
      slug: "performance",
      description: "Optimización y mejores prácticas",
      icon: "⚡",
      color: "from-orange-400 to-red-500",
      posts: 7,
      trending: false,
      topics: ["Lighthouse", "Web Vitals", "Caching", "Optimization"]
    },
    {
      name: "DevOps",
      slug: "devops",
      description: "Deployment, CI/CD y automatización",
      icon: "🚀",
      color: "from-indigo-400 to-pink-500",
      posts: 5,
      trending: false,
      topics: ["CI/CD", "Docker", "GitHub Actions", "Monitoring"]
    }
  ];

  // Usar datos del prop o fallback
  const displayCategories = data?.categories || defaultCategories;

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        
        {/* Categories section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Categorías
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Contenido organizado por temas para que encuentres exactamente lo que necesitas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCategories.map((category, index) => (
              <Link
                key={index}
                href={`/blog?category=${category.slug}`}
                className="group bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`text-4xl`}>{category.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {category.name}
                      </h3>
                      {category.trending && (
                        <span className="text-xs text-orange-400 font-semibold">
                          🔥 Trending
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 font-mono">
                    {category.posts} posts
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4">
                  {category.description}
                </p>

                {/* Topics */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {category.topics.map((topic, topicIndex) => (
                      <span
                        key={topicIndex}
                        className="text-xs px-2 py-1 rounded border border-gray-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="mt-6">
                  <button className="w-full py-2 px-4 border border-gray-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-400 rounded-lg transition-colors text-sm font-medium">
                    Explorar {category.name}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA to Cursos */}
        <div className="mt-20">
          <div className="relative bg-gradient-to-br from-purple-900/30 via-gray-900/50 to-cyan-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-12 overflow-hidden">
            
            {/* Background effects */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <div className="text-5xl mb-6">🎓</div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Prefieres aprender paso a paso?
              </h3>
              <p className="text-lg text-gray-300 mb-8">
                Descubre nuestras <strong className="text-purple-400">Rutas de Aprendizaje</strong>: 
                secuencias estructuradas de artículos diseñadas para llevarte de principiante a experto.
              </p>
              
              {/* Features list */}
              <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Contenido ordenado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Proyectos reales</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>100% gratis</span>
                </div>
              </div>

              {/* Button */}
              <Link
                href="/cursos"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Explorar rutas de aprendizaje →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}