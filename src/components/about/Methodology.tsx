// src/components/about/Methodology.tsx
'use client';

interface MethodologyData {
  title?: string;
  description?: string;
  steps?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

interface Props {
  data?: MethodologyData;
}

export default function Methodology({ data }: Props) {
  const methodologyContent = {
    title: data?.title || "Mi Metodología",
    description: data?.description || "Un proceso estructurado que garantiza resultados excepcionales",
    steps: data?.steps || [
      {
        title: "Análisis y Planificación",
        description: "Entiendo tus necesidades, objetivos y audiencia para crear una estrategia sólida.",
        icon: "🎯"
      },
      {
        title: "Diseño y Prototipado",
        description: "Creo wireframes y prototipos que validan la experiencia de usuario antes del desarrollo.",
        icon: "🎨"
      },
      {
        title: "Desarrollo Ágil",
        description: "Implemento la solución usando las mejores prácticas y tecnologías modernas.",
        icon: "⚡"
      },
      {
        title: "Testing y Optimización",
        description: "Pruebas exhaustivas y optimización de performance antes del lanzamiento.",
        icon: "🔍"
      },
      {
        title: "Lanzamiento y Soporte",
        description: "Deploy seguro y soporte continuo para garantizar el éxito a largo plazo.",
        icon: "🚀"
      }
    ]
  };

  return (
    <section className="py-20 bg-[#0F172A]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              {methodologyContent.title}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {methodologyContent.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {methodologyContent.steps.map((step, index) => (
              <div key={index} className="relative">
                
                {/* Connection line */}
                {index < methodologyContent.steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-cyan-400 to-green-400 transform translate-x-4"></div>
                )}

                <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 text-center hover:border-cyan-500/40 transition-all duration-200">
                  
                  <div className="text-4xl mb-4">{step.icon}</div>
                  
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full flex items-center justify-center text-black font-bold text-sm mx-auto mb-4">
                    {index + 1}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3">
                    {step.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.description}
                  </p>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}