// src/app/admin/leads/page.js - VERSIÓN FINAL CORRECTA
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
        limit: '20'
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

  return (
    <div className="space-y-6">
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

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Leads"
            value={stats.opportunities?.total || 0}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Alta Oportunidad"
            value={stats.opportunities?.highOpportunity || 0}
            icon="🎯"
            color="green"
          />
          <StatCard
            title="Nuevos"
            value={stats.byStatus?.new || 0}
            icon="✨"
            color="yellow"
          />
          <StatCard
            title="Contactados"
            value={stats.byStatus?.contacted || 0}
            icon="📧"
            color="purple"
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex gap-4 items-center border border-gray-200 dark:border-gray-700">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
        >
          <option value="all">Todos los estados</option>
          <option value="new">Nuevos</option>
          <option value="contacted">Contactados</option>
          <option value="interested">Interesados</option>
          <option value="rejected">Rechazados</option>
          <option value="client">Clientes</option>
        </select>

        <input
          type="text"
          placeholder="Buscar por nombre, categoría o dirección..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
        />

        {filters.search && (
          <button
            onClick={() => setFilters({ ...filters, search: '', page: 1 })}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

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
                    <td className="p-4">
                      <ScoreBadge score={lead.opportunityScore} />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">{lead.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{lead.category}</p>
                        {lead.rating && (
                          <p className="text-yellow-500 text-sm mt-1">
                            ★ {lead.rating} ({lead.reviewCount} reseñas)
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {lead.phone && (
                          <p className="text-gray-700 dark:text-gray-300">📞 {lead.phone}</p>
                        )}
                        {lead.possibleEmails?.[0] && (
                          <p className="text-gray-700 dark:text-gray-300">✉️ {lead.possibleEmails[0]}</p>
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
                          {lead.webAnalysis?.issues && lead.webAnalysis.issues.length > 0 && (
                            <p className="text-orange-500 text-xs mt-1">
                              {lead.webAnalysis.issues[0]}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-red-500 text-sm">Sin web</span>
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
                        <option value="rejected">Rechazado</option>
                        <option value="client">Cliente</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/leads/${lead._id}`}
                          className="text-cyan-500 hover:text-cyan-400 text-sm"
                          title="Ver detalles"
                        >
                          👁️
                        </Link>
                        <Link
                          href={`/admin/leads/${lead._id}/email`}
                          className="text-green-500 hover:text-green-400 text-sm"
                          title="Generar email"
                        >
                          ✉️
                        </Link>
                        <button
                          onClick={() => deleteLead(lead._id)}
                          className="text-red-500 hover:text-red-400 text-sm"
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

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500'
  }
  
  return (
    <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-lg shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/90 text-sm font-medium">{title}</p>
          <p className="text-white text-3xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  )
}

function ScoreBadge({ score }) {
  const getColor = () => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500'
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
    return 'bg-gray-500/20 text-gray-400 border-gray-500'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getColor()}`}>
      {score}
    </span>
  )
}