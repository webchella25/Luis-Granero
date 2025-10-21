// src/components/portfolio/PortfolioHero.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PortfolioHeroProps {
  data?: any;
  projectCount?: number;
}

type ColorType = 'cyan' | 'green' | 'yellow' | 'purple';

interface PortfolioStat {
  label: string;
  value: string;
  icon: string;
  color: ColorType;
}

export default function PortfolioHero({ data, projectCount = 0 }: PortfolioHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTech, setCurrentTech] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const technologies = [
    { name: "React", color: "from-blue-400 to-cyan-400", icon: "⚛️" },
    { name: "Next.js", color: "from-gray-400 to-gray-600", icon: "▲" },
    { name: "TypeScript", color: "from-blue-600 to-indigo-600", icon: "🔷" },
    { name: "Node.js", color: "from-green-500 to-emerald-500", icon: "🟢" },
    { name: "MongoDB", color: "from-green-600 to-green-800", icon: "🍃" }
  ];

  // CRÍTICO: Asegurar que todos los values sean strings
  const portfolioStats: PortfolioStat[] = [
    { 
      label: "Proyectos", 
      value: projectCount > 0 ? `${projectCount}+` : "25+", 
      icon: "💼", 
      color: "cyan" 
    },
    { 
      label: "Clientes", 
      value: "35+", 
      icon: "🤝", 
      color: "green" 
    },
    { 
      label: "Performance", 
      value: "98/100", 
      icon: "⚡", 
      color: "yellow" 
    },
    { 
      label: "Satisfacción", 
      value: String(data?.stats?.clientSatisfaction || "100%"), 
      icon: "⭐", 
      color: "purple" 
    }
  ];

  useEffect(() => {
    setIsVisible(true);

    const interval = setInterval(() => {
      setCurrentTech((prev) => (prev + 1) % technologies.length);
    }, 2000);

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

  const heroContent = {
    title: data?.hero?.title || "Portfolio",
    subtitle: data?.hero?.subtitle || "Proyectos que transforman negocios",
    description: data?.hero?.description || "Proyectos reales que transforman negocios. Cada línea de código cuenta una historia de éxito."
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden py-20">
      
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-green-500/5" />
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x / 10}px, ${mousePosition.y / 10}px)`
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(-${mousePosition.x / 10}px, -${mousePosition.y / 10}px)`,
            animationDelay: '1s'
          }}
        />
      </div>

      <div className={`container mx-auto px-4 relative z-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="text-center max-w-5xl mx-auto">
          
          {/* Code greeting */}
          <div className="flex items-center justify-center space-x-2 text-cyan-400 mb-8 font-mono text-sm md:text-base">
            <span className="opacity-50">{'>'}</span>
            <span className="animate-typing">console.log("Bienvenido al portfolio")</span>
            <span className="animate-blink">_</span>
          </div>

          {/* Main title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent animate-gradient">
              {heroContent.title}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-gray-300 font-semibold mb-6">
            {heroContent.subtitle}
          </p>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            {heroContent.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {portfolioStats.map((stat, index) => {
              const colorClasses: Record<ColorType, string> = {
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
                    {String(stat.value)}
                  </div>
                  <div className="text-gray-400 text-sm md:text-base uppercase tracking-wider font-semibold">
                    {stat.label}
                  </div>
                  
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            
              href="#projects"
              className="group relative px-10 py-5 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-2 border-purple-500/30 text-purple-400 font-bold text-xl rounded-2xl hover:from-purple-600/40 hover:to-cyan-600/40 hover:border-purple-500/60 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2"
            >
              <span className="relative z-10 flex items-center">
                <span className="mr-3 text-2xl group-hover:rotate-12 transition-transform">🎨</span>
                Ver proyectos
                <span className="ml-3 group-hover:translate-x-2 transition-transform text-2xl">→</span>
              </span>
            </a>
            
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

          {/* Technologies */}
          <div className="mt-16">
            <div className="text-gray-400 text-sm mb-4 font-mono">Tecnologías utilizadas:</div>
            <div className="flex justify-center items-center space-x-8 flex-wrap gap-y-4">
              {technologies.map((tech, index) => (
                <div
                  key={index}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-110 ${
                    index === currentTech 
                      ? `bg-gradient-to-r ${tech.color} border-transparent text-black font-bold shadow-lg`
                      : 'border-gray-700 text-gray-400 hover:border-cyan-500/50'
                  }`}
                >
                  <span className="text-xl">{tech.icon}</span>
                  <span className="font-mono text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}