'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Eye, Tag, Twitter, Linkedin } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import { useEffect, useState } from 'react';

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

const difficultyStyle = (d: string) => {
  switch (d?.toLowerCase()) {
    case 'principiante': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'intermedio':   return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'avanzado':     return 'bg-red-500/15 text-red-400 border-red-500/30';
    default:             return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
};

export default function BlogPost({ post }: Props) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const convert = async () => {
      const html = await marked.parse(post.content, { breaks: true, gfm: true });
      setHtmlContent(DOMPurify.sanitize(html));
    };
    convert();
  }, [post.content]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <article className="bg-[#0F172A] pt-28 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-10">
            <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-slate-400 truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="badge badge-cyan">{post.category}</span>
              {post.difficulty && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyStyle(post.difficulty)}`}>
                  {post.difficulty}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-50 leading-tight tracking-tight mb-6">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-slate-400 leading-relaxed mb-8 border-l-4 border-cyan-500/40 pl-4">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {post.views} vistas
              </div>
              <span>{formatDate(post.publishDate)}</span>
            </div>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 font-bold text-sm">LG</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">{post.author?.name || 'Luis Granero'}</div>
                <div className="text-xs text-slate-500">Desarrollador Web Full Stack</div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div
            className="
              prose prose-lg prose-invert max-w-none

              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-50
              prose-headings:scroll-mt-20

              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h2:pb-3 prose-h2:border-b prose-h2:border-slate-800

              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-slate-100

              prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2 prose-h4:text-slate-200

              prose-p:text-slate-300 prose-p:leading-[1.85] prose-p:my-5

              prose-a:text-cyan-400 prose-a:no-underline prose-a:font-medium
              hover:prose-a:text-cyan-300 hover:prose-a:underline

              prose-strong:text-slate-100 prose-strong:font-semibold

              prose-em:text-slate-300

              prose-code:text-cyan-300 prose-code:bg-slate-800 prose-code:px-1.5
              prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-code:before:content-none prose-code:after:content-none

              prose-pre:bg-[#0D1526] prose-pre:border prose-pre:border-slate-700/50
              prose-pre:rounded-xl prose-pre:shadow-xl prose-pre:my-8
              prose-pre:overflow-x-auto

              prose-ul:my-5 prose-ul:text-slate-300
              prose-ol:my-5 prose-ol:text-slate-300
              prose-li:my-1.5 prose-li:leading-relaxed

              prose-blockquote:border-l-4 prose-blockquote:border-cyan-500
              prose-blockquote:bg-cyan-500/5 prose-blockquote:rounded-r-lg
              prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:my-8
              prose-blockquote:text-slate-300 prose-blockquote:not-italic

              prose-hr:border-slate-800 prose-hr:my-10

              prose-img:rounded-xl prose-img:border prose-img:border-slate-700/50
              prose-img:shadow-xl prose-img:my-8

              prose-table:border-collapse
              prose-th:bg-slate-800 prose-th:text-slate-200 prose-th:px-4 prose-th:py-3
              prose-th:border prose-th:border-slate-700
              prose-td:text-slate-300 prose-td:px-4 prose-td:py-3
              prose-td:border prose-td:border-slate-800
            "
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-14 pt-8 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500 font-medium">Etiquetas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <Link
                    key={i}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 text-sm bg-slate-800 text-slate-400 rounded-full border border-slate-700 hover:border-cyan-500/50 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-10 pt-8 border-t border-slate-800">
            <p className="text-sm text-slate-500 mb-4 text-center">¿Te ha resultado útil? Compártelo</p>
            <div className="flex justify-center gap-3">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </div>
          </div>

        </div>
      </div>
    </article>
  );
}
