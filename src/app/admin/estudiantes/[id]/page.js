// src/app/admin/estudiantes/[id]/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  AcademicCapIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  BellIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function StudentProfile({ params }) {
  const router = useRouter()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [notificationType, setNotificationType] = useState('')
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [customSubject, setCustomSubject] = useState('')

  useEffect(() => {
    fetchStudentData()
  }, [params.id])

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`/api/admin/students/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setStudent(data)
      }
    } catch (error) {
      console.error('Error fetching student:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async () => {
    if (!notificationType) return

    setSending(true)
    try {
      const response = await fetch(`/api/admin/students/${params.id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notificationType,
          customMessage,
          customSubject
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Notificación enviada correctamente')
        setShowNotificationModal(false)
        setCustomMessage('')
        setCustomSubject('')
      } else {
        alert('❌ Error al enviar notificación')
      }
    } catch (error) {
      alert('❌ Error al enviar notificación')
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando perfil...</div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Estudiante no encontrado</div>
        <Link href="/admin/estudiantes/lista" className="text-cyan-400">
          ← Volver a la lista
        </Link>
      </div>
    )
  }

  const { student: studentInfo, stats, coursesInProgress, coursesCompleted, recentActivity, activityTimeline } = student

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/estudiantes/lista"
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver a estudiantes
        </Link>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-3xl">
                {studentInfo.avatar ? (
                  <img
                    src={studentInfo.avatar}
                    alt={studentInfo.fullName}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-white" />
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {studentInfo.fullName}
                </h1>
                <div className="flex items-center gap-4 text-gray-400 mb-3">
                  <span className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    {studentInfo.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Registrado: {formatShortDate(studentInfo.createdAt)}
                  </span>
                </div>

                {studentInfo.bio && (
                  <p className="text-gray-300 max-w-2xl">{studentInfo.bio}</p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  {stats.isPremium && (
                    <span className="px-3 py-1 text-sm bg-yellow-500/20 text-yellow-400 rounded-full">
                      💎 Premium
                    </span>
                  )}
                  <span className="px-3 py-1 text-sm bg-purple-500/20 text-purple-400 rounded-full">
                    Nivel {stats.level}
                  </span>
                  {stats.streak > 0 && (
                    <span className="px-3 py-1 text-sm bg-orange-500/20 text-orange-400 rounded-full">
                      🔥 Racha de {stats.streak} días
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowNotificationModal(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <BellIcon className="w-4 h-4" />
              Enviar Notificación
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-4">
          <div className="text-cyan-400 text-2xl font-bold">{stats.totalXP.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">XP Total</div>
        </div>

        <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-4">
          <div className="text-purple-400 text-2xl font-bold">{stats.level}</div>
          <div className="text-gray-400 text-sm">Nivel</div>
        </div>

        <div className="bg-gray-800 border border-blue-500/30 rounded-lg p-4">
          <div className="text-blue-400 text-2xl font-bold">{stats.coursesEnrolled}</div>
          <div className="text-gray-400 text-sm">Cursos Inscritos</div>
        </div>

        <div className="bg-gray-800 border border-green-500/30 rounded-lg p-4">
          <div className="text-green-400 text-2xl font-bold">{stats.coursesCompleted}</div>
          <div className="text-gray-400 text-sm">Completados</div>
        </div>

        <div className="bg-gray-800 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-yellow-400 text-2xl font-bold">{stats.certificatesEarned}</div>
          <div className="text-gray-400 text-sm">Certificados</div>
        </div>

        <div className="bg-gray-800 border border-orange-500/30 rounded-lg p-4">
          <div className="text-orange-400 text-2xl font-bold">{stats.totalStudyHours}h</div>
          <div className="text-gray-400 text-sm">Tiempo Estudio</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cursos en Progreso */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AcademicCapIcon className="w-6 h-6 text-cyan-400" />
              Cursos en Progreso ({coursesInProgress?.length || 0})
            </h2>

            {coursesInProgress && coursesInProgress.length > 0 ? (
              <div className="space-y-4">
                {coursesInProgress.map((course) => (
                  <div key={course._id} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{course.icon}</span>
                        <div>
                          <h3 className="text-white font-semibold">{course.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <span>{course.completedArticles}/{course.totalArticles} lecciones</span>
                            <span>Última vez: {formatShortDate(course.lastAccessedAt)}</span>
                            {course.isPremium && <span className="text-yellow-400">💎</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-cyan-400 font-bold">{Math.round(course.progress)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No tiene cursos en progreso</p>
            )}
          </div>

          {/* Cursos Completados */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrophyIcon className="w-6 h-6 text-green-400" />
              Cursos Completados ({coursesCompleted?.length || 0})
            </h2>

            {coursesCompleted && coursesCompleted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coursesCompleted.map((course) => (
                  <div key={course._id} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{course.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm">{course.title}</h3>
                        <p className="text-xs text-gray-400">
                          Completado: {formatShortDate(course.completedAt)}
                        </p>
                      </div>
                    </div>
                    {course.certificateIssued && (
                      <div className="flex items-center gap-2 text-xs text-yellow-400 mt-2">
                        <TrophyIcon className="w-4 h-4" />
                        Certificado: {course.certificateId}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No ha completado ningún curso aún</p>
            )}
          </div>

          {/* Actividad Reciente */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-blue-400" />
              Actividad Reciente
            </h2>

            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-gray-400">
                      {formatShortDate(activity.completedAt)}
                    </span>
                    <span className="text-white">
                      Completó lección en <span className="text-cyan-400">{activity.courseTitle}</span>
                    </span>
                    {activity.timeSpent && (
                      <span className="text-gray-500 ml-auto">{activity.timeSpent}min</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Sin actividad reciente</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Timeline */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">📅 Timeline (30 días)</h2>
            <div className="space-y-4">
              {activityTimeline && activityTimeline.length > 0 ? (
                activityTimeline.slice(0, 15).map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        event.type === 'certificate_earned' ? 'bg-yellow-400' :
                        event.type === 'course_completed' ? 'bg-green-400' :
                        'bg-blue-400'
                      }`} />
                      {index < activityTimeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-700 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-xs text-gray-500 mb-1">
                        {formatShortDate(event.date)}
                      </div>
                      <div className="text-sm text-white">
                        {event.type === 'enrollment' && `📚 Se inscribió en ${event.courseTitle}`}
                        {event.type === 'course_completed' && `✅ Completó ${event.courseTitle}`}
                        {event.type === 'certificate_earned' && `🏆 Certificado obtenido: ${event.courseTitle}`}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Sin actividad en los últimos 30 días</p>
              )}
            </div>
          </div>

          {/* Info Adicional */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">ℹ️ Información</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-400">Último login</div>
                <div className="text-white">{formatDate(studentInfo.lastLogin)}</div>
              </div>
              <div>
                <div className="text-gray-400">Última actividad</div>
                <div className="text-white">{formatDate(studentInfo.lastActivity)}</div>
              </div>
              <div>
                <div className="text-gray-400">Racha más larga</div>
                <div className="text-white">{stats.longestStreak} días</div>
              </div>
              <div>
                <div className="text-gray-400">Plan de suscripción</div>
                <div className="text-white capitalize">{stats.subscriptionPlan}</div>
              </div>
              {studentInfo.location && (
                <div>
                  <div className="text-gray-400">Ubicación</div>
                  <div className="text-white">{studentInfo.location}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Enviar Notificación a {studentInfo.fullName}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo de notificación</label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="welcome">Bienvenida</option>
                  <option value="completion">Felicitación por completar curso</option>
                  <option value="inactive_reminder">Recordatorio de inactividad</option>
                  <option value="level_up">Felicitación por subir de nivel</option>
                  <option value="custom">Mensaje personalizado</option>
                </select>
              </div>

              {notificationType === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Asunto</label>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Asunto del email..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Mensaje</label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      rows={5}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={sendNotification}
                disabled={!notificationType || sending}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
