// src/app/admin/appointments/page.tsx - MEJORADO CON LAS 5 FUNCIONALIDADES
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Appointment {
  _id: string
  leadId: any
  name: string
  phone?: string
  email?: string
  scheduledDate?: Date | string
  scheduledTime?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  callNotes?: string
  duration?: {
    planned: number
    actual?: number
    startedAt?: Date
    endedAt?: Date
  }
  callResult?: {
    converted?: boolean | null
    interest?: 'hot' | 'warm' | 'cold' | null
    nextSteps?: string
    budgetDiscussed?: string
    closingProbability?: number
  }
  remindersSent?: Array<{
    type: string
    sentAt: Date
    opened?: boolean
  }>
  token?: string
  createdAt?: Date
  updatedAt?: Date
}

interface Stats {
  total: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  no_show: number
  thisWeek: number
  needsReminder: number
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
    thisWeek: 0,
    needsReminder: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showCallModal, setShowCallModal] = useState(false)

  // ✅ BUG FIX: useEffect que SIEMPRE se ejecuta al montar
  useEffect(() => {
    console.log('🔄 Componente montado - cargando citas...')
    fetchAppointments()
  }, []) // Array vacío = solo al montar

  // Recargar cuando cambia el tab
  useEffect(() => {
    if (!loading) {
      fetchAppointments()
    }
  }, [activeTab])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      console.log('📡 Fetching appointments...')
      
      const url = activeTab === 'all' 
        ? '/api/admin/appointments?includeExpired=true'
        : `/api/admin/appointments?status=${activeTab}`
      
      const res = await fetch(url)
      const data = await res.json()
      
      console.log('✅ Citas recibidas:', data.appointments?.length || 0)
      
      if (data.success) {
        setAppointments(data.appointments || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('❌ Error cargando citas:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (id: string, status: string, additionalData = {}) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData })
      })
      
      if (res.ok) {
        fetchAppointments()
        return true
      }
    } catch (error) {
      console.error('Error:', error)
    }
    return false
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return
    
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

  const sendReminder = async (appointmentId: string) => {
    try {
      const res = await fetch('/api/admin/appointments/send-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, type: 'manual' })
      })
      
      const data = await res.json()
      alert(data.sent ? '✅ Recordatorio enviado' : '❌ Error enviando')
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error enviando recordatorio')
    }
  }

  const startCall = (appointment: Appointment) => {
    setSelectedAppointment({
      ...appointment,
      duration: {
        ...appointment.duration,
        planned: appointment.duration?.planned || 30,
        startedAt: new Date()
      }
    })
    setShowCallModal(true)
  }

  const endCall = async (callData: any) => {
    if (!selectedAppointment) return
    
    const endTime = new Date()
    const startTime = new Date(selectedAppointment.duration?.startedAt || endTime)
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    
    await updateAppointmentStatus(selectedAppointment._id, 'completed', {
      callNotes: callData.notes,
      callResult: callData.result,
      duration: {
        ...selectedAppointment.duration,
        actual: durationMinutes,
        endedAt: endTime
      }
    })
    
    setShowCallModal(false)
    setSelectedAppointment(null)
  }

  const getLeadId = (apt: Appointment) => {
    if (!apt.leadId) return null
    
    if (typeof apt.leadId === 'object' && apt.leadId._id) {
      return apt.leadId._id
    }
    
    if (typeof apt.leadId === 'string') {
      return apt.leadId
    }
    
    return null
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      confirmed: 'bg-green-500/20 text-green-300 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
      no_show: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '🟡',
      confirmed: '🟢',
      completed: '🔵',
      cancelled: '🔴',
      no_show: '⚪'
    }
    return icons[status] || '❓'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      no_show: 'No asistió'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando citas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📅 Llamadas Agendadas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {stats.total || 0} citas totales
          </p>
        </div>
        
        <div className="flex gap-4">
          {/* Toggle Vista */}
          <div className="flex gap-2 bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📋 Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === 'calendar'
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📅 Calendario
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard label="Pendientes" value={stats.pending} icon="🟡" color="yellow" />
        <StatCard label="Confirmadas" value={stats.confirmed} icon="🟢" color="green" />
        <StatCard label="Completadas" value={stats.completed} icon="🔵" color="blue" />
        <StatCard label="Canceladas" value={stats.cancelled} icon="🔴" color="red" />
        <StatCard label="No asistió" value={stats.no_show} icon="⚪" color="gray" />
        <StatCard label="Esta semana" value={stats.thisWeek} icon="📆" color="cyan" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { id: 'all', label: 'Todas', count: stats.total },
          { id: 'pending', label: 'Pendientes', count: stats.pending },
          { id: 'confirmed', label: 'Confirmadas', count: stats.confirmed },
          { id: 'completed', label: 'Completadas', count: stats.completed },
          { id: 'cancelled', label: 'Canceladas', count: stats.cancelled }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-cyan-500 border-b-2 border-cyan-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {appointments.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">No hay citas agendadas</p>
          <p className="text-gray-500 dark:text-gray-500">
            {activeTab !== 'all' && `No hay citas con estado "${getStatusLabel(activeTab)}"`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map(apt => (
            <AppointmentCard
              key={apt._id}
              appointment={apt}
              onStatusChange={updateAppointmentStatus}
              onDelete={deleteAppointment}
              onSendReminder={sendReminder}
              onStartCall={startCall}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getStatusLabel={getStatusLabel}
              getLeadId={getLeadId}
            />
          ))}
        </div>
      )}

      {/* Modal de llamada */}
      {showCallModal && selectedAppointment && (
        <CallModal
          appointment={selectedAppointment}
          onClose={() => setShowCallModal(false)}
          onSave={endCall}
        />
      )}
    </div>
  )
}

