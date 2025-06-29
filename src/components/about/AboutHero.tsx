// src/components/about/AboutHero.tsx
'use client';

interface HeroData {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  stats?: Array<{
    label: string;
    value: string;
  }>;
}

interface Props {
  data?: HeroData;
}

export default function AboutHero({ data }: Props) {
  const heroContent = {
    title: data?.title || "Luis Granero",
    subtitle: data?.subtitle || "Desarrollador Web Full Stack Freelance",
    description: data?.description || "Especializado en React, Next.js y soluciones web personalizadas. Transformo ideas en aplicaciones modernas y exitosas.",
    image: data?.image || "",
    stats: data?.stats || [
      { label: "Años de experiencia", value: "10+" },
      { label: "Proyectos completados", value: "50+" },
      { label: "Satisfacción del cliente", value: "98%" },
      { label: "Tecnologías dominadas", value: "20+" }
    ]
  };

  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content */}
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="gradient-text">{heroContent.title}</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-cyan-400 mb-6 font-semibold">
                {heroContent.subtitle}
              </p>
              
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {heroContent.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
                  Ver mi trabajo
                </button>
                <button className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold rounded-lg transition-all duration-300">
                  Contactar
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {heroContent.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image/Avatar */}
            <div className="lg:text-center">
              <div className="relative inline-block">
                <div className="w-80 h-80 mx-auto bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                  {heroContent.image ? (
                    <img 
                      src={heroContent.image} 
                      alt={heroContent.title}
                      className="w-72 h-72 rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-8xl">👨‍💻</div>
                  )}
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-cyan-400 text-black px-4 py-2 rounded-lg font-bold text-sm">
                  Available for hire
                </div>
                <div className="absolute -bottom-4 -left-4 bg-green-400 text-black px-4 py-2 rounded-lg font-bold text-sm">
                  Remote work
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}