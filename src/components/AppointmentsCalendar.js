// src/components/AppointmentsCalendar.js - CALENDARIO VISUAL COMPLETO
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AppointmentsCalendar({ 
  appointments, 
  currentMonth, 
  onMonthChange, 
  onAppointmentClick,
  getStatusIcon,
  getStatusColor
}) {
  const [selectedDate, setSelectedDate] = useState(null)

  // Obtener días del mes
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  // Obtener citas de un día específico
  const getAppointmentsForDay = (day) => {
    return appointments.filter(apt => {
      if (!apt.scheduledDate) return false
      const aptDate = new Date(apt.scheduledDate)
      return aptDate.getDate() === day &&
             aptDate.getMonth() === month &&
             aptDate.getFullYear() === year
    })
  }

  // Navegar meses
  const previousMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    onMonthChange(newDate)
  }

  const nextMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    onMonthChange(newDate)
  }

  const goToToday = () => {
    onMonthChange(new Date())
  }

  // Formatear mes y año
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  // Generar array de días (incluyendo vacíos del mes anterior)
  const days = []
  
  // Días vacíos al inicio
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear()
  }

  const hasAppointments = (day) => {
    if (!day) return false
    return getAppointmentsForDay(day).length > 0
  }

  return (
    <div className="space-y-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            ← Anterior
          </button>
          
          <h2 className="text-2xl font-bold text-white min-w-[200px] text-center">
            {monthNames[month]} {year}
          </h2>
          
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Siguiente →
          </button>
        </div>

        <button
          onClick={goToToday}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition"
        >
          📅 Hoy
        </button>
      </div>

      {/* Grid del calendario */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        {/* Nombres de los días */}
        <div className="grid grid-cols-7 border-b border-gray-700">
          {dayNames.map(name => (
            <div
              key={name}
              className="p-4 text-center font-semibold text-gray-400 bg-gray-900"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayAppointments = day ? getAppointmentsForDay(day) : []
            const isCurrentDay = isToday(day)
            
            return (
              <motion.div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-700 p-2 ${
                  day ? 'cursor-pointer hover:bg-gray-700/50' : 'bg-gray-900/50'
                } ${isCurrentDay ? 'bg-cyan-500/10 border-cyan-500' : ''}`}
                onClick={() => day && setSelectedDate(day)}
                whileHover={day ? { scale: 1.02 } : {}}
              >
                {day && (
                  <>
                    {/* Número del día */}
                    <div className={`text-right mb-2 ${
                      isCurrentDay 
                        ? 'text-cyan-400 font-bold text-lg' 
                        : 'text-gray-400'
                    }`}>
                      {day}
                      {isCurrentDay && (
                        <span className="ml-1 text-xs">📍</span>
                      )}
                    </div>

                    {/* Citas del día */}
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map(apt => (
                        <motion.div
                          key={apt._id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onAppointmentClick(apt)
                          }}
                          className={`text-xs p-1.5 rounded cursor-pointer ${getStatusColor(apt.status)}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center gap-1">
                            <span>{getStatusIcon(apt.status)}</span>
                            <span className="truncate font-medium">
                              {apt.scheduledTime || 'Sin hora'}
                            </span>
                          </div>
                          <div className="truncate text-xs opacity-80">
                            {apt.name}
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Indicador de más citas */}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-center text-cyan-400 font-semibold">
                          +{dayAppointments.length - 3} más
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Modal de día seleccionado */}
      <AnimatePresence>
        {selectedDate && (
          <DayDetailModal
            date={new Date(year, month, selectedDate)}
            appointments={getAppointmentsForDay(selectedDate)}
            onClose={() => setSelectedDate(null)}
            onAppointmentClick={onAppointmentClick}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
          />
        )}
      </AnimatePresence>

      {/* Leyenda */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-3">📊 Leyenda:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { status: 'pending', label: 'Pendiente' },
            { status: 'confirmed', label: 'Confirmada' },
            { status: 'completed', label: 'Completada' },
            { status: 'cancelled', label: 'Cancelada' },
            { status: 'no_show', label: 'No asistió' }
          ].map(item => (
            <div key={item.status} className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded ${getStatusColor(item.status)}`}></span>
              <span className="text-sm text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Modal de detalles del día
function DayDetailModal({ 
  date, 
  appointments, 
  onClose, 
  onAppointmentClick,
  getStatusIcon,
  getStatusColor
}) {
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              📅 {formatDate(date)}
            </h2>
            <p className="text-gray-400">
              {appointments.length} {appointments.length === 1 ? 'cita' : 'citas'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Lista de citas */}
        <div className="p-6">
          {appointments.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No hay citas programadas para este día
            </p>
          ) : (
            <div className="space-y-4">
              {appointments.sort((a, b) => {
                const timeA = a.scheduledTime || '00:00'
                const timeB = b.scheduledTime || '00:00'
                return timeA.localeCompare(timeB)
              }).map(apt => (
                <motion.div
                  key={apt._id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    onAppointmentClick(apt)
                    onClose()
                  }}
                  className={`p-4 rounded-lg cursor-pointer border ${getStatusColor(apt.status)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStatusIcon(apt.status)}</span>
                      <div>
                        <h3 className="font-bold text-white">{apt.name}</h3>
                        <p className="text-sm text-gray-400">
                          🕐 {apt.scheduledTime || 'Sin hora específica'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {apt.notes && (
                    <p className="text-sm text-gray-400 mt-2">
                      📝 {apt.notes}
                    </p>
                  )}

                  {apt.phone && (
                    <p className="text-sm text-gray-400 mt-1">
                      📱 {apt.phone}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
