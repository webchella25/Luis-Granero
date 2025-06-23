// src/components/about/AboutStory.tsx
'use client';

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
    title: data?.title || "Mi Trayectoria",
    content: data?.content || "Comencé mi carrera en el desarrollo web hace más de una década...",
    highlights: data?.highlights || [
      "10+ años de experiencia en desarrollo web",
      "Especialista en React y Next.js",
      "Enfoque en soluciones personalizadas"
    ]
  };

  return (
    <section className="py-20 bg-gray-950">
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
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg">
                  {storyContent.content}
                </p>
              </div>
            </div>

            {/* Highlights */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Puntos Destacados</h3>
                <ul className="space-y-4">
                  {storyContent.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-cyan-400 mt-1">✓</span>
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