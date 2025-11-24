// src/app/admin/email-courses/[id]/subscribers/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { use } from 'react'

export default function EmailCourseSubscribersPage({ params }) {
  const unwrappedParams = use(params)
  const [loading, setLoading] = useState(true)
  const [subscribers, setSubscribers] = useState([])
  const [course, setCourse] = useState(null)
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  })

  useEffect(() => {
    fetchSubscribers()
  }, [filters])

  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const res = await fetch(`/api/admin/email-courses/${unwrappedParams.id}/subscribers?${params}`)
      const data = await res.json()

      if (res.ok) {
        setSubscribers(data.subscribers || [])
        setCourse(data.course)
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400'
      case 'unsubscribed':
        return 'bg-gray-600/20 text-gray-400'
      default:
        return 'bg-gray-600/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'completed':
        return 'Completado'
      case 'unsubscribed':
        return 'Cancelado'
      default:
        return status
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEmailsSentCount = (subscriber) => {
    const sent = Object.values(subscriber.emailsSent || {}).filter(e => e.sent).length
    return sent
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Cargando suscriptores...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-8">
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg">
          Curso no encontrado
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/email-courses"
          className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block"
        >
          ← Volver a cursos
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Suscriptores: {course.title}</h1>
            <p className="text-gray-400">Gestiona los suscriptores del curso</p>
          </div>
          <Link
            href={`/admin/email-courses/${course._id}/edit`}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            ✏️ Editar Curso
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: 'Total Suscriptores',
            value: course.stats?.totalSubscribers || 0,
            icon: '👥',
            color: 'cyan'
          },
          {
            label: 'Activos',
            value: course.stats?.activeSubscribers || 0,
            icon: '🔥',
            color: 'green'
          },
          {
            label: 'Completados',
            value: course.stats?.completedSubscribers || 0,
            icon: '✅',
            color: 'blue'
          },
          {
            label: 'Tasa Completación',
            value: course.stats?.totalSubscribers
              ? `${Math.round((course.stats.completedSubscribers / course.stats.totalSubscribers) * 100)}%`
              : '0%',
            icon: '📊',
            color: 'purple'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.icon}</span>
              <span className={`text-2xl font-bold text-${stat.color}-400`}>
                {stat.value}
              </span>
            </div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="completed">Completados</option>
              <option value="unsubscribed">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      {subscribers.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-white mb-2">No hay suscriptores</h3>
          <p className="text-gray-400">
            {filters.status !== 'all' || filters.search
              ? 'No se encontraron suscriptores con los filtros aplicados'
              : 'Aún no hay suscriptores en este curso'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Suscriptor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Emails Enviados
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fecha Suscripción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{subscriber.name}</div>
                        <div className="text-gray-400 text-sm">{subscriber.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(subscriber.status)}`}>
                        {getStatusText(subscriber.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-cyan-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(subscriber.currentDay / 5) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm">
                          Día {subscriber.currentDay}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((day) => {
                          const sent = subscriber.emailsSent?.[`day${day}`]?.sent
                          return (
                            <div
                              key={day}
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                sent
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-700 text-gray-500'
                              }`}
                              title={sent ? `Día ${day} enviado` : `Día ${day} pendiente`}
                            >
                              {day}
                            </div>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {formatDate(subscriber.subscribedAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {subscribers.length > 0 && (
        <div className="mt-4 text-gray-400 text-sm text-center">
          Mostrando {subscribers.length} suscriptor{subscribers.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  )
}
