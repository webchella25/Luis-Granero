'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function ContactForm() {
  const [settings, setSettings] = useState(null);
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

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error cargando settings:', err));
  }, []);

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

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        alert('Error al enviar. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    const phone = settings?.site?.phone || '+34 XXX XXX XXX';
    const whatsapp = settings?.site?.whatsapp || phone.replace(/\s/g, '');
    const phoneClean = phone.replace(/\s/g, '');
    const whatsappClean = whatsapp.replace(/\+/g, '').replace(/\s/g, '');
    
    return (
      <section className="py-20 bg-gray-950" id="formulario">
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
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-400">
                  <span>📧 Respuesta por email: 2-4h</span>
                  <Link 
                    href={`tel:${phoneClean}`}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    📞 Llamada urgente: {phone}
                  </Link>
                  <Link
                    href={`https://wa.me/${whatsappClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    💬 WhatsApp
                  </Link>
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
    <section className="py-20 bg-gray-950" id="formulario">
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
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre completo *"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                />
                <input
                  type="text"
                  name="company"
                  placeholder="Empresa (opcional)"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none md:col-span-2"
                />
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
                    <div className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                      formData.projectType === type.id
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="font-semibold text-white text-sm">{type.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Presupuesto estimado</h3>
              <div className="space-y-3">
                {budgetRanges.map((range) => (
                  <label key={range.id} className="cursor-pointer block">
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
                      <div className="font-semibold text-white mb-1">{range.label}</div>
                      <div className="text-sm text-gray-400">{range.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">¿Cuándo necesitas el proyecto?</h3>
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
                    <div className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                      formData.timeline === timeline.id
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <div className="text-3xl mb-2">{timeline.icon}</div>
                      <div className="font-semibold text-white text-sm">{timeline.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Funcionalidades requeridas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature) => (
                  <label key={feature.id} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature.id)}
                      onChange={() => handleFeatureChange(feature.id)}
                      className="w-5 h-5 text-cyan-400 rounded focus:ring-cyan-400 focus:ring-offset-gray-900"
                    />
                    <span className="ml-3 text-white group-hover:text-cyan-400 transition-colors">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Descripción del proyecto</h3>
              <textarea
  name="description"
  placeholder="Cuéntame en detalle qué necesitas..."
  rows={6}
  required
  value={formData.description}
  onChange={handleInputChange}
  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none resize-none"
/>
            </div>

            {/* Priority */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Prioridad</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      checked={formData.priority === priority.id}
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