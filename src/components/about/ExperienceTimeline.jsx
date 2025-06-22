function ExperienceTimeline() {
  const experiences = [
    {
      year: "2025",
      title: "Desarrollador Full Stack Freelance",
      company: "Independiente",
      description: "Especialización en React, Next.js y soluciones personalizadas para startups y empresas tech.",
      technologies: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB"],
      type: "current"
    },
    {
      year: "2022-2024",
      title: "Transición a Tecnologías Modernas",
      company: "Formación continua",
      description: "Migración completa de WordPress a stack moderno. Dominio de React ecosystem y arquitecturas escalables.",
      technologies: ["React", "Next.js", "TypeScript", "Tailwind", "APIs"],
      type: "learning"
    },
    {
      year: "2018-2022",
      title: "Desarrollador WordPress Senior",
      company: "Proyectos diversos",
      description: "Desarrollo de sitios corporativos, e-commerce con WooCommerce y optimización de performance.",
      technologies: ["WordPress", "PHP", "MySQL", "WooCommerce", "SEO"],
      type: "experience"
    },
    {
      year: "2014-2018",
      title: "Desarrollador Web Junior",
      company: "Primeros pasos",
      description: "Inicio en desarrollo web, aprendizaje de fundamentos y primeros proyectos comerciales.",
      technologies: ["HTML", "CSS", "JavaScript", "PHP", "WordPress"],
      type: "start"
    }
  ];

  const getTypeStyle = (type) => {
    switch (type) {
      case 'current':
        return 'from-cyan-400 to-green-400';
      case 'learning':
        return 'from-purple-400 to-pink-400';
      case 'experience':
        return 'from-blue-400 to-cyan-400';
      case 'start':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Mi Trayectoria
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            La evolución de un desarrollador WordPress hacia especialista en tecnologías modernas
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-green-400 to-gray-600 transform md:-translate-x-0.5"></div>

            {experiences.map((exp, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}>
                {/* Timeline dot */}
                <div className={`absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-gradient-to-r ${getTypeStyle(exp.type)} transform md:-translate-x-2 z-10 shadow-lg`}></div>

                {/* Content */}
                <div className={`w-full md:w-5/12 ml-12 md:ml-0 ${
                  index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
                }`}>
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full bg-gradient-to-r ${getTypeStyle(exp.type)} text-black`}>
                        {exp.year}
                      </span>
                      {exp.type === 'current' && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                          Actual
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">
                      {exp.title}
                    </h3>
                    
                    <p className="text-cyan-400 font-semibold mb-3">
                      {exp.company}
                    </p>
                    
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {exp.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded border border-cyan-500/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Year marker for mobile */}
                <div className={`hidden md:block w-5/12 ${
                  index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'
                }`}>
                  <div className="text-6xl font-bold text-gray-800 opacity-50">
                    {exp.year.split('-')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExperienceTimeline;