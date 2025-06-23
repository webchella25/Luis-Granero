// src/components/blog/RelatedPosts.tsx
'use client';

import Link from 'next/link';

interface RelatedPost {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishDate: string;
  slug: string;
  difficulty: string;
}

interface Props {
  posts: RelatedPost[];
  currentCategory: string;
}

export default function RelatedPosts({ posts, currentCategory }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Artículos Relacionados
            </h2>
            <p className="text-gray-400">
              Más contenido sobre {currentCategory}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(0, 3).map((post) => (
              <article
                key={post._id}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-cyan-400 text-sm font-semibold">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 text-xs">
                      {new Date(post.publishDate).toLocaleDateString('es-ES')}
                    </span>
                    <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                      {post.difficulty}
                    </span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="block w-full py-2 px-4 bg-gradient-to-r from-cyan-500/20 to-green-500/20 border border-cyan-500/30 text-cyan-400 font-semibold rounded-lg hover:bg-gradient-to-r hover:from-cyan-500 hover:to-green-500 hover:text-black transition-all duration-300 text-center text-sm"
                  >
                    Leer artículo
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>Ver todos los artículos</span>
              <span>→</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}