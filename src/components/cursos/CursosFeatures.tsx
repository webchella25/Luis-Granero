// src/components/cursos/CursosFeatures.tsx
'use client';

import { 
  AcademicCapIcon, 
  ClockIcon, 
  CodeBracketIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

export default function CursosFeatures() {
  const features = [
    {
      icon: <AcademicCapIcon className="w-8 h-8" />,
      title: "Aprendizaje Estructurado",
      description: "Cada ruta está diseñada con una secuencia lógica de conceptos, desde lo básico hasta lo avanzado.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <CodeBracketIcon className="w-8 h-8" />,
      title: "Proyectos Reales",
      description: "Aprende construyendo proyectos del mundo real que puedes añadir a tu portfolio.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: "A Tu Ritmo",
      description: "Sin fechas límite. Aprende cuando quieras y avanza según tu disponibilidad.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <DocumentTextIcon className="w-8 h-8" />,
      title: "Contenido Actualizado",
      description: "Artículos constantemente actualizados con las últimas versiones y mejores prácticas.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <CheckCircleIcon className="w-8 h-8" />,
      title: "100% Gratuito",
      description: "Todo el contenido es gratuito y accesible. Sin suscripciones ni pagos ocultos.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <RocketLaunchIcon className="w-8 h-8" />,
      title: "Stack Moderno",
      description: "Aprende las tecnologías que las empresas realmente buscan: React, Next.js, TypeScript y más.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section className="py-20 bg-[#0F172A] relative overflow-hidden">
      
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
            ¿Por qué elegir estas rutas?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Aprende de la forma correcta
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            No más tutoriales dispersos. Un camino claro y estructurado para alcanzar tus objetivos.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-[#1E293B]/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Icon with gradient */}
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${feature.color} p-0.5 mb-4`}>
                <div className="w-full h-full bg-[#1E293B] rounded-lg flex items-center justify-center text-white">
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Extra info */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl p-8 max-w-3xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              💡 Metodología probada
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Estas rutas están basadas en mi experiencia de <strong className="text-cyan-400">+10 años</strong> desarrollando proyectos reales.
              He condensado lo que realmente necesitas saber para trabajar como desarrollador profesional,
              eliminando la información innecesaria y enfocándome en lo práctico.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}