// src/app/admin/cursos/[id]/estudiantes/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

export default function CourseStudentsPage({ params }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [statusFilter])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${params.id}/students?status=${statusFilter}`)
      const result = await response.json()

      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching course students:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatMinutes = (mins) => {
    if (!mins) return '0m'
    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const getStatusBadge = (status) => {
    const badges = {
      not_started: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'No Iniciado' },
      in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'En Progreso' },
      completed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Completado' }
    }
    const badge = badges[status] || badges.not_started
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando estudiantes...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400">Error al cargar datos</div>
      </div>
    )
  }

  const { course, metrics, students, articleCompletions } = data

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/blog/learning-paths"
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver a cursos
        </Link>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{course.icon}</span>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                <p className="text-gray-400">{course.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>{course.totalArticles} lecciones</span>
                  <span>•</span>
                  <span>{metrics.totalEnrolled} estudiantes inscritos</span>
                </div>
              </div>
            </div>

            <a
              href={`/api/admin/students/export?type=progress&courseId=${params.id}`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Exportar
            </a>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-4">
          <div className="text-cyan-400 text-2xl font-bold">{metrics.totalEnrolled}</div>
          <div className="text-gray-400 text-sm">Total Inscritos</div>
        </div>

        <div className="bg-gray-800 border border-blue-500/30 rounded-lg p-4">
          <div className="text-blue-400 text-2xl font-bold">{metrics.inProgress}</div>
          <div className="text-gray-400 text-sm">En Progreso</div>
        </div>

        <div className="bg-gray-800 border border-green-500/30 rounded-lg p-4">
          <div className="text-green-400 text-2xl font-bold">{metrics.completed}</div>
          <div className="text-gray-400 text-sm">Completados</div>
        </div>

        <div className="bg-gray-800 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-yellow-400 text-2xl font-bold">{metrics.completionRate}%</div>
          <div className="text-gray-400 text-sm">Tasa Completado</div>
        </div>

        <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-4">
          <div className="text-purple-400 text-2xl font-bold">{metrics.avgProgress}%</div>
          <div className="text-gray-400 text-sm">Progreso Promedio</div>
        </div>

        <div className="bg-gray-800 border border-orange-500/30 rounded-lg p-4">
          <div className="text-orange-400 text-2xl font-bold">{formatMinutes(metrics.avgTimeSpent)}</div>
          <div className="text-gray-400 text-sm">Tiempo Promedio</div>
        </div>
      </div>

      {/* Análisis de Abandono */}
      {articleCompletions && articleCompletions.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📊 Análisis de Abandono por Lección</h2>
          <div className="space-y-3">
            {articleCompletions.map((article, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="text-gray-500 font-mono text-sm w-8">#{article.order}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm">{article.title}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-cyan-400 text-sm">{article.completions} completados</span>
                      {article.dropoffRate > 0 && (
                        <span className={`text-sm ${
                          article.dropoffRate > 30 ? 'text-red-400' :
                          article.dropoffRate > 15 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {article.dropoffRate}% abandono
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${(article.completions / metrics.totalEnrolled) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'not_started', label: 'No Iniciados' },
          { id: 'in_progress', label: 'En Progreso' },
          { id: 'completed', label: 'Completados' }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === filter.id
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Students List */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Lecciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tiempo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Inscrito
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Última Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Certificado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                    No hay estudiantes con este filtro
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/estudiantes/${student._id}`}
                        className="flex items-center gap-3 hover:text-cyan-400"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          {student.avatar ? (
                            <img src={student.avatar} alt={student.username} className="w-full h-full rounded-full" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{student.fullName}</div>
                          <div className="text-xs text-gray-400">{student.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              student.progress === 100 ? 'bg-green-500' :
                              student.progress > 50 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-semibold">{Math.round(student.progress)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">
                        {student.completedArticles}/{student.totalArticles}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400">{formatMinutes(student.timeSpent)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">{formatDate(student.enrolledAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">{formatDate(student.lastAccessedAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {student.certificateIssued ? (
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-400" />
                          <span className="text-xs text-green-400">{student.certificateId}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">No emitido</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
