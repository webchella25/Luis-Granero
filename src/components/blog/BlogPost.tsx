// src/components/blog/BlogPost.tsx
'use client';

import Link from 'next/link';
import { ArrowLeftIcon, ClockIcon, EyeIcon, TagIcon } from '@heroicons/react/24/outline';
import DOMPurify from 'isomorphic-dompurify';

interface BlogPostData {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  readTime: string;
  publishDate: string;
  views: number;
  difficulty: string;
  author?: {
    name: string;
    avatar?: string;
  };
}

interface Props {
  post: BlogPostData;
}

export default function BlogPost({ post }: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'principiante':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermedio':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'avanzado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <article className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Volver al blog</span>
            </Link>
          </div>

          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                {post.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm border ${getDifficultyColor(post.difficulty)}`}>
                {post.difficulty}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                {post.excerpt}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <EyeIcon className="w-4 h-4" />
                <span>{post.views} vistas</span>
              </div>
              <span>{formatDate(post.publishDate)}</span>
            </div>

            {/* Author info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-green-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">LG</span>
              </div>
              <div>
                <div className="text-white font-semibold">
                  {post.author?.name || 'Luis Granero'}
                </div>
                <div className="text-gray-400 text-sm">
                  Desarrollador Web Full Stack
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg prose-invert max-w-none">
            <div
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex items-center space-x-4 mb-4">
              <TagIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 font-semibold">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full border border-gray-700 hover:border-cyan-500/50 transition-colors text-sm"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Share buttons (opcional) */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                ¿Te gustó este artículo?
              </h3>
              <div className="flex justify-center space-x-4">
                <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
                  Compartir en Twitter
                </button>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Compartir en LinkedIn
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </article>
  );
}