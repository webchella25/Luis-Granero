// src/components/cursos/LearningPathsGrid.tsx
'use client';

import Link from 'next/link';
import { 
  ClockIcon, 
  DocumentTextIcon, 
  AcademicCapIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';

interface LearningPath {
  _id: string;
  slug: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  topics: string[];
  articles: any[];
  icon: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  enrollments?: number;
}

interface Props {
  paths: LearningPath[];
  featured?: boolean;
}

export default function LearningPathsGrid({ paths, featured = false }: Props) {
  
  if (paths.length === 0) {
    return (
      <div className="text-center py-20">
        <AcademicCapIcon className="w-20 h-20 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">
          {featured ? 'No hay rutas destacadas disponibles' : 'No hay rutas disponibles aún'}
        </p>
        <Link 
          href="/blog" 
          className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block"
        >
          Explorar artículos del blog →
        </Link>
      </div>
    );
  }

  // Mapeo de niveles a colores
  const getLevelColor = (level: string) => {
    if (level.toLowerCase().includes('principiante')) return 'text-green-400 border-green-400';
    if (level.toLowerCase().includes('intermedio')) return 'text-yellow-400 border-yellow-400';
    if (level.toLowerCase().includes('avanzado')) return 'text-red-400 border-red-400';
    return 'text-gray-400 border-gray-400';
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${featured ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8`}>
      {paths.map((path) => (
        <Link 
          key={path._id}
          href={`/cursos/${path.slug}`}
          className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
        >
          
          {/* Badge premium */}
          {path.isPremium && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
                💎 PREMIUM
              </span>
            </div>
          )}

          {/* Badge featured */}
          {path.isFeatured && !featured && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500 text-purple-400 text-xs font-bold rounded-full">
                ⭐ DESTACADA
              </span>
            </div>
          )}
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">{path.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              {path.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {path.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-700">
            <div className="text-center">
              <ClockIcon className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{path.duration}</div>
              <div className="text-xs text-gray-500">Duración estimada</div>
            </div>
            <div className="text-center">
              <DocumentTextIcon className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{path.articles?.length || 0}</div>
              <div className="text-xs text-gray-500">Artículos</div>
            </div>
          </div>

          {/* Level */}
          <div className="flex justify-center mb-4">
            <span className={`px-3 py-1 border rounded-full text-xs font-semibold ${getLevelColor(path.level)}`}>
              {path.level}
            </span>
          </div>

          {/* Topics */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Temas principales:
            </h4>
            <div className="flex flex-wrap gap-2">
              {path.topics.slice(0, 4).map((topic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-800 text-cyan-400 text-xs rounded border border-slate-700"
                >
                  {topic}
                </span>
              ))}
              {path.topics.length > 4 && (
                <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded border border-slate-700">
                  +{path.topics.length - 4} más
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-auto">
            <div className="w-full py-3 px-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-400 font-bold rounded-lg group-hover:from-purple-500 group-hover:to-cyan-500 group-hover:text-white transition-all duration-300 text-center">
              Comenzar ruta →
            </div>
          </div>

          {/* Enrollment count */}
          {path.enrollments && path.enrollments > 0 && (
            <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
              <UserGroupIcon className="w-4 h-4 mr-1" />
              {path.enrollments} personas siguiendo esta ruta
            </div>
          )}

        </Link>
      ))}
    </div>
  );
}