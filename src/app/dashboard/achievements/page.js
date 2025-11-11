// src/app/dashboard/achievements/page.js
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  TrophyIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function AchievementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [achievements, setAchievements] = useState(null)
  const [filter, setFilter] = useState('all') // all, unlocked, locked
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/dashboard/achievements')
    }
    if (session) {
      fetchAchievements()
    }
  }, [session, status])
  
  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/student/achievements')
      const data = await res.json()
      
      if (data.success) {
        setAchievements(data.achievements)
      }
    } catch (error) {
      console.error('Error cargando logros:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando logros...</p>
        </div>
      </div>
    )
  }
  
  if (!achievements) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Error cargando logros</p>
      </div>
    )
  }
  
  const getRarityColor = (rarity) => {
    const colors = {
      common: 'from-gray-500 to-gray-600 border-gray-500/30',
      uncommon: 'from-green-500 to-emerald-600 border-green-500/30',
      rare: 'from-blue-500 to-cyan-600 border-blue-500/30',
      epic: 'from-purple-500 to-pink-600 border-purple-500/30',
      legendary: 'from-yellow-500 to-orange-600 border-yellow-500/30'
    }
    return colors[rarity] || colors.common
  }
  
  const getRarityLabel = (rarity) => {
    const labels = {
      common: 'Común',
      uncommon: 'Poco común',
      rare: 'Raro',
      epic: 'Épico',
      legendary: 'Legendario'
    }
    return labels[rarity] || rarity
  }
  
  const filteredAchievements = filter === 'all' 
    ? [...achievements.unlocked, ...achievements.locked]
    : filter === 'unlocked' 
      ? achievements.unlocked 
      : achievements.locked
  
  const completionPercentage = Math.round(
    (achievements.unlockedCount / achievements.total) * 100
  )
  
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
            <TrophyIcon className="w-12 h-12 text-yellow-400" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Logros
              </h1>
              <p className="text-xl text-gray-400">
                {achievements.unlockedCount} de {achievements.total} desbloqueados
              </p>
            </div>
          </div>
          
          {/* Barra de progreso total */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 font-semibold">Progreso total</span>
              <span className="text-cyan-400 font-bold text-lg">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Todos ({achievements.total})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'unlocked'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Desbloqueados ({achievements.unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'locked'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Bloqueados ({achievements.total - achievements.unlockedCount})
          </button>
        </div>
        
        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map(achievement => (
            <div
              key={achievement.id}
              className={`relative rounded-2xl p-6 transition-all ${
                achievement.unlocked
                  ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} hover:scale-105`
                  : 'bg-gray-900/30 border border-gray-800 opacity-60'
              }`}
            >
              {/* Locked overlay */}
              {!achievement.unlocked && (
                <div className="absolute top-4 right-4">
                  <LockClosedIcon className="w-6 h-6 text-gray-600" />
                </div>
              )}
              
              {/* Icon */}
              <div className={`text-6xl mb-4 ${!achievement.unlocked && 'grayscale'}`}>
                {achievement.icon}
              </div>
              
              {/* Title */}
              <h3 className={`text-xl font-bold mb-2 ${
                achievement.unlocked ? 'text-white' : 'text-gray-500'
              }`}>
                {achievement.name}
              </h3>
              
              {/* Description */}
              <p className={`text-sm mb-4 ${
                achievement.unlocked ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {achievement.unlocked 
                  ? achievement.description 
                  : '???'}
              </p>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                {/* Rarity badge */}
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  achievement.unlocked
                    ? 'bg-black/30 text-white'
                    : 'bg-gray-800 text-gray-600'
                }`}>
                  {getRarityLabel(achievement.rarity)}
                </span>
                
                {/* XP */}
                {achievement.unlocked && (
                  <div className="flex items-center gap-1">
                    <SparklesIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm">
                      +{achievement.xp} XP
                    </span>
                  </div>
                )}
              </div>
              
              {/* Unlocked effect */}
              {achievement.unlocked && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-green-500 rounded-full p-2">
                    <TrophyIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Empty state */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <TrophyIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay logros en esta categoría</p>
          </div>
        )}
        
      </div>
    </div>
  )
}