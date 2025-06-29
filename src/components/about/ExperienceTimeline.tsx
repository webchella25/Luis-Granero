// src/components/about/ExperienceTimeline.tsx
'use client';

interface Experience {
  company: string;
  position: string;
  period: string;
  description: string;
  technologies?: string[];
  achievements?: string[];
}

interface Props {
  data?: Experience[];
}

export default function ExperienceTimeline({ data }: Props) {
  const defaultExperience: Experience[] = [
    {
      company: "Freelance",
      position: "Desarrollador Web Full Stack",
      period: "2020 - Presente",
      description: "Desarrollo de aplicaciones web personalizadas para startups y empresas, especializado en React, Next.js y soluciones de e-commerce.",
      technologies: ["React", "Next.js", "Node.js", "MongoDB", "TypeScript"],
      achievements: ["50+ proyectos completados", "98% satisfacción del cliente", "Especialista en performance web"]
    },
    {
      company: "Transición Tecnológica",
      position: "Especialización en Stack Moderno",
      period: "2018 - 2020",
      description: "Migración completa de WordPress a tecnologías modernas. Dominio del ecosistema React y arquitecturas escalables.",
      technologies: ["React", "Next.js", "TypeScript", "API REST", "JAMstack"],
      achievements: ["Migración exitosa a stack moderno", "Reducción 60% en tiempo de desarrollo"]
    },
    {
      company: "Proyectos Diversos",
      position: "Desarrollador WordPress Senior",
      period: "2014 - 2018",
      description: "Desarrollo de sitios corporativos, e-commerce con WooCommerce y optimización de performance.",
      technologies: ["WordPress", "PHP", "MySQL", "WooCommerce", "jQuery"],
      achievements: ["100+ sitios WordPress", "Especialista en WooCommerce", "Optimización SEO avanzada"]
    }
  ];

  const experiences = (data && data.length > 0) ? data : defaultExperience;

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Experiencia Profesional
            </h2>
            <p className="text-xl text-gray-400">
              Mi trayectoria en el desarrollo web moderno
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 to-green-400"></div>

            {experiences.map((exp, index) => (
              <div key={index} className="relative flex items-start mb-12 last:mb-0">
                
                {/* Timeline dot */}
                <div className="absolute left-6 w-4 h-4 bg-cyan-400 rounded-full border-4 border-black z-10"></div>
                
                {/* Content */}
                <div className="ml-20 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 w-full hover:border-gray-600 transition-colors">
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{exp.position}</h3>
                      <p className="text-cyan-400 font-semibold">{exp.company}</p>
                    </div>
                    <span className="text-gray-400 text-sm font-mono mt-2 md:mt-0">{exp.period}</span>
                  </div>

                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Technologies */}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Tecnologías:</h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded-full border border-cyan-500/30"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Logros destacados:</h4>
                      <ul className="space-y-1">
                        {exp.achievements.map((achievement, achievementIndex) => (
                          <li key={achievementIndex} className="flex items-center text-sm text-gray-300">
                            <span className="text-green-400 mr-2">🏆</span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}