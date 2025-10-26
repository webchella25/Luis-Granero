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
}

interface Props {
  path: LearningPath;
}

export default function LearningPathDetail({ path }: Props) {
  const [completedArticles, setCompletedArticles] = useState<string[]>([]);

  const toggleArticleComplete = (articleId: string) => {
    setCompletedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const progress = path.articles.length > 0 
    ? Math.round((completedArticles.length / path.articles.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black pt-20">
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Icon */}
            <div className="text-6xl mb-6">{path.icon}</div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {path.title}
            </h1>
            
            {/* Description */}
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {path.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center space-x-2 text-gray-300">
                <ClockIcon className="w-5 h-5 text-cyan-400" />
                <span>{path.duration}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <DocumentTextIcon className="w-5 h-5 text-green-400" />
                <span>{path.articles.length} artículos</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <AcademicCapIcon className="w-5 h-5 text-purple-400" />
                <span>{path.level}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Tu progreso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Topics */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
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
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
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
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
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

              </div>
            </div>

            {/* Articles List */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Contenido de la ruta
                </h2>
                <p className="text-gray-400">
                  Sigue los artículos en orden para un aprendizaje óptimo
                </p>
              </div>

              <div className="space-y-4">
                {path.articles
                  .sort((a, b) => a.order - b.order)
                  .map((article, index) => {
                    const isCompleted = completedArticles.includes(article.postId._id);
                    
                    return (
                      <div
                        key={article.postId._id}
                        className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                      >
                        <div className="flex items-start space-x-4">
                          
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleArticleComplete(article.postId._id)}
                            className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                              isCompleted 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-600 hover:border-green-500'
                            }`}
                          >
                            {isCompleted && (
                              <CheckCircleIcon className="w-4 h-4 text-white" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs font-mono rounded">
                                {index + 1}/{path.articles.length}
                              </span>
                              {article.isRequired && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                                  REQUERIDO
                                </span>
                              )}
                              {article.postId.readTime && (
                                <span className="text-xs text-gray-500">
                                  {article.postId.readTime}
                                </span>
                              )}
                            </div>

                            <Link 
                              href={`/blog/${article.postId.slug}`}
                              className="block group-hover:text-purple-400 transition-colors"
                            >
                              <h3 className={`text-xl font-bold mb-2 ${
                                isCompleted ? 'text-gray-500 line-through' : 'text-white'
                              }`}>
                                {article.postId.title}
                              </h3>
                            </Link>

                            <p className="text-gray-400 text-sm mb-4">
                              {article.postId.excerpt}
                            </p>

                            <Link
                              href={`/blog/${article.postId.slug}`}
                              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
                            >
                              <BookOpenIcon className="w-4 h-4 mr-2" />
                              Leer artículo
                            </Link>
                          </div>

                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}