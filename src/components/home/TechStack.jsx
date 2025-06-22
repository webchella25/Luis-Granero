function TechStack() {
  const techCategories = [
    {
      category: "Frontend",
      color: "from-cyan-400 to-blue-500",
      technologies: [
        { name: "React", level: 95, icon: "⚛️" },
        { name: "Next.js", level: 90, icon: "▲" },
        { name: "TypeScript", level: 85, icon: "🔷" },
        { name: "Tailwind CSS", level: 90, icon: "🎨" }
      ]
    },
    {
      category: "Backend",
      color: "from-green-400 to-emerald-500",
      technologies: [
        { name: "Node.js", level: 88, icon: "🟢" },
        { name: "Express", level: 85, icon: "🚀" },
        { name: "APIs REST", level: 92, icon: "🔗" },
        { name: "MongoDB", level: 80, icon: "🍃" }
      ]
    },
    {
      category: "Herramientas",
      color: "from-purple-400 to-pink-500",
      technologies: [
        { name: "Git", level: 90, icon: "📝" },
        { name: "Docker", level: 75, icon: "🐳" },
        { name: "Vercel", level: 85, icon: "▲" },
        { name: "SEO", level: 88, icon: "📈" }
      ]
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Stack Tecnológico
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Tecnologías modernas y herramientas especializadas para crear 
            soluciones web robustas y escalables.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {techCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent mb-2`}>
                  {category.category}
                </h3>
              </div>

              <div className="space-y-4">
                {category.technologies.map((tech, techIndex) => (
                  <div key={techIndex} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{tech.icon}</span>
                        <span className="font-semibold text-white">{tech.name}</span>
                      </div>
                      <span className="text-sm text-gray-400 font-mono">{tech.level}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${category.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${tech.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">+10</div>
            <div className="text-gray-400 font-mono">Años experiencia</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">+50</div>
            <div className="text-gray-400 font-mono">Proyectos completados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">100%</div>
            <div className="text-gray-400 font-mono">Código personalizado</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">24/7</div>
            <div className="text-gray-400 font-mono">Soporte técnico</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TechStack;