// src/components/cursos/EmailCourseLanding.tsx
'use client'
import { useState } from 'react'
import { CheckCircleIcon, EnvelopeIcon, StarIcon } from '@heroicons/react/24/solid'

interface EmailCourse {
  _id: string
  title: string
  slug: string
  description: string
  icon: string
  totalDays: number
  benefits?: string[]
  whatYouLearn?: string[]
  testimonials?: Array<{
    name: string
    text: string
    avatar?: string
  }>
  ctaText?: string
  stats?: {
    totalSubscribers: number
  }
}

interface EmailCourseLandingProps {
  course: EmailCourse
}

export default function EmailCourseLanding({ course }: EmailCourseLandingProps) {
  const [formData, setFormData] = useState({ email: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/subscribe/${course.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setSubscribed(true)
      } else {
        setError(data.error || 'Error al suscribirse')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (subscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            ¡Bienvenido al curso!
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Revisa tu email. La primera lección llegará en unos minutos.
          </p>
          <p className="text-gray-400">
            Recuerda revisar tu carpeta de spam y añadir luis@luisgranero.com a tus contactos
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-7xl mb-4 block">{course.icon}</span>
          <h1 className="text-5xl font-bold text-white mb-4">
            {course.title}
          </h1>
          <p className="text-2xl text-cyan-100 mb-8">
            {course.description}
          </p>

          {/* Form de suscripción */}
          <div className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                required
              />
              <input
                type="email"
                placeholder="Tu email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 transition-all"
              >
                {loading ? 'Suscribiendo...' : course.ctaText || 'Comenzar Gratis'}
              </button>
            </form>

            <p className="text-sm text-gray-600 mt-4">
              Sin spam. Cancela cuando quieras.
            </p>
          </div>
        </div>
      </section>

      {/* Qué aprenderás */}
      {course.whatYouLearn && course.whatYouLearn.length > 0 && (
        <section className="py-20 max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Lo que aprenderás
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {course.whatYouLearn.map((item, i) => (
              <div key={i} className="flex gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300 text-lg">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Beneficios */}
      {course.benefits && course.benefits.length > 0 && (
        <section className="py-20 bg-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              ¿Por qué este curso?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {course.benefits.map((benefit, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <StarIcon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-300 text-lg">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonios */}
      {course.testimonials && course.testimonials.length > 0 && (
        <section className="py-20 max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Lo que dicen los estudiantes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {course.testimonials.map((testimonial, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-300 mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                <p className="text-cyan-400 font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-cyan-100 mb-8">
            Únete a {course.stats?.totalSubscribers || 0}+ estudiantes que ya están aprendiendo
          </p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
          >
            Inscribirme Gratis
          </a>
        </div>
      </section>

    </div>
  )
}
