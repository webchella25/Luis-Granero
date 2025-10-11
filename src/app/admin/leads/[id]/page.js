// src/app/admin/leads/[id]/page.js - VERSIÓN COMPLETA
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
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

  const copyContactMessage = (lead) => {
    const message = `Hola! 👋

Soy Luis Granero, desarrollador web especializado en ${lead.category || 'negocios locales'}.

He visto *${lead.name}* en Google Maps y creo que podría ayudaros a conseguir más clientes online.

Puedo ayudarte a crear una web profesional que:
✅ Atraiga más clientes locales a través de Google
✅ Muestre tu negocio 24/7
✅ Aumente tu credibilidad frente a la competencia

Con ${lead.reviewCount || 0} reseñas positivas y ${lead.rating || 0} estrellas, es claro que ofrecéis un gran servicio. Una web profesional potenciaría aún más vuestro éxito.

¿Te interesaría una llamada gratuita de 15 minutos para ver cómo podemos mejorar vuestra presencia digital?

Puedes responder este mensaje o llamarme cuando prefieras.

Un saludo! 🚀
Luis Granero
Desarrollo Web Profesional
📧 luis@luisgranero.com
🌐 www.luisgranero.com`

    navigator.clipboard.writeText(message)
    alert('✅ Mensaje copiado al portapapeles!\n\nAhora puedes pegarlo en:\n• WhatsApp\n• Instagram\n• Facebook\n• Email\n• Cualquier canal')
  }

  const generateWhatsAppLink = (lead) => {
    const message = `Hola! 👋

Soy Luis Granero, desarrollador web.

He visto *${lead.name}* en Google Maps y creo que podría ayudaros a conseguir más clientes online.

Con ${lead.reviewCount || 0} reseñas positivas, es claro que ofrecéis un gran servicio. Una web profesional potenciaría aún más vuestro éxito.

¿Te interesaría una llamada de 15 minutos para hablar de vuestra presencia digital?

Un saludo!
Luis Granero
www.luisgranero.com`

    return `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
  }

  const markAsContacted = async (contactType) => {
    try {
      await fetch(`/api/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'contacted',
          $push: {
            contactHistory: {
              date: new Date(),
              type: contactType,
              notes: `Contactado vía ${contactType}`
            }
          }
        })
      })
      fetchLead()
    } catch (error) {
      console.error('Error:', error)
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
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href="/admin/leads" className="text-cyan-500 hover:underline text-sm">
        &larr; Volver a leads
      </Link>

      {/* Header con nombre y score */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{lead.name}</h1>
        <div className="flex items-center gap-4">
          <span className="text-lg opacity-90">{lead.category}</span>
          <span className="bg-white/20 px-4 py-1 rounded-full font-semibold">
            Score: {lead.opportunityScore}/100
          </span>
          {lead.rating && (
            <span className="bg-yellow-400/30 px-4 py-1 rounded-full">
              ⭐ {lead.rating} ({lead.reviewCount} reseñas)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Básica */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📋 Información Básica
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Dirección</span>
                <p className="text-gray-900 dark:text-white">{lead.address || 'No disponible'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Teléfono</span>
                <p className="text-gray-900 dark:text-white">{lead.phone || 'No disponible'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Website</span>
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">
                    Ver sitio web
                  </a>
                ) : (
                  <p className="text-red-500 font-semibold">❌ Sin web</p>
                )}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Estado</span>
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
          </div>

          {/* Emails Encontrados */}
          {lead.possibleEmails && lead.possibleEmails.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📧 Emails Encontrados
              </h2>
              <div className="space-y-2">
                {lead.possibleEmails.map((email, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded">
                    <span className="text-gray-900 dark:text-white font-mono">{email}</span>
                    
                      href={`mailto:${email}`}
                      className="text-cyan-500 hover:underline text-sm"
                    >
                      Enviar email
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Redes Sociales */}
          {lead.socialMedia && Object.values(lead.socialMedia).some(v => v) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🔗 Redes Sociales
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {lead.socialMedia.instagram && (
                  
                    href={lead.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <span className="text-xl">📷</span>
                    Instagram
                  </a>
                )}
                {lead.socialMedia.facebook && (
                  
                    href={lead.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <span className="text-xl">👥</span>
                    Facebook
                  </a>
                )}
                {lead.socialMedia.twitter && (
                  
                    href={lead.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-black text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <span className="text-xl">🐦</span>
                    Twitter/X
                  </a>
                )}
                {lead.socialMedia.linkedin && (
                  
                    href={lead.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-700 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <span className="text-xl">💼</span>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Análisis Web */}
          {lead.webAnalysis && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🌐 Análisis Web
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Score Web</span>
                  <p className="text-2xl font-bold text-cyan-500">{lead.webAnalysis.score}/100</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Tiempo de carga</span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(lead.webAnalysis.loadTime / 1000).toFixed(1)}s
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Tecnología</span>
                  <p className="text-gray-900 dark:text-white font-medium">{lead.webAnalysis.technology}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Características</span>
                  <div className="flex gap-2 mt-1">
                    <span>{lead.webAnalysis.hasMobile ? '✅' : '❌'} Mobile</span>
                    <span>{lead.webAnalysis.hasSSL ? '✅' : '❌'} SSL</span>
                  </div>
                </div>
              </div>
              
              {lead.webAnalysis.issues && lead.webAnalysis.issues.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                    ⚠️ Problemas Detectados
                  </h3>
                  <ul className="list-disc list-inside text-orange-700 dark:text-orange-400 space-y-1">
                    {lead.webAnalysis.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Historial de Contacto */}
          {lead.contactHistory && lead.contactHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📝 Historial de Contacto
              </h2>
              <div className="space-y-3">
                {lead.contactHistory.map((contact, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {contact.type === 'email' && '📧 Email'}
                        {contact.type === 'phone' && '📞 Llamada'}
                        {contact.type === 'whatsapp' && '📱 WhatsApp'}
                        {contact.type === 'meeting' && '🤝 Reunión'}
                        {contact.type === 'note' && '📝 Nota'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(contact.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {contact.emailSubject && (
                      <p className="text-gray-900 dark:text-white font-medium mb-1">
                        {contact.emailSubject}
                      </p>
                    )}
                    {contact.notes && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Opciones de Contacto */}
        <div className="space-y-6">
          {/* Opciones de Contacto */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📞 Contactar Lead
            </h2>
            
            <div className="space-y-3">
              {/* Email Automático */}
              {lead.possibleEmails && lead.possibleEmails.length > 0 && (
                <Link
                  href={`/admin/leads/${params.id}/email`}
                  onClick={() => markAsContacted('email')}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity w-full"
                >
                  <span className="text-xl">✉️</span>
                  Enviar Email Automático
                </Link>
              )}
              
              {/* WhatsApp */}
              {lead.phone && (
                
                  href={generateWhatsAppLink(lead)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markAsContacted('whatsapp')}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity w-full"
                >
                  <span className="text-xl">📱</span>
                  Abrir WhatsApp
                </a>
              )}
              
              {/* Llamada Directa */}
              {lead.phone && (
                
                  href={`tel:${lead.phone}`}
                  onClick={() => markAsContacted('phone')}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity w-full"
                >
                  <span className="text-xl">📞</span>
                  Llamar Ahora
                </a>
              )}
              
              {/* Copiar Mensaje */}
              <button
                onClick={() => copyContactMessage(lead)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity w-full"
              >
                <span className="text-xl">📋</span>
                Copiar Mensaje
              </button>
              
              {/* Ver Web */}
              {lead.website && (
                
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity w-full"
                >
                  <span className="text-xl">🌐</span>
                  Ver Sitio Web
                </a>
              )}
            </div>

            {/* Ayuda */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                💡 <strong>Consejo:</strong>
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                <li>✅ Si hay email, envía primero email automático</li>
                <li>📱 Si no responde, prueba WhatsApp</li>
                <li>📞 Llamada directa como último recurso</li>
                <li>📋 Usa "Copiar mensaje" para redes sociales</li>
              </ul>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              ⚡ Acciones Rápidas
            </h3>
            <div className="space-y-2">
              <button
                onClick={async () => {
                  await fetch(`/api/leads/${params.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'interested' })
                  })
                  fetchLead()
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                ✅ Marcar como interesado
              </button>
              <button
                onClick={async () => {
                  await fetch(`/api/leads/${params.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'rejected' })
                  })
                  fetchLead()
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                ❌ Marcar como rechazado
              </button>
              <button
                onClick={async () => {
                  if (confirm('¿Eliminar este lead?')) {
                    await fetch(`/api/leads/${params.id}`, { method: 'DELETE' })
                    router.push('/admin/leads')
                  }
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                🗑️ Eliminar lead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}