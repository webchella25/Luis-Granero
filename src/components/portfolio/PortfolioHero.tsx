'use client';

import Link from 'next/link';
import { ArrowRight, Briefcase, Users, Zap, Star } from 'lucide-react';

interface PortfolioHeroProps {
  data?: any;
  projectCount?: number;
}

export default function PortfolioHero({ data, projectCount = 0 }: PortfolioHeroProps) {
  const heroContent = {
    title: data?.hero?.title || 'Portfolio',
    subtitle: data?.hero?.subtitle || 'Proyectos que transforman negocios',
    description: data?.hero?.description || 'Proyectos reales con métricas, tecnologías y resultados medibles.',
  };

  const stats = [
    { icon: Briefcase, value: projectCount > 0 ? `${projectCount}+` : '25+', label: 'Proyectos' },
    { icon: Users, value: '35+', label: 'Clientes' },
    { icon: Zap, value: '98/100', label: 'Performance' },
    { icon: Star, value: String(data?.stats?.clientSatisfaction || '100%'), label: 'Satisfacción' },
  ];

  const techStack = ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB'];

  return (
    <section className="relative overflow-hidden bg-[#0F172A] pt-32 pb-20">
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">

          <div className="badge badge-cyan mx-auto mb-8">
            <Briefcase className="w-3.5 h-3.5" />
            {heroContent.title}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-slate-50 mb-6">
            {heroContent.subtitle}
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            {heroContent.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link href="#projects" className="btn-primary inline-flex items-center justify-center gap-2">
              Ver proyectos
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contacto" className="btn-secondary inline-flex items-center justify-center gap-2">
              Trabajemos juntos
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 pt-10 border-t border-slate-800">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-100">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Tech pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {techStack.map((tech) => (
              <span key={tech} className="badge">
                {tech}
              </span>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
