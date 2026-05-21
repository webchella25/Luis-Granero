'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle, MessageCircle, Calendar } from 'lucide-react';

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          description: formData.description,
          // Valores por defecto para que el modelo no falle
          projectType: 'other',
          budget: 'custom',
          timeline: 'flexible',
          priority: 'normal',
          features: [],
        })
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        setError('Error al enviar. Inténtalo de nuevo o escríbeme directamente.');
      }
    } catch {
      setError('Error de conexión. Puedes escribirme a hola@luisgranero.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-24 bg-[#0B1120]" id="formulario">
        <div className="container mx-auto px-6 max-w-xl">
          <div className="bg-[#1E293B] border border-emerald-500/30 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">
              Recibido, gracias
            </h2>
            <p className="text-slate-400 mb-8">
              Te respondo en menos de 24h con mis disponibilidades para una llamada de 20 minutos. En esa llamada definimos si encajamos y qué necesitas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/34XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] rounded-lg hover:bg-[#25D366]/20 transition-colors text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp si es urgente
              </a>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-5 py-3 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors text-sm"
              >
                Enviar otro mensaje
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-[#0B1120]" id="formulario">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">

          {/* Left — contexto */}
          <div className="pt-2">
            <div className="badge badge-cyan mb-5">
              <Calendar className="w-3.5 h-3.5" />
              Llamada gratuita de 20 min
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 leading-tight mb-5">
              Cuéntame qué<br />necesitas
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Sin formularios largos. Me dices qué tienes en mente, te respondo en 24h con mis disponibilidades y hablamos por llamada. Nada más.
            </p>

            <div className="space-y-4">
              {[
                { step: '1', label: 'Me escribes', desc: 'Nombre, email y qué necesitas' },
                { step: '2', label: 'Te respondo en 24h', desc: 'Con hueco para una llamada de 20 min' },
                { step: '3', label: 'Hablamos', desc: 'Entiendo tu proyecto y te digo si puedo ayudarte' },
                { step: '4', label: 'Propuesta', desc: 'Si encajamos, te mando presupuesto detallado' },
              ].map(({ step, label, desc }) => (
                <div key={step} className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold flex-shrink-0 mt-0.5">
                    {step}
                  </span>
                  <div>
                    <div className="text-slate-200 font-medium text-sm">{label}</div>
                    <div className="text-slate-500 text-sm">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — formulario */}
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  ¿Qué necesitas?
                </label>
                <textarea
                  name="description"
                  required
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Cuéntame brevemente tu proyecto o idea. Sin preocuparte por los detalles técnicos."
                  className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.email || !formData.description}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-[#0F172A] font-bold rounded-lg transition-colors text-sm"
              >
                {isSubmitting ? 'Enviando...' : (
                  <>Enviar mensaje <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-slate-600 text-xs text-center">
                Respuesta garantizada en menos de 24h · Sin spam
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ContactForm;
