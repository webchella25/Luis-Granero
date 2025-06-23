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
      title: "Calidad",
      description: "Código limpio, escalable y mantenible en cada proyecto",
      icon: "💎"
    },
    {
      title: "Transparencia",
      description: "Comunicación clara y honesta en todo el proceso",
      icon: "🔍"
    },
    {
      title: "Resultados",
      description: "Enfoque en objetivos medibles y ROI real",
      icon: "🎯"
    }
  ];

  const values = (data && data.length > 0) ? data : defaultValues;

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Mis Valores
            </h2>
            <p className="text-xl text-gray-400">
              Los principios que guían mi trabajo profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                
                <div className="text-5xl mb-6">{value.icon}</div>
                
                <h3 className="text-xl font-bold text-white mb-4">
                  {value.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
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