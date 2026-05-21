// src/components/about/ExperienceTimeline.tsx
'use client';

import { Trophy } from 'lucide-react';

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
      company: "Proyectos propios + Freelance",
      position: "Desarrollador Web Full Stack — React & Next.js",
      period: "2024 - Presente",
      description: "Tras años con WordPress, di el salto definitivo al stack moderno. Ahora construyo webs y aplicaciones a medida para pequeñas empresas, sin las limitaciones de temas ni plugins. Paralelamente desarrollo dos productos SaaS propios.",
      technologies: ["React", "Next.js", "Node.js", "MongoDB", "TypeScript", "Tailwind CSS"],
      achievements: ["Salto a stack moderno en 2024", "2 proyectos SaaS en desarrollo", "Webs sin límites ni dependencias de terceros"]
    },
    {
      company: "Freelance",
      position: "Desarrollador WordPress",
      period: "2015 - 2024",
      description: "Empecé a hacer webs con WordPress por hobby y terminé con clientes reales. Construí sitios para empresas de telecomunicaciones, carpinterías metálicas y otros negocios locales. Con el tiempo las limitaciones de WordPress — plugins de pago, temas que no se adaptan del todo — me llevaron a buscar algo mejor.",
      technologies: ["WordPress", "WooCommerce", "PHP", "MySQL", "CSS", "jQuery"],
      achievements: ["Webs para sectores como telecomunicaciones y metal", "Gestión completa: diseño, desarrollo y SEO", "Proyectos activos a día de hoy"]
    },
    {
      company: "Empresa de telecomunicaciones",
      position: "Técnico de instalaciones — Internet por antenas",
      period: "2011 - 2015",
      description: "Instalación y mantenimiento de sistemas de acceso a internet mediante antenas. Trabajo de campo que me dio una base sólida en redes e infraestructura.",
      technologies: ["Redes IP", "Antenas WiFi", "Mikrotik", "Ubiquiti", "Cableado estructurado"],
      achievements: ["Instalaciones de internet en zona rural", "Administración de redes y routers", "Diagnóstico y resolución de fallos en campo"]
    },
    {
      company: "Negocio propio",
      position: "Emprendedor — Tienda de informática",
      period: "2008 - 2011",
      description: "Abrí mi propia tienda de informática. Reparación, montaje de equipos y venta de componentes. La crisis de 2011 obligó al cierre, pero fue una escuela brutal de autonomía, atención al cliente y resolución de problemas.",
      technologies: ["Hardware PC", "Redes LAN", "Sistemas Windows/Linux", "Reparación de equipos"],
      achievements: ["Gestión completa del negocio", "Reparación y montaje de ordenadores", "Experiencia directa con clientes y proveedores"]
    }
  ];

  const experiences = (data && data.length > 0) ? data : defaultExperience;

  return (
    <section className="py-20 bg-[#0F172A]">
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
                <div className="absolute left-6 w-4 h-4 bg-cyan-400 rounded-full border-4 border-[#0F172A] z-10"></div>
                
                {/* Content */}
                <div className="ml-20 bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 w-full hover:border-slate-600 transition-colors">
                  
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
                            <Trophy className="w-3.5 h-3.5 text-green-400 mr-2 flex-shrink-0" />
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