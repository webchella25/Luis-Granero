// src/app/admin/leads/page.js - ARCHIVO COMPLETO CON WHATSAPP DINÁMICO
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1
  })

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
        limit: '50'
      })
      
      const res = await fetch(`/api/leads/list?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setLeads(data.leads)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
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

  // ✅ NUEVA FUNCIÓN QUE CARGA EL TEMPLATE DE WHATSAPP DINÁMICAMENTE
  const handleWhatsAppClick = async (lead) => {
    try {
      // 1. Cargar template de WhatsApp desde la DB
      const res = await fetch('/api/templates?type=whatsapp');
      const data = await res.json();
      
      if (!data.success || data.templates.length === 0) {
        alert('❌ No hay templates de WhatsApp configurados. Ve a /admin/templates para crear uno.');
        return;
      }
      
      // 2. Usar el primer template activo
      const template = data.templates.find(t => t.isActive) || data.templates[0];
      
      // 3. Reemplazar variables en el template
      let message = template.body;
      
      const replacements = {
        '{{business_name}}': lead.name || '',
        '{{category}}': lead.category || 'tu negocio',
        '{{review_count}}': lead.reviewCount || 0,
        '{{rating}}': lead.rating || 0,
        '{{phone}}': lead.phone || '',
        '{{address}}': lead.address || '',
        '{{website}}': lead.website || '',
        '{{score}}': lead.opportunityScore || 0
      };
      
      // Reemplazar todas las variables
      Object.entries(replacements).forEach(([key, value]) => {
        message = message.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
      });
      
      // 4. Generar link de WhatsApp con el mensaje
      const phoneClean = lead.phone?.replace(/\D/g, '') || '';
      
      if (!phoneClean) {
        alert('❌ Este lead no tiene teléfono');
        return;
      }
      
      const whatsappUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`;
      
      // 5. Abrir WhatsApp
      window.open(whatsappUrl, '_blank');
      
      console.log(`✅ WhatsApp abierto para ${lead.name}`);
      
    } catch (error) {
      console.error('Error cargando template de WhatsApp:', error);
      alert('❌ Error al cargar el template de WhatsApp');
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
            {stats?.opportunities?.total || 0} leads totales
          </p>
        </div>
        
        <Link
          href="/admin/test-scraper"
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
        >
          ➕ Buscar Nuevos Leads
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Leads"
            value={stats.opportunities?.total || 0}
            icon="🎯"
            color="blue"
          />
          <StatCard
            title="Alta Oportunidad"
            value={stats.opportunities?.high || 0}
            icon="🔥"
            color="red"
          />
          <StatCard
            title="Contactados"
            value={stats.byStatus?.contacted || 0}
            icon="✉️"
            color="green"
          />
          <StatCard
            title="Interesados"
            value={stats.byStatus?.interested || 0}
            icon="💰"
            color="yellow"
          />
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, categoría o dirección..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filtro por estado */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="new">Nuevos</option>
            <option value="contacted">Contactados</option>
            <option value="interested">Interesados</option>
            <option value="rejected">Rechazados</option>
            <option value="client">Clientes</option>
          </select>
        </div>
      </div>

      {/* Tabla de Leads */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No hay leads todavía</p>
          <Link
            href="/admin/test-scraper"
            className="mt-4 text-cyan-500 hover:underline inline-block"
          >
            Buscar tu primer lead
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left p-4 text-gray-600 dark:text-gray-400 font-semibold">Score</th>
                  <th className="text-left p-4 text-gray-600 dark:text-gray-400 font-semibold">Negocio</th>
                  <th className="text-left p-4 text-gray-600 dark:text-gray-400 font-semibold">Contacto</th>
                  <th className="text-left p-4 text-gray-600 dark:text-gray-400 font-semibold">Website</th>
                  <th className="text-left p-4 text-gray-600 dark:text-gray-400 font-semibold">Estado</th>
                  <th className="text-left p-4 text-gray-600 dark:text-gray-400 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {/* Score */}
                    <td className="p-4">
                      <ScoreBadge score={lead.opportunityScore} />
                    </td>

                    {/* Negocio - CON BADGES DE FUENTE */}
                    <td className="p-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-white font-medium">{lead.name}</p>
                          
                          {/* Badge de Instagram */}
                          {lead.source === 'instagram' && (
                            <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded text-xs font-semibold">
                              📸 Instagram
                            </span>
                          )}
                          
                          {/* Badge de Google Maps */}
                          {lead.source === 'google_maps' && (
                            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs font-semibold">
                              🗺️ Maps
                            </span>
                          )}
                          
                          {/* Badge de Google Search */}
                          {lead.source === 'google_search' && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                              🔎 Search
                            </span>
                          )}
                        </div>
                        
                        {/* Username de Instagram */}
                        {lead.username && lead.source === 'instagram' && (
                          <p className="text-pink-400 text-sm">@{lead.username}</p>
                        )}
                        
                        {/* Categoría */}
                        {lead.category && (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{lead.category}</p>
                        )}
                        
                        {/* Rating */}
                        {lead.rating && (
                          <p className="text-yellow-500 text-sm mt-1">
                            ⭐ {lead.rating} ({lead.reviewCount} reseñas)
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        {lead.phone && (
                          <p className="text-gray-700 dark:text-gray-300">📞 {lead.phone}</p>
                        )}
                        {lead.possibleEmails?.[0] && (
                          <p className="text-gray-700 dark:text-gray-300">✉️ {lead.possibleEmails[0]}</p>
                        )}
                        {!lead.phone && !lead.possibleEmails?.[0] && (
                          <p className="text-gray-500">Sin contacto</p>
                        )}
                      </div>
                    </td>

                    {/* Website */}
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

                    {/* Estado */}
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded text-sm border border-gray-300 dark:border-gray-600"
                      >
                        <option value="new">Nuevo</option>
                        <option value="contacted">Contactado</option>
                        <option value="interested">Interesado</option>
                        <option value="rejected">Rechazado</option>
                        <option value="client">Cliente</option>
                      </select>
                    </td>

                    {/* Acciones */}
                    <td className="p-4">
                      <div className="flex gap-2 items-center">
                        {/* Ver detalles */}
                        <Link
                          href={`/admin/leads/${lead._id}`}
                          className="text-cyan-500 hover:text-cyan-400 text-xl"
                          title="Ver detalles"
                        >
                          👁️
                        </Link>
                        
                        {/* Email */}
                        {lead.possibleEmails && lead.possibleEmails[0] && (
                          <Link
                            href={`/admin/leads/${lead._id}/email`}
                            className="text-blue-500 hover:text-blue-400 text-xl"
                            title="Enviar email"
                          >
                            ✉️
                          </Link>
                        )}
                        
                        {/* ✅ WhatsApp - AHORA USA TEMPLATE DINÁMICO */}
                        {lead.phone && (
                          <button
                            onClick={() => handleWhatsAppClick(lead)}
                            className="text-green-500 hover:text-green-400 text-xl"
                            title="WhatsApp"
                          >
                            📱
                          </button>
                        )}
                        
                        {/* Llamada */}
                        {lead.phone && (
                          <Link
                            href={`tel:${lead.phone}`}
                            className="text-cyan-600 hover:text-cyan-500 text-xl"
                            title="Llamar"
                          >
                            📞
                          </Link>
                        )}
                        
                        {/* Instagram - Ahora con username */}
                        {lead.username && lead.source === 'instagram' && (
                          <Link
                            href={`https://instagram.com/${lead.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-500 hover:text-pink-400 text-xl"
                            title="Ver Instagram"
                          >
                            📷
                          </Link>
                        )}
                        
                        {/* Instagram desde socialMedia (legacy) */}
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
                        
                        {/* Facebook */}
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
                        
                        {/* Eliminar */}
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
      )}
    </div>
  )
}

// Componente para el badge de score
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

// Componente para las tarjetas de estadísticas
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