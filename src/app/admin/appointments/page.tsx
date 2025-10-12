// src/app/admin/appointments/page.tsx - VERSIÓN FINAL CORREGIDA
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const url = filter === 'all' 
        ? '/api/admin/appointments' 
        : `/api/admin/appointments?status=${filter}`;
      
      const res = await fetch(url)
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

  const deleteAppointment = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'No definida';
    
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // ← HELPER PARA EXTRAER EL ID DEL LEAD (populate o no)
  const getLeadId = (apt: any) => {
    if (!apt.leadId) return null;
    
    // Si leadId es un objeto (populated), devolver su _id
    if (typeof apt.leadId === 'object' && apt.leadId._id) {
      return apt.leadId._id;
    }
    
    // Si leadId es un string (ObjectId), devolverlo directamente
    if (typeof apt.leadId === 'string') {
      return apt.leadId;
    }
    
    return null;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', label: 'Pendiente' },
      confirmed: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: 'Confirmada' },
      completed: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', label: 'Completada' },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', label: 'Cancelada' },
      no_show: { bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-700 dark:text-gray-300', label: 'No asistió' }
    };
    
    const badge = badges[status] || badges.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

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
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 dark:text-gray-400">No hay citas agendadas</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((apt: any) => {
            const leadId = getLeadId(apt); // ← EXTRAER ID CORRECTAMENTE
            
            return (
              <div
                key={apt._id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {apt.name}
                      </h3>
                      {getStatusBadge(apt.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      📅 Fecha:
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {formatDate(apt.scheduledDate)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      🕐 Hora:
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {apt.scheduledTime || 'No definida'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      📞 Teléfono:
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {apt.phone || 'No disponible'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      ✉️ Email:
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {apt.email || 'No disponible'}
                    </div>
                  </div>
                </div>

                {apt.notes && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      📝 Notas:
                    </div>
                    <div className="text-gray-900 dark:text-white text-sm">
                      {apt.notes}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {/* Botón Ver Lead - CORREGIDO CON HELPER */}
                  {leadId && (
                    <Link
                      href={`/admin/leads/${leadId}`}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      👁️ Ver Lead
                    </Link>
                  )}

                  {/* Cambiar estado */}
                  {apt.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(apt._id, 'confirmed')}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      ✅ Confirmar
                    </button>
                  )}

                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(apt._id, 'completed')}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      ✔️ Completada
                    </button>
                  )}

                  {(apt.status === 'pending' || apt.status === 'confirmed') && (
                    <button
                      onClick={() => updateStatus(apt._id, 'cancelled')}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      ❌ Cancelar
                    </button>
                  )}

                  {/* Eliminar */}
                  <button
                    onClick={() => deleteAppointment(apt._id)}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}