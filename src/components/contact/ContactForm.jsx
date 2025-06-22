'use client';

import { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    timeline: '',
    description: '',
    features: [],
    priority: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const projectTypes = [
    { id: 'landing', label: 'Landing Page', icon: '📄' },
    { id: 'corporate', label: 'Web Corporativa', icon: '🏢' },
    { id: 'ecommerce', label: 'E-commerce', icon: '🛒' },
    { id: 'webapp', label: 'Aplicación Web', icon: '💻' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'other', label: 'Otro', icon: '🔧' }
  ];

  const budgetRanges = [
    { id: 'starter', label: '1,000€ - 3,000€', desc: 'Landing pages, sitios básicos' },
    { id: 'business', label: '3,000€ - 8,000€', desc: 'Webs corporativas, e-commerce básico' },
    { id: 'enterprise', label: '8,000€ - 15,000€', desc: 'Aplicaciones complejas, e-commerce avanzado' },
    { id: 'custom', label: '+15,000€', desc: 'Proyectos enterprise, desarrollo a medida' }
  ];

  const timelines = [
    { id: 'asap', label: 'Lo antes posible', icon: '🚀' },
    { id: '1month', label: '1 mes', icon: '📅' },
    { id: '2months', label: '2-3 meses', icon: '⏰' },
    { id: 'flexible', label: 'Flexible', icon: '🤝' }
  ];

  const features = [
    { id: 'responsive', label: 'Diseño responsive' },
    { id: 'seo', label: 'SEO optimizado' },
    { id: 'cms', label: 'Panel de administración' },
    { id: 'ecommerce', label: 'Tienda online' },
    { id: 'blog', label: 'Blog integrado' },
    { id: 'multilang', label: 'Multi-idioma' },
    { id: 'analytics', label: 'Analytics avanzado' },
    { id: 'integrations', label: 'Integraciones API' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (featureId) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(id => id !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold gradient-text mb-4">
                ¡Mensaje enviado con éxito!
              </h2>
              <p className="text-gray-300 mb-6">
                He recibido tu solicitud y te responderé en las próximas 2-4 horas. 
                Si es urgente, también puedes llamarme directamente.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                  <span>📧 Respuesta por email: 2-4h</span>
                  <span>📞 Llamada urgente: +34 XXX XXX XXX</span>
                </div>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Cuéntame tu proyecto
            </h2>
            <p className="text-xl text-gray-400">
              Cuanto más detalles me proporciones, mejor podré ayudarte
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal info */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Información de contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Empresa / Proyecto
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Nombre de tu empresa o proyecto"
                  />
                </div>
              </div>
            </div>

            {/* Project type */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Tipo de proyecto</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {projectTypes.map((type) => (
                  <label key={type.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="projectType"
                      value={type.id}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border transition-all duration-300 text-center ${
                      formData.projectType === type.id
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="text-sm font-semibold text-white">{type.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Presupuesto estimado</h3>
              <div className="space-y-4">
                {budgetRanges.map((range) => (
                  <label key={range.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="budget"
                      value={range.id}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border transition-all duration-300 ${
                      formData.budget === range.id
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">{range.label}</div>
                          <div className="text-sm text-gray-400">{range.desc}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                          formData.budget === range.id
                            ? 'border-cyan-400 bg-cyan-400'
                            : 'border-gray-600'
                        }`}></div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Timeline deseado</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {timelines.map((timeline) => (
                  <label key={timeline.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="timeline"
                      value={timeline.id}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border transition-all duration-300 text-center ${
                      formData.timeline === timeline.id
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <div className="text-2xl mb-2">{timeline.icon}</div>
                      <div className="text-sm font-semibold text-white">{timeline.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Funcionalidades deseadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <label key={feature.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature.id)}
                      onChange={() => handleFeatureChange(feature.id)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-colors ${
                      formData.features.includes(feature.id)
                        ? 'bg-cyan-400 border-cyan-400'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}>
                      {formData.features.includes(feature.id) && (
                        <svg className="w-3 h-3 text-black mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-300">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Descripción del proyecto</h3>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                placeholder="Cuéntame más detalles sobre tu proyecto: objetivos, funcionalidades específicas, referencias, etc."
              />
            </div>

            {/* Priority */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Prioridad</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'low', label: 'Normal', desc: 'Respuesta en 24-48h' },
                  { id: 'normal', label: 'Urgente', desc: 'Respuesta en 2-4h' },
                  { id: 'high', label: 'Muy urgente', desc: 'Respuesta inmediata' }
                ].map((priority) => (
                  <label key={priority.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={priority.id}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border transition-all duration-300 text-center ${
                      formData.priority === priority.id
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <div className="font-semibold text-white mb-1">{priority.label}</div>
                      <div className="text-xs text-gray-400">{priority.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={!formData.name || !formData.email || isSubmitting}
                className="px-12 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  'Enviar solicitud'
                )}
              </button>
              <p className="text-sm text-gray-400 mt-4">
                * Al enviar este formulario acepto ser contactado sobre mi proyecto
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;