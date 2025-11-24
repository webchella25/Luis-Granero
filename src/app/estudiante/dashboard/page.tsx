// src/app/estudiante/dashboard/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface DashboardData {
  user: {
    name: string
    email: string
    avatar?: string
    fullName: string
  }
  stats: {
    coursesEnrolled: number
    coursesInProgress: number
    coursesCompleted: number
    totalXP: number
    level: number
    streak: number
    longestStreak: number
    totalStudyHours: number
    achievementsCount: number
    isPremium: boolean
  }
  courses: {
    inProgress: any[]
    completed: any[]
  }
  recommendedCourses: any[]
  levelProgress: {
    currentLevel: number
    xpProgress: number
  }
}

export default function StudentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/student/dashboard')

      if (res.status === 401) {
        router.push('/estudiante/login')
        return
      }

      const dashboardData = await res.json()

      if (dashboardData.success) {
        setData(dashboardData)
      } else {
        setError(dashboardData.error || 'Error al cargar dashboard')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Cargando...</div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">{error}</div>
            <Link
              href="/estudiante/login"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Volver al login
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              👋 Hola, {data.user.fullName}
            </h1>
            <p className="text-gray-400">Bienvenido a tu panel de estudiante</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-2xl font-bold text-cyan-400">
                {data.stats.coursesEnrolled}
              </div>
              <div className="text-gray-400 text-sm">Cursos Inscritos</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-2xl font-bold text-green-400">
                {data.stats.coursesInProgress}
              </div>
              <div className="text-gray-400 text-sm">En Progreso</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-blue-400">
                {data.stats.coursesCompleted}
              </div>
              <div className="text-gray-400 text-sm">Completados</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-purple-400">
                Nivel {data.stats.level}
              </div>
              <div className="text-gray-400 text-sm">{data.stats.totalXP} XP</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-bold">
                Nivel {data.levelProgress.currentLevel}
              </div>
              <div className="text-gray-400 text-sm">
                {data.levelProgress.xpProgress}% al siguiente nivel
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${data.levelProgress.xpProgress}%` }}
              />
            </div>
          </div>

          {/* Courses Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Courses in Progress */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                📖 Cursos en Progreso
              </h2>

              {data.courses.inProgress.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-3">🎓</div>
                  <p className="text-gray-400 mb-4">
                    No tienes cursos en progreso
                  </p>
                  <Link
                    href="/cursos"
                    className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    Explorar Cursos
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.courses.inProgress.map((course) => (
                    <Link
                      key={course._id}
                      href={`/cursos/${course.slug}`}
                      className="block bg-gray-900 border border-gray-800 hover:border-cyan-500 rounded-lg p-6 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{course.icon}</span>
                          <div>
                            <h3 className="text-white font-bold">
                              {course.title}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {course.completedArticles}/{course.totalArticles}{' '}
                              lecciones
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                        <div
                          className="bg-cyan-500 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <div className="text-right text-gray-400 text-sm">
                        {course.progress}%
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Courses */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                🏆 Cursos Completados
              </h2>

              {data.courses.completed.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <p className="text-gray-400">
                    Aún no has completado ningún curso
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.courses.completed.map((course) => (
                    <div
                      key={course._id}
                      className="bg-gray-900 border border-gray-800 rounded-lg p-6"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{course.icon}</span>
                        <div>
                          <h3 className="text-white font-bold">
                            {course.title}
                          </h3>
                          <p className="text-green-400 text-sm">
                            ✓ Completado
                          </p>
                        </div>
                      </div>
                      {course.certificateIssued && (
                        <button className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
                          📜 Ver Certificado
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommended Courses */}
          {data.recommendedCourses.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">
                💡 Cursos Recomendados para Ti
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {data.recommendedCourses.map((course) => (
                  <Link
                    key={course._id}
                    href={`/cursos/${course.slug}`}
                    className="bg-gray-900 border border-gray-800 hover:border-cyan-500 rounded-lg p-6 transition-all"
                  >
                    <div className="text-4xl mb-3">{course.icon}</div>
                    <h3 className="text-white font-bold mb-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{course.duration}</span>
                      <span>•</span>
                      <span>{course.level}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
