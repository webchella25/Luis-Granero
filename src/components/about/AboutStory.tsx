// src/components/about/AboutStory.tsx
'use client';

import { CheckCircle } from 'lucide-react';

interface StoryData {
  title?: string;
  content?: string;
  highlights?: string[];
}

interface Props {
  data?: StoryData;
}

export default function AboutStory({ data }: Props) {
  const storyContent = {
    title: data?.title || "Mi historia",
    content: data?.content || `Soy de Chella, un pueblo de Valencia, y llevo con los ordenadores desde que tengo uso de razón. De joven me enseñé solo a repararlos y montarlos — tengo un curso de reparación y montaje, y con el tiempo aprendí redes, Mikrotik, Ubiquiti. Me gusta entender cómo funciona todo por dentro.

En 2008 abrí una tienda propia, pero la crisis de 2011 me obligó a cerrarla. Después de eso trabajé en una empresa de telecomunicaciones instalando sistemas de internet por antenas, lo que me permitió seguir aprendiendo sobre redes e infraestructura.

El desarrollo web llegó como hobby. Empecé con WordPress hace más de diez años — hice webs para una empresa de telecomunicaciones, para una carpintería metálica... proyectos reales para clientes reales. Pero con el tiempo WordPress me fue quedando pequeño: para casi cualquier cosa que necesitas, estás buscando un plugin específico que muchas veces tiene las funciones limitadas para que pagues la versión premium, y los temas siempre te limitan a lo que el diseñador decidió que podías cambiar.

En 2024 di el salto a React y Next.js, y fue como pasar de conducir con el freno de mano puesto. Ahora construyo exactamente lo que cada proyecto necesita, sin compromisos ni workarounds. Actualmente combino mi trabajo por cuenta ajena con proyectos freelance para pequeñas empresas, y en mis ratos libres estoy desarrollando dos SaaS propios.

Si algo me define como profesional es que me pongo mucho cariño en lo que hago. Si no me convence, no lo entrego. Así de simple.`,
    highlights: data?.highlights || [
      "Autodidacta — de la reparación de PCs al desarrollo web",
      "10+ años construyendo webs reales para clientes",
      "Salto a React/Next.js en 2024 tras años con WordPress",
      "Conocimientos de redes, Mikrotik y Ubiquiti",
      "Actualmente: freelance + 2 proyectos SaaS propios",
      "No entrego nada hasta que está bien hecho"
    ]
  };

  return (
    <section className="py-20 bg-[#0B1120]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              {storyContent.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Historia principal */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg prose-invert max-w-none space-y-5">
                {storyContent.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-300 leading-relaxed text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="lg:col-span-1">
              <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Puntos Destacados</h3>
                <ul className="space-y-4">
                  {storyContent.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}