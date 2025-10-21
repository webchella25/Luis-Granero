// src/components/contact/ContactHero.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function ContactHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [contactData, setContactData] = useState({});
  const [loading, setLoading] = useState(true);

  // Pasos del proceso de contacto
  const contactSteps = [
    { 
      step: "01", 
      action: "Hablamos", 
      description: "Consulta gratuita de 30 min",
      icon: "💬",
      color: "from-cyan-400 to-blue-500"
    },
    { 
      step: "02", 
      action: "Planificamos", 
      description: "Propuesta técnica detallada",
      icon: "📋",
      color: "from-blue-500 to-purple-500"
    },
    { 
      step: "03", 
      action: "Creamos", 
      description: "Desarrollo con metodología ágil",
      icon: "💻",
      color: "from-purple-500 to-green-500"
    },
    { 
      step: "04", 
      action: "Lanzamos", 
      description: "Deploy y seguimiento",
      icon: "🚀",
      color: "from-green-500 to-cyan-400"
    }
  ];

  // Opciones de contacto
  const contactOptions = [
    {
      method: "Llamada",
      time: "24 horas",
      icon: "📞",
      color: "cyan",
      description: "Respuesta rápida"
    },
    {
      method: "Email",
      time: "Inmediato",
      icon: "📧",
      color: "green",
      description: "Siempre disponible"
    },
    {
      method: "Presupuesto",
      time: "5 minutos",
      icon: "💰",
      color: "purple",
      description: "Calculadora automática"
    }
  ];

  useEffect(() => {
    // Fetch contact data from MongoDB
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
    setIsVisible(true);

    // Rotación de pasos cada 2.5 segundos
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % contactSteps.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const currentContactStep = contactSteps[currentStep];

  return (
    <section className="py-20 bg-gradient-to-br from-black via-gray-950 to-gray-900 relative overflow-hidden min-h-[85vh] flex items-center">
      
      {/* EFECTOS DE FONDO COMUNICATIVOS */}
      <div className="absolute inset-0">
        {/* Ondas de comunicación */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-cyan-400 rounded-full animate-ping"
              style={{
                top: '50%',
                left: '50%',
                width: `${(i + 1) * 200}px`,
                height: `${(i + 1) * 200}px`,
                marginTop: `-${(i + 1) * 100}px`,
                marginLeft: `-${(i + 1) * 100}px`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
        
        {/* Efectos de luz cálidos */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Partículas de conexión */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 gap-8 h-full">
            {[...Array(32)].map((_, i) => (
              <div 
                key={i}
                className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          
          {/* STATUS INDICATOR */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-semibold text-lg">
              {contactData.availability || 'Disponible para nuevos proyectos'}
            </span>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>

          {/* TÍTULO PRINCIPAL PERSUASIVO */}
          <h1 className="mb-8">
            <div className="text-6xl md:text-8xl font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                Hablemos
              </span>
            </div>
            
            {/* SUBTÍTULO CON PASO ACTUAL */}
            <div className="text-2xl md:text-4xl font-bold">
              <span className="text-gray-300">Paso {currentContactStep.step}: </span>
              <span 
                className={`bg-gradient-to-r ${currentContactStep.color} bg-clip-text text-transparent animate-pulse`}
              >
                {currentContactStep.icon} {currentContactStep.action}
              </span>
            </div>
            <div className="text-lg md:text-xl text-gray-400 mt-2">
              {currentContactStep.description}
            </div>
          </h1>

          {/* PROPUESTA DE VALOR */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            <span className="text-cyan-400 font-semibold">¿Tienes una idea increíble?</span> Vamos a{' '}
            <span className="text-green-400 font-semibold">convertirla en realidad</span>.
            <br />
            <span className="text-purple-400 font-semibold bg-gray-900/50 px-2 py-1 rounded">Consulta gratuita</span> sin compromiso para{' '}
            <span className="text-yellow-400 font-semibold">analizar tu proyecto</span>.
          </p>

          {/* MÉTODOS DE CONTACTO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            {contactOptions.map((option, index) => {
              const colorClasses = {
                cyan: "from-cyan-400 to-cyan-600 border-cyan-500/30 hover:border-cyan-500/60",
                green: "from-green-400 to-green-600 border-green-500/30 hover:border-green-500/60",
                purple: "from-purple-400 to-purple-600 border-purple-500/30 hover:border-purple-500/60"
              };

              return (
                <div
                  key={index}
                  className={`group bg-gray-900/40 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 animate-fade-in-up ${colorClasses[option.color]}`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
                    {option.icon}
                  </div>
                  <h3 className={`text-2xl font-bold bg-gradient-to-r ${colorClasses[option.color].split(' ')[0]} ${colorClasses[option.color].split(' ')[1]} bg-clip-text text-transparent mb-2`}>
                    {option.method}
                  </h3>
                  <div className="text-gray-400 text-lg mb-3">
                    {option.description}
                  </div>
                  <div className="text-cyan-400 font-semibold text-xl">
                    ⏱️ {option.time}
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="mt-4 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${colorClasses[option.color].split(' ')[0]} ${colorClasses[option.color].split(' ')[1]} rounded-full animate-progress-bar`}
                      style={{ animationDelay: `${index * 300 + 500}ms` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTONES DE ACCIÓN PRINCIPALES */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
  href="#formulario"
  className="group relative px-12 py-6 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-black text-2xl rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-3"
>
  <span className="relative z-10 flex items-center">
    <span className="mr-4 text-3xl group-hover:rotate-12 transition-transform">🚀</span>
    Empezar proyecto
    <span className="ml-4 group-hover:translate-x-2 transition-transform text-3xl">→</span>
  </span>
  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
</Link>

<Link
  href="#calculadora"
  className="group px-12 py-6 border-3 border-purple-400/50 text-purple-400 hover:bg-purple-400/10 hover:border-purple-400 font-bold text-2xl rounded-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-3"
>
  <span className="flex items-center">
    <span className="mr-4 text-3xl group-hover:scale-125 transition-transform">💰</span>
    Calcular presupuesto
  </span>
</Link>
          </div>

          {/* PROCESO VISUAL */}
          <div className="max-w-6xl mx-auto">
            <div className="text-gray-400 text-lg mb-8 font-semibold">Nuestro proceso:</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {contactSteps.map((step, index) => (
                <div
                  key={index}
                  className={`group relative p-6 rounded-2xl border transition-all duration-500 ${
                    index === currentStep 
                      ? `border-cyan-500/60 bg-gray-900/60 scale-105` 
                      : 'border-gray-700/50 hover:border-gray-600 hover:scale-105'
                  }`}
                >
                  {/* Línea conectora */}
                  {index < contactSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-cyan-400 to-green-400 opacity-50" />
                  )}
                  
                  <div className="text-3xl mb-3 group-hover:scale-125 transition-transform">
                    {step.icon}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">PASO {step.step}</div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    index === currentStep 
                      ? `bg-gradient-to-r ${step.color} bg-clip-text text-transparent` 
                      : 'text-white group-hover:text-cyan-400'
                  }`}>
                    {step.action}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {step.description}
                  </p>
                  
                  {index === currentStep && (
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* GARANTÍAS Y CONFIANZA */}
          {!loading && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 text-green-400">
                <span className="text-2xl">✅</span>
                <span className="font-semibold">
                  Respuesta en {contactData.response_time || '24 horas'}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-cyan-400">
                <span className="text-2xl">🔒</span>
                <span className="font-semibold">Confidencialidad garantizada</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-purple-400">
                <span className="text-2xl">💎</span>
                <span className="font-semibold">Sin compromiso inicial</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactHero;