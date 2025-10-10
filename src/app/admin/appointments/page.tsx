// src/app/admin/appointments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, confirmed, completed

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/appointments?status=${filter}`)
      const data = await res.json()
      
      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📅 Llamadas Agendadas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {appointments.length} citas totales
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            {status === 'all' && 'Todas'}
            {status === 'pending' && 'Pendientes'}
            {status === 'confirmed' && 'Confirmadas'}
            {status === 'completed' && 'Completadas'}
            {status === 'cancelled' && 'Canceladas'}
          </button>
        ))}
      </div>

      {/* Lista de citas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No hay citas agendadas</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((apt: any) => (
            <div
              key={apt._id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {apt.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">📅 Fecha:</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(apt.scheduledDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">🕐 Hora:</span>
                      <p className="text-gray-900 dark:text-white font-medium">{apt.scheduledTime}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">📞 Teléfono:</span>
                      <p className="text-gray-900 dark:text-white font-medium">{apt.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">✉️ Email:</span>
                      <p className="text-gray-900 dark:text-white font-medium">{apt.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(apt._id, 'completed')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      ✓ Completada
                    </button>
                  )}
                  <Link
                    href={`/admin/leads/${apt.leadId}`}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    Ver Lead
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}