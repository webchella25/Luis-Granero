'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, FileText, Calculator, CheckCircle, Lock, Clock } from 'lucide-react';

function ContactHero() {
  const [contactData, setContactData] = useState({});
  const [loading, setLoading] = useState(true);

  const steps = [
    { step: '01', label: 'Hablamos', desc: 'Consulta gratuita de 30 min' },
    { step: '02', label: 'Planificamos', desc: 'Propuesta técnica detallada' },
    { step: '03', label: 'Creamos', desc: 'Desarrollo con metodología ágil' },
    { step: '04', label: 'Lanzamos', desc: 'Deploy y seguimiento' },
  ];

  useEffect(() => {
    async function fetchContactData() {
      try {
        const response = await fetch('/api/homepage');
        const data = await response.json();
        setContactData(data.config || {});
      } catch (error) {
        console.error('Error fetching contact data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchContactData();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#0F172A] pt-32 pb-20">
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">

          {/* Status */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-emerald-400 font-medium">
              {contactData.availability || 'Disponible para nuevos proyectos'}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-slate-50 mb-6">
            Hablemos de<br />
            <span className="gradient-text">tu proyecto</span>
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Consulta gratuita sin compromiso para analizar tu idea y definir la mejor solución.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link href="#formulario" className="btn-primary inline-flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Empezar proyecto
            </Link>
            <Link href="#calculadora" className="btn-secondary inline-flex items-center justify-center gap-2">
              <Calculator className="w-4 h-4" />
              Calcular presupuesto
            </Link>
          </div>

          {/* Process steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {steps.map((step, i) => (
              <div key={step.step} className="relative bg-[#1E293B] border border-slate-700/50 rounded-xl p-4 text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-slate-700" />
                )}
                <div className="text-xs font-mono text-slate-500 mb-1">PASO {step.step}</div>
                <div className="text-sm font-semibold text-slate-200 mb-0.5">{step.label}</div>
                <div className="text-xs text-slate-500">{step.desc}</div>
              </div>
            ))}
          </div>

          {/* Trust signals */}
          {!loading && (
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-500" />
                Respuesta en {contactData.response_time || '24 horas'}
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-500" />
                Confidencialidad garantizada
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-500" />
                Sin compromiso inicial
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactHero;
