'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Code2, ArrowRight } from 'lucide-react';

interface AboutHeroProps {
  data?: any;
}

export default function AboutHero({ data }: AboutHeroProps) {
  const heroContent = {
    title: data?.title || 'Luis Granero',
    subtitle: data?.subtitle || 'Desarrollador web freelance — Chella, Valencia',
    description: data?.description || 'Autodidacta desde siempre. Empecé reparando ordenadores de joven, pasé por WordPress durante años y en 2024 di el salto definitivo a React y Next.js. Trabajo con cariño: si algo lleva mi nombre, no sale hasta que está bien.',
    location: data?.location || 'Chella, Valencia',
    experience: data?.experience || '10+ años',
  };

  const roles = [
    { label: 'Desarrollador', years: '10+ años', desc: 'WordPress → React/Next.js' },
    { label: 'Freelance', years: 'Pequeñas empresas', desc: 'Soluciones a medida' },
    { label: 'SaaS Builder', years: '2 en desarrollo', desc: 'Productos propios' },
  ];

  const values = [
    { label: 'Perfeccionismo', desc: 'No entrego hasta que está bien' },
    { label: 'Transparencia', desc: 'Comunicación clara y directa' },
    { label: 'Autodidacta', desc: 'Aprendizaje continuo' },
    { label: 'Cariño', desc: 'Me implico en cada proyecto' },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0F172A] pt-32 pb-20">
      {/* Grid bg */}
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-50" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-6">

        {/* Fila superior: texto + foto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-12">

          {/* LEFT — contenido principal */}
          <div>
            <div className="badge badge-cyan mb-6">
              <MapPin className="w-3.5 h-3.5" />
              {heroContent.location}
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-slate-50 mb-4">
              {heroContent.title}
            </h1>

            <p className="text-xl text-slate-400 mb-2 font-medium">
              {heroContent.subtitle}
            </p>

            <p className="text-slate-400 leading-relaxed mb-8 max-w-lg">
              {heroContent.description}
            </p>

            {/* Quick facts */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-[#1E293B] border border-slate-700/50 rounded-xl p-4">
                <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Experiencia</div>
                  <div className="text-sm font-semibold text-slate-200">{heroContent.experience}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#1E293B] border border-slate-700/50 rounded-xl p-4">
                <Code2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Especialidad</div>
                  <div className="text-sm font-semibold text-slate-200">Full Stack Dev</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="#my-story" className="btn-primary inline-flex items-center justify-center gap-2">
                Mi historia
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contacto" className="btn-secondary inline-flex items-center justify-center gap-2">
                Hablemos
              </Link>
            </div>
          </div>

          {/* RIGHT — solo la foto */}
          <div className="relative mx-auto w-56 h-64 lg:w-full lg:h-80">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-2xl scale-105 pointer-events-none" />
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
              <Image
                src="/images/luis-granero.png"
                alt="Luis Granero — Desarrollador web freelance"
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 1024px) 224px, 480px"
              />
            </div>
          </div>
        </div>

        {/* Fila inferior: roles + valores en paralelo, ancho completo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Roles */}
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Mis roles</h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.label} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{role.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{role.desc}</div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                    {role.years}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Valores */}
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Mis valores</h3>
            <div className="grid grid-cols-2 gap-3">
              {values.map((v) => (
                <div key={v.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                  <div className="text-sm font-semibold text-slate-200 mb-0.5">{v.label}</div>
                  <div className="text-xs text-slate-500">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
