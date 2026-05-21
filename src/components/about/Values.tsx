// src/components/about/Values.tsx
'use client';

interface Value {
  title: string;
  description: string;
  icon: string;
}

interface Props {
  data?: Value[];
}

export default function Values({ data }: Props) {
  const defaultValues: Value[] = [
    {
      title: "Calidad ante todo",
      description: "Cada línea de código está pensada para ser mantenible, escalable y eficiente.",
      icon: "💎"
    },
    {
      title: "Comunicación transparente",
      description: "Mantengo informado al cliente en cada etapa del proyecto con actualizaciones regulares.",
      icon: "💬"
    },
    {
      title: "Enfoque en resultados",
      description: "No solo desarrollo sitios web, creo soluciones que impactan positivamente en tu negocio.",
      icon: "🎯"
    },
    {
      title: "Aprendizaje continuo",
      description: "Me mantengo actualizado con las últimas tecnologías y mejores prácticas del sector.",
      icon: "📚"
    }
  ];

  const values = (data && data.length > 0) ? data : defaultValues;

  return (
    <section className="py-20 bg-[#0B1120]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Mis Valores
            </h2>
            <p className="text-xl text-gray-400">
              Los principios que guían mi trabajo diario
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 text-center hover:border-cyan-500/40 transition-all duration-200"
              >
                
                <div className="text-4xl mb-4">{value.icon}</div>

                <h3 className="text-lg font-bold text-white mb-3">
                  {value.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {value.description}
                </p>

              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}