// src/app/admin/estudiantes/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  UserGroupIcon,
  AcademicCapIcon,
  TrophyIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function StudentsAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      const [analyticsRes, studentsRes] = await Promise.all([
        fetch('/api/admin/students/analytics'),
        fetch(`/api/admin/students?filter=${filter}&limit=10&sortBy=xp&sortOrder=desc`)
      ])

      const analyticsData = await analyticsRes.json()
      const studentsData = await studentsRes.json()

      if (analyticsData.success) {
        setAnalytics(analyticsData)
      }

      if (studentsData.success) {
        setStudents(studentsData.students)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    return num?.toLocaleString('es-ES') || '0'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando analytics...</div>
      </div>
    )
  }

  const { overview, topCourses, dailyGrowth, topStudentsByXP } = analytics || {}

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">📊 Analytics de Estudiantes</h1>
          <p className="text-gray-400 mt-1">Dashboard completo de métricas y seguimiento</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/admin/students/export?type=students"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            📥 Exportar Estudiantes
          </a>
          <Link
            href="/admin/estudiantes/lista"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Ver Todos →
          </Link>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Estudiantes */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <UserGroupIcon className="w-8 h-8 text-blue-400" />
            <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">
              Total
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatNumber(overview?.totalStudents)}
          </div>
          <div className="text-sm text-gray-400">Estudiantes registrados</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-400">Este mes:</span>
            <span className="text-sm font-semibold text-blue-400">
              +{overview?.newStudentsThisMonth}
            </span>
          </div>
        </div>

        {/* Estudiantes Activos */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <ChartBarIcon className="w-8 h-8 text-green-400" />
            {overview?.growthRate >= 0 ? (
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
            ) : (
              <ArrowTrendingDownIcon className="w-6 h-6 text-red-400" />
            )}
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatNumber(overview?.activeStudents)}
          </div>
          <div className="text-sm text-gray-400">Activos (últimos 7 días)</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-400">Crecimiento:</span>
            <span className={`text-sm font-semibold ${
              overview?.growthRate >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {overview?.growthRate >= 0 ? '+' : ''}{overview?.growthRate}%
            </span>
          </div>
        </div>

        {/* Cursos Completados */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <AcademicCapIcon className="w-8 h-8 text-purple-400" />
            <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
              {overview?.completionRate}%
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatNumber(overview?.completedCourses)}
          </div>
          <div className="text-sm text-gray-400">Cursos completados</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-400">Inscripciones:</span>
            <span className="text-sm font-semibold text-purple-400">
              {formatNumber(overview?.totalEnrollments)}
            </span>
          </div>
        </div>

        {/* Certificados */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <TrophyIcon className="w-8 h-8 text-yellow-400" />
            <span className="text-xs text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded-full">
              Este mes: {overview?.certificatesThisMonth}
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatNumber(overview?.totalCertificates)}
          </div>
          <div className="text-sm text-gray-400">Certificados emitidos</div>
          <div className="mt-2">
            <Link
              href="/admin/certificados"
              className="text-xs text-yellow-400 hover:text-yellow-300"
            >
              Ver todos →
            </Link>
          </div>
        </div>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Total XP Generado</div>
          <div className="text-2xl font-bold text-cyan-400">
            {formatNumber(overview?.totalXP)}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Horas de Estudio</div>
          <div className="text-2xl font-bold text-green-400">
            {formatNumber(overview?.totalStudyHours)}h
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Tasa de Retención</div>
          <div className="text-2xl font-bold text-purple-400">
            {overview?.retentionRate}%
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Premium</div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatNumber(overview?.premiumStudents)}
          </div>
        </div>
      </div>

      {/* Alerta de Estudiantes en Riesgo */}
      {overview?.atRiskStudents > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            <div>
              <div className="text-red-400 font-semibold">
                {overview.atRiskStudents} estudiantes en riesgo de abandono
              </div>
              <div className="text-sm text-gray-400">
                Sin actividad en 14+ días con cursos activos
              </div>
            </div>
            <Link
              href="/admin/estudiantes/lista?filter=at_risk"
              className="ml-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Ver Estudiantes
            </Link>
          </div>
        </div>
      )}

      {/* Gráficos y Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Cursos */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">📚 Cursos Más Populares</h3>
          <div className="space-y-4">
            {topCourses?.slice(0, 5).map((course, index) => (
              <div key={course.courseId} className="flex items-center gap-4">
                <div className={`text-2xl font-bold ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-amber-600' :
                  'text-gray-500'
                }`}>
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold mb-1">{course.title}</div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-cyan-400">{course.enrollments} inscritos</span>
                    <span className="text-green-400">{course.completionRate}% completado</span>
                    {course.isPremium && (
                      <span className="text-yellow-400">💎 Premium</span>
                    )}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${course.avgProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Estudiantes por XP */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">🏆 Top Estudiantes por XP</h3>
          <div className="space-y-3">
            {topStudentsByXP?.slice(0, 5).map((student, index) => (
              <Link
                key={student.id}
                href={`/admin/estudiantes/${student.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className={`text-xl font-bold ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-amber-600' :
                  'text-gray-500'
                }`}>
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{student.name}</div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-purple-400">Nivel {student.level}</span>
                    <span className="text-cyan-400">{formatNumber(student.xp)} XP</span>
                    <span className="text-green-400">{student.coursesCompleted} completados</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Crecimiento Diario (últimos 30 días) */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">📈 Crecimiento Diario (últimos 30 días)</h3>
        <div className="flex items-end justify-between h-48 gap-1">
          {dailyGrowth?.map((day, index) => {
            const maxStudents = Math.max(...(dailyGrowth.map(d => d.students) || [1]));
            const height = (day.students / maxStudents) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div
                    className="bg-cyan-500 hover:bg-cyan-400 rounded-t transition-all cursor-pointer"
                    style={{ height: `${height * 1.5}px`, minHeight: day.students > 0 ? '4px' : '0' }}
                    title={`${day.date}: ${day.students} nuevos`}
                  />
                </div>
                {index % 5 === 0 && (
                  <div className="text-xs text-gray-500 mt-2 rotate-45 origin-left whitespace-nowrap">
                    {new Date(day.date).getDate()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ver Todos */}
      <div className="text-center">
        <Link
          href="/admin/estudiantes/lista"
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          <UserGroupIcon className="w-5 h-5" />
          Ver Todos los Estudiantes
        </Link>
      </div>
    </div>
  )
}
