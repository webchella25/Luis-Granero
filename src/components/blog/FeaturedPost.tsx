// src/components/blog/FeaturedPost.tsx
'use client';

import Link from 'next/link';
import { ClockIcon, EyeIcon } from '@heroicons/react/24/outline';

interface FeaturedPostData {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishDate: string;
  views: number;
  slug: string;
  featured: boolean;
}

interface Props {
  post: FeaturedPostData;
}

export default function FeaturedPost({ post }: Props) {
  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Artículo Destacado
            </h2>
            <p className="text-gray-400">
              El contenido más popular esta semana
            </p>
          </div>

          <article className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-400/50 transition-all duration-300">
            
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                    {post.category}
                  </span>
                  <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                    ⭐ Destacado
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 hover:text-cyan-400 transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-gray-400">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm">{post.readTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="w-4 h-4" />
                      <span className="text-sm">{post.views} vistas</span>
                    </div>
                    <span className="text-sm">
                      {new Date(post.publishDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-semibold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Leer artículo
                  </Link>
                </div>
              </div>

              {/* Sidebar info */}
              <div className="lg:w-80">
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">
                    Sobre este artículo
                  </h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex justify-between">
                      <span>Categoría:</span>
                      <span className="text-cyan-400">{post.category}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Tiempo de lectura:</span>
                      <span>{post.readTime}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Vistas:</span>
                      <span>{post.views}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Publicado:</span>
                      <span>{new Date(post.publishDate).toLocaleDateString('es-ES')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}