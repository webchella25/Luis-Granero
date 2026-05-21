'use client'
import { useState, useEffect } from 'react'
import { Star, Plus, Check, X, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react'

const EMPTY_FORM = {
  client: { name: '', company: '', role: '', linkedin: '' },
  content: '',
  rating: 5,
  project: { name: '', category: '', url: '' },
  metrics: [],
  isFeatured: false,
  verificationStatus: 'verified',
  isActive: true,
}

const STATUS_LABEL = { pending: 'Pendiente', verified: 'Verificado', rejected: 'Rechazado' }
const STATUS_COLOR = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  verified: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null) // id del que se edita
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [newMetric, setNewMetric] = useState({ value: '', label: '' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/testimonials')
      if (res.ok) setTestimonials(await res.json())
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(t) {
    setEditing(t._id)
    setForm({
      client: { name: t.client?.name || '', company: t.client?.company || '', role: t.client?.role || '', linkedin: t.client?.linkedin || '' },
      content: t.content || '',
      rating: t.rating || 5,
      project: { name: t.project?.name || '', category: t.project?.category || '', url: t.project?.url || '' },
      metrics: t.metrics || [],
      isFeatured: t.isFeatured || false,
      verificationStatus: t.verificationStatus || 'pending',
      isActive: t.isActive !== false,
    })
    setShowForm(true)
  }

  async function save() {
    if (!form.client.name || !form.content) return alert('Nombre y testimonio son obligatorios')
    setSaving(true)
    try {
      const url = editing ? `/api/admin/testimonials/${editing}` : '/api/admin/testimonials'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) {
        setShowForm(false)
        setEditing(null)
        fetchAll()
      } else {
        alert('Error al guardar')
      }
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id, status) {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus: status, isActive: status === 'verified' }),
    })
    fetchAll()
  }

  async function remove(id) {
    if (!confirm('¿Eliminar este testimonio?')) return
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  function addMetric() {
    if (!newMetric.value || !newMetric.label) return
    setForm(f => ({ ...f, metrics: [...f.metrics, { key: newMetric.label.toLowerCase(), ...newMetric }] }))
    setNewMetric({ value: '', label: '' })
  }

  function removeMetric(i) {
    setForm(f => ({ ...f, metrics: f.metrics.filter((_, idx) => idx !== i) }))
  }

  const pending = testimonials.filter(t => t.verificationStatus === 'pending')
  const verified = testimonials.filter(t => t.verificationStatus === 'verified')
  const rejected = testimonials.filter(t => t.verificationStatus === 'rejected')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonios</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona y valida los testimonios de clientes</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" />
          Añadir testimonio
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pendientes', count: pending.length, color: 'text-yellow-400' },
          { label: 'Verificados', count: verified.length, color: 'text-green-400' },
          { label: 'Rechazados', count: rejected.length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-slate-400 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-5">
            {editing ? 'Editar testimonio' : 'Nuevo testimonio'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nombre del cliente *</label>
              <input
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                value={form.client.name}
                onChange={e => setForm(f => ({ ...f, client: { ...f.client, name: e.target.value } }))}
                placeholder="Ej: Ana García"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Empresa</label>
              <input
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                value={form.client.company}
                onChange={e => setForm(f => ({ ...f, client: { ...f.client, company: e.target.value } }))}
                placeholder="Ej: Mi Empresa S.L."
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cargo</label>
              <input
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                value={form.client.role}
                onChange={e => setForm(f => ({ ...f, client: { ...f.client, role: e.target.value } }))}
                placeholder="Ej: CEO, Fundadora..."
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">LinkedIn (opcional)</label>
              <input
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                value={form.client.linkedin}
                onChange={e => setForm(f => ({ ...f, client: { ...f.client, linkedin: e.target.value } }))}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1">Testimonio * <span className="text-slate-600">({form.content.length}/500)</span></label>
            <textarea
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none resize-none"
              rows={4}
              maxLength={500}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Lo que dijo el cliente sobre el trabajo..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Proyecto</label>
              <input
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                value={form.project.name}
                onChange={e => setForm(f => ({ ...f, project: { ...f.project, name: e.target.value } }))}
                placeholder="Ej: LenceriaStore.es"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Valoración</label>
              <select
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                value={form.rating}
                onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Estado</label>
              <select
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                value={form.verificationStatus}
                onChange={e => setForm(f => ({ ...f, verificationStatus: e.target.value, isActive: e.target.value === 'verified' }))}
              >
                <option value="pending">Pendiente</option>
                <option value="verified">Verificado</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>
          </div>

          {/* Métricas */}
          <div className="mb-5">
            <label className="block text-xs text-slate-400 mb-2">Métricas del proyecto (opcional)</label>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                placeholder="Valor (ej: +85%)"
                value={newMetric.value}
                onChange={e => setNewMetric(m => ({ ...m, value: e.target.value }))}
              />
              <input
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                placeholder="Etiqueta (ej: Ventas)"
                value={newMetric.label}
                onChange={e => setNewMetric(m => ({ ...m, label: e.target.value }))}
              />
              <button onClick={addMetric} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.metrics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.metrics.map((m, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-2 py-1 bg-slate-700 rounded text-xs text-white">
                    <strong className="text-cyan-400">{m.value}</strong> {m.label}
                    <button onClick={() => removeMetric(i)} className="text-slate-400 hover:text-red-400"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-cyan-500" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
              <span className="text-sm text-slate-300">Destacado en portada</span>
            </label>
          </div>

          <div className="flex gap-3 mt-5 pt-5 border-t border-slate-700">
            <button onClick={save} disabled={saving} className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-semibold rounded-lg text-sm transition-colors">
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear testimonio'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-xl">
          <Star className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-2">No hay testimonios todavía</p>
          <p className="text-slate-500 text-sm">Añade el primero manualmente o espera a que un cliente te envíe uno.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...pending, ...verified, ...rejected].map(t => (
            <div key={t._id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-white text-sm">{t.client?.name}</span>
                    {t.client?.role && <span className="text-slate-400 text-xs">{t.client.role}</span>}
                    {t.client?.company && <span className="text-slate-500 text-xs">· {t.client.company}</span>}
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${STATUS_COLOR[t.verificationStatus]}`}>
                      {STATUS_LABEL[t.verificationStatus]}
                    </span>
                    {t.isFeatured && <span className="px-2 py-0.5 text-xs rounded-full border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Destacado</span>}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">"{t.content}"</p>
                  {t.project?.name && <p className="text-xs text-slate-500 mt-1">Proyecto: {t.project.name}</p>}
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(t.rating || 5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {t.verificationStatus === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(t._id, 'verified')} title="Verificar" className="p-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateStatus(t._id, 'rejected')} title="Rechazar" className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {t.verificationStatus === 'verified' && (
                    <button onClick={() => updateStatus(t._id, 'pending')} title="Mover a pendiente" className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 rounded-lg transition-colors text-xs px-2">
                      Desactivar
                    </button>
                  )}
                  <button onClick={() => openEdit(t)} title="Editar" className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(t._id)} title="Eliminar" className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
