// src/app/admin/legal/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PlusIcon, 
  PencilIcon, 
  EyeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function LegalPagesManager() {
  const [pages, setPages] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pages') // 'pages' | 'settings'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pagesRes, settingsRes] = await Promise.all([
        fetch('/api/admin/legal'),
        fetch('/api/admin/settings')
      ])
      
      const pagesData = await pagesRes.json()
      const settingsData = await settingsRes.json()
      
      setPages(pagesData.pages || [])
      setSettings(settingsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePublished = async (id, isPublished) => {
    try {
      await fetch(`/api/admin/legal/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished })
      })
      fetchData()
    } catch (error) {
      console.error('Error updating page:', error)
    }
  }

  const deletePage = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta página legal?')) return

    try {
      await fetch(`/api/admin/legal/${id}`, { method: 'DELETE' })
      setPages(pages.filter(p => p._id !== id))
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  const legalPageTypes = [
    { 
      type: 'aviso-legal', 
      title: 'Aviso Legal', 
      icon: '⚖️',
      description: 'Información legal de la empresa (LSSI)'
    },
    { 
      type: 'privacidad', 
      title: 'Política de Privacidad', 
      icon: '🔒',
      description: 'Tratamiento de datos personales (RGPD)'
    },
    { 
      type: 'cookies', 
      title: 'Política de Cookies', 
      icon: '🍪',
      description: 'Uso de cookies en el sitio web'
    },
    { 
      type: 'terminos', 
      title: 'Términos y Condiciones', 
      icon: '📜',
      description: 'Condiciones de uso del servicio'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando páginas legales...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Páginas Legales</h1>
            <p className="text-gray-400">
              Gestiona el contenido legal de tu sitio web (obligatorio por RGPD)
            </p>
          </div>
          <Link
            href="/admin/legal/new"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nueva Página</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-700">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'pages'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <DocumentTextIcon className="w-5 h-5 inline mr-2" />
            Páginas Legales
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CogIcon className="w-5 h-5 inline mr-2" />
            Datos Legales
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'pages' ? (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {legalPageTypes.map((type) => {
              const page = pages.find(p => p.pageType === type.type)
              const exists = !!page
              const isPublished = page?.isPublished || false

              return (
                <div
                  key={type.type}
                  className={`p-4 rounded-lg border ${
                    exists && isPublished
                      ? 'bg-green-500/10 border-green-500/30'
                      : exists
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{type.icon}</span>
                    {exists && isPublished ? (
                      <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                    ) : exists ? (
                      <span className="text-xs text-yellow-400">Borrador</span>
                    ) : (
                      <span className="text-xs text-red-400">Falta</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    {type.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {type.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Warning if incomplete */}
          {pages.filter(p => p.isPublished).length < 4 && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-orange-400 mb-1">
                    Páginas legales incompletas
                  </h3>
                  <p className="text-sm text-gray-300">
                    Para cumplir con la normativa española (RGPD, LSSI), necesitas tener publicadas las 4 páginas legales: 
                    Aviso Legal, Política de Privacidad, Política de Cookies y Términos y Condiciones.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pages List */}
          <div className="space-y-4">
            {pages.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
                <DocumentTextIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No hay páginas legales
                </h3>
                <p className="text-gray-400 mb-6">
                  Crea tus primeras páginas legales para cumplir con la normativa
                </p>
                <Link
                  href="/admin/legal/new"
                  className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-md"
                >
                  Crear primera página
                </Link>
              </div>
            ) : (
              pages.map((page) => (
                <div
                  key={page._id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-white">
                          {page.title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          page.isPublished
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {page.isPublished ? 'Publicada' : 'Borrador'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {page.metaDescription || 'Sin descripción'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Slug: /{page.slug}</span>
                        <span>•</span>
                        <span>
                          Actualizada: {new Date(page.lastUpdated).toLocaleDateString('es-ES')}
                        </span>
                        <span>•</span>
                        <span>Versión: {page.version}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {page.isPublished && (
                        <Link
                          href={`/legal/${page.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                          title="Ver página"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/legal/${page._id}/edit`}
                        className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => togglePublished(page._id, page.isPublished)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          page.isPublished
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {page.isPublished ? 'Ocultar' : 'Publicar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Settings Tab */
        <LegalSettingsForm settings={settings} onSave={fetchData} />
      )}
    </div>
  )
}

// Componente para editar datos legales
function LegalSettingsForm({ settings, onSave }) {
  const [formData, setFormData] = useState(settings?.legal || {})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          legal: formData