// src/components/blog/FeaturedPost.tsx
'use client';

import Link from 'next/link';

interface FeaturedPostData {
  _id?: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTime: string;
  publishDate: string;
  slug: string;
  difficulty?: string;
}

interface Props {
  post?: FeaturedPostData | null;
}

export default function FeaturedPost({ post }: Props) {
  // Post por defecto si no hay datos
  const defaultPost: FeaturedPostData = {
    title: "Core Web Vitals: Optimización completa para 2025",
    excerpt: "Todo lo que necesitas saber sobre LCP, FID, CLS y las nuevas métricas INP. Técnicas prácticas con ejemplos reales para mejorar el rendimiento web.",
    category: "Performance",
    tags: ["Performance", "Core Web Vitals", "SEO", "UX"],
    readTime: "15 min",
    publishDate: "8 Enero 2025",
    slug: "core-web-vitals-optimizacion-2025",
    difficulty: "Intermedio"
  };

  const featuredPost = post || defaultPost;

  if (!featuredPost) return null;

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-8">
            <span className="bg-gradient-to-r from-cyan-400 to-green-400 text-black text-sm font-bold px-4 py-2 rounded-full">
              ARTÍCULO DESTACADO
            </span>
          </div>

          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 lg:p-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Content */}
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-cyan-400 font-semibold text-sm">
                    {featuredPost.category}
                  </span>
                  {featuredPost.difficulty && (
                    <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-2 py-1 rounded">
                      {featuredPost.difficulty}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-6">
                  {featuredPost.title}
                </h2>

                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-8">
                  <span>{featuredPost.readTime} de lectura</span>
                  <span>{featuredPost.publishDate}</span>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105"
                >
                  <span>Leer artículo completo</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Visual element */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-green-500/20 rounded-2xl flex items-center justify-center">
                    <div className="text-6xl">📚</div>
                  </div>
                  
                  {/* Tags floating */}
                  <div className="absolute -top-4 -right-4 bg-gray-900 border border-cyan-500/30 rounded-lg p-2">
                    <span className="text-cyan-400 text-xs font-mono">#{featuredPost.tags[0]}</span>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 bg-gray-900 border border-green-500/30 rounded-lg p-2">
                    <span className="text-green-400 text-xs font-mono">#{featuredPost.tags[1]}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* All tags */}
            <div className="mt-8 pt-8 border-t border-gray-700">
              <div className="flex flex-wrap gap-2">
                {featuredPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-full border border-gray-700 hover:border-cyan-500/50 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}