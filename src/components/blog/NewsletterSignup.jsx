'use client';

import { useState } from 'react';

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const interestOptions = [
    { id: 'react', label: 'React & Hooks', icon: '⚛️' },
    { id: 'nextjs', label: 'Next.js', icon: '▲' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'typescript', label: 'TypeScript', icon: '🔷' },
    { id: 'seo', label: 'SEO Técnico', icon: '📈' },
    { id: 'devops', label: 'DevOps', icon: '🚀' }
  ];

  const benefits = [
    {
      icon: "📧",
      title: "Newsletter semanal",
      description: "Resumen de los mejores artículos y recursos cada viernes"
    },
    {
      icon: "🎯",
      title: "Contenido exclusivo",
      description: "Tutoriales avanzados y tips que no publico en el blog"
    },
    {
      icon: "📚",
      title: "Recursos gratuitos",
      description: "Checklists, templates y guías descargables"
    },
    {
      icon: "💡",
      title: "Primeras noticias",
      description: "Sé el primero en conocer nuevos proyectos y cursos"
    }
  ];

  const stats = [
    { number: "2,500+", label: "Suscriptores" },
    { number: "95%", label: "Tasa de apertura" },
    { number: "4.9/5", label: "Valoración media" },
    { number: "0", label: "Spam nunca" }
  ];

  const handleInterestChange = (interestId) => {
    setInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsSubscribed(true);
    setEmail('');
    setInterests([]);
  };

  if (isSubscribed) {
    return (
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold gradient-text mb-4">
                ¡Bienvenido a la comunidad!
              </h2>
              <p className="text-gray-300 mb-6">
                Te he enviado un email de confirmación. Revisa tu bandeja de entrada 
                (y la carpeta de spam por si acaso).
              </p>
              <p className="text-gray-400 text-sm">
                Recibirás el primer newsletter este viernes con contenido exclusivo.
              </p>
              <button 
                onClick={() => setIsSubscribed(false)}
                className="mt-6 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Suscribir otro email
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#0F172A] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-green-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Únete a la Newsletter
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Recibe contenido exclusivo, tutoriales avanzados y recursos gratuitos 
              directamente en tu inbox. Sin spam, solo valor.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <div className="bg-[#1E293B]/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                    Tu email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 bg-gray-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Temas de interés (opcional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {interestOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={interests.includes(option.id)}
                          onChange={() => handleInterestChange(option.id)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-colors ${
                          interests.includes(option.id)
                            ? 'bg-cyan-400 border-cyan-400'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}>
                          {interests.includes(option.id) && (
                            <svg className="w-3 h-3 text-black mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-gray-300 flex items-center space-x-1">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!email || isLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Suscribiendo...</span>
                    </div>
                  ) : (
                    'Suscribirme gratis'
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Al suscribirte aceptas recibir emails con contenido técnico. 
                  Puedes cancelar en cualquier momento.
                </p>
              </form>
            </div>

            {/* Benefits and stats */}
            <div className="space-y-8">
              {/* Benefits */}
              <div>
                <h3 className="text-2xl font-bold gradient-text mb-6">
                  ¿Qué recibirás?
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="text-2xl flex-shrink-0">{benefit.icon}</div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                        <p className="text-gray-400 text-sm">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-[#1E293B]/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h4 className="font-bold text-white mb-4 text-center">
                  Números que hablan por sí solos
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xl font-bold gradient-text">{stat.number}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-[#1E293B]/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <blockquote className="text-gray-300 text-sm italic mb-3">
                  "Los newsletters de Luis son los únicos que leo completos. 
                  Siempre aprendo algo nuevo y aplicable en mis proyectos."
                </blockquote>
                <div className="text-xs text-gray-400">
                  - María García, Senior Frontend Developer
                </div>
              </div>

              {/* Social proof */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Únete a desarrolladores de:
                </p>
                <div className="flex items-center justify-center space-x-4 text-2xl">
                  <span title="Google">🔍</span>
                  <span title="Microsoft">Ⓜ️</span>
                  <span title="Meta">📘</span>
                  <span title="Spotify">🎵</span>
                  <span title="Startups">🚀</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSignup;