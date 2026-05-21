'use client';

import Link from 'next/link';
import { Rocket, Users, ExternalLink } from 'lucide-react';
import ProjectCard from './ProjectCard';

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
  projects?: Project[];
}

export default function ProjectsGrid({ projects = [] }: Props) {
  const ownProjects = projects.filter(p => p.isOwnProject);
  const clientProjects = projects.filter(p => !p.isOwnProject);

  if (projects.length === 0) {
    return (
      <section id="projects" className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-400 mb-6">Próximamente casos de estudio detallados.</p>
          <Link href="/contacto" className="btn-primary inline-flex items-center gap-2">
            Hablemos de tu proyecto
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 bg-[#0B1120]">
      <div className="container mx-auto px-6 space-y-24">

        {/* ── PRODUCTOS PROPIOS ── */}
        {ownProjects.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                Productos propios
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2">
              Construyo productos que uso y vendo
            </h2>
            <p className="text-slate-400 mb-10 max-w-2xl">
              No solo desarrollo para clientes — también lanzo mis propios SaaS y e-commerces.
              Cada producto resuelve un problema real y está en producción con usuarios activos.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ownProjects.map(project => (
                <ProjectCard key={String(project._id)} project={project} isOwn />
              ))}
            </div>
          </div>
        )}

        {/* ── PROYECTOS DE CLIENTES ── */}
        {clientProjects.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-slate-300" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Proyectos de clientes
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2">
              Casos de éxito con clientes
            </h2>
            <p className="text-slate-400 mb-10 max-w-2xl">
              Proyectos desarrollados para empresas y emprendedores. Resultados medibles y entregas en plazo.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clientProjects.map(project => (
                <ProjectCard key={String(project._id)} project={project} isOwn={false} />
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-8 max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold text-slate-50 mb-3">
            ¿Quieres ser el próximo caso de éxito?
          </h3>
          <p className="text-slate-400 mb-6 text-sm">
            Cuéntame tu idea. Ya sea un SaaS, una tienda o una aplicación web a medida.
          </p>
          <Link href="/contacto" className="btn-primary inline-flex items-center gap-2">
            Iniciar mi proyecto
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
