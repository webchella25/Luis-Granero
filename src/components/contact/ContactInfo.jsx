// src/components/contact/ContactInfo.jsx
// VERSIÓN DINÁMICA - Lee configuración del admin

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function ContactInfo() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/public');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Error cargando settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-950" id="info">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </section>
    );
  }

  // Valores por defecto si no hay settings
  const site = settings?.site || {
    name: 'Luis Granero',
    email: 'luis@luisgranero.com',
    phone: '+34 698 38 36 10',
    whatsapp: '+34698383610',
    address: 'Madrid, España',
    timezone: 'CET (UTC+1)',
    languages: 'Español, Inglés',
    workingHours: 'Lunes a Viernes: 9:00 - 18:00',
    responseTime: '2-4 horas'
  };

  const social = settings?.social || {};

  // Limpiar número de WhatsApp (quitar espacios y caracteres especiales)
  const whatsappNumber = (site.whatsapp || site.phone || '').replace(/\D/g, '');
  const phoneClean = (site.phone || '').replace(/\D/g, '');

  // Métodos de contacto dinámicos
  const contactMethods = [
    {
      icon: "📧",
      title: "Email",
      value: site.email,
      description: "Respuesta en 2-4 horas",
      action: "Enviar email",
      link: `mailto:${site.email}`,
      available: "24/7",
      show: !!site.email
    },
    {
      icon: "📞",
      title: "Teléfono",
      value: site.phone,
      description: "Llamadas y WhatsApp",
      action: "Llamar ahora",
      link: `tel:+${phoneClean}`,
      available: "Lun-Vie 9:00-18:00",
      show: !!site.phone
    },
    {
      icon: "💬",
      title: "WhatsApp",
      value: "Mensaje directo",
      description: "Respuesta rápida",
      action: "Abrir WhatsApp",
      link: `https://wa.me/${whatsappNumber}`,
      available: "Lun-Vie 9:00-20:00",
      show: !!(site.whatsapp || site.phone)
    },
    {
      icon: "📅",
      title: "Videollamada",
      value: "Consulta gratuita",
      description: "30 minutos sin compromiso",
      action: "Agendar cita",
      link: site.calendly || "#calendar",
      available: "Previa cita",
      show: true // Siempre mostrar
    }
  ].filter(method => method.show);

  // Redes sociales dinámicas
  const socialNetworks = [
    {
      name: "LinkedIn",
      icon: "💼",
      username: social.linkedin ? `@${social.linkedin.split('/').pop()}` : null,
      description: "Conecta profesionalmente",
      link: social.linkedin,
      show: !!social.linkedin
    },
    {
      name: "GitHub",
      icon: "🐱",
      username: social.github ? `@${social.github.split('/').pop()}` : null,
      description: "Ve mi código",
      link: social.github,
      show: !!social.github
    },
    {
      name: "Twitter",
      icon: "🐦",
      username: social.twitter ? `@${social.twitter.split('/').pop()}` : null,
      description: "Sígueme para tips diarios",
      link: social.twitter,
      show: !!social.twitter
    },
    {
      name: "YouTube",
      icon: "📺",
      username: social.youtube ? social.youtube.split('/').pop() : null,
      description: "Tutoriales en video",
      link: social.youtube,
      show: !!social.youtube
    },
    {
      name: "Instagram",
      icon: "📸",
      username: social.instagram ? `@${social.instagram.split('/').pop()}` : null,
      description: "Sígueme en Instagram",
      link: social.instagram,
      show: !!social.instagram
    },
    {
      name: "TikTok",
      icon: "🎵",
      username: social.tiktok ? `@${social.tiktok.split('/').pop()}` : null,
      description: "Videos cortos",
      link: social.tiktok,
      show: !!social.tiktok
    }
  ].filter(network => network.show);

  // FAQs (estas pueden ser estáticas o también dinámicas)
  const faqs = [
    {
      question: "¿Cuál es la mejor forma de contactarte?",
      answer: "Para proyectos nuevos, prefiero email o el formulario web. Para consultas rápidas, WhatsApp es perfecto."
    },
    {
      question: "¿Ofreces consultas gratuitas?",
      answer: "Sí, la primera consulta de 30 minutos es completamente gratuita para analizar tu proyecto."
    },
    {
      question: "¿Trabajas con clientes internacionales?",
      answer: "Absolutamente. Trabajo con clientes de España, Europa y Latinoamérica. Manejo horarios flexibles."
    },
    {
      question: "¿Cuánto tardas en responder?",
      answer: `Normalmente respondo en ${site.responseTime || '2-4 horas'} durante días laborables. Urgencias las atiendo el mismo día.`
    }
  ];

  return (
    <section className="py-20 bg-gray-950" id="info">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Información de Contacto
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Múltiples formas de contactar conmigo. Elige la que más te convenga.
            </p>
          </div>

          {/* Contact methods grid */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Formas de contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <a
                  key={index}
                  href={method.link}
                  target={method.link.startsWith('http') ? '_blank' : '_self'}
                  rel={method.link.startsWith('http') ? 'noopener noreferrer' : ''}
                  className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="text-4xl mb-4">{method.icon}</div>
                  <h4 className="font-bold text-white text-lg mb-2">{method.title}</h4>
                  <p className="text-gray-400 text-sm mb-2">{method.description}</p>
                  <p className="text-cyan-400 font-semibold mb-3">{method.value}</p>
                  <p className="text-gray-500 text-xs mb-4">
                    Disponible: {method.available}
                  </p>
                  <span className="inline-block px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm font-semibold group-hover:bg-cyan-500/20 transition-colors">
                    {method.action}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Office info grid */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              📍 Información general
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {site.address && (
                <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-2">Ubicación</h4>
                  <p className="text-gray-400">{site.address}</p>
                </div>
              )}

              {site.timezone && (
                <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-2">Zona horaria</h4>
                  <p className="text-gray-400">{site.timezone}</p>
                </div>
              )}

              {site.languages && (
                <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-2">Idiomas</h4>
                  <p className="text-gray-400">{site.languages}</p>
                </div>
              )}

              {site.workingHours && (
                <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-2">Horario</h4>
                  <p className="text-gray-400">{site.workingHours}</p>
                </div>
              )}

              {site.responseTime && (
                <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-2">Tiempo de respuesta</h4>
                  <p className="text-gray-400">{site.responseTime} en horario laboral</p>
                </div>
              )}

              {/* Response speed */}
              <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h4 className="font-bold text-white mb-4">⚡ Respuesta rápida</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">🟢</span>
                    <span className="text-gray-300 text-sm">Online ahora</span>
                  </div>
                  {site.email && (
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-400">📧</span>
                      <span className="text-gray-300 text-sm">Email: {site.responseTime || '2-4h'}</span>
                    </div>
                  )}
                  {whatsappNumber && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">💬</span>
                      <span className="text-gray-300 text-sm">WhatsApp: 30min</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-400">🚨</span>
                    <span className="text-gray-300 text-sm">Urgencias: Inmediato</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social networks */}
          {socialNetworks.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">
                Sígueme en redes sociales
              </h3>
              <div className={`grid grid-cols-2 ${socialNetworks.length >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
                {socialNetworks.map((network, index) => (
                  <a
                    key={index}
                    href={network.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
                  >
                    <div className="text-4xl mb-3">{network.icon}</div>
                    <h4 className="font-bold text-white mb-1">{network.name}</h4>
                    {network.username && (
                      <p className="text-cyan-400 text-sm mb-2">{network.username}</p>
                    )}
                    <p className="text-gray-400 text-xs">{network.description}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Preguntas frecuentes sobre contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                >
                  <h4 className="font-bold text-white mb-3">{faq.question}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency contact */}
          {whatsappNumber && (
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl p-8 max-w-2xl mx-auto">
                <div className="text-4xl mb-4">🚨</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  ¿Tienes una urgencia?
                </h3>
                <p className="text-gray-300 mb-6">
                  Si tu sitio web está caído o tienes un problema crítico, 
                  contáctame inmediatamente por WhatsApp o teléfono.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {site.phone && (
                    <a
                      href={`tel:+${phoneClean}`}
                      className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🚨 Contacto de urgencia
                    </a>
                  )}
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    💬 WhatsApp directo
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactInfo;
