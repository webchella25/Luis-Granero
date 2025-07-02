// src/components/about/AboutHero.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AboutHeroProps {
  data?: any;
}

export default function AboutHero({ data }: AboutHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState(0);

  // Roles/identidades profesionales
  const professionalRoles = [
    { 
      role: "Desarrollador", 
      years: "10+ años",
      color: "from-cyan-400 to-blue-500", 
      icon: "💻",
      description: "Crafting code since 2014"
    },
    { 
      role: "Arquitecto", 
      years: "50+ proyectos",
      color: "from-purple-400 to-indigo-500", 
      icon: "🏗️",
      description: "Designing scalable solutions"
    },
    { 
      role: "Mentor", 
      years: "100+ devs",
      color: "from-green-400 to-emerald-500", 
      icon: "🎓",
      description: "Sharing knowledge & experience"
    },
    { 
      role: "Optimizador", 
      years: "Performance expert",
      color: "from-yellow-400 to-orange-500", 
      icon: "⚡",
      description: "Making apps blazing fast"
    },
    { 
      role: "Innovador", 
      years: "Always learning",
      color: "from-pink-400 to-red-500", 
      icon: "🚀",
      description: "Exploring new technologies"
    }
  ];

  // Valores personales/profesionales
  const coreValues = [
    {
      value: "Calidad",
      description: "Código limpio y mantenible",
      icon: "💎",
      color: "cyan"
    },
    {
      value: "Transparencia", 
      description: "Comunicación honesta y clara",
      icon: "🔍",
      color: "green"
    },
    {
      value: "Crecimiento",
      description: "Aprendizaje continuo",
      icon: "📈", 
      color: "purple"
    },
    {
      value: "Impacto",
      description: "Soluciones que transforman",
      icon: "🎯",
      color: "yellow"
    }
  ];

  useEffect(() => {
    setIsVisible(true);

    // Rotación de roles cada 3 segundos
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % professionalRoles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentProfessionalRole = professionalRoles[currentRole];

  // Datos por defecto o desde props
  const heroContent = {
    title: data?.title || "Luis Granero",
    subtitle: data?.subtitle || "La persona detrás del código",
    description: data?.description || "Más de 10 años transformando ideas en aplicaciones web exitosas. Mi pasión es crear soluciones que realmente importen, con código limpio y metodologías que garantizan resultados.",
    location: data?.location || "España 🇪🇸",
    experience: data?.experience || "10+ años"
  };

  return (
    <section className="py-20 bg-gradient-to-br from-black via-gray-950 to-gray-900 relative overflow-hidden min-h-[90vh] flex items-center">
      
      {/* EFECTOS DE FONDO PERSONALES */}
      <div className="absolute inset-0">
        {/* Constelación de puntos - representando el journey */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Efectos de luz cálidos y personales */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-500/8 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Timeline visual sutil */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent opacity-30" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* COLUMNA IZQUIERDA - CONTENIDO */}
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            
            {/* GREETING PERSONAL */}
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl animate-wave">👋</span>
              <span className="text-cyan-400 font-mono text-lg">Hola, soy</span>
            </div>

            {/* NOMBRE Y TÍTULO */}
            <h1 className="mb-6">
              <div className="text-5xl md:text-7xl font-black mb-4">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent animate-gradient-x">
                  {heroContent.title}
                </span>
              </div>
              
              <div className="text-xl md:text-2xl text-gray-300 mb-4">
                {heroContent.subtitle}
              </div>
              
              {/* ROL ROTATIVO */}
              <div className="text-2xl md:text-3xl font-bold">
                <span className="text-gray-400">Soy </span>
                <span 
                  className={`bg-gradient-to-r ${currentProfessionalRole.color} bg-clip-text text-transparent animate-pulse`}
                >
                  {currentProfessionalRole.icon} {currentProfessionalRole.role}
                </span>
              </div>
              <div className="text-lg text-gray-500 mt-2 font-mono">
                {currentProfessionalRole.description} • {currentProfessionalRole.years}
              </div>
            </h1>

            {/* DESCRIPCIÓN PERSONAL */}
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              {heroContent.description}
            </p>

            {/* QUICK FACTS */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="text-cyan-400 font-semibold">Ubicación</div>
                  <div className="text-gray-400">{heroContent.location}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <div className="text-green-400 font-semibold">Experiencia</div>
                  <div className="text-gray-400">{heroContent.experience}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="text-purple-400 font-semibold">Especialidad</div>
                  <div className="text-gray-400">Full Stack Development</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💡</span>
                <div>
                  <div className="text-yellow-400 font-semibold">Pasión</div>
                  <div className="text-gray-400">Solving Problems</div>
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#my-story"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 text-cyan-400 font-semibold rounded-xl hover:from-cyan-600/40 hover:to-purple-600/40 hover:border-cyan-500/60 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  <span className="mr-3 text-xl group-hover:rotate-12 transition-transform">📖</span>
                  Mi historia
                  <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
              
              <Link
                href="/contacto"
                className="group px-8 py-4 border-2 border-green-400/50 text-green-400 hover:bg-green-400/10 hover:border-green-400 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  <span className="mr-3 text-xl group-hover:scale-125 transition-transform">💬</span>
                  Hablemos
                </span>
              </Link>
            </div>
          </div>

          {/* COLUMNA DERECHA - VALORES Y ROLES */}
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            
            {/* MIS VALORES */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3 text-3xl">⭐</span>
                Mis valores
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coreValues.map((item, index) => {
                  const colorClasses = {
                    cyan: "from-cyan-400 to-cyan-600 border-cyan-500/30",
                    green: "from-green-400 to-green-600 border-green-500/30", 
                    purple: "from-purple-400 to-purple-600 border-purple-500/30",
                    yellow: "from-yellow-400 to-yellow-600 border-yellow-500/30"
                  };

                  return (
                    <div
                      key={index}
                      className={`group bg-gray-900/40 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 hover:scale-105 animate-fade-in-up ${colorClasses[item.color]}`}
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl group-hover:scale-125 transition-transform">
                          {item.icon}
                        </span>
                        <div>
                          <h4 className={`font-bold text-lg bg-gradient-to-r ${colorClasses[item.color].split(' ')[0]} ${colorClasses[item.color].split(' ')[1]} bg-clip-text text-transparent`}>
                            {item.value}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROLES/IDENTIDADES */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3 text-3xl">🎭</span>
                Mis roles
              </h3>
              <div className="space-y-3">
                {professionalRoles.map((role, index) => (
                  <div
                    key={index}
                    className={`group flex items-center space-x-4 p-4 rounded-xl border transition-all duration-300 relative ${
                      index === currentRole
                        ? 'border-cyan-500/60 bg-gray-900/60 scale-105'
                        : 'border-gray-700/50 hover:border-gray-600 hover:scale-102'
                    }`}
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform">
                      {role.icon}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        index === currentRole
                          ? `bg-gradient-to-r ${role.color} bg-clip-text text-transparent`
                          : 'text-white group-hover:text-cyan-400'
                      }`}>
                        {role.role}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {role.description}
                      </p>
                    </div>
                    <div className="text-cyan-400 text-sm font-mono">
                      {role.years}
                    </div>
                    
                    {index === currentRole && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}