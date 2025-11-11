// src/components/courses/StudentStats.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  TrophyIcon, 
  FireIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline'

export default function StudentStats() {
  const { data: session } = useSession()
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    if (session) {
      fetchStats()
    }
  }, [session])
  
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/student/stats')
      const data = await res.json()
      
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error cargando stats:', error)
    }
  }
  
  if (!session || !stats) {
    return null
  }
  
  return (
    <Link 
      href="/dashboard"
      className="fixed bottom-6 right-6 z-40 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-4 shadow-2xl hover:scale-105 transition-transform cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Level */}
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-xs text-gray-400">Nivel</div>
            <div className="text-lg font-bold text-white">{stats.level}</div>
          </div>
        </div>
        
        {/* Streak */}
        <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
          <FireIcon className="w-5 h-5 text-orange-400" />
          <div>
            <div className="text-xs text-gray-400">Racha</div>
            <div className="text-lg font-bold text-white">{stats.streak}</div>
          </div>
        </div>
        
        {/* Achievements */}
        <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
          <TrophyIcon className="w-5 h-5 text-yellow-400" />
          <div>
            <div className="text-xs text-gray-400">Logros</div>
            <div className="text-lg font-bold text-white">{stats.achievementsCount}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}