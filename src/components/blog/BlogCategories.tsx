// src/components/blog/BlogCategories.tsx
'use client';

interface CategoryData {
  name: string;
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
  categories?: string[];
  data?: {
    categories?: CategoryData[];
    learningPaths?: LearningPath[];
  };
}

export default function BlogCategories({ categories = [], data }: Props) {
  // Datos por defecto
  const defaultCategories: CategoryData[] = [
    {
      name: "React & Hooks",
      description: "Tutoriales avanzados sobre React 18+, custom hooks, patterns y optimizaciones",
      icon: "⚛️",
      color: "from-cyan-400 to-blue-500",
      posts: 12,
      trending: true,
      topics: ["Custom Hooks", "Performance", "Patterns", "State Management"]
    },
    {
      name: "Next.js",
      description: "Guías completas sobre Next.js 14, App Router, SSR, SSG y deployment",
      icon: "▲",
      color: "from-gray-400 to-gray-600",
      posts: 8,
      trending: true,
      topics: ["App Router", "API Routes", "Middleware", "Deployment"]
    },
    {
      name: "Performance Web",
      description: "Optimización de aplicaciones, Core Web Vitals, bundle analysis y monitoring",
      icon: "⚡",
      color: "from-yellow-400 to-orange-500",
      posts: 10,
      trending: false,
      topics: ["Core Web Vitals", "Bundle Size", "Lazy Loading", "Caching"]
    },
    {
      name: "TypeScript",
      description: "TypeScript para React, tipos avanzados, generics y mejores prácticas",
      icon: "🔷",
      color: "from-blue-400 to-indigo-500",
      posts: 6,
      trending: true,
      topics: ["React Types", "Generics", "Utility Types", "Strict Mode"]
    },
    {
      name: "SEO Técnico",
      description: "SEO moderno, structured data, meta tags dinámicos y Core Web Vitals",
      icon: "📈",
      color: "from-green-400 to-emerald-500",
      posts: 7,
      trending: false,
      topics: ["Structured Data", "Meta Tags", "Sitemaps", "Analytics"]
    },
    {
      name: "DevOps & Deploy",
      description: "CI/CD, Docker, GitHub Actions, Vercel, AWS y automatización de deployments",
      icon: "🚀",
      color: "from-purple-400 to-pink-500",
      posts: 5,
      trending: false,
      topics: ["CI/CD", "Docker", "GitHub Actions", "Monitoring"]
    }
  ];

  const defaultLearningPaths: LearningPath[] = [
    {
      title: "React Developer Path",
      description: "De principiante a experto en React",
      duration: "8 semanas",
      articles: 15,
      difficulty: "Principiante → Avanzado",
      topics: ["Fundamentos", "Hooks", "Context", "Performance", "Testing"]
    },
    {
      title: "Next.js Full Stack",
      description: "Desarrollo completo con Next.js",
      duration: "6 semanas", 
      articles: 12,
      difficulty: "Intermedio → Avanzado",
      topics: ["SSR/SSG", "API Routes", "Database", "Auth", "Deploy"]
    },
    {
      title: "Performance Expert",
      description: "Optimización avanzada de aplicaciones",
      duration: "4 semanas",
      articles: 8,
      difficulty: "Avanzado",
      topics: ["Bundle Analysis", "Core Web Vitals", "Monitoring", "Optimization"]
    }
  ];

  // Usar datos del prop o fallback
  const displayCategories = data?.categories || defaultCategories;
  const learningPaths = data?.learningPaths || defaultLearningPaths;

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
              <div
                key={index}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className={`text-lg font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                        {category.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{category.posts} artículos</span>
                        {category.trending && (
                          <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">
                            🔥 Trending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {category.description}
                </p>

                {/* Topics */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Temas principales
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.topics.map((topic, topicIndex) => (
                      <span
                        key={topicIndex}
                        className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700"
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
              </div>
            ))}
          </div>
        </div>

        {/* Learning Paths section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Rutas de Aprendizaje
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Secuencias estructuradas de artículos para un aprendizaje progresivo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {learningPaths.map((path, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {path.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {path.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-cyan-400">{path.duration}</div>
                    <div className="text-xs text-gray-500">Duración</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{path.articles}</div>
                    <div className="text-xs text-gray-500">Artículos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">{path.difficulty.split(' → ')[0]}</div>
                    <div className="text-xs text-gray-500">Nivel</div>
                  </div>
                </div>

                {/* Topics */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Aprenderás
                  </div>
                  <div className="space-y-2">
                    {path.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center space-x-2">
                        <span className="text-green-400 text-xs">✓</span>
                        <span className="text-gray-300 text-sm">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <button className="w-full py-3 px-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-semibold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300">
                  Comenzar ruta
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}