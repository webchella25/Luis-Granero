function SkillsDetail() {
  const skillCategories = [
    {
      title: "Frontend Development",
      icon: "🎨",
      color: "from-cyan-400 to-blue-500",
      skills: [
        { name: "React", level: 95, description: "Hooks, Context, Performance optimization" },
        { name: "Next.js", level: 90, description: "SSR, SSG, API Routes, App Router" },
        { name: "TypeScript", level: 85, description: "Type safety, Interfaces, Generics" },
        { name: "Tailwind CSS", level: 90, description: "Utility-first, Responsive design" }
      ]
    },
    {
      title: "Backend Development",
      icon: "⚙️",
      color: "from-green-400 to-emerald-500",
      skills: [
        { name: "Node.js", level: 88, description: "Express, APIs, Middleware" },
        { name: "MongoDB", level: 80, description: "Mongoose, Aggregation, Indexing" },
        { name: "PostgreSQL", level: 75, description: "Queries, Relations, Optimization" },
        { name: "APIs REST", level: 92, description: "Design, Documentation, Testing" }
      ]
    },
    {
      title: "DevOps & Tools",
      icon: "🛠️",
      color: "from-purple-400 to-pink-500",
      skills: [
        { name: "Git", level: 90, description: "Branching, Merging, Workflows" },
        { name: "Docker", level: 75, description: "Containerization, Deployment" },
        { name: "Vercel/Render", level: 85, description: "CI/CD, Environment management" },
        { name: "SEO Técnico", level: 88, description: "Performance, Core Web Vitals" }
      ]
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Habilidades Técnicas
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Tecnologías que domino y utilizo para crear soluciones robustas y escalables
          </p>
        </div>

        <div className="space-y-12">
          {skillCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className={`text-2xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                    {category.title}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.skills.map((skill, skillIndex) => (
                  <div
                    key={skillIndex}
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-white">{skill.name}</h4>
                      <span className="text-sm font-mono text-cyan-400">{skill.level}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${category.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-gray-400 text-sm">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SkillsDetail;