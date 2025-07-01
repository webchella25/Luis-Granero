// src/components/home/ContactCTA.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ContactInfo {
  contact_email?: string;
  response_time?: string;
  availability?: string;
}

interface Props {
  data?: any;
}

export default function ContactCTA({ data }: Props) {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const response = await fetch('/api/homepage');
        const data = await response.json();
        setContactInfo(data.config || {});
      } catch (error) {
        console.error('Error fetching contact info:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContactInfo();
  }, []);

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-green-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Título principal */}
          <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-8">
            ¿Tienes un proyecto en mente?
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Hablemos y transformemos tu idea en una aplicación web exitosa
          </p>

          {/* Botones principales */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              href="/contacto"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Empezar proyecto
              <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
            
            <Link
              href="/contacto#calculator"
              className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Calcular presupuesto
            </Link>
          </div>

          {/* Info rápida */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-bold text-white mb-2">Respuesta rápida</h3>
              <p className="text-gray-400">
                {contactInfo.response_time || 'Respuesta en 24 horas'}
              </p>
            </div>

            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-lg font-bold text-white mb-2">Consulta gratuita</h3>
              <p className="text-gray-400">
                30 minutos para analizar tu proyecto
              </p>
            </div>

            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-lg font-bold text-white mb-2">Inicio inmediato</h3>
              <p className="text-gray-400">
                {contactInfo.availability || 'Disponible para nuevos proyectos'}
              </p>
            </div>
          </div>

          {/* Contact info */}
          {!loading && contactInfo.contact_email && (
            <div className="mt-12 text-center">
              <p className="text-gray-400 mb-2">O escríbeme directamente:</p>
              
                href={`mailto:${contactInfo.contact_email}`}
                className="text-cyan-400 hover:text-cyan-300 font-medium text-lg transition-colors"
              >
                {contactInfo.contact_email}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}