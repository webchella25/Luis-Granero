// src/app/cursos/react-5-dias/page.jsx
'use client'
import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CheckIcon, StarIcon, ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function React5DiasLanding() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/subscribe/react-5-dias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })

      const data = await response.json()

      if (response.ok) {
        setSubscribed(true)
        setEmail('')
        setName('')
      } else {
        setError(data.error || 'Error al suscribirse. Inténtalo de nuevo.')
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const curriculum = [
    {
      day: 1,
      title: "Introducción a React",
      topics: ["Qué es React y por qué usarlo", "Instalación de Node.js y VS Code", "Tu primer proyecto con Vite", "Estructura de un proyecto React"],
      duration: "15 min lectura"
    },
    {
      day: 2,
      title: "Tu primer componente",
      topics: ["Componentes funcionales", "JSX explicado", "Props y reutilización", "Proyecto: Tarjeta de perfil"],
      duration: "20 min lectura + código"
    },
    {
      day: 3,
      title: "Estado con useState",
      topics: ["Hook useState", "Eventos en React", "Estado local vs props", "Proyecto: Contador interactivo"],
      duration: "25 min lectura + código"
    },
    {
      day: 4,
      title: "Efectos con useEffect",
      topics: ["Hook useEffect", "Ciclo de vida", "Consumir una API", "Proyecto: Lista de usuarios"],
      duration: "30 min lectura + código"
    },
    {
      day: 5,
      title: "Deploy tu app",
      topics: ["Build de producción", "Deploy en Vercel", "Variables de entorno", "Tu portfolio live"],
      duration: "20 min lectura + deploy"
    }
  ]

  const benefits = [
    { icon: "📧", text: "1 lección diaria directo a tu email" },
    { icon: "💻", text: "Código real y práctico en cada lección" },
    { icon: "🎯", text: "Enfoque hands-on, nada de teoría pura" },
    { icon: "⚡", text: "15-30 minutos por día, a tu ritmo" },
    { icon: "🚀", text: "Proyecto final deployado en Vercel" },
    { icon: "🆓", text: "100% gratis, sin tarjeta de crédito" }
  ]

  const testimonials = [
    {
      name: "María González",
      role: "Junior Developer",
      avatar: "👩‍💻",
      text: "En 5 días pasé de no saber nada de React a tener mi primera app funcionando. ¡Increíble!",
      rating: 5
    },
    {
      name: "Carlos Ruiz",
      role: "Estudiante",
      avatar: "👨‍🎓",
      text: "El formato de email diario es perfecto. Cada lección es corta pero muy práctica.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Freelancer",
      avatar: "👩‍💼",
      text: "Después de este curso me sentí con confianza para aplicar a trabajos de React. Gracias Luis!",
      rating: 5
    }
  ]

  const faqs = [
    {
      q: "¿Necesito experiencia previa?",
      a: "Solo necesitas conocimientos básicos de HTML, CSS y JavaScript. Si sabes usar variables, funciones y arrays, estás listo."
    },
    {
      q: "¿Cuánto tiempo necesito dedicar?",
      a: "Entre 15-30 minutos por día. Puedes ir a tu ritmo, los emails quedan guardados en tu bandeja."
    },
    {
      q: "¿Es realmente gratis?",
      a: "Sí, 100% gratis. No pedimos tarjeta de crédito ni datos de pago. Solo tu email para enviarte las lecciones."
    },
    {
      q: "¿Qué pasa después de los 5 días?",
      a: "Al final del curso te ofreceremos acceso a nuestro curso avanzado de pago, pero es completamente opcional."
    },
    {
      q: "¿Puedo cancelar en cualquier momento?",
      a: "Por supuesto. Cada email tiene un link para darte de baja si decides que no es para ti."
    }
  ]

  return (
    <main className="min-h-screen bg-black">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-full">
              <span className="text-cyan-400 font-semibold text-sm">
                ⚡ Curso Email Gratuito
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Aprende React en{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                5 Días
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Recibe <strong className="text-white">1 lección diaria por email</strong> y 
              crea tu primera aplicación React desde cero
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12 text-gray-400">
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span><strong className="text-white">4.9/5</strong> valoración</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-cyan-400" />
                <span><strong className="text-white">15-30 min</strong> por día</span>
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="w-5 h-5 text-green-400" />
                <span><strong className="text-white">2,500+</strong> estudiantes</span>
              </div>
            </div>

            {/* Form or Success Message */}
            {!subscribed ? (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    required
                    className="w-full px-6 py-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full px-6 py-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  
                  {error && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Procesando...' : '🚀 Comenzar Gratis Ahora'}
                  </button>
                </form>

                <p className="text-gray-500 text-sm mt-4">
                  Sin spam. Cancela cuando quieras. 100% gratis.
                </p>
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-gradient-to-r from-green-900/20 to-cyan-900/20 border border-green-500/50 rounded-xl p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  ¡Ya estás dentro!
                </h3>
                <p className="text-gray-300 mb-4">
                  Te he enviado un email de confirmación a <strong className="text-cyan-400">{email}</strong>
                </p>
                <p className="text-gray-400 text-sm">
                  Revisa tu bandeja de entrada (y spam por si acaso). 
                  La primera lección llegará en los próximos minutos.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            ¿Por qué este curso es diferente?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
              >
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <p className="text-gray-300">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              ¿Qué aprenderás cada día?
            </h2>
            <p className="text-gray-400 text-center mb-12">
              5 lecciones progresivas de menos a más
            </p>

            <div className="space-y-6">
              {curriculum.map((lesson) => (
                <div 
                  key={lesson.day}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{lesson.day}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {lesson.title}
                        </h3>
                        <p className="text-cyan-400 text-sm">{lesson.duration}</p>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2 ml-16">
                    {lesson.topics.map((topic, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <CheckIcon className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA después del currículum */}
            <div className="mt-12 text-center">
              <a 
                href="#hero"
                className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Inscribirme Gratis Ahora
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Lo que dicen nuestros estudiantes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              Preguntas frecuentes
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-3">
                    {faq.q}
                  </h3>
                  <p className="text-gray-400">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              ¿Listo para aprender React?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Únete a más de 2,500 estudiantes que ya están dominando React
            </p>
            <a 
              href="#hero"
              className="inline-block px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Comenzar Gratis Ahora 🚀
            </a>
            <p className="text-gray-500 text-sm mt-4">
              No necesitas tarjeta de crédito • Cancela cuando quieras
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}