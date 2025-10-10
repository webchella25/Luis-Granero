// src/app/admin/leads/[id]/email/page.js - ACTUALIZAR
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function GenerateEmailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState(null)
  const [email, setEmail] = useState({
    to: '',
    subject: '',
    body: '',
    htmlPreview: ''
  })
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchLead()
  }, [])

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setLead(data.lead)
        
        // Generar vista previa del email
        const previewHtml = generateEmailPreview(data.lead)
        setEmail({
          to: data.lead.possibleEmails?.[0] || '',
          subject: previewHtml.subject,
          body: previewHtml.textBody,
          htmlPreview: previewHtml.htmlBody
        })
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateEmailPreview = (lead) => {
    const magicLink = 'https://www.luisgranero.com/agendar/[TOKEN]'
    
    if (!lead.website) {
      return {
        subject: `Oportunidad digital para ${lead.name}`,
        textBody: `Hola,

Soy Luis Granero, desarrollador web especializado en ${lead.category || 'negocios locales'}.

He encontrado ${lead.name} en Google Maps y me he dado cuenta de que no tienen presencia web.

Puedo ayudarte a crear una web profesional que:
✓ Atraiga más clientes locales
✓ Muestre tu negocio 24/7
✓ Aumente tu credibilidad

Con ${lead.reviewCount || 0} reseñas, es claro que ofreces un gran servicio.

👉 Agenda una llamada gratuita: ${magicLink}

Saludos,
Luis Granero`,
        htmlBody: `Vista previa del email con diseño completo (se enviará en HTML)`
      }
    } else {
      return {
        subject: `Mejora la velocidad de ${lead.name}`,
        textBody: `Hola,

He analizado tu web y tarda ${Math.round((lead.webAnalysis?.loadTime || 0) / 1000)} segundos en cargar.

Problemas detectados:
${lead.webAnalysis?.issues?.slice(0, 3).map(issue => `• ${issue}`).join('\n') || '• Velocidad lenta'}

Puedo ayudarte a mejorar hasta un 70% la velocidad.

👉 Agenda un análisis gratuito: ${magicLink}

Saludos,
Luis Granero`,
        htmlBody: `Vista previa del email con diseño completo (se enviará en HTML)`
      }
    }
  }

  const handleSendEmail = async () => {
    if (!email.to) {
      alert('No hay email de destino')
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
          to: email.to
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
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/admin/leads/${params.id}`}
            className="text-cyan-500 hover:underline text-sm mb-2 inline-block"
          >
            &larr; Volver al lead
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📧 Generar Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Para: {lead.name}
          </p>
        </div>

        <button
          onClick={handleSendEmail}
          disabled={sending || !email.to}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? '⏳ Enviando...' : '📤 Enviar Email'}
        </button>
      </div>

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
            <span className="text-gray-500 dark:text-gray-400">Score:</span>
            <span className="text-cyan-500 font-bold">{lead.opportunityScore}/100</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Vista Previa del Email
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Para:
            </label>
            <input
              type="email"
              value={email.to}
              onChange={(e) => setEmail({ ...email, to: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asunto:
            </label>
            <p className="text-gray-900 dark:text-white font-semibold px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded">
              {email.subject}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensaje:
            </label>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded whitespace-pre-wrap text-gray-900 dark:text-white text-sm">
              {email.body}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ℹ️ El email se enviará con diseño HTML profesional incluyendo un botón para agendar llamada.
            </p>
          </div>
        </div>
      </div>

      {!email.to && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            ⚠️ Este lead no tiene email. Añade uno manualmente antes de enviar.
          </p>
        </div>
      )}
    </div>
  )
}