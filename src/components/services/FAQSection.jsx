'use client';

import { useState } from 'react';

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "¿Por qué elegir desarrollo personalizado en lugar de WordPress?",
          answer: "El desarrollo personalizado ofrece performance superior, escalabilidad garantizada, seguridad mejorada y código optimizado. Mientras WordPress puede ser más rápido inicialmente, el desarrollo a medida te da control total, mejor SEO técnico y una base sólida para crecer sin limitaciones de plugins o temas."
        },
        {
          question: "¿Cuánto tiempo toma desarrollar un proyecto?",
          answer: "Depende de la complejidad: Landing pages (2-3 semanas), sitios corporativos (4-6 semanas), e-commerce (6-8 semanas), aplicaciones complejas (8-12 semanas). Trabajo con metodología ágil, así que ves progreso cada semana y puedes hacer ajustes sobre la marcha."
        },
        {
          question: "¿Qué incluye el soporte técnico?",
          answer: "El soporte incluye resolución de bugs, actualizaciones de seguridad, copias de seguridad, monitoreo de performance, actualizaciones menores de contenido y consultas técnicas. El tiempo de soporte varía según el paquete (1-6 meses incluidos)."
        },
        {
          question: "¿Entregas el código fuente?",
          answer: "Sí, recibes todo el código fuente, documentación completa, accesos a servicios y transferencia total del proyecto. No hay dependencias conmigo para futuras modificaciones, aunque recomiendo el mantenimiento profesional."
        }
      ]
    },
    {
      category: "Técnico",
      questions: [
        {
          question: "¿Qué tecnologías utilizas y por qué?",
          answer: "Utilizo React/Next.js porque ofrecen la mejor experiencia de desarrollo y usuario final. Next.js proporciona SSR/SSG para SEO excepcional, TypeScript añade seguridad de tipos, y Tailwind CSS acelera el desarrollo sin sacrificar calidad. Para backend uso Node.js con MongoDB/PostgreSQL según necesidades."
        },
        {
          question: "¿Los sitios son optimizados para SEO?",
          answer: "Absolutamente. Implemento SEO técnico desde el primer día: estructura semántica, meta tags optimizados, Core Web Vitals excelentes, sitemap automático, datos estructurados y performance 90+. No es algo que se añade después, sino que está integrado en la arquitectura."
        },
        {
          question: "¿Cómo garantizas la seguridad?",
          answer: "Implemento mejores prácticas de seguridad: autenticación robusta, validación de datos, protección CSRF, headers de seguridad, auditorías de dependencias, backups automáticos y monitoreo de vulnerabilidades. Además, uso servicios cloud seguros y certificados SSL."
        },
        {
          question: "¿Los sitios son escalables?",
          answer: "Sí, diseño la arquitectura pensando en escalabilidad. Uso patrones de diseño escalables, optimización de base de datos, CDN para assets, lazy loading, y arquitectura modular. Los sitios pueden manejar desde cientos hasta millones de usuarios sin reestructurar."
        }
      ]
    },
    {
      category: "Proceso",
      questions: [
        {
          question: "¿Cómo es el proceso de trabajo?",
          answer: "Trabajo con metodología ágil: 1) Análisis y planificación inicial, 2) Diseño y arquitectura, 3) Desarrollo en sprints con demos semanales, 4) Testing y optimización, 5) Deploy y lanzamiento. Tienes visibilidad total del progreso y participas en cada etapa."
        },
        {
          question: "¿Puedo hacer cambios durante el desarrollo?",
          answer: "Sí, la metodología ágil permite ajustes durante el desarrollo. Cambios menores no afectan el cronograma, cambios mayores se evalúan en conjunto para ajustar tiempo/presupuesto. La comunicación constante evita sorpresas al final."
        },
        {
          question: "¿Qué pasa si no estoy satisfecho con el resultado?",
          answer: "Trabajo hasta que estés 100% satisfecho. Incluyo revisiones en cada fase, y si algo no cumple expectativas, lo ajustamos sin costo adicional (dentro del alcance acordado). Mi objetivo es superarte expectativas, no solo cumplirlas."
        },
        {
          question: "¿Ofreces capacitación para gestionar el sitio?",
          answer: "Sí, incluyo capacitación personalizada para que puedas gestionar contenido, productos, usuarios, etc. Proporciono documentación detallada, videos explicativos y sesiones de formación. También quedo disponible para consultas futuras."
        }
      ]
    },
    {
      category: "Pricing",
      questions: [
        {
          question: "¿Los precios son fijos o pueden variar?",
          answer: "Los precios mostrados son puntos de partida para proyectos estándar. El precio final depende de funcionalidades específicas, integraciones, complejidad del diseño y cronograma. Siempre proporciono un presupuesto detallado antes de empezar."
        },
        {
          question: "¿Qué forma de pago aceptas?",
          answer: "Acepto transferencia bancaria, PayPal y Stripe. Normalmente trabajo con 50% al inicio del proyecto y 50% al finalizar, aunque para proyectos largos podemos acordar pagos por hitos o mensuales."
        },
        {
          question: "¿Hay costos adicionales después del lanzamiento?",
          answer: "Los únicos costos adicionales son opcionales: hosting (si prefieres que yo lo gestione), soporte extendido, nuevas funcionalidades o mantenimiento premium. Te explico todos los costos desde el inicio para que no haya sorpresas."
        },
        {
          question: "¿Ofreces garantía?",
          answer: "Sí, ofrezco garantía completa contra bugs y errores de funcionamiento durante el período de soporte incluido. Si algo no funciona como se especificó, lo arreglo sin costo. También garantizo que el código cumple los estándares de calidad prometidos."
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Resuelvo las dudas más comunes sobre mis servicios y proceso de trabajo
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h3 className="text-2xl font-bold gradient-text mb-6 text-center">
                {category.category}
              </h3>
              
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const isOpen = openIndex === `${categoryIndex}-${questionIndex}`;
                  
                  return (
                    <div
                      key={questionIndex}
                      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors duration-300"
                      >
                        <h4 className="font-semibold text-white pr-4">
                          {faq.question}
                        </h4>
                        <div className={`transform transition-transform duration-300 flex-shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}>
                          <svg
                            className="w-5 h-5 text-cyan-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <div className="border-t border-gray-700 pt-4">
                            <p className="text-gray-300 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              ¿Tienes más preguntas?
            </h3>
            <p className="text-gray-400 mb-6">
              Hablemos directamente sobre tu proyecto. Te responderé todas las dudas sin compromiso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
                Consulta gratuita
              </button>
              <button className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold rounded-lg transition-all duration-300">
                Enviar mensaje
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;