// src/components/hero/HeroSection.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentText, setCurrentText] = useState(0);
  const [heroData, setHeroData] = useState({});
  const [loading, setLoading] = useState(true);

  // Textos rotativos para el impacto
  const rotatingTexts = [
    "Desarrollador Full Stack",
    "Especialista en React",
    "Experto en Next.js", 
    "Arquitecto de Software",
    "Performance Expert"
  ];

  useEffect(() => {
    // Fetch data from MongoDB
    async function fetchHeroData() {
      try {
        const response = await fetch('/api/homepage');
        const data = await response.json();
        setHeroData(data.hero || {});
      } catch (error) {
        console.error('Error fetching hero data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHeroData();
    setIsVisible(true);

    // Rotación de textos cada 3 segundos
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Datos por defecto
  const heroContent = {
    title: heroData.title || "Luis Granero",
    description: heroData.description || "Transformo ideas en aplicaciones web modernas y soluciones personalizadas. Especializado en React, Next.js y arquitecturas escalables.",
    ctaText: heroData.ctaText || "Ver mis proyectos",
    ctaLink: heroData.ctaLink || "/portfolio",
    stats: heroData.stats || [
      { label: "Proyectos", value: "50+" },
      { label: "Años", value: "10+" },
      { label: "Clientes", value: "35+" },
      { label: "Tecnologías", value: "15+" }
    ]
  };

  // Removed loading state to avoid showing placeholder boxes

  return (
    <section className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden pt-20">
      
      {/* BACKGROUND EFFECTS ÉPICOS */}
      <div className="absolute inset-0">
        {/* Gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        
        {/* Efectos de luz animados */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Grid de puntos */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-12 gap-4 h-full">
            {[...Array(144)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                style={{ animationDelay: `${(i * 100)}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          
          {/* CONSOLE GREETING MÁS ÉPICO */}
          <div className="flex items-center justify-center space-x-2 text-cyan-400 mb-8 font-mono text-xl">
            <span className="animate-pulse">›</span>
            <div className="typewriter">
              <span>console.log("</span>
              <span className="text-green-400 animate-pulse">¡Hola, mundo del código!</span>
              <span>");</span>
            </div>
          </div>
          
          {/* NOMBRE SÚPER ÉPICO */}
          <h1 className="mb-6">
            <div className="text-6xl md:text-8xl lg:text-9xl font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                {heroContent.title}
              </span>
            </div>
            
            {/* SUBTÍTULO ROTATIVO */}
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold">
              <span className="text-gray-300">Soy </span>
              <span className="text-green-400 font-mono animate-pulse">
                {rotatingTexts[currentText]}
              </span>
              <span className="animate-blink text-green-400">|</span>
            </div>
          </h1>

          {/* DESCRIPCIÓN CON EFECTOS */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12 animate-fade-in-up delay-300">
            <span className="text-cyan-400 font-semibold">Transformo ideas</span> en{' '}
            <span className="text-green-400 font-semibold">aplicaciones web modernas</span> y{' '}
            <span className="text-purple-400 font-semibold">soluciones personalizadas</span>.
            <br />
            <span className="text-gray-400 text-lg">
              Especializado en React, Next.js y arquitecturas escalables.
            </span>
          </p>

          {/* BOTONES SÚPER LLAMATIVOS */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              href={heroContent.ctaLink}
              className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-black text-xl rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2"
            >
              <span className="relative z-10 flex items-center">
                {heroContent.ctaText}
                <span className="ml-3 group-hover:translate-x-2 transition-transform text-2xl">🚀</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <Link
              href="/contacto"
              className="group px-10 py-5 border-3 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-400/50"
            >
              <span className="flex items-center">
                Hablemos
                <span className="ml-3 group-hover:rotate-12 transition-transform text-2xl">💬</span>
              </span>
            </Link>
          </div>

          {/* STATS ÉPICAS CON ANIMACIONES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
            {heroContent.stats.map((stat, index) => (
              <div
                key={index}
                className={`group bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-cyan-500 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm md:text-base uppercase tracking-wider font-semibold">
                  {stat.label}
                </div>

                {/* Barra de progreso animada */}
                <div className="mt-3 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-green-400 rounded-full animate-progress-bar"
                    style={{ animationDelay: `${index * 300}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* INDICADOR DE SCROLL */}
          <div className="flex flex-col items-center text-gray-400 animate-bounce">
            <span className="text-sm mb-2 font-mono">Explora mi trabajo</span>
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;