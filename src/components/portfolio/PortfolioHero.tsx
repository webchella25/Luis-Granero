// src/components/portfolio/PortfolioHero.tsx - Versión completamente dinámica
'use client';

interface PortfolioStats {
  totalProjects?: number;
  featuredProjects?: number;
  technologies?: number;
  yearsExperience?: number;
  clientSatisfaction?: string;
  avgROI?: string;
  avgLoadTime?: string;
}

interface PortfolioData {
  hero?: {
    title?: string;
    subtitle?: string;
    description?: string;
  };
  stats?: PortfolioStats;
  categories?: Array<{
    name: string;
    count: string;
    color: string;
  }>;
  valuePropositions?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

interface Props {
  data?: PortfolioData;
  projectCount?: number;
}

export default function PortfolioHero({ data, projectCount = 0 }: Props) {
  // Datos por defecto con valores dinámicos
  const heroContent = {
    title: data?.hero?.title || "Portfolio",
    subtitle: data?.hero?.subtitle || "Casos de éxito que demuestran mi experiencia en desarrollo web moderno",
    description: data?.hero?.description || "Cada proyecto incluye código, métricas reales y tecnologías utilizadas."
  };

  const stats = [
    { 
      number: `${projectCount || data?.stats?.totalProjects || 50}+`, 
      label: "Proyectos completados", 
      icon: "🚀" 
    },
    { 
      number: data?.stats?.clientSatisfaction || "98%", 
      label: "Satisfacción cliente", 
      icon: "⭐" 
    },
    { 
      number: data?.stats?.avgROI || "300%", 
      label: "ROI promedio", 
      icon: "📈" 
    },
    { 
      number: data?.stats?.avgLoadTime || "1.2s", 
      label: "Tiempo de carga medio", 
      icon: "⚡" 
    }
  ];

  const categories = data?.categories || [
    { name: "E-commerce", count: "15+", color: "from-green-400 to-emerald-500" },
    { name: "Aplicaciones Web", count: "20+", color: "from-cyan-400 to-blue-500" },
    { name: "Dashboards", count: "12+", color: "from-purple-400 to-pink-500" },
    { name: "Landing Pages", count: "18+", color: "from-orange-400 to-red-500" }
  ];

  const valuePropositions = data?.valuePropositions || [
    {
      icon: "🎯",
      title: "Enfoque en conversiones",
      description: "Cada proyecto está optimizado para maximizar ROI y conversiones"
    },
    {
      icon: "⚡",
      title: "Performance excepcional",
      description: "Velocidad de carga sub-2 segundos y puntuaciones Lighthouse 90+"
    }
  ];

  const features = [
    "Stack tecnológico utilizado",
    "Métricas y resultados reales", 
    "Screenshots del proyecto",
    "Fragmentos de código relevantes"
  ];

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-green-500/5"></div>
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Header dinámico */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-8">
              {heroContent.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              {heroContent.subtitle}. {heroContent.description}
            </p>
          </div>

          {/* Categories dinámicas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`text-2xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent mb-2`}>
                  {category.count}
                </div>
                <div className="text-gray-300 text-sm">{category.name}</div>
              </div>
            ))}
          </div>

          {/* Value proposition dinámico */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Proyectos que generan resultados
              </h2>
              <div className="space-y-4">
                {valuePropositions.map((vp, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-xl mt-1">{vp.icon}</span>
                    <div>
                      <h3 className="font-semibold text-white">{vp.title}</h3>
                      <p className="text-gray-400">{vp.description}</p>
                    </div>
                  </div>
                ))}
                
                {/* Features fijas */}
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats dinámicas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
