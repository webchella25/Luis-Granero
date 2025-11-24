// src/components/home/FeaturedCourse.tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface FeaturedCourseProps {
  course?: {
    title: string
    slug: string
    description: string
    icon: string
    benefits: string[]
    stats: {
      totalSubscribers: number
    }
  }
}

export default function FeaturedCourse({ course }: FeaturedCourseProps) {
  // Si no hay curso, mostrar versión por defecto
  if (!course) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-block bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-cyan-400 font-semibold">📧 CURSO GRATUITO</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="text-5xl md:text-6xl">⚛️</span>
              <br />
              Aprende React en 5 Días
            </h2>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Recibe un email diario con lecciones prácticas, ejemplos de código y ejercicios para dominar React desde cero. 100% gratis.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="bg-gray-800 rounded-lg px-6 py-3">
                <div className="text-cyan-400 font-bold text-lg">5 Días</div>
                <div className="text-gray-400 text-sm">de contenido</div>
              </div>
              <div className="bg-gray-800 rounded-lg px-6 py-3">
                <div className="text-cyan-400 font-bold text-lg">100% Gratis</div>
                <div className="text-gray-400 text-sm">sin tarjeta</div>
              </div>
              <div className="bg-gray-800 rounded-lg px-6 py-3">
                <div className="text-cyan-400 font-bold text-lg">1 Email/Día</div>
                <div className="text-gray-400 text-sm">aprende a tu ritmo</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cursos/react-5-dias"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              >
                ¡Quiero Aprender React! →
              </Link>
              <Link
                href="/cursos"
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all"
              >
                Ver Todos los Cursos
              </Link>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              ✨ Únete a cientos de desarrolladores que ya están aprendiendo
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  // Si hay curso disponible, mostrarlo con sus datos
  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-block bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
            <span className="text-cyan-400 font-semibold">📧 CURSO GRATUITO</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="text-5xl md:text-6xl">{course.icon}</span>
            <br />
            {course.title}
          </h2>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {course.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
            {course.benefits.slice(0, 3).map((benefit, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-300 text-sm">✓ {benefit}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/cursos/${course.slug}`}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              ¡Comenzar Ahora! →
            </Link>
            <Link
              href="/cursos"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all"
            >
              Ver Todos los Cursos
            </Link>
          </div>

          {course.stats?.totalSubscribers > 0 && (
            <p className="text-gray-500 text-sm mt-6">
              ✨ Únete a {course.stats.totalSubscribers}+ desarrolladores que ya están aprendiendo
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
