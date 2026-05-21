'use client'
import { useState, useEffect } from 'react'
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff, ChevronUp, ChevronDown, X, Search } from 'lucide-react'

const LEVELS = ['Principiante', 'Intermedio', 'Avanzado', 'Principiante → Avanzado', 'Intermedio → Avanzado']

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  icon: '📚',
  duration: '4 semanas',
  level: 'Intermedio',
  topics: [],
  prerequisites: [],
  learningObjectives: [],
  articles: [],
  isPublished: false,
  isFeatured: false,
  isPremium: false,
  metaTitle: '',
  metaDescription: '',
}

export default function LearningPathsAdminPage() {
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // Para buscar artículos del blog
  const [postSearch, setPostSearch] = useState('')
  const [postResults, setPostResults] = useState([])
  const [searchingPosts, setSearchingPosts] = useState(false)

  // Campos de array (topic nuevo, prerequisito nuevo, objetivo nuevo)
  const [newTopic, setNewTopic] = useState('')
  const [newPrereq, setNewPrereq] = useState('')
  const [newObjective, setNewObjective] = useState('')

  useEffect(() => { fetchPaths() }, [])

  async function fetchPaths() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/learning-paths')
      const data = await res.json()
      setPaths(data.paths || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function searchPosts(q) {
    if (!q.trim()) { setPostResults([]); return }
    setSearchingPosts(true)
    try {
      const res = await fetch(`/api/admin/blog?search=${encodeURIComponent(q)}&limit=10`)
      const data = await res.json()
      setPostResults(data.posts || [])
    } catch (e) {
      setPostResults([])
    } finally {
      setSearchingPosts(false)
    }
  }

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
    setPostSearch('')
    setPostResults([])
  }

  function openEdit(path) {
    setForm({
      title: path.title || '',
      slug: path.slug || '',
      description: path.description || '',
      icon: path.icon || '📚',
      duration: path.duration || '4 semanas',
      level: path.level || 'Intermedio',
      topics: path.topics || [],
      prerequisites: path.prerequisites || [],
      learningObjectives: path.learningObjectives || [],
      articles: (path.articles || []).map(a => ({
        postId: a.postId?._id || a.postId,
        title: a.postId?.title || a.title || '',
        slug: a.postId?.slug || a.slug || '',
        order: a.order,
        isRequired: a.isRequired !== false,
      })),
      isPublished: path.isPublished || false,
      isFeatured: path.isFeatured || false,
      isPremium: path.isPremium || false,
      metaTitle: path.metaTitle || '',
      metaDescription: path.metaDescription || '',
    })
    setEditingId(path._id)
    setShowForm(true)
    setPostSearch('')
    setPostResults([])
  }

  function generateSlug(title) {
    return title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')
  }

  function handleTitleChange(val) {
    setForm(f => ({ ...f, title: val, slug: editingId ? f.slug : generateSlug(val) }))
  }

  async function handleSave() {
    if (!form.title || !form.slug) return alert('Título y slug son obligatorios')
    setSaving(true)
    try {
      const payload = {
        ...form,
        articles: form.articles.map((a, i) => ({
          postId: a.postId,
          title: a.title,
          order: i + 1,
          isRequired: a.isRequired,
        }))
      }
      const url = editingId ? `/api/admin/learning-paths/${editingId}` : '/api/admin/learning-paths'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setShowForm(false)
        fetchPaths()
      } else {
        const err = await res.json()
        alert('Error: ' + err.error)
      }
    } catch (e) {
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta ruta de aprendizaje?')) return
    await fetch(`/api/admin/learning-paths/${id}`, { method: 'DELETE' })
    fetchPaths()
  }

  async function toggleField(id, field, current) {
    await fetch(`/api/admin/learning-paths/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !current })
    })
    fetchPaths()
  }

  function addArticle(post) {
    if (form.articles.find(a => a.postId === post._id)) return
    setForm(f => ({
      ...f,
      articles: [...f.articles, {
        postId: post._id,
        title: post.title,
        slug: post.slug,
        order: f.articles.length + 1,
        isRequired: true,
      }]
    }))
    setPostSearch('')
    setPostResults([])
  }

  function removeArticle(postId) {
    setForm(f => ({ ...f, articles: f.articles.filter(a => a.postId !== postId) }))
  }

  function moveArticle(index, dir) {
    const arr = [...form.articles]
    const swap = index + dir
    if (swap < 0 || swap >= arr.length) return;
    [arr[index], arr[swap]] = [arr[swap], arr[index]]
    setForm(f => ({ ...f, articles: arr }))
  }

  function addToArray(field, value, setter) {
    if (!value.trim()) return
    setForm(f => ({ ...f, [field]: [...f[field], value.trim()] }))
    setter('')
  }

  function removeFromArray(field, index) {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }))
  }

  if (loading) return (
    <div className="p-8 text-slate-400">Cargando rutas...</div>
  )

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Rutas de Aprendizaje</h1>
          <p className="text-slate-400 text-sm mt-1">{paths.length} rutas · Agrupa artículos del blog en cursos estructurados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-[#0F172A] font-bold rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Nueva ruta
        </button>
      </div>

      {/* Lista */}
      {paths.length === 0 ? (
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No hay rutas de aprendizaje todavía</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paths.map(path => (
            <div key={path._id} className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-5 flex items-center gap-4">
              <div className="text-3xl flex-shrink-0">{path.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-slate-100 font-semibold truncate">{path.title}</span>
                  {path.isFeatured && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">Destacada</span>}
                  {path.isPremium && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30">Premium</span>}
                  <span className={`px-2 py-0.5 text-xs rounded border ${path.isPublished ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                    {path.isPublished ? 'Publicada' : 'Borrador'}
                  </span>
                </div>
                <div className="text-slate-400 text-xs flex gap-3">
                  <span>{path.level}</span>
                  <span>·</span>
                  <span>{path.duration}</span>
                  <span>·</span>
                  <span>{path.articles?.length || 0} artículos</span>
                  <span>·</span>
                  <span className="text-slate-500">/cursos/{path.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleField(path._id, 'isPublished', path.isPublished)}
                  title={path.isPublished ? 'Despublicar' : 'Publicar'}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  {path.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => toggleField(path._id, 'isFeatured', path.isFeatured)}
                  title={path.isFeatured ? 'Quitar destacada' : 'Destacar'}
                  className="p-2 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-slate-700 transition-colors"
                >
                  {path.isFeatured ? <Star className="w-4 h-4 text-yellow-400" /> : <StarOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEdit(path)}
                  className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(path._id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-slate-100">
                {editingId ? 'Editar ruta' : 'Nueva ruta de aprendizaje'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Título y slug */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Título *</label>
                  <input
                    value={form.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="React desde cero"
                    className="w-full bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Slug *</label>
                  <input
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="react-desde-cero"
                    className="w-full bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Icono (emoji)</label>
                  <input
                    value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="⚛️"
                    className="w-full bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Aprende React desde los fundamentos..."
                  className="w-full bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Nivel y duración */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nivel</label>
                  <select
                    value={form.level}
                    onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                    className="w-full bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Duración</label>
                  <input
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    placeholder="4 semanas"
                    className="w-full bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Temas */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Temas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToArray('topics', newTopic, setNewTopic))}
                    placeholder="React, Next.js..."
                    className="flex-1 bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <button onClick={() => addToArray('topics', newTopic, setNewTopic)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.topics.map((t, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                      {t}
                      <button onClick={() => removeFromArray('topics', i)} className="text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Prerequisitos */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Prerrequisitos</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newPrereq}
                    onChange={e => setNewPrereq(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToArray('prerequisites', newPrereq, setNewPrereq))}
                    placeholder="HTML y CSS básico..."
                    className="flex-1 bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <button onClick={() => addToArray('prerequisites', newPrereq, setNewPrereq)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.prerequisites.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                    <span className="text-slate-500">•</span>{p}
                    <button onClick={() => removeFromArray('prerequisites', i)} className="ml-auto text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>

              {/* Objetivos */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Objetivos de aprendizaje</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newObjective}
                    onChange={e => setNewObjective(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToArray('learningObjectives', newObjective, setNewObjective))}
                    placeholder="Dominar useState y useEffect..."
                    className="flex-1 bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <button onClick={() => addToArray('learningObjectives', newObjective, setNewObjective)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.learningObjectives.map((o, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                    <span className="text-cyan-500">✓</span>{o}
                    <button onClick={() => removeFromArray('learningObjectives', i)} className="ml-auto text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>

              {/* Artículos del blog */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Artículos del blog (lecciones)</label>

                {/* Búsqueda */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    value={postSearch}
                    onChange={e => { setPostSearch(e.target.value); searchPosts(e.target.value) }}
                    placeholder="Buscar artículo por título..."
                    className="w-full bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                  {postResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E293B] border border-slate-600 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                      {postResults.map(post => (
                        <button
                          key={post._id}
                          onClick={() => addArticle(post)}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors border-b border-slate-700/50 last:border-0"
                        >
                          {post.title}
                        </button>
                      ))}
                    </div>
                  )}
                  {searchingPosts && <span className="absolute right-3 top-2.5 text-xs text-slate-500">buscando...</span>}
                </div>

                {/* Lista de artículos añadidos */}
                {form.articles.length === 0 ? (
                  <p className="text-slate-500 text-sm italic">Sin artículos aún. Busca y añade artículos del blog.</p>
                ) : (
                  <div className="space-y-2">
                    {form.articles.map((a, i) => (
                      <div key={a.postId} className="flex items-center gap-2 bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2">
                        <span className="text-slate-500 text-xs w-5 text-right flex-shrink-0">{i + 1}.</span>
                        <span className="flex-1 text-sm text-slate-300 truncate">{a.title}</span>
                        <label className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={a.isRequired}
                            onChange={e => {
                              const arts = [...form.articles]
                              arts[i] = { ...arts[i], isRequired: e.target.checked }
                              setForm(f => ({ ...f, articles: arts }))
                            }}
                            className="accent-cyan-500"
                          />
                          obligatorio
                        </label>
                        <button onClick={() => moveArticle(i, -1)} disabled={i === 0} className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => moveArticle(i, 1)} disabled={i === form.articles.length - 1} className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeArticle(a.postId)} className="p-1 text-slate-500 hover:text-red-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Opciones */}
              <div className="flex gap-6">
                {[
                  { field: 'isPublished', label: 'Publicada' },
                  { field: 'isFeatured', label: 'Destacada' },
                  { field: 'isPremium', label: 'Premium' },
                ].map(({ field, label }) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.checked }))}
                      className="accent-cyan-500 w-4 h-4"
                    />
                    <span className="text-sm text-slate-300">{label}</span>
                  </label>
                ))}
              </div>

              {/* SEO */}
              <div className="border-t border-slate-800 pt-5 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase">SEO (opcional)</p>
                <input
                  value={form.metaTitle}
                  onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))}
                  placeholder="Meta título (deja vacío para usar el título)"
                  className="w-full bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
                <textarea
                  value={form.metaDescription}
                  onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                  rows={2}
                  placeholder="Meta descripción (máx 160 caracteres)"
                  className="w-full bg-[#1E293B] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            </div>

            {/* Footer del modal */}
            <div className="flex justify-end gap-3 p-6 border-t border-slate-800">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 text-[#0F172A] font-bold rounded-lg text-sm transition-colors"
              >
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear ruta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
