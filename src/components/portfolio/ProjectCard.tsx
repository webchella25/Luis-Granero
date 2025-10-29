// src/components/portfolio/ProjectCard.tsx - CON IMÁGENES
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  status: string;
  metrics?: Record<string, string>;
  features?: string[];
  images?: string[]; // 🔥 Array de imágenes
  image?: string;    // Imagen antigua (compatibilidad)
  isFeatured?: boolean;
  slug?: string;
  year?: string | number;
}

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const projectId = String(project._id);
  const projectSlug = project.slug || projectId;

  // 🔥 OBTENER IMAGEN PRINCIPAL
  const getMainImage = () => {
    if (project.images && project.images.length > 0) {
      return project.images[0];
    }
    return project.image || null;
  };

  const mainImage = getMainImage();

  return (
    <div className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105">
      
      {/* 🔥 IMAGEN DEL PROYECTO */}
      {mainImage && (
        <div className="relative h-64 w-full overflow-hidden bg-gray-800">
          <Image
            src={mainImage}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-60"></div>
          
          {/* Badge de Featured */}
          {project.isFeatured && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black px-3 py-1 rounded-full text-xs font-bold">
              ⭐ Destacado
            </div>
          )}
        </div>
      )}

      {/* Si no hay imagen, mostrar gradiente con emoji/letra */}
      {!mainImage && (
        <div className="relative h-64 w-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <span className="text-8xl opacity-50">
            {project.title.charAt(0)}
          </span>
          {project.isFeatured && (
            <div className="absolute top-4 right-4 bg-white text-cyan-600 px-3 py-1 rounded-full text-xs font-bold">
              ⭐ Destacado
            </div>
          )}
        </div>
      )}
      
      {/* Project content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
              {project.title}
            </h3>
            <p className="text-gray-500 text-sm">
              {project.category} • {project.year}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
            project.status === 'En producción' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : project.status === 'En desarrollo'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {project.status}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-800 text-cyan-400 rounded border border-gray-700"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded border border-gray-700">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Metrics */}
        {project.metrics && Object.keys(project.metrics).length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-800">
            {Object.entries(project.metrics)
              .filter(([_, value]) => value)
              .slice(0, 3)
              .map(([key, value], index) => (
                <div key={index} className="text-center">
                  <p className="text-cyan-400 font-bold text-sm">{value}</p>
                  <p className="text-gray-500 text-xs capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* CTA Button */}
        <Link
          href={`/portfolio/${projectSlug}`}
          className="block w-full text-center py-3 px-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-500/50 transition-all duration-300 font-semibold"
        >
          Ver caso completo →
        </Link>
      </div>
    </div>
  );
}