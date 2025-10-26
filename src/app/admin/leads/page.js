// src/app/admin/leads/page.js - VERSIÓN COMPLETA INTEGRADA
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InstagramContactModal from '@/components/admin/InstagramContactModal'
import ContactHistory from '@/components/admin/ContactHistory'

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current: 1
  })

  // ✅ NUEVOS ESTADOS PARA INSTAGRAM
  const [selectedLead, setSelectedLead] = useState(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  const tabs = [
    { id: 'all', label: 'Todos', icon: '📊', status: 'all' },
    { id: 'new', label: 'Nuevos', icon: '🆕', status: 'new' },
    { id: 'contacted', label: 'Contactados', icon: '📧', status: 'contacted' },
    { id: 'interested', label: 'Interesados', icon: '💰', status: 'interested' },
    { id: 'qualified', label: 'Cualificados', icon: '⭐', status: 'qualified' },
    { id: 'proposal', label: 'Propuesta', icon: '📄', status: 'proposal' },
    { id: 'negotiation', label: 'Negociación', icon: '🤝', status: 'negotiation' },
    { id: 'won', label: 'Ganados', icon: '🎉', status: 'won' },
    { id: 'lost', label: 'Perdidos', icon: '❌', status: 'lost' }
  ]

  useEffect(() => {
    fetchLeads()
  }, [filters])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: filters.status,
        search: filters.search,
        page: filters.page.toString(),
        limit: filters.limit.toString()
      })
      
      const res = await fetch(`/api/leads/list?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setLeads(data.leads)
        setStats(data.stats)
        
        setPagination({
          total: data.total || 0,
          pages: Math.ceil((data.total || 0) / filters.limit),
          current: filters.page
        })
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ NUEVA FUNCIÓN PARA INSTAGRAM
  const handleContactSuccess = () => {
    fetchLeads() // Recargar leads para actualizar estado
  }

  const handleTabChange = (tabStatus) => {
    setActiveTab(tabStatus)
    setFilters({
      ...filters,
      status: tabStatus,
      page: 1
    })
  }

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getCountForStatus = (status) => {
    if (!stats) return 0
    if (status === 'all') return stats.opportunities?.total || 0
    return stats.byStatus?.[status] || 0
  }

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (res.ok) {
        fetchLeads()
      }
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const deleteLead = async (leadId) => {
    if (!confirm('¿Eliminar este lead?')) return
    
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
      if (res.ok) fetchLeads()
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  }

  const handleWhatsAppClick = async (lead) => {
    try {
      const res = await fetch('/api/templates?type=whatsapp')
      const data = await res.json()
      
      if (!data.success || data.templates.length === 0) {
        alert('❌ No hay templates de WhatsApp configurados. Ve a /admin/templates para crear uno.')
        return
      }
      
      const template = data.templates.find(t => t.isActive) || data.templates[0]
      let message = template.body
      
      const replacements = {
        '{{business_name}}': lead.name || '',
        '{{category}}': lead.category || 'tu negocio',
        '{{review_count}}': lead.reviewCount || 0,
        '{{rating}}': lead.rating || 0,
        '{{phone}}': lead.phone || '',
        '{{address}}': lead.address || '',
        '{{website}}': lead.website || '',
        '{{score}}': lead.opportunityScore || 0
      }
      
      Object.entries(replacements).forEach(([key, value]) => {
        message = message.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value))
      })
      
      const phoneClean = lead.phone?.replace(/\D/g, '') || ''
      
      if (!phoneClean) {
        alert('❌ Este lead no tiene teléfono')
        return
      }
      
      const whatsappUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
      
      console.log(`✅ WhatsApp abierto para ${lead.name}`)
      
    } catch (error) {
      console.error('Error cargando template de WhatsApp:', error)
      alert('❌ Error al cargar el template de WhatsApp')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 Gestión de Leads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {activeTab === 'all' 
              ? `${pagination.total} leads totales` 
              : `${getCountForStatus(activeTab)} leads en "${tabs.find(t => t.status === activeTab)?.label}"`
            } • Página {pagination.current} de {pagination.pages}
          </p>
        </div>
        
        <Link
          href="/admin/test-scraper"
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
        >
          ➕ Buscar Nuevos Leads
        </Link>
      </div>

      {/* Pestañas con contadores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const count = getCountForStatus(tab.status)
            const isActive = activeTab === tab.status
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  isActive
                    ? 'bg-white/20'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Oportunidades"
            value={stats.opportunities?.total || 0}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Score Promedio"
            value={Math.round(stats.opportunities?.avgScore || 0)}
            icon="⭐"
            color="yellow"
          />
          <StatCard
            title="Alta Prioridad"
            value={stats.opportunities?.highPriority || 0}
            icon="🔥"
            color="red"
          />
          <StatCard
            title="Sin Web"
            value={stats.opportunities?.noWebsite || 0}
            icon="🚫"
            color="green"
          />
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <input
          type="text"
          placeholder="🔍 Buscar leads..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No hay leads en esta categoría
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Score</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Negocio</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Contacto</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Web</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Estado</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4">
                        <ScoreBadge score={lead.opportunityScore} />
                      </td>

                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-gray-900 dark:text-white font-medium">{lead.name}</p>
                            
                            {lead.source === 'instagram' && (
                              <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded text-xs font-semibold">
                                📸 Instagram
                              </span>
                            )}
                            
                            {lead.source === 'google_maps' && (
                              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs font-semibold">
                                🗺️ Maps
                              </span>
                            )}
                            
                            {lead.source === 'google_search' && (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                                🔎 Search
                              </span>
                            )}
                          </div>
                          
                          {lead.username && lead.source === 'instagram' && (
                            <p className="text-pink-400 text-sm">@{lead.username}</p>
                          )}
                          
                          {lead.category && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{lead.category}</p>
                          )}
                          
                          {lead.rating && (
                            <p className="text-yellow-500 text-sm mt-1">
                              ⭐ {lead.rating} ({lead.reviewCount} reseñas)
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-sm space-y-1">
                          {lead.phone && (
                            <p className="text-gray-700 dark:text-gray-300">📞 {lead.phone}</p>
                          )}
                          {lead.possibleEmails?.[0] && (
                            <p className="text-gray-700 dark:text-gray-300">✉️ {lead.possibleEmails[0]}</p>
                          )}
                          {!lead.phone && !lead.possibleEmails?.[0] && (
                            <span className="text-orange-500 text-xs">⚠️ Sin contacto directo</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        {lead.website ? (
                          <div>
                            <Link
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-500 hover:underline text-sm"
                            >
                              Ver sitio
                            </Link>
                            {lead.webAnalysis && lead.webAnalysis.issues && lead.webAnalysis.issues.length > 0 && (
                              <p className="text-orange-500 text-xs mt-1">
                                ⚠️ {lead.webAnalysis.issues[0]}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-red-500 font-semibold text-sm">❌ Sin web</span>
                        )}
                      </td>

                      <td className="p-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                          className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded text-sm border border-gray-300 dark:border-gray-600"
                        >
                          <option value="new">Nuevo</option>
                          <option value="contacted">Contactado</option>
                          <option value="interested">Interesado</option>
                          <option value="qualified">Cualificado</option>
                          <option value="proposal">Propuesta</option>
                          <option value="negotiation">Negociación</option>
                          <option value="won">Ganado</option>
                          <option value="lost">Perdido</option>
                          <option value="rejected">Rechazado</option>
                          <option value="client">Cliente</option>
                        </select>
                      </td>

                      {/* ✅ COLUMNA DE ACCIONES ACTUALIZADA CON INSTAGRAM */}
                      <td className="p-4">
                        <div className="flex gap-2 items-center flex-wrap">
                          
                          {/* ✅ NUEVO: Botón contactar por Instagram */}
                          {lead.source === 'instagram' && lead.username && (
                            <button
                              onClick={() => {
                                setSelectedLead(lead)
                                setShowContactModal(true)
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1"
                              title="Contactar por Instagram"
                            >
                              📸 Contactar
                            </button>
                          )}
                          
                          {/* ✅ NUEVO: Ver historial de contactos */}
                          {lead.contactHistory && lead.contactHistory.length > 0 && (
                            <button
                              onClick={() => {
                                setSelectedLead(lead)
                                setShowHistoryModal(true)
                              }}
                              className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-lg transition-colors"
                              title={`Ver ${lead.contactHistory.length} contactos`}
                            >
                              📜 ({lead.contactHistory.length})
                            </button>
                          )}
                          
                          {/* Botones existentes */}
                          <Link
                            href={`/admin/leads/${lead._id}`}
                            className="text-cyan-500 hover:text-cyan-400 text-xl"
                            title="Ver detalles"
                          >
                            👁️
                          </Link>
                          
                          {lead.possibleEmails && lead.possibleEmails[0] && (
                            <Link
                              href={`/admin/leads/${lead._id}/email`}
                              className="text-blue-500 hover:text-blue-400 text-xl"
                              title="Enviar email"
                            >
                              ✉️
                            </Link>
                          )}
                          
                          {lead.phone && (
                            <button
                              onClick={() => handleWhatsAppClick(lead)}
                              className="text-green-500 hover:text-green-400 text-xl"
                              title="WhatsApp"
                            >
                              📱
                            </button>
                          )}
                          
                          {lead.phone && (
                            <Link
                              href={`tel:${lead.phone}`}
                              className="text-cyan-600 hover:text-cyan-500 text-xl"
                              title="Llamar"
                            >
                              📞
                            </Link>
                          )}
                          
                          {lead.username && lead.source === 'instagram' && (
                            <Link
                              href={`https://instagram.com/${lead.username.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-500 hover:text-pink-400 text-xl"
                              title="Ver Instagram"
                            >
                              📷
                            </Link>
                          )}
                          
                          {lead.socialMedia && lead.socialMedia.instagram && !lead.username && (
                            <Link
                              href={lead.socialMedia.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-500 hover:text-pink-400 text-xl"
                              title="Instagram"
                            >
                              📷
                            </Link>
                          )}
                          
                          {lead.socialMedia && lead.socialMedia.facebook && (
                            <Link
                              href={lead.socialMedia.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-500 text-xl"
                              title="Facebook"
                            >
                              👥
                            </Link>
                          )}
                          
                          <button
                            onClick={() => deleteLead(lead._id)}
                            className="text-red-500 hover:text-red-400 text-xl"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                ← Anterior
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Página {pagination.current} de {pagination.pages}
                </span>
                <span className="text-gray-500 dark:text-gray-500 text-sm">
                  ({pagination.total} leads totales)
                </span>
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* ✅ NUEVO: Modal de contacto Instagram */}
      {showContactModal && selectedLead && (
        <InstagramContactModal
          lead={selectedLead}
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false)
            setSelectedLead(null)
          }}
          onSuccess={handleContactSuccess}
        />
      )}

      {/* ✅ NUEVO: Modal de historial de contactos */}
      {showHistoryModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Historial de contactos
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedLead.name} {selectedLead.username && `• @${selectedLead.username.replace('@', '')}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false)
                  setSelectedLead(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <ContactHistory
                leadId={selectedLead._id}
                contacts={selectedLead.contactHistory}
                onUpdate={handleContactSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ score }) {
  let bgColor = 'bg-gray-500'
  let textColor = 'text-white'
  
  if (score >= 80) {
    bgColor = 'bg-red-500'
    textColor = 'text-white'
  } else if (score >= 60) {
    bgColor = 'bg-orange-500'
    textColor = 'text-white'
  } else if (score >= 40) {
    bgColor = 'bg-yellow-500'
    textColor = 'text-gray-900'
  }
  
  return (
    <div className={`${bgColor} ${textColor} px-3 py-1 rounded-full text-sm font-bold text-center`}>
      {score}
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
  }
  
  return (
    <div className={`bg-gradient-to-r ${colors[color]} rounded-lg p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  )
}