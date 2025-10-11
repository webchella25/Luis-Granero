// src/app/admin/templates/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TemplatesManager() {
  const router = useRouter()
  const [templates, setTemplates] = useState([])
  const [activeTab, setActiveTab] = useState('email')
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [loading, setLoading] = useState(true)

  // Shortcodes disponibles por tipo
  const availableShortcodes = {
    email: [
      { code: '{{business_name}}', desc: 'Nombre del negocio' },
      { code: '{{category}}', desc: 'Categoría del negocio' },
      { code: '{{review_count}}', desc: 'Número de reseñas' },
      { code: '{{rating}}', desc: 'Puntuación (ej: 4.5)' },
      { code: '{{load_time}}', desc: 'Tiempo de carga en segundos' },
      { code: '{{issues_list}}', desc: 'Lista de problemas detectados' },
      { code: '{{magic_link}}', desc: 'Link para agendar llamada' },
      { code: '{{score}}', desc: 'Score de oportunidad (0-100)' },
      { code: '{{phone}}', desc: 'Teléfono del lead' },
      { code: '{{address}}', desc: 'Dirección del negocio' },
      { code: '{{website}}', desc: 'Sitio web actual' },
      { code: '{{contact_name}}', desc: 'Nombre del contacto' },
      { code: '{{scheduled_date}}', desc: 'Fecha de la cita' },
      { code: '{{scheduled_time}}', desc: 'Hora de la cita' }
    ],
    whatsapp: [
      { code: '{{business_name}}', desc: 'Nombre del negocio' },
      { code: '{{category}}', desc: 'Categoría del negocio' },
      { code: '{{review_count}}', desc: 'Número de reseñas' },
      { code: '{{rating}}', desc: 'Puntuación' },
      { code: '{{phone}}', desc: 'Teléfono' }
    ],
    copy: [
      { code: '{{business_name}}', desc: 'Nombre del negocio' },
      { code: '{{category}}', desc: 'Categoría del negocio' },
      { code: '{{review_count}}', desc: 'Número de reseñas' },
      { code: '{{rating}}', desc: 'Puntuación' }
    ],
    sms: [
      { code: '{{business_name}}', desc: 'Nombre del negocio' },
      { code: '{{phone}}', desc: 'Teléfono' }
    ]
  }

  useEffect(() => {
    fetchTemplates()
  }, [activeTab])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/templates?type=${activeTab}`)
      const data = await res.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const url = editingTemplate._id 
        ? `/api/templates/${editingTemplate.id}`
        : '/api/templates'
      
      const method = editingTemplate._id ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate)
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Template guardado correctamente')
        setEditingTemplate(null)
        setShowNewTemplate(false)
        fetchTemplates()
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error al guardar template')
    }
  }

  const handleDelete = async (template) => {
    if (!confirm(`¿Eliminar el template "${template.name}"?`)) return

    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('✅ Template eliminado')
        fetchTemplates()
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error al eliminar template')
    }
  }

  const handlePreview = (template) => {
    setEditingTemplate(template)
    setShowPreview(true)
  }

  const handleNewTemplate = () => {
    setEditingTemplate({
      id: `${activeTab}_custom_${Date.now()}`,
      name: '',
      type: activeTab,
      subject: activeTab === 'email' ? '' : undefined,
      body: '',
      variables: [],
      isActive: true
    })
    setShowNewTemplate(true)
  }

  const insertShortcode = (code) => {
    if (!editingTemplate) return
    
    const textarea = document.getElementById('template-body')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = editingTemplate.body
    const newText = text.substring(0, start) + code + text.substring(end)
    
    setEditingTemplate({
      ...editingTemplate,
      body: newText
    })

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + code.length, start + code.length)
    }, 0)
  }

  const renderPreview = () => {
    if (!editingTemplate) return null

    const mockData = {
      business_name: 'Restaurante El Rincón',
      category: 'restaurantes',
      review_count: '47',
      rating: '4.8',
      load_time: '8.5',
      issues_list: '• Imágenes sin optimizar\n• CSS sin minificar\n• Sin caché del navegador',
      magic_link: 'https://luisgranero.com/agendar/ABC123',
      phone: '+34 666 777 888',
      address: 'Calle Mayor 123, Madrid',
      website: 'www.elrincon.com',
      contact_name: 'María García',
      scheduled_date: '15 de Enero de 2025',
      scheduled_time: '10:00',
      score: '85'
    }

    let previewSubject = editingTemplate.subject || ''
    let previewBody = editingTemplate.body
    
    Object.entries(mockData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      previewSubject = previewSubject.replace(regex, value)
      previewBody = previewBody.replace(regex, value)
    })

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">
              🔍 Vista Previa
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4">
            {editingTemplate.subject && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block font-semibold">
                  Asunto:
                </label>
                <div className="bg-gray-800 rounded-lg p-4 text-white font-semibold">
                  {previewSubject}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 mb-2 block font-semibold">
                Mensaje:
              </label>
              <div className="bg-gray-800 rounded-lg p-4 text-white whitespace-pre-wrap">
                {previewBody}
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                ℹ️ Esta es una vista previa con datos de ejemplo. Las variables se reemplazarán automáticamente con datos reales del lead.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderEditor = () => {
  if (!editingTemplate && !showNewTemplate) return null

  const shortcuts = availableShortcodes[editingTemplate?.type || activeTab] || []

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* AÑADIR overflow-y-auto AQUÍ */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-center z-10">
          <h3 className="text-2xl font-bold text-white">
            {showNewTemplate ? '➕ Nuevo Template' : `✏️ Editando: ${editingTemplate.name}`}
          </h3>
          <button
            onClick={() => {
              setEditingTemplate(null)
              setShowNewTemplate(false)
            }}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* QUITAR sticky del sidebar de shortcodes */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor - 2 columnas */}
            <div className="lg:col-span-2 space-y-6">
              {/* Nombre del template */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nombre del Template
                </label>
                <input
                  type="text"
                  value={editingTemplate?.name || ''}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    name: e.target.value
                  })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Ej: Email - Prospección inicial"
                />
              </div>

              {/* ID del template */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  ID del Template (único)
                </label>
                <input
                  type="text"
                  value={editingTemplate?.id || ''}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    id: e.target.value
                  })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none font-mono"
                  placeholder="email_prospecting_v1"
                  disabled={!showNewTemplate}
                />
                {!showNewTemplate && (
                  <p className="text-xs text-gray-500 mt-1">
                    El ID no se puede cambiar una vez creado
                  </p>
                )}
              </div>

              {/* Asunto (solo email) */}
              {editingTemplate?.type === 'email' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Asunto del Email
                  </label>
                  <input
                    type="text"
                    value={editingTemplate?.subject || ''}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      subject: e.target.value
                    })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Usa {{shortcodes}} para personalizar"
                  />
                </div>
              )}

              {/* Body */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Cuerpo del Mensaje
                </label>
                <textarea
                  id="template-body"
                  value={editingTemplate?.body || ''}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    body: e.target.value
                  })}
                  rows={15}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none font-mono text-sm"
                  placeholder="Escribe tu mensaje aquí... Usa {{shortcodes}} para personalizar"
                />
              </div>
            </div>

            {/* Shortcodes - 1 columna - QUITAR sticky */}
            <div className="space-y-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-xl">📌</span>
                  Shortcodes Disponibles
                </h4>
                <p className="text-sm text-gray-400 mb-4">
                  Haz clic para insertar en el cursor
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {shortcuts.map((shortcut) => (
                    <button
                      key={shortcut.code}
                      onClick={() => insertShortcode(shortcut.code)}
                      className="w-full text-left px-3 py-2 bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors group"
                    >
                      <code className="text-cyan-400 text-sm font-mono block mb-1">
                        {shortcut.code}
                      </code>
                      <span className="text-xs text-gray-500 group-hover:text-gray-400">
                        {shortcut.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <h5 className="font-semibold text-blue-300 mb-2 text-sm">
                  💡 Consejos
                </h5>
                <ul className="text-xs text-blue-200 space-y-2">
                  <li>• Los shortcodes se reemplazan automáticamente</li>
                  <li>• Usa saltos de línea para mejor formato</li>
                  <li>• Añade emojis para mensajes más atractivos</li>
                  <li>• Prueba el preview antes de guardar</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones - STICKY al fondo */}
          <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 mt-6 pt-6 -mx-6 px-6 pb-6">
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => handlePreview(editingTemplate)}
                className="px-6 py-3 bg-gray-800 text-cyan-400 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                👁️ Vista Previa
              </button>
              <button
                onClick={() => {
                  setEditingTemplate(null)
                  setShowNewTemplate(false)
                }}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!editingTemplate?.name || !editingTemplate?.body}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-black rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Guardar Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              📝 Gestor de Templates
            </h1>
            <p className="text-gray-400">
              Crea y edita los mensajes que envías a tus leads
            </p>
          </div>
          <button
            onClick={handleNewTemplate}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-black rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            ➕ Nuevo Template
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          {['email', 'whatsapp', 'copy', 'sms'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === 'email' && '✉️ Email'}
              {tab === 'whatsapp' && '📱 WhatsApp'}
              {tab === 'copy' && '📋 Copiar'}
              {tab === 'sms' && '💬 SMS'}
            </button>
          ))}
        </div>

        {/* Templates List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">
              No hay templates de {activeTab}
            </p>
            <button
              onClick={handleNewTemplate}
              className="px-6 py-3 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-colors font-semibold"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {template.name}
                    </h3>
                    <code className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                      {template.id}
                    </code>
                    {template.subject && (
                      <p className="text-sm text-gray-400 mt-2">
                        <span className="font-semibold">Asunto:</span>{' '}
                        <span className="text-cyan-400">{template.subject}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(template)}
                      className="px-4 py-2 bg-gray-800 text-cyan-400 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      👁️ Preview
                    </button>
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-colors font-semibold text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(template)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap line-clamp-3">
                    {template.body}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {template.variables?.map(variable => (
                    <span
                      key={variable}
                      className="px-3 py-1 bg-gray-800 text-cyan-400 rounded-full text-xs font-mono"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {(editingTemplate || showNewTemplate) && renderEditor()}
        {showPreview && renderPreview()}
      </div>
    </div>
  )
}