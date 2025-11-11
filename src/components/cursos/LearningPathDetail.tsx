// src/components/cursos/LearningPathDetail.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ClockIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  BookOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import CourseProgress from '@/components/courses/CourseProgress';

interface Article {
  postId: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    readTime?: string;
  };
  order: number;
  isRequired: boolean;
}

interface LearningPath {
  _id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  topics: string[];
  prerequisites: string[];
  learningObjectives: string[];
  articles: Article[];
  icon: string;
  enrollments?: number;
  slug: string;
}

interface Props {
  path: LearningPath;
}

export default function LearningPathDetail({ path }: Props) {
  const [completedArticles, setCompletedArticles] = useState<string[]>([]);

  const handleArticleComplete = (data: any) => {
    console.log('✅ Artículo completado:', data);
    // Aquí podrías actualizar el estado local o refrescar datos
  };

  const progress = path.articles.length > 0 
    ? Math.round((completedArticles.length / path.articles.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black">
      
      {/* Content Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Topics */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Temas principales
                  </h3>
                  <div className="space-y-2">
                    {path.topics.map((topic, index) => (
                      <div key={index} className="flex items-center text-gray-300">
                        <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        <span className="text-sm">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prerequisites */}
                {path.prerequisites && path.prerequisites.length > 0 && (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <span className="mr-2">📚</span>
                      Prerrequisitos
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      {path.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Learning Objectives */}
                {path.learningObjectives && path.learningObjectives.length > 0 && (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <span className="mr-2">🎓</span>
                      Objetivos de aprendizaje
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      {path.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-cyan-400">✓</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stats Card */}
                <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    📊 Estadísticas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Total lecciones</span>
                      <span className="text-white font-bold">{path.articles.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Duración</span>
                      <span className="text-cyan-400 font-bold">{path.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Nivel</span>
                      <span className="text-purple-400 font-bold">{path.level}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Articles List */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2" id="articles">
                  Contenido de la ruta
                </h2>
                <p className="text-gray-400">
                  {path.articles.length} lecciones • Sigue el orden para un aprendizaje óptimo
                </p>
              </div>

              <div className="space-y-6">
                {path.articles
                  .sort((a, b) => a.order - b.order)
                  .map((article, index) => {
                    return (
                      <div
                        key={article.postId._id}
                        className="group bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300"
                      >
                        {/* Article Content */}
                        <div className="p-6">
                          <div className="flex items-start space-x-4">
                            
                            {/* Number Badge */}
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                                <span className="text-cyan-400 font-bold text-lg">
                                  {index + 1}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs font-mono rounded">
                                  Lección {index + 1} de {path.articles.length}
                                </span>
                                
                                {article.isRequired && (
                                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded border border-red-500/30">
                                    ⚡ REQUERIDO
                                  </span>
                                )}
                                
                                {article.postId.readTime && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <ClockIcon className="w-3 h-3" />
                                    {article.postId.readTime}
                                  </span>
                                )}
                              </div>

                              <Link 
                                href={`/blog/${article.postId.slug}`}
                                className="block group-hover:text-cyan-400 transition-colors"
                              >
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                  {article.postId.title}
                                </h3>
                              </Link>

                              <p className="text-gray-400 text-sm md:text-base mb-4 leading-relaxed">
                                {article.postId.excerpt}
                              </p>

                              <Link
                                href={`/blog/${article.postId.slug}`}
                                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                              >
                                <BookOpenIcon className="w-4 h-4" />
                                Leer artículo
                                <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                              </Link>
                            </div>

                          </div>
                        </div>

                        {/* 🔥 COMPONENTE DE PROGRESO */}
                        <div className="border-t border-gray-800 bg-gray-900/30 p-4">
                          <CourseProgress
                            courseId={path._id}
                            courseSlug={path.slug}
                            articleId={article.postId._id}
                            onComplete={handleArticleComplete}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Completion Message */}
              {path.articles.length === 0 && (
                <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <DocumentTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Aún no hay lecciones en esta ruta de aprendizaje
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}