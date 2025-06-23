// src/components/home/ContactCTA.tsx
'use client';

import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon, CalculatorIcon } from '@heroicons/react/24/outline';

interface ContactOption {
  icon: string;
  title: string;
  description: string;
  action: string;
  link: string;
  highlight?: boolean;
}

interface CTAData {
  title?: string;
  description?: string;
  options?: ContactOption[];
  mainCTA?: {
    text: string;
    link: string;
  };
  features?: string[];
}

interface Props {
  data?: CTAData;
}

export default function ContactCTA({ data }: Props) {
  // Datos por defecto
  const defaultData: CTAData = {
    title: "Hablemos de tu proyecto",
    description: "¿Tienes una idea increíble? ¿Necesitas modernizar tu web actual? ¿Buscas un desarrollador que entienda tu negocio?",
    options: [
      {
        icon: "💬",
        title: "Consulta Gratuita",
        description: "30 minutos para analizar tu proyecto sin compromiso",
        action: "Agendar llamada",
        link: "/contacto",
        highlight: true
      },
      {
        icon: "💻", 
        title: "Presupuesto Express",
        description: "Calculadora automática para proyectos estándar",
        action: "Calcular precio",
        link: "/contacto#calculadora"
      },
      {
        icon: "📧",
        title: "Contacto Directo", 
        description: "Escríbeme directamente con los detalles de tu proyecto",
        action: "Enviar mensaje",
        link: "/contacto#formulario"
      }
    ],
    mainCTA: {
      text: "Empezar mi proyecto ahora",
      link: "/contacto"
    },
    features: [
      "Respuesta en 24h",
      "Sin compromiso", 
      "Consulta gratuita"
    ]
  };

  const contactData = {
    title: data?.title || defaultData.title,
    description: data?.description || defaultData.description,
    options: data?.options || defaultData.options,
    mainCTA: data?.mainCTA || defaultData.mainCTA,
    features: data?.features || defaultData.features
  };

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-green-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-8">
            {contactData.title}
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            {contactData.description}
          </p>

          {/* Contact options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {contactData.options?.map((option, index) => (
              <Link
                key={index}
                href={option.link}
                className={`group bg-gray-900/30 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 block ${
                  option.highlight 
                    ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                    : 'border-gray-800 hover:border-cyan-500/50'
                }`}
              >
                <div className="text-4xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{option.title}</h3>
                <p className="text-gray-400 mb-4">
                  {option.description}
                </p>
                <span className={`inline-block w-full py-2 px-4 font-semibold rounded-lg transition-colors ${
                  option.highlight
                    ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-black'
                    : 'bg-gray-800 text-cyan-400 group-hover:bg-gray-700'
                }`}>
                  {option.action} →
                </span>
              </Link>
            ))}
          </div>

          {/* Main CTA */}
          <div className="space-y-6">
            <Link
              href={contactData.mainCTA?.link || '/contacto'}
              className="inline-block px-12 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg text-lg hover:shadow-2xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105"
            >
              {contactData.mainCTA?.text}
            </Link>
            
            {/* Features */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-gray-400">
              {contactData.features?.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">98%</div>
              <div className="text-gray-400 text-sm">Clientes satisfechos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">24h</div>
              <div className="text-gray-400 text-sm">Tiempo respuesta</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">50+</div>
              <div className="text-gray-400 text-sm">Proyectos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">100%</div>
              <div className="text-gray-400 text-sm">A tiempo</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}