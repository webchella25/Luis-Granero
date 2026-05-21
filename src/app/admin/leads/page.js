'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Users, Search, Plus, Eye, Mail, Phone, Trash2,
  MessageCircle, ExternalLink, Star, Globe, RefreshCw
} from 'lucide-react'

const STATUSES = [
  { value: 'all',         label: 'Todos',       color: 'text-slate-300' },
  { value: 'new',         label: 'Nuevos',       color: 'text-cyan-400' },
  { value: 'contacted',   label: 'Contactados',  color: 'text-blue-400' },
  { value: 'interested',  label: 'Interesados',  color: 'text-yellow-400' },
  { value: 'qualified',   label: 'Cualificados', color: 'text-purple-400' },
  { value: 'proposal',    label: 'Propuesta',    color: 'text-orange-400' },
  { value: 'negotiation', label: 'Negociación',  color: 'text-pink-400' },
  { value: 'won',         label: 'Ganados',      color: 'text-green-400' },
  { value: 'lost',        label: 'Perdidos',     color: 'text-red-400' },
]

const STATUS_OPTIONS = [
  { value: 'new',         label: 'Nuevo' },
  { value: 'contacted',   label: 'Contactado' },
  { value: 'interested',  label: 'Interesado' },
  { value: 'qualified',   label: 'Cualificado' },
  { value: 'proposal',    label: 'Propuesta' },
  { value: 'negotiation', label: 'Negociación' },
  { value: 'won',         label: 'Ganado' },
  { value: 'lost',        label: 'Perdido' },
]

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeStatus, setActiveStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 0 })

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        status: activeStatus,
        search,
        page: String(page),
        limit: '25',
      })
      const res = await fetch(`/api/leads/list?${params}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Error desconocido')

      setLeads(data.leads || [])
      setStats(data.stats || null)
      setPagination({
        total: data.pagination?.total ?? 0,
        pages: data.pagination?.pages ?? 0,
      })
    } catch (err) {
      setError(err.message)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [activeStatus, search, page])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleStatusTab = (value) => {
    setActiveStatus(value)
    setPage(1)
  }

  const updateStatus = async (leadId, newStatus) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchLeads()
    } catch (e) {
      console.error('Error updating status', e)
    }
  }

  const deleteLead = async (leadId, name) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return
    try {
      await fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
      fetchLeads()
    } catch (e) {
      console.error('Error deleting lead', e)
    }
  }

  const openWhatsApp = (lead) => {
    const phone = lead.phone?.replace(/\D/g, '') || ''
    if (!phone) return alert('Sin teléfono')
    const number = phone.startsWith('34') ? phone : `34${phone}`
    const msg = `Hola ${lead.name}, soy Luis Granero, desarrollador web. Me gustaría hablar con usted sobre su presencia online.`
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const getStatusCount = (value) => {
    if (!stats) return 0
    if (value === 'all') return stats.opportunities?.total ?? 0
    return stats.byStatus?.[value] ?? 0
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Gestión de Leads</h1>
            <p className="text-sm text-slate-500">
              {loading ? 'Cargando...' : `${pagination.total} leads totales`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <Link
            href="/admin/test-scraper"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-white transition-all"
          >
            <Plus className="w-4 h-4" />
            Buscar Leads
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total leads" value={stats.opportunities?.total ?? 0} accent="cyan" />
          <StatCard label="Score medio" value={Math.round(stats.opportunities?.avgScore ?? 0)} accent="yellow" />
          <StatCard label="Alta prioridad" value={stats.opportunities?.highOpportunity ?? 0} accent="red" />
          <StatCard label="Sin web" value={(stats.opportunities?.total ?? 0) - (stats.opportunities?.withWebsite ?? 0)} accent="orange" />
        </div>
      )}

      {/* Tabs por estado */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex flex-wrap gap-1">
        {STATUSES.map((s) => {
          const count = getStatusCount(s.value)
          const active = activeStatus === s.value
          return (
            <button
              key={s.value}
              onClick={() => handleStatusTab(s.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-slate-700 text-slate-100 shadow'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className={active ? 'text-slate-100' : s.color}>{s.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por nombre, categoría, dirección..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          Error al cargar leads: {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
          <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500">No hay leads en esta categoría</p>
          <Link href="/admin/test-scraper" className="mt-3 inline-block text-cyan-400 text-sm hover:text-cyan-300">
            Buscar nuevos leads →
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Negocio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Contacto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Web</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {leads.map((lead) => (
                  <LeadRow
                    key={lead._id}
                    lead={lead}
                    onStatusChange={updateStatus}
                    onDelete={deleteLead}
                    onWhatsApp={openWhatsApp}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-slate-700"
          >
            ← Anterior
          </button>
          <span className="text-sm text-slate-500">
            Página {page} de {pagination.pages} · {pagination.total} leads
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-slate-700"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}

function LeadRow({ lead, onStatusChange, onDelete, onWhatsApp }) {
  const score = lead.opportunityScore ?? 0
  const scoreColor =
    score >= 75 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
    score >= 55 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
    score >= 35 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-slate-700 text-slate-400 border-slate-600'

  const sourceLabel =
    lead.source === 'google_maps'   ? { text: 'Maps',      cls: 'bg-cyan-500/15 text-cyan-400' } :
    lead.source === 'google_search' ? { text: 'Search',    cls: 'bg-blue-500/15 text-blue-400' } :
    lead.source === 'instagram'     ? { text: 'Instagram', cls: 'bg-pink-500/15 text-pink-400' } :
                                      { text: lead.source, cls: 'bg-slate-700 text-slate-400' }

  return (
    <tr className="hover:bg-slate-800/40 transition-colors group">
      {/* Score */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold border ${scoreColor}`}>
          {score}
        </span>
      </td>

      {/* Negocio */}
      <td className="px-4 py-3 max-w-[220px]">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-slate-200 font-medium truncate">{lead.name}</span>
          <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${sourceLabel.cls}`}>
            {sourceLabel.text}
          </span>
        </div>
        {lead.category && (
          <p className="text-slate-500 text-xs truncate">{lead.category}</p>
        )}
        {lead.rating > 0 && (
          <p className="text-yellow-500/80 text-xs flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3" />
            {lead.rating} · {lead.reviewCount} reseñas
          </p>
        )}
      </td>

      {/* Contacto */}
      <td className="px-4 py-3">
        <div className="space-y-0.5 text-xs">
          {lead.phone ? (
            <p className="text-slate-300 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-500" /> {lead.phone}
            </p>
          ) : null}
          {lead.possibleEmails?.[0] ? (
            <p className="text-slate-300 flex items-center gap-1 max-w-[160px] truncate">
              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{lead.possibleEmails[0]}</span>
            </p>
          ) : null}
          {!lead.phone && !lead.possibleEmails?.[0] && (
            <span className="text-orange-400/80">Sin contacto</span>
          )}
        </div>
      </td>

      {/* Web */}
      <td className="px-4 py-3">
        {lead.website ? (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs"
          >
            <Globe className="w-3 h-3" />
            Ver web
          </a>
        ) : (
          <span className="text-red-400/80 text-xs font-medium">Sin web</span>
        )}
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <select
          value={lead.status}
          onChange={(e) => onStatusChange(lead._id, e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:border-cyan-500 focus:outline-none cursor-pointer"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/leads/${lead._id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {lead.possibleEmails?.[0] && (
            <Link
              href={`/admin/leads/${lead._id}/email`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all"
              title="Enviar email"
            >
              <Mail className="w-4 h-4" />
            </Link>
          )}

          {lead.phone && (
            <button
              onClick={() => onWhatsApp(lead)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-green-400 hover:bg-slate-800 transition-all"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}

          {lead.website && (
            <a
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              title="Ver web"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={() => onDelete(lead._id, lead.name)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800 transition-all"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function StatCard({ label, value, accent }) {
  const accents = {
    cyan:   'border-cyan-500/20 text-cyan-400',
    yellow: 'border-yellow-500/20 text-yellow-400',
    red:    'border-red-500/20 text-red-400',
    orange: 'border-orange-500/20 text-orange-400',
  }
  return (
    <div className={`bg-slate-900 border rounded-xl p-4 ${accents[accent]}`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accents[accent].split(' ')[1]}`}>{value}</p>
    </div>
  )
}
