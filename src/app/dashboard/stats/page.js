// src/app/dashboard/stats/page.js
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

export default function StatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/dashboard/stats')
    }
    if (session) {
      fetchStats()
    }
  }, [session, status])
  
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/student/stats')
      const data = await res.json()
      
      if (data.success) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }
  
  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Error cargando estadísticas</p>
      </div>
    )
  }
  
  const maxMinutes = Math.max(...stats.charts.last7Days.map(d => d.minutes), 1)
  
  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16">
      <div className="container mx-auto px-4">
        
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver al dashboard
        </Link>
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <ChartBarIcon className="w-12 h-12 text-cyan-400" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Estadísticas
              </h1>
              <p className="text-xl text-gray-400">
                Tu progreso detallado
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* XP Total */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <TrophyIcon className="w-8 h-8 text-indigo-400" />
              <span className="text-indigo-400 font-bold">Nivel {stats.stats.level}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.stats.totalXP.toLocaleString()} XP
            </div>
            <div className="text-gray-400 text-sm">Experiencia total</div>
          </div>
          
          {/* Racha */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <FireIcon className="w-8 h-8 text-orange-400" />
              <span className="text-xs text-gray-400">Récord: {stats.stats.longestStreak}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.stats.streak} días
            </div>
            <div className="text-gray-400 text-sm">Racha actual</div>
          </div>
          
          {/* Tiempo total */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <ClockIcon className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {Math.round(stats.stats.totalStudyTime / 60)}h
            </div>
            <div className="text-gray-400 text-sm">
              {stats.stats.totalStudyTime} minutos totales
            </div>
          </div>
          
          {/* Cursos */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <AcademicCapIcon className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.stats.coursesCompleted}
            </div>
            <div className="text-gray-400 text-sm">
              de {stats.stats.coursesEnrolled} completados
            </div>
          </div>
        </div>
        
        {/* Actividad semanal */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-cyan-400" />
            Actividad de los últimos 7 días
          </h2>
          
          <div className="flex items-end justify-between gap-4 h-64">
            {stats.charts.last7Days.map((day, index) => {
              const heightPercent = (day.minutes / maxMinutes) * 100
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bar */}
                  <div className="w-full flex items-end justify-center h-48">
                    <div 
                      className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg transition-all hover:from-cyan-400 hover:to-blue-400 relative group"
                      style={{ height: `${heightPercent}%`, minHeight: day.minutes > 0 ? '8px' : '0' }}
                    >
                      {/* Tooltip */}
                      {day.minutes > 0 && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {day.minutes} min
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Day label */}
                  <div className="text-xs text-gray-400 font-semibold uppercase">
                    {day.day}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Total esta semana: {stats.charts.last7Days.reduce((sum, d) => sum + d.minutes, 0)} minutos
            </p>
          </div>
        </div>
        
        {/* Topics favoritos */}
        {stats.charts.topTopics.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Topics más estudiados
            </h2>
            
            <div className="space-y-4">
              {stats.charts.topTopics.map((topic, index) => {
                const maxCount = stats.charts.topTopics[0].count
                const widthPercent = (topic.count / maxCount) * 100
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{topic.topic}</span>
                      <span className="text-cyan-400 font-bold">{topic.count}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Progreso mensual */}
        {stats.charts.monthlyProgress.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Lecciones completadas por mes
            </h2>
            
            <div className="space-y-4">
              {stats.charts.monthlyProgress.map((month, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-gray-400 text-sm font-semibold">
                    {month.month}
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                      style={{ 
                        width: `${(month.lessonsCompleted / Math.max(...stats.charts.monthlyProgress.map(m => m.lessonsCompleted))) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="w-12 text-right text-white font-bold">
                    {month.lessonsCompleted}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}