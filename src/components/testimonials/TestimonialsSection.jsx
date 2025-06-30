// src/components/testimonials/TestimonialsSection.jsx
'use client';

function TestimonialsSection({ testimonials = [] }) {
  // Datos de fallback si no vienen testimonios
  const defaultTestimonials = [
    {
      _id: '1',
      client: {
        name: 'María González',
        company: 'StartupTech',
        role: 'CEO'
      },
      content: 'Luis transformó nuestra idea en una plataforma increíble. El resultado superó nuestras expectativas y los tiempos de entrega fueron impecables.',
      rating: 5,
      project: {
        name: 'Plataforma SaaS'
      },
      metrics: [
        { key: 'performance', value: '+40%', label: 'Performance' },
        { key: 'conversions', value: '+60%', label: 'Conversiones' }
      ]
    },
    {
      _id: '2',
      client: {
        name: 'Carlos Ruiz',
        company: 'E-commerce Plus',
        role: 'CTO'
      },
      content: 'La tienda online que desarrolló Luis incrementó nuestras ventas un 85% en los primeros 3 meses. Su enfoque técnico es excepcional.',
      rating: 5,
      project: {
        name: 'E-commerce Personalizado'
      },
      metrics: [
        { key: 'sales', value: '+85%', label: 'Ventas' },
        { key: 'performance', value: '95/100', label: 'Performance' }
      ]
    },
    {
      _id: '3',
      client: {
        name: 'Ana Martínez',
        company: 'Digital Agency',
        role: 'Directora'
      },
      content: 'Trabajar con Luis fue una experiencia fantástica. Su comunicación es clara, cumple plazos y el código es de calidad profesional.',
      rating: 5,
      project: {
        name: 'Dashboard Corporativo'
      },
      metrics: [
        { key: 'efficiency', value: '+50%', label: 'Eficiencia' },
        { key: 'users', value: '1000+', label: 'Usuarios' }
      ]
    }
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  if (displayTestimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Lo que dicen mis clientes
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Testimonios reales de clientes satisfechos con resultados medibles y proyectos exitosos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial) => (
            <div 
              key={testimonial._id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-cyan-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Rating */}
              <div className="flex items-center mb-6">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <svg 
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-300 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Metrics */}
              {testimonial.metrics && testimonial.metrics.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-6">
                  {testimonial.metrics.map((metric, index) => (
                    <div key={index} className="text-center">
                      <div className="text-cyan-400 font-bold text-lg">
                        {metric.value}
                      </div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Client info */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {testimonial.client.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {testimonial.client.name}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {testimonial.client.role}
                      {testimonial.client.company && (
                        <span> en {testimonial.client.company}</span>
                      )}
                    </div>
                    {testimonial.project?.name && (
                      <div className="text-cyan-400 text-xs mt-1">
                        Proyecto: {testimonial.project.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">
            ¿Quieres ser el próximo caso de éxito?
          </p>
          <a 
            href="/contacto"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
          >
            Empezar mi proyecto
          </a>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;