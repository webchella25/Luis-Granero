// src/app/admin/leads/[id]/email/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { generatePersonalizedEmail } from '@/lib/email/templates'

export default function GenerateEmailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState(null)
  const [email, setEmail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    fetchLead()
  }, [])

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setLead(data.lead)
        
        // Generar email automáticamente
        const generatedEmail = generatePersonalizedEmail(data.lead)
        setEmail(generatedEmail)
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!email.to) {
      alert('No hay email de destino. Añade un email al lead primero.')
      return
    }

    if (!confirm(`¿Enviar email a ${email.to}?`)) return

    setSending(true)
    try {
      const res = await fetch('/api/leads/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: params.id,
          to: email.to,
          subject: email.subject,
          body: email.body
        })
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Email enviado correctamente!')
        router.push(`/admin/leads/${params.id}`)
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error al enviar email')
    } finally {
      setSending(false)
    }
  }

  const copyToClipboard = () => {
    const fullEmail = `Para: ${email.to}\nAsunto: ${email.subject}\n\n${email.body}`
    navigator.clipboard.writeText(fullEmail)
    alert('✅ Email copiado al portapapeles')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!lead) {
    return <div className="p-8 text-white">Lead no encontrado</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/admin/leads/${params.id}`}
            className="text-cyan-500 hover:underline text-sm mb-2 inline-block"
          >
            ← Volver al lead
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📧 Generar Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Para: {lead.name}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            📋 Copiar
          </button>
          <button
            onClick={handleSendEmail}
            disabled={sending || !email?.to}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '⏳ Enviando...' : '📤 Enviar Email'}
          </button>
        </div>
      </div>

      {/* Lead Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Información del Lead
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Negocio:</span>
            <p className="text-gray-900 dark:text-white font-medium">{lead.name}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
            <p className="text-gray-900 dark:text-white">{lead.category}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Email:</span>
            <p className="text-gray-900 dark:text-white">{lead.possibleEmails?.[0] || 'No disponible'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Score:</span>
            <span className="text-cyan-500 font-bold">{lead.opportunityScore}/100</span>
          </div>
        </div>
      </div>

      {/* Email Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Vista Previa del Email
          </h3>
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-sm text-cyan-500 hover:underline"
          >
            {editMode ? '✅ Guardar cambios' : '✏️ Editar'}
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Para */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Para:
            </label>
            {editMode ? (
              <input
                type="email"
                value={email.to || lead.possibleEmails?.[0] || ''}
                onChange={(e) => setEmail({ ...email, to: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded">
                {email.to || lead.possibleEmails?.[0] || 'No email disponible'}
              </p>
            )}
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asunto:
            </label>
            {editMode ? (
              <input
                type="text"
                value={email.subject}
                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded">
                {email.subject}
              </p>
            )}
          </div>

          {/* Cuerpo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensaje:
            </label>
            {editMode ? (
              <textarea
                value={email.body}
                onChange={(e) => setEmail({ ...email, body: e.target.value })}
                rows={16}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white font-mono text-sm"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded whitespace-pre-wrap text-gray-900 dark:text-white font-mono text-sm">
                {email.body}
              </div>
            )}
          </div>

          {/* Template info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            Plantilla utilizada: <span className="font-mono">{email.templateUsed}</span>
          </div>
        </div>
      </div>

      {/* Warning si no hay email */}
      {!email?.to && !lead.possibleEmails?.[0] && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            ⚠️ Este lead no tiene email. Añade uno manualmente o busca el contacto antes de enviar.
          </p>
        </div>
      )}
    </div>
  )
}