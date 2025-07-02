// src/components/portfolio/PortfolioHero.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PortfolioHeroProps {
  data?: any;
  projectCount?: number;
}

export default function PortfolioHero({ data, projectCount = 0 }: PortfolioHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTech, setCurrentTech] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Tecnologías rotativas
  const technologies = [
    { name: "React", color: "from-blue-400 to-cyan-400", icon: "⚛️" },
    { name: "Next.js", color: "from-gray-400 to-gray-600", icon: "▲" },
    { name: "TypeScript", color: "from-blue-600 to-indigo-600", icon: "🔷" },
    { name: "Node.js", color: "from-green-500 to-emerald-500", icon: "🟢" },
    { name: "MongoDB", color: "from-green-600 to-green-800", icon: "🍃" }
  ];

  // Stats del portfolio (usando datos dinámicos)
  const portfolioStats = [
    { 
      label: "Proyectos", 
      value: projectCount > 0 ? `${projectCount}+` : "25+", 
      icon: "💼", 
      color: "cyan" 
    },
    { label: "Clientes", value: "35+", icon: "🤝", color: "green" },
    { label: "Performance", value: "98/100", icon: "⚡", color: "yellow" },
    { label: "Satisfacción", value: "100%", icon: "⭐", color: "purple" }
  ];

  useEffect(() => {
    setIsVisible(true);

    // Rotación de tecnologías cada 2 segundos
    const interval = setInterval(() => {
      setCurrentTech((prev) => (prev + 1) % technologies.length);
    }, 2000);

    // Mouse tracking para efectos parallax
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const currentTechnology = technologies[currentTech];

  // Contenido por defecto o desde data
  const heroContent = {
    title: data?.hero?.title || "Portfolio",
    subtitle: data?.hero?.subtitle || "Proyectos que transforman negocios",
    description: data?.hero?.description || "Proyectos reales que transforman negocios. Cada línea de código cuenta una historia de éxito."
  };

  return (
    <section className="py-20 bg-gradient-to-br from-black via-gray-950 to-gray-900 relative overflow-hidden min-h-[80vh] flex items-center">
      
      {/* EFECTOS DE FONDO DINÁMICOS */}
      <div className="absolute inset-0">
        {/* Gradiente animado que sigue el mouse */}
        <div 
          className="absolute inset-0 opacity-30 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`
          }}
        />
        
        {/* Efectos de luz específicos de portfolio */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Grid de código flotante */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 gap-4 h-full font-mono text-xs text-cyan-400">
            {[...Array(64)].map((_, i) => (
              <div 
                key={i}
                className="animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {Math.random() > 0.5 ? '{' : '}'}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          
          {/* BREADCRUMB ESTILO CÓDIGO */}
          <div className="flex items-center justify-center space-x-2 text-cyan-400 mb-8 font-mono text-lg">
            <span className="animate-pulse">const</span>
            <span className="text-purple-400">portfolio</span>
            <span className="text-gray-400">=</span>
            <span className="text-green-400">[</span>
            <span className="text-yellow-400">"proyectos_épicos"</span>
            <span className="text-green-400">];</span>
          </div>

          {/* TÍTULO PRINCIPAL CON EFECTOS */}
          <h1 className="mb-8">
            <div className="text-6xl md:text-8xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent animate-gradient-x">
                {heroContent.title}
              </span>
            </div>
            
            {/* SUBTÍTULO CON TECNOLOGÍA ROTATIVA */}
            <div className="text-2xl md:text-4xl font-bold">
              <span className="text-gray-300">Creado con </span>
              <span 
                className={`bg-gradient-to-r ${currentTechnology.color} bg-clip-text text-transparent font-mono animate-pulse`}
              >
                {currentTechnology.icon} {currentTechnology.name}
              </span>
              <span className="animate-blink text-cyan-400 ml-2">|</span>
            </div>
          </h1>

          {/* DESCRIPCIÓN CON HIGHLIGHTS */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            <span className="text-purple-400 font-semibold">Proyectos reales</span> que{' '}
            <span className="text-cyan-400 font-semibold">transforman negocios</span>.
            <br />
            Cada línea de código cuenta una{' '}
            <span className="text-green-400 font-semibold bg-gray-900/50 px-2 py-1 rounded font-mono">historia de éxito</span>.
          </p>

          {/* STATS DEL PORTFOLIO CON ANIMACIONES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {portfolioStats.map((stat, index) => {
              const colorClasses = {
                cyan: "from-cyan-400 to-cyan-600 border-cyan-500/30 hover:border-cyan-500/60",
                green: "from-green-400 to-green-600 border-green-500/30 hover:border-green-500/60",
                yellow: "from-yellow-400 to-yellow-600 border-yellow-500/30 hover:border-yellow-500/60",
                purple: "from-purple-400 to-purple-600 border-purple-500/30 hover:border-purple-500/60"
              };

              return (
                <div
                  key={index}
                  className={`group bg-gray-900/40 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 animate-fade-in-up ${colorClasses[stat.color]}`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className={`text-3xl md:text-4xl font-black bg-gradient-to-r ${colorClasses[stat.color].split(' ')[0]} ${colorClasses[stat.color].split(' ')[1]} bg-clip-text text-transparent mb-2 group-hover:animate-pulse`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm md:text-base uppercase tracking-wider font-semibold">
                    {stat.label}
                  </div>
                  
                  {/* Barra de progreso con color único */}
                  <div className="mt-4 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${colorClasses[stat.color].split(' ')[0]} ${colorClasses[stat.color].split(' ')[1]} rounded-full animate-progress-bar`}
                      style={{ animationDelay: `${index * 300 + 500}ms` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTONES DE ACCIÓN ÚNICOS */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="#projects"
              className="group relative px-10 py-5 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-2 border-purple-500/30 text-purple-400 font-bold text-xl rounded-2xl hover:from-purple-600/40 hover:to-cyan-600/40 hover:border-purple-500/60 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2"
            >
              <span className="relative z-10 flex items-center">
                <span className="mr-3 text-2xl group-hover:rotate-12 transition-transform">🎨</span>
                Ver proyectos
                <span className="ml-3 group-hover:translate-x-2 transition-transform text-2xl">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <Link
              href="/contacto"
              className="group px-10 py-5 border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 font-bold text-xl rounded-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-2"
            >
              <span className="flex items-center">
                <span className="mr-3 text-2xl group-hover:scale-125 transition-transform">💼</span>
                Trabajemos juntos
              </span>
            </Link>
          </div>

          {/* TECNOLOGÍAS DISPONIBLES */}
          <div className="mt-16">
            <div className="text-gray-400 text-sm mb-4 font-mono">Tecnologías utilizadas:</div>
            <div className="flex justify-center items-center space-x-8 flex-wrap gap-y-4">
              {technologies.map((tech, index) => (
                <div
                  key={index}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-110 ${
                    index === currentTech 
                      ? `border-cyan-500/60 bg-gray-900/60` 
                      : 'border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <span className="text-xl group-hover:scale-125 transition-transform">
                    {tech.icon}
                  </span>
                  <span className={`font-semibold ${
                    index === currentTech 
                      ? `bg-gradient-to-r ${tech.color} bg-clip-text text-transparent` 
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}