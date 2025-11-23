// src/components/courses/EnrollButton.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  AcademicCapIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

export default function EnrollButton({ courseId, courseSlug, isPremium = false }) {
  const session = null; const status = "unauthenticated" // TODO: Auth manual
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState(null)
  const [checking, setChecking] = useState(true)
  
  useEffect(() => {
    if (session) {
      checkEnrollment()
    } else {
      setChecking(false)
    }
  }, [session, courseSlug])
  
  const checkEnrollment = async () => {
    try {
      const params = new URLSearchParams()
      if (courseId) params.append('courseId', courseId)
      if (courseSlug) params.append('courseSlug', courseSlug)
      
      const res = await fetch(`/api/courses/enroll?${params}`)
      const data = await res.json()
      
      if (data.enrolled) {
        setEnrolled(true)
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Error verificando inscripción:', error)
    } finally {
      setChecking(false)
    }
  }
  
  const handleEnroll = async () => {
    if (!session) {
      router.push(`/auth/login?redirect=/cursos/${courseSlug}`)
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId, 
          courseSlug 
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setEnrolled(true)
        setProgress(data.progress)
        
        // Mostrar notificación
        if (data.alreadyEnrolled) {
          alert('Ya estás inscrito en este curso')
        } else {
          alert('¡Inscripción exitosa! 🎉')
        }
      } else if (data.needsPremium) {
        // Redirigir a página de premium
        router.push('/premium?course=' + courseSlug)
      } else {
        alert(data.error || 'Error al inscribirse')
      }
    } catch (error) {
      console.error('Error inscribiendo:', error)
      alert('Error al inscribirse')
    } finally {
      setLoading(false)
    }
  }
  
  const handleContinue = () => {
    router.push(`/cursos/${courseSlug}#articles`)
  }
  
  if (checking) {
    return (
      <div className="flex items-center justify-center py-3 px-6 bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }
  
  // Si ya está inscrito
  if (enrolled && progress) {
    return (
      <div className="space-y-3">
        {/* Progress bar */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Tu progreso</span>
            <span className="text-cyan-400 font-bold">{progress.progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
        
        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          <CheckCircleIcon className="w-5 h-5" />
          Continuar curso
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    )
  }
  
  // Si es premium y no tiene acceso
  if (isPremium && session && !session.user?.isPremium) {
    return (
      <button
        onClick={() => router.push('/premium?course=' + courseSlug)}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
      >
        <LockClosedIcon className="w-5 h-5" />
        Desbloquear con Premium
      </button>
    )
  }
  
  // Botón de inscripción
  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          Inscribiendo...
        </>
      ) : (
        <>
          <AcademicCapIcon className="w-5 h-5" />
          {session ? 'Inscribirse gratis' : 'Iniciar sesión para inscribirse'}
        </>
      )}
    </button>
  )
}