// src/components/courses/CourseProgress.js
'use client'
import { useState, useEffect } from 'react'
export default function CourseProgress({ courseId, courseSlug, articleId, onComplete }) {
  const session = null; const status = "unauthenticated" // TODO: Auth manual
  const [marking, setMarking] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [progress, setProgress] = useState(null)
  
  useEffect(() => {
    if (session) {
      checkProgress()
    }
  }, [session, courseSlug, articleId])
  
  const checkProgress = async () => {
    try {
      const params = new URLSearchParams()
      if (courseId) params.append('courseId', courseId)
      if (courseSlug) params.append('courseSlug', courseSlug)
      
      const res = await fetch(`/api/courses/progress?${params}`)
      const data = await res.json()
      
      if (data.success && data.progress) {
        setProgress(data.progress)
        
        // Verificar si este artículo ya está completado
        const isCompleted = data.progress.completedArticles?.some(
          article => article.articleId === articleId
        )
        setCompleted(isCompleted)
      }
    } catch (error) {
      console.error('Error verificando progreso:', error)
    }
  }
  
  const handleMarkComplete = async () => {
    if (!session) {
      alert('Debes iniciar sesión para marcar lecciones como completadas')
      return
    }
    
    setMarking(true)
    
    try {
      const res = await fetch('/api/courses/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          courseSlug,
          articleId,
          timeSpent: 5 // Podrías calcular esto con un timer
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setCompleted(true)
        setProgress({
          ...progress,
          progress: data.progress
        })
        
        // Mostrar notificación de XP ganado
        if (data.xpEarned) {
          showXPNotification(data.xpEarned, data.newLevel)
        }
        
        // Callback para actualizar UI del curso
        if (onComplete) {
          onComplete(data)
        }
      }
    } catch (error) {
      console.error('Error marcando como completado:', error)
    } finally {
      setMarking(false)
    }
  }
  
  const showXPNotification = (xp, level) => {
    // Podrías usar una librería de notificaciones o tu propio sistema
    const notification = document.createElement('div')
    notification.className = 'fixed top-24 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-bounce'
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-2xl">✨</span>
        <div>
          <div class="font-bold">+${xp} XP</div>
          <div class="text-xs opacity-90">Nivel ${level}</div>
        </div>
      </div>
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }
  
  if (!session) {
    return null
  }
  
  if (!progress) {
    return null
  }
  
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Progreso del curso</span>
          <span className="text-cyan-400 font-bold">{progress.progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>
      
      {/* Complete button */}
      <button
        onClick={handleMarkComplete}
        disabled={marking || completed}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          completed
            ? 'bg-green-600/20 text-green-400 border border-green-600/30 cursor-not-allowed'
            : 'bg-cyan-600 hover:bg-cyan-700 text-white'
        }`}
      >
        {marking ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            Guardando...
          </span>
        ) : completed ? (
          <span className="flex items-center justify-center gap-2">
            ✓ Lección completada
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Marcar como completada
          </span>
        )}
      </button>
    </div>
  )
}