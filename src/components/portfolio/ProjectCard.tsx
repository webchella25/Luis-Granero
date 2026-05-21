'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Rocket, ExternalLink } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  status: string;
  metrics?: Record<string, string>;
  features?: string[];
  images?: string[];
  image?: string;
  isFeatured?: boolean;
  isOwnProject?: boolean;
  slug?: string;
  year?: string | number;
  urls?: { live?: string; github?: string };
}

interface Props {
  project: Project;
  isOwn?: boolean;
}

const CATEGORY_LABEL: Record<string, string> = {
  saas: 'SaaS',
  ecommerce: 'E-commerce',
  webapp: 'Web App',
  dashboard: 'Dashboard',
  landing: 'Landing',
  api: 'API',
  mobile: 'Mobile',
};

export default function ProjectCard({ project, isOwn = false }: Props) {
  const slug = project.slug || String(project._id);
  const mainImage = project.images?.[0] || project.image || null;
  const catLabel = CATEGORY_LABEL[project.category] || project.category;

  return (
    <div className={`group relative bg-[#1E293B] border rounded-xl overflow-hidden transition-all duration-200 ${
      isOwn
        ? 'border-cyan-500/20 hover:border-cyan-500/50'
        : 'border-slate-700/50 hover:border-slate-600'
    }`}>

      {/* Badge proyecto propio */}
      {isOwn && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/15 border border-cyan-500/30 rounded-full backdrop-blur-sm">
          <Rocket className="w-3 h-3 text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400">Producto propio</span>
        </div>
      )}

      {/* Imagen */}
      {mainImage ? (
        <div className="relative h-52 w-full overflow-hidden bg-slate-800">
          <Image
            src={mainImage}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-transparent to-transparent" />
        </div>
      ) : (
        <div className={`relative h-52 w-full flex items-center justify-center ${
          isOwn
            ? 'bg-gradient-to-br from-cyan-900/40 to-slate-800'
            : 'bg-gradient-to-br from-slate-800 to-slate-900'
        }`}>
          <span className="text-7xl font-bold text-slate-700 select-none">
            {project.title.charAt(0)}
          </span>
        </div>
      )}

      {/* Contenido */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-500 font-mono">{catLabel}</span>
              {project.year && <span className="text-xs text-slate-600">· {project.year}</span>}
            </div>
            <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors leading-snug">
              {project.title}
            </h3>
          </div>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${
            project.status === 'En producción'
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : project.status === 'En desarrollo'
              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
          }`}>
            {project.status}
          </span>
        </div>

        <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Stack */}
        {project.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.slice(0, 5).map((tech, i) => (
              <span key={i} className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-cyan-400 rounded border border-slate-700">
                {tech}
              </span>
            ))}
            {project.technologies.length > 5 && (
              <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-500 rounded border border-slate-700">
                +{project.technologies.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Metrics */}
        {project.metrics && Object.values(project.metrics).some(Boolean) && (
          <div className="grid grid-cols-3 gap-2 mb-5 pb-4 border-b border-slate-700/50">
            {Object.entries(project.metrics)
              .filter(([, v]) => v)
              .slice(0, 3)
              .map(([key, value]) => (
                <div key={key} className="text-center">
                  <p className="text-cyan-400 font-bold text-sm">{value}</p>
                  <p className="text-slate-500 text-xs capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-2">
          <Link
            href={`/portfolio/${slug}`}
            className="flex-1 text-center py-2.5 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-all duration-200"
          >
            Ver caso completo
          </Link>
          {project.urls?.live && (
            <a
              href={project.urls.live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-slate-800 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500/30 rounded-lg transition-all duration-200"
              title="Ver en vivo"
            >
              <ExternalLink className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
