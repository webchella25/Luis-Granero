// src/app/agendar/[token]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function AgendarPage() {
  const params = useParams()
  const [lead, setLead] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    validateToken()
  }, [])

  const validateToken = async () => {
    try {
      const res = await fetch(`/api/agendar/validate/${params.token}`)
      const data = await res.json()
      
      if (data.valid) {
        setLead(data.lead)
        setName(data.lead.name)
        setPhone(data.lead.phone || '')
      } else {
        setError('Link inválido o expirado')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al validar el enlace')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/agendar/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: params.token,
          date: selectedDate,
          time: selectedTime,
          name,
          phone
        })
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(true)
      } else {
        alert(data.error || 'Error al agendar')
      }
    } catch (error) {
      alert('Error al agendar. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // Generar próximos 14 días hábiles (lunes a viernes)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    let daysAdded = 0
    let currentDate = new Date(today)
    currentDate.setDate(currentDate.getDate() + 1) // Empezar mañana

    while (daysAdded < 14) {
      const dayOfWeek = currentDate.getDay()
      // Solo lunes (1) a viernes (5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push(new Date(currentDate))
        daysAdded++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  const availableDates = getAvailableDates()
  
  const availableSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '15:00', '16:00', '17:00', '18:00'
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Inválido</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Este enlace ya no es válido o ha expirado.'}
          </p>
          <p className="text-sm text-gray-500">
            Si necesitas ayuda, contacta directamente a <br/>
            <a href="mailto:luis@luisgranero.com" className="text-cyan-500 hover:underline">
              luis@luisgranero.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-4xl">✅</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Llamada Agendada!</h1>
          <p className="text-gray-600 mb-2">
            Perfecto, <strong>{name}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Te llamaré el <strong className="text-cyan-600">{new Date(selectedDate).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}</strong> a las <strong className="text-cyan-600">{selectedTime}</strong>.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              📧 Te he enviado un email de confirmación con todos los detalles.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-2">📞 Información de contacto:</p>
            <p className="text-sm text-gray-600">{phone}</p>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Si necesitas cambiar la fecha, responde al email de confirmación.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-8 text-white text-center">
            <div className="mb-4">
              <span className="text-5xl">📅</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Agendar Llamada</h1>
            <p className="text-lg opacity-90">Hablemos sobre tu proyecto web</p>
            <div className="mt-4 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-sm">⏱️ Duración: 15 minutos</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre / Empresa *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Tu nombre o empresa"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="+34 600 000 000"
              />
              <p className="mt-1 text-xs text-gray-500">Te llamaré a este número</p>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Selecciona un día *
              </label>
              <div classN