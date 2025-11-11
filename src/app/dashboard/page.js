// src/app/dashboard/page.js
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  AcademicCapIcon, 
  TrophyIcon, 
  FireIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon,
  BookmarkIcon,
  ArrowRightIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/dashboard')
    }
    if (session) {
      fetchDashboardData()
    }
  }, [session, status])
  
  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/student/dashboard')
      const data = await res.json()
      
      if (data.success) {
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Error cargando datos</p>
      </div>
    )
  }
  
  const { user, stats, courses, recommendedCourses, recentActivity, levelProgress } = dashboardData
  
  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            ¡Hola, {user.fullName}! 👋
          </h1>
          <p className="text-xl text-gray-400">
            Continúa tu aprendizaje donde lo dejaste
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Cursos Activos */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <AcademicCapIcon className="w-8 h-8 text-cyan-400" />
              {stats.coursesInProgress > 0 && (
                <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded-full font-semibold">
                  En progreso
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.coursesInProgress}
            </div>
            <div className="text-gray-400 text-sm">Cursos activos</div>
          </div>
          
          {/* Cursos Completados */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <TrophyIcon className="w-8 h-8 text-green-400" />
              {stats.coursesCompleted > 0 && (
                <span className="text-2xl">🎉</span>
              )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.coursesCompleted}
            </div>
            <div className="text-gray-400 text-sm">Completados</div>
          </div>
          
          {/* Racha */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <FireIcon className="w-8 h-8 text-orange-400" />
              {stats.streak >= 7 && (
                <span className="text-2xl">🔥</span>
              )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.streak} días
            </div>
            <div className="text-gray-400 text-sm">
              Racha actual {stats.longestStreak > stats.streak && `(récord: ${stats.longestStreak})`}
            </div>
          </div>
          
          {/* Tiempo Total */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <ClockIcon className="w-8 h-8 text-purple-400" />
              <ChartBarIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalStudyHours}h
            </div>
            <div className="text-gray-400 text-sm">Tiempo total de estudio</div>
          </div>
        </div>
        
        {/* Progreso de Nivel */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-8 h-8 text-indigo-400" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  Nivel {levelProgress.currentLevel}
                </h3>
                <p className="text-gray-400 text-sm">
                  {levelProgress.totalXP} XP total
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Próximo nivel</p>
              <p className="text-white font-bold">
                {levelProgress.xpProgress}%
              </p>
            </div>
          </div>
          
          {/* Barra de progreso XP */}
          <div className="relative">
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress.xpProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {Math.round(levelProgress.xpForNextLevel * (levelProgress.xpProgress / 100))} / {levelProgress.xpForNextLevel} XP
            </p>
          </div>
          
          {/* Logros recientes */}
          {stats.achievementsCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300 text-sm">
                    {stats.achievementsCount} logros desbloqueados
                  </span>
                </div>
                <Link 
                  href="/dashboard/achievements"
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center gap-1"
                >
                  Ver todos
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs de cursos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Mis Cursos</h2>
            <Link
              href="/cursos"
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-2"
            >
              Explorar más cursos
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Cursos en progreso */}
        {courses.inProgress.length > 0 ? (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-400">📚</span>
              Continúa aprendiendo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.inProgress.map(course => (
                <Link
                  key={course._id}
                  href={`/cursos/${course.slug}`}
                  className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{course.icon}</div>
                    {course.isPremium && (
                      <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Premium
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progreso</span>
                      <span className="font-semibold text-cyan-400">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {course.completedArticles}/{course.totalArticles} lecciones
                    </span>
                    <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Continuar
                      <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12 text-center py-12 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <AcademicCapIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              Aún no tienes cursos en progreso
            </p>
            <Link
              href="/cursos"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Explorar cursos
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        )}
        
        {/* Cursos completados */}
        {courses.completed.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrophyIcon className="w-6 h-6 text-green-400" />
              Cursos completados
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.completed.map(course => (
                <Link
                  key={course._id}
                  href={`/cursos/${course.slug}`}
                  className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all group"
                >
                  <div className="text-3xl mb-3">{course.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                    {course.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-sm font-semibold">
                      ✓ Completado
                    </span>
                    {course.certificateIssued && (
                      <span className="text-xs">🏆</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Cursos recomendados */}
        {recommendedCourses.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-purple-400" />
              Recomendados para ti
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedCourses.map(course => (
                <div
                  key={course._id}
                  className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{course.icon}</div>
                    {course.isPremium && (
                      <LockClosedIcon className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-2">
                    {course.title}
                  </h4>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.topics?.slice(0, 3).map(topic => (
                      <span 
                        key={topic}
                        className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  
                  <Link
                    href={`/cursos/${course.slug}`}
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm"
                  >
                    Ver curso
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}