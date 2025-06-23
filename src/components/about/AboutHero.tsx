// src/components/about/AboutHero.tsx
'use client';

import Image from 'next/image';

interface HeroData {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
}

interface Props {
  data?: HeroData;
}

export default function AboutHero({ data }: Props) {
  const heroContent = {
    title: data?.title || "Sobre Luis Granero",
    subtitle: data?.subtitle || "Mi historia como desarrollador",
    description: data?.description || "Soy un desarrollador web con más de 10 años de experiencia, especializado en crear soluciones digitales que transforman ideas en realidad.",
    image: data?.image || "/images/about/luis-granero.jpg"
  };

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-green-500/5"></div>
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-6">
                {heroContent.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                {heroContent.subtitle}
              </p>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                {heroContent.description}
              </p>
              
              {/* Stats rápidas */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold gradient-text mb-2">10+</div>
                  <div className="text-gray-400 text-sm">Años de experiencia</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold gradient-text mb-2">50+</div>
                  <div className="text-gray-400 text-sm">Proyectos completados</div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/20 to-green-500/20 flex items-center justify-center">
                  {heroContent.image ? (
                    <Image
                      src={heroContent.image}
                      alt="Luis Granero"
                      width={300}
                      height={300}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-64 h-64 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-6xl">👨‍💻</span>
                    </div>
                  )}
                </div>
                {/* Efectos decorativos */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400 rounded-full opacity-60"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full opacity-60"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}