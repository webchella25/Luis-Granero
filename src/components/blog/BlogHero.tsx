// src/components/blog/BlogHero.tsx
'use client';

interface BlogHeroData {
  title?: string;
  subtitle?: string;
  description?: string;
  stats?: {
    totalPosts?: number;
    categories?: number;
    totalViews?: string;
    avgReadTime?: string;
  };
}

interface Props {
  totalPosts?: number;
  data?: BlogHeroData;
}

export default function BlogHero({ totalPosts = 0, data }: Props) {
  // Datos por defecto
  const defaultData: BlogHeroData = {
    title: "Blog de Desarrollo Web",
    subtitle: "Artículos técnicos, tutoriales y casos de estudio reales",
    description: "Aprende desarrollo moderno con React, Next.js, TypeScript y las mejores prácticas de la industria.",
    stats: {
      totalPosts: totalPosts,
      categories: 8,
      totalViews: "50K+",
      avgReadTime: "8 min"
    }
  };

  const heroContent = {
    ...defaultData,
    ...data,
    stats: {
      ...defaultData.stats,
      ...data?.stats,
      totalPosts: totalPosts || data?.stats?.totalPosts || 0
    }
  };

  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Main content */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">{heroContent.title}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              {heroContent.subtitle}
            </p>
            
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-12">
              {heroContent.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
                Explorar artículos
              </button>
              <button className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold rounded-lg transition-all duration-300">
                Suscribirse al newsletter
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                {heroContent.stats.totalPosts}
              </div>
              <div className="text-gray-400">Artículos</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">
                {heroContent.stats.categories}
              </div>
              <div className="text-gray-400">Categorías</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                {heroContent.stats.totalViews}
              </div>
              <div className="text-gray-400">Lecturas</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                {heroContent.stats.avgReadTime}
              </div>
              <div className="text-gray-400">Promedio</div>
            </div>
          </div>

          {/* Featured topics */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center text-white mb-8">
              Temas destacados
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: "React 18", color: "from-cyan-400 to-blue-500" },
                { name: "Next.js 15", color: "from-gray-400 to-gray-600" },
                { name: "TypeScript", color: "from-blue-400 to-indigo-500" },
                { name: "Performance", color: "from-yellow-400 to-orange-500" },
                { name: "SEO Técnico", color: "from-green-400 to-emerald-500" },
                { name: "DevOps", color: "from-purple-400 to-pink-500" }
              ].map((topic, index) => (
                <span
                  key={index}
                  className={`px-4 py-2 bg-gradient-to-r ${topic.color} bg-clip-text text-transparent font-semibold border border-gray-700 rounded-lg hover:border-gray-500 transition-colors cursor-pointer`}
                >
                  {topic.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}