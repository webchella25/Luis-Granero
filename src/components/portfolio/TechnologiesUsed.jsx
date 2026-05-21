function TechnologiesUsed() {
  const techStack = [
    {
      category: "Frontend Frameworks",
      color: "from-cyan-400 to-blue-500",
      technologies: [
        { name: "React", projects: 18, icon: "⚛️", expertise: "Expert" },
        { name: "Next.js", projects: 15, icon: "▲", expertise: "Expert" },
        { name: "Vue.js", projects: 6, icon: "💚", expertise: "Advanced" },
        { name: "Svelte", projects: 3, icon: "🔥", expertise: "Intermediate" }
      ]
    },
    {
      category: "Styling & UI",
      color: "from-green-400 to-emerald-500",
      technologies: [
        { name: "Tailwind CSS", projects: 20, icon: "🎨", expertise: "Expert" },
        { name: "Styled Components", projects: 12, icon: "💅", expertise: "Advanced" },
        { name: "CSS Modules", projects: 8, icon: "📦", expertise: "Advanced" },
        { name: "Framer Motion", projects: 10, icon: "🎭", expertise: "Advanced" }
      ]
    },
    {
      category: "Backend & APIs",
      color: "from-purple-400 to-pink-500",
      technologies: [
        { name: "Node.js", projects: 16, icon: "🟢", expertise: "Expert" },
        { name: "Express", projects: 14, icon: "🚀", expertise: "Expert" },
        { name: "FastAPI", projects: 5, icon: "⚡", expertise: "Intermediate" },
        { name: "GraphQL", projects: 7, icon: "📊", expertise: "Advanced" }
      ]
    },
    {
      category: "Databases",
      color: "from-orange-400 to-red-500",
      technologies: [
        { name: "MongoDB", projects: 12, icon: "🍃", expertise: "Expert" },
        { name: "PostgreSQL", projects: 10, icon: "🐘", expertise: "Advanced" },
        { name: "Firebase", projects: 8, icon: "🔥", expertise: "Advanced" },
        { name: "Redis", projects: 6, icon: "🔴", expertise: "Intermediate" }
      ]
    },
    {
      category: "DevOps & Tools",
      color: "from-indigo-400 to-purple-500",
      technologies: [
        { name: "Docker", projects: 11, icon: "🐳", expertise: "Advanced" },
        { name: "AWS", projects: 9, icon: "☁️", expertise: "Intermediate" },
        { name: "Vercel", projects: 18, icon: "▲", expertise: "Expert" },
        { name: "GitHub Actions", projects: 13, icon: "🔧", expertise: "Advanced" }
      ]
    },
    {
      category: "Testing & Quality",
      color: "from-pink-400 to-red-500",
      technologies: [
        { name: "Jest", projects: 15, icon: "🃏", expertise: "Advanced" },
        { name: "Cypress", projects: 8, icon: "🌲", expertise: "Advanced" },
        { name: "ESLint", projects: 20, icon: "🔍", expertise: "Expert" },
        { name: "TypeScript", projects: 16, icon: "🔷", expertise: "Expert" }
      ]
    }
  ];

  const getExpertiseColor = (expertise) => {
    switch (expertise) {
      case 'Expert':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Advanced':
        return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
      case 'Intermediate':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const projectTypes = [
    {
      type: "E-commerce",
      count: 15,
      mainTech: ["Next.js", "Node.js", "MongoDB", "Stripe"],
      description: "Tiendas online completas con gestión de inventarios y pagos"
    },
    {
      type: "SaaS Platforms",
      count: 8,
      mainTech: ["React", "TypeScript", "PostgreSQL", "AWS"],
      description: "Aplicaciones web complejas con sistemas de suscripción"
    },
    {
      type: "Corporate Websites",
      count: 12,
      mainTech: ["Next.js", "Tailwind", "CMS", "Analytics"],
      description: "Sitios corporativos optimizados para conversión y SEO"
    },
    {
      type: "Dashboards",
      count: 10,
      mainTech: ["React", "Chart.js", "Real-time APIs", "WebSockets"],
      description: "Paneles administrativos con datos en tiempo real"
    }
  ];

  return (
    <section className="py-20 bg-[#0F172A]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Stack Tecnológico Utilizado
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Tecnologías modernas y probadas que utilizo para crear soluciones robustas y escalables
          </p>
        </div>

        {/* Technology categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {techStack.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="bg-[#1E293B]/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
            >
              <h3 className={`text-xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent mb-6`}>
                {category.category}
              </h3>
              
              <div className="space-y-4">
                {category.technologies.map((tech, techIndex) => (
                  <div
                    key={techIndex}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{tech.icon}</span>
                      <div>
                        <div className="font-semibold text-white">{tech.name}</div>
                        <div className="text-sm text-gray-400">{tech.projects} proyectos</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getExpertiseColor(tech.expertise)}`}>
                      {tech.expertise}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Project types breakdown */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold gradient-text mb-8 text-center">
            Tipos de Proyectos Desarrollados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projectTypes.map((project, index) => (
              <div
                key={index}
                className="bg-[#1E293B]/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold gradient-text mb-2">{project.count}</div>
                  <h4 className="font-bold text-white">{project.type}</h4>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 text-center">
                  {project.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-cyan-400 text-center">Tech Stack Principal:</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {project.mainTech.map((tech, techIndex) => (
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
            ))}
          </div>
        </div>

        {/* Development approach */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <h3 className="text-2xl font-bold gradient-text mb-6 text-center">
            Mi Enfoque de Desarrollo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="font-bold text-white mb-3">Performance First</h4>
              <p className="text-gray-400 text-sm">
                Cada línea de código está optimizada para máximo rendimiento. 
                Lighthouse scores 90+ son el estándar, no la excepción.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h4 className="font-bold text-white mb-3">Código Mantenible</h4>
              <p className="text-gray-400 text-sm">
                Arquitectura limpia, patrones de diseño y documentación completa 
                para facilitar futuras modificaciones y escalabilidad.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h4 className="font-bold text-white mb-3">Tecnologías Modernas</h4>
              <p className="text-gray-400 text-sm">
                Stack tecnológico actualizado con las mejores prácticas del sector. 
                Seguridad, escalabilidad y developer experience optimizadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TechnologiesUsed;