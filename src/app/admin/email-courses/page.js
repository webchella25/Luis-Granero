// src/app/admin/email-courses/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function EmailCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/email-courses')
      const data = await res.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (courseId, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/email-courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (res.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error('Error toggling course:', error)
    }
  }

  const handleDelete = async (courseId) => {
    if (!confirm('¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/email-courses/${courseId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Cargando cursos...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cursos por Email</h1>
          <p className="text-gray-400">Gestiona los cursos automáticos de email</p>
        </div>
        <Link
          href="/admin/email-courses/new"
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          + Crear Curso
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: 'Total Cursos',
            value: courses.length,
            icon: '📧',
            color: 'cyan'
          },
          {
            label: 'Cursos Activos',
            value: courses.filter(c => c.isActive).length,
            icon: '✅',
            color: 'green'
          },
          {
            label: 'Total Suscriptores',
            value: courses.reduce((sum, c) => sum + (c.stats?.totalSubscribers || 0), 0),
            icon: '👥',
            color: 'blue'
          },
          {
            label: 'Suscriptores Activos',
            value: courses.reduce((sum, c) => sum + (c.stats?.activeSubscribers || 0), 0),
            icon: '🔥',
            color: 'orange'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.icon}</span>
              <span className={`text-3xl font-bold text-${stat.color}-400`}>
                {stat.value}
              </span>
            </div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-xl font-bold text-white mb-2">No hay cursos creados</h3>
          <p className="text-gray-400 mb-6">Crea tu primer curso de email para comenzar</p>
          <Link
            href="/admin/email-courses/new"
            className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Crear Primer Curso
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{course.icon}</div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{course.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        course.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {course.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400">
                        {course.totalDays} días
                      </span>
                    </div>

                    <p className="text-gray-400 mb-3">{course.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>📊 {course.stats?.totalSubscribers || 0} suscriptores totales</span>
                      <span>🔥 {course.stats?.activeSubscribers || 0} activos</span>
                      <span>✅ {course.stats?.completedSubscribers || 0} completados</span>
                      <span>📧 {course.emails?.length || 0} emails configurados</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/email-courses/${course._id}/subscribers`}
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="Ver suscriptores"
                  >
                    👥
                  </Link>
                  <Link
                    href={`/admin/email-courses/${course._id}/edit`}
                    className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                    title="Editar"
                  >
                    ✏️
                  </Link>
                  <button
                    onClick={() => handleToggleActive(course._id, course.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      course.isActive
                        ? 'text-yellow-400 hover:bg-yellow-500/20'
                        : 'text-green-400 hover:bg-green-500/20'
                    }`}
                    title={course.isActive ? 'Desactivar' : 'Activar'}
                  >
                    {course.isActive ? '⏸️' : '▶️'}
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