// Componente StatCard
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  )
}

// Componente AppointmentCard
function AppointmentCard({ 
  appointment, 
  onStatusChange, 
  onDelete, 
  onSendReminder,
  onStartCall,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  getLeadId
}: any) {
  const [showDetails, setShowDetails] = useState(false)
  
  const formatDate = (date?: Date | string) => {
    if (!date) return 'Sin fecha'
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const leadId = getLeadId(appointment)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{appointment.name}</h3>
            <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(appointment.status)}`}>
              {getStatusIcon(appointment.status)} {getStatusLabel(appointment.status)}
            </span>
          </div>
          
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            <p>📅 {formatDate(appointment.scheduledDate)}</p>
            {appointment.phone && <p>📱 {appointment.phone}</p>}
            {appointment.email && <p>📧 {appointment.email}</p>}
            {leadId && (
              <Link 
                href={`/admin/leads/${leadId}`}
                className="text-cyan-500 hover:underline inline-flex items-center gap-1"
              >
                👤 Ver Lead →
              </Link>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
        >
          {showDetails ? '▼' : '▶'}
        </button>
      </div>

      {/* Acciones rápidas */}
      <div className="flex flex-wrap gap-2">
        {appointment.status === 'confirmed' && (
          <>
            <button
              onClick={() => onStartCall(appointment)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
            >
              📞 Iniciar Llamada
            </button>
            <button
              onClick={() => onSendReminder(appointment._id)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
            >
              🔔 Enviar Recordatorio
            </button>
          </>
        )}
        
        {appointment.status === 'pending' && (
          <button
            onClick={() => onStatusChange(appointment._id, 'confirmed')}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
          >
            ✅ Confirmar
          </button>
        )}

        <button
          onClick={() => onStatusChange(appointment._id, 'cancelled')}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm border border-red-500/30"
        >
          ❌ Cancelar
        </button>

        <button
          onClick={() => onDelete(appointment._id)}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
        >
          🗑️ Eliminar
        </button>
      </div>

      {/* Detalles expandibles */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            {appointment.notes && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📝 Notas pre-llamada:</h4>
                <p className="text-gray-600 dark:text-gray-400">{appointment.notes}</p>
              </div>
            )}

            {appointment.callNotes && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💬 Notas de la llamada:</h4>
                <p className="text-gray-600 dark:text-gray-400">{appointment.callNotes}</p>
              </div>
            )}

            {appointment.duration?.actual && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">⏱️ Duración:</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Planificado: {appointment.duration.planned} min | Real: {appointment.duration.actual} min
                </p>
              </div>
            )}

            {appointment.callResult && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Resultado:</h4>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  {appointment.callResult.converted !== null && (
                    <p>Conversión: {appointment.callResult.converted ? '✅ Sí' : '❌ No'}</p>
                  )}
                  {appointment.callResult.interest && (
                    <p>
                      Interés: {appointment.callResult.interest === 'hot' ? '🔥 Caliente' : 
                               appointment.callResult.interest === 'warm' ? '🌡️ Tibio' : '❄️ Frío'}
                    </p>
                  )}
                  {appointment.callResult.nextSteps && (
                    <p>Próximos pasos: {appointment.callResult.nextSteps}</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Modal de llamada
function CallModal({ appointment, onClose, onSave }: any) {
  const [notes, setNotes] = useState('')
  const [converted, setConverted] = useState<boolean | null>(null)
  const [interest, setInterest] = useState<'hot' | 'warm' | 'cold' | null>(null)
  const [nextSteps, setNextSteps] = useState('')
  
  const handleSave = () => {
    onSave({
      notes,
      result: {
        converted,
        interest,
        nextSteps
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📞 Llamada con {appointment.name}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Notas */}
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-2">
              📝 Notas de la llamada:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
              placeholder="¿Qué se habló? ¿Qué necesita el cliente?"
            />
          </div>

          {/* Conversión */}
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-2">
              💰 ¿Convirtió en cliente?
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setConverted(true)}
                className={`flex-1 py-3 rounded-lg border-2 transition ${
                  converted === true
                    ? 'bg-green-500/20 border-green-500 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                ✅ Sí
              </button>
              <button
                onClick={() => setConverted(false)}
                className={`flex-1 py-3 rounded-lg border-2 transition ${
                  converted === false
                    ? 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                ❌ No
              </button>
            </div>
          </div>

          {/* Interés */}
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-2">
              🌡️ Nivel de interés:
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'hot' as const, label: '🔥 Caliente', colorClass: 'red' },
                { value: 'warm' as const, label: '🌡️ Tibio', colorClass: 'yellow' },
                { value: 'cold' as const, label: '❄️ Frío', colorClass: 'blue' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setInterest(opt.value)}
                  className={`py-3 rounded-lg border-2 transition ${
                    interest === opt.value
                      ? `bg-${opt.colorClass}-500/20 border-${opt.colorClass}-500 text-${opt.colorClass}-600 dark:text-${opt.colorClass}-400`
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Próximos pasos */}
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-2">
              📋 Próximos pasos:
            </label>
            <input
              type="text"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              placeholder="Enviar propuesta, agendar otra llamada..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:opacity-90 text-white font-bold rounded-lg"
          >
            💾 Guardar y Finalizar
          </button>
        </div>
      </div>
    </div>
  )
}