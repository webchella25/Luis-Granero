// src/components/about/SkillsDetail.tsx
'use client';

interface Skills {
  technical?: string[];
  soft?: string[];
  tools?: string[];
}

interface Props {
  data?: Skills;
}

export default function SkillsDetail({ data }: Props) {
  const defaultSkills: Skills = {
    technical: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB"],
    soft: ["Comunicación efectiva", "Resolución de problemas", "Trabajo en equipo"],
    tools: ["VS Code", "Git", "Docker", "Vercel", "Figma"]
  };

  const skills = {
    technical: (data?.technical && data.technical.length > 0) ? data.technical : defaultSkills.technical,
    soft: (data?.soft && data.soft.length > 0) ? data.soft : defaultSkills.soft,
    tools: (data?.tools && data.tools.length > 0) ? data.tools : defaultSkills.tools
  };

  const skillCategories = [
    {
      title: "Habilidades Técnicas",
      skills: skills.technical,
      icon: "💻",
      color: "from-cyan-400 to-blue-500"
    },
    {
      title: "Habilidades Blandas",
      skills: skills.soft,
      icon: "🤝",
      color: "from-green-400 to-emerald-500"
    },
    {
      title: "Herramientas",
      skills: skills.tools,
      icon: "🛠️",
      color: "from-purple-400 to-pink-500"
    }
  ];

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Habilidades
            </h2>
            <p className="text-xl text-gray-400">
              Mi conjunto de competencias técnicas y personales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skillCategories.map((category, index) => (
              <div
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
              >
                
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className={`text-xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                    {category.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {category.skills?.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                    >
                      <span className="text-gray-300">{skill}</span>
                      <span className="text-green-400">✓</span>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}