// src/app/admin/leads/[id]/email/page.js - ACTUALIZADO
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function GenerateEmailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState(null)
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [preview, setPreview] = useState({ subject: '', body: '' })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (lead && selectedTemplate) {
      generatePreview()
    }
  }, [lead, selectedTemplate])

  const fetchData = async () => {
    try {
      // Obtener lead
      const leadRes = await fetch(`/api/leads/${params.id}`)
      const leadData = await leadRes.json()
      
      if (leadData.success) {
        setLead(leadData.lead)
        setEmail(leadData.lead.possibleEmails?.[0] || '')
        
        // Obtener templates de email
        const templatesRes = await fetch('/api/templates?type=email')
        const templatesData = await templatesRes.json()
        
        if (templatesData.success) {
          setTemplates(templatesData.templates)
          // Seleccionar template por defecto
          const defaultId = leadData.lead.website ? 'email_has_website' : 'email_no_website'
          const defaultTemplate = templatesData.templates.find(t => t.id === defaultId)
          setSelectedTemplate(defaultTemplate || templatesData.templates[0])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePreview = () => {
    if (!lead || !selectedTemplate) return

    const magicLink = 'https://www.luisgranero.com/agendar/[TOKEN_EJEMPLO]'
    
    const variableMap = {
      business_name: lead.name,
      category: lead.category || 'negocios locales',
      review_count: lead.reviewCount || 0,
      rating: lead.rating || 0,
      load_time: lead.webAnalysis?.loadTime 
        ? Math.round(lead.webAnalysis.loadTime / 1000) 
        : '?',
      issues_list: lead.webAnalysis?.issues 
        ? lead.webAnalysis.issues.slice(0, 3).map(issue => `• ${issue}`).join('\n')
        : '• Sin análisis disponible',
      magic_link: magicLink,
      score: lead.opportunityScore
    }

    let processedSubject = selectedTemplate.subject || ''
    let processedBody = selectedTemplate.body

    Object.entries(variableMap).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      processedSubject = processedSubject.replace(regex, String(value))
      processedBody = processedBody.replace(regex, String(value))
    })

    setPreview({ subject: processedSubject, body: processedBody })
  }

  const handleSendEmail = async () => {
    if (!email) {
      alert('No hay email de destino')
      return
    }

    if (!confirm(`¿Enviar email a ${email}?`)) return

    setSending(true)
    try {
      const res = await fetch('/api/leads/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: params.id,
          to: email,
          templateId: selectedTemplate?.id
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
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <Link href={`/admin/leads/${params.id}`} className="text-cyan-500 hover:underline text-sm">
        &larr; Volver al lead
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            📧 Enviar Email
          </h1>
          <p className="text-gray-400 mt-1">
            Para: {lead.name}
          </p>
        </div>

        <button
          onClick={handleSendEmail}
          disabled={sending || !email}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {sending ? '⏳ Enviando...' : '📤 Enviar Email'}
        </button>
      </div>

      {/* Selector de template */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Seleccionar Template</h3>
        <select
          value={selectedTemplate?.id || ''}
          onChange={(e) => {
            const template = templates.find(t => t.id === e.target.value)
            setSelectedTemplate(template)
          }}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
        >
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <Link
          href="/admin/templates"
          className="text-sm text-cyan-400 hover:underline mt-2 inline-block"
        >
          ✏️ Editar templates
        </Link>
      </div>

      {/* Email input */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email destino:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          placeholder="email@ejemplo.com"
        />
      </div>

      {/* Preview */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="bg-gray-900 p-4 border-b border-gray-700">
          <h3 className="font-semibold text-white">Vista Previa</h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Asunto:</label>
            <p className="text-white font-semibold px-4 py-2 bg-gray-900 rounded">
              {preview.subject}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mensaje:</label>
            <div className="px-4 py-3 bg-gray-900 rounded whitespace-pre-wrap text-white text-sm">
              {preview.body}
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              ℹ️ El email se enviará con diseño HTML profesional. El magic link será único y temporal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}