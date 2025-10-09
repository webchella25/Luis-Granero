// src/app/admin/leads/[id]/page.js - CORREGIDO
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function LeadDetailPage() {
  const params = useParams()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLead()
  }, [])

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setLead(data.lead)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
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
    return (
      <div className="p-8">
        <p className="text-gray-900 dark:text-white">Lead no encontrado</p>
        <Link href="/admin/leads" className="text-cyan-500 hover:underline mt-4 inline-block">
          Volver a leads
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/leads" className="text-cyan-500 hover:underline text-sm">
        &larr; Volver a leads
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {lead.name}
        </h1>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">Categoría</span>
            <p className="text-gray-900 dark:text-white font-medium">{lead.category}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">Score de Oportunidad</span>
            <p className="text-cyan-500 font-bold text-2xl">{lead.opportunityScore}/100</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">Teléfono</span>
            <p className="text-gray-900 dark:text-white">{lead.phone || 'No disponible'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">Email</span>
            <p className="text-gray-900 dark:text-white">{lead.possibleEmails?.[0] || 'No disponible'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">Dirección</span>
            <p className="text-gray-900 dark:text-white">{lead.address || 'No disponible'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">Rating</span>
            {lead.rating ? (
              <p className="text-yellow-500">★ {lead.rating} ({lead.reviewCount} reseñas)</p>
            ) : (
              <p className="text-gray-500">Sin valoraciones</p>
            )}
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">Website</span>
            {lead.website ? (
              <Link href={lead.website} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">
                Ver sitio web
              </Link>
            ) : (
              <p className="text-red-500">Sin web</p>
            )}
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">Estado</span>
            <span className={`
              px-3 py-1 rounded-full text-sm font-semibold inline-block
              ${lead.status === 'new' ? 'bg-blue-500/20 text-blue-400' : ''}
              ${lead.status === 'contacted' ? 'bg-purple-500/20 text-purple-400' : ''}
              ${lead.status === 'interested' ? 'bg-green-500/20 text-green-400' : ''}
              ${lead.status === 'rejected' ? 'bg-red-500/20 text-red-400' : ''}
              ${lead.status === 'client' ? 'bg-cyan-500/20 text-cyan-400' : ''}
            `}>
              {lead.status === 'new' && 'Nuevo'}
              {lead.status === 'contacted' && 'Contactado'}
              {lead.status === 'interested' && 'Interesado'}
              {lead.status === 'rejected' && 'Rechazado'}
              {lead.status === 'client' && 'Cliente'}
            </span>
          </div>
        </div>

        {lead.webAnalysis && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Análisis Web</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Score Web:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-medium">{lead.webAnalysis.score}/100</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Tiempo de carga:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-medium">{(lead.webAnalysis.loadTime / 1000).toFixed(1)}s</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Mobile:</span>
                <span className="ml-2">{lead.webAnalysis.hasMobile ? '✅' : '❌'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">SSL:</span>
                <span className="ml-2">{lead.webAnalysis.hasSSL ? '✅' : '❌'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400 block mb-2">Problemas detectados:</span>
                <ul className="list-disc list-inside text-orange-500 space-y-1">
                  {lead.webAnalysis.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {lead.contactHistory && lead.contactHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Historial de Contacto</h3>
            <div className="space-y-2">
              {lead.contactHistory.map((contact, i) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {contact.type === 'email' && '📧 Email enviado'}
                      {contact.type === 'phone' && '📞 Llamada'}
                      {contact.type === 'meeting' && '🤝 Reunión'}
                      {contact.type === 'note' && '📝 Nota'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(contact.date).toLocaleDateString()}
                    </span>
                  </div>
                  {contact.emailSubject && (
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{contact.emailSubject}</p>
                  )}
                  {contact.notes && (
                    <p className="text-gray-600 dark:text-gray-400">{contact.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/admin/leads/${params.id}/email`}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            ✉️ Generar Email
          </Link>
          {lead.phone && (
            <Link
              href={`tel:${lead.phone}`}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              📞 Llamar
            </Link>
          )}
          {lead.website && (
            <Link
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              🌐 Ver Web
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}