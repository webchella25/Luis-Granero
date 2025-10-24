// src/app/admin/settings/page.js
'use client'
import { useState, useEffect } from 'react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    site: {
      name: '',
      tagline: '',
      email: '',
      phone: '',
      address: ''
    },
    social: {
      linkedin: '',
      github: '',
      twitter: '',
      youtube: ''
    },
    analytics: {
      googleAnalytics: '',
      gtmId: '',
      facebookPixel: ''
    },
    seo: {
      defaultMetaDescription: '',
      defaultKeywords: [],
      sitemapEnabled: true,
      robotsEnabled: true
    },
    email: {
      contactEmail: '',
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: ''
    },
    maintenance: {
      enabled: false,
      message: '',
      allowedIPs: []
    }
  })

  const [activeTab, setActiveTab] = useState('site')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  const tabs = [
    { id: 'site', label: 'Sitio Web', icon: '??' },
    { id: 'social', label: 'Redes Sociales', icon: '??' },
    { id: 'analytics', label: 'Analytics', icon: '??' },
    { id: 'seo', label: 'SEO', icon: '??' },
    { id: 'email', label: 'Email', icon: '??' },
    { id: 'maintenance', label: 'Mantenimiento', icon: '??' }
  ]

  // Cargar configuraci車n al montar el componente
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(prevSettings => ({
          ...prevSettings,
          ...data
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      showMessage('error', 'Error al cargar la configuraci車n')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        showMessage('success', '? Configuraci車n guardada exitosamente')
      } else {
        showMessage('error', `? Error: ${data.error || 'No se pudo guardar'}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      showMessage('error', '? Error al guardar la configuraci車n')
    } finally {
      setIsSaving(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const updateSetting = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Cargando configuraci車n...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuraci車n</h1>
          <p className="text-gray-400">Administra la configuraci車n global de tu sitio</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Mensajes de feedback */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-600/20 border border-green-600 text-green-400' :
          'bg-red-600/20 border border-red-600 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg p-6">
            {/* Configuraci車n del sitio */}
            {activeTab === 'site' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Informaci車n del Sitio</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre del Sitio
                    </label>
                    <input
                      type="text"
                      value={settings.site.name}
                      onChange={(e) => updateSetting('site', 'name', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.site.tagline}
                      onChange={(e) => updateSetting('site', 'tagline', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email de Contacto
                    </label>
                    <input
                      type="email"
                      value={settings.site.email}
                      onChange={(e) => updateSetting('site', 'email', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tel谷fono
                    </label>
                    <input
                      type="tel"
                      value={settings.site.phone}
                      onChange={(e) => updateSetting('site', 'phone', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Direcci車n
                    </label>
                    <input
                      type="text"
                      value={settings.site.address}
                      onChange={(e) => updateSetting('site', 'address', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Redes Sociales */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Redes Sociales</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={settings.social.linkedin}
                      onChange={(e) => updateSetting('social', 'linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/tu-perfil"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={settings.social.github}
                      onChange={(e) => updateSetting('social', 'github', e.target.value)}
                      placeholder="https://github.com/tu-usuario"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Twitter / X
                    </label>
                    <input
                      type="url"
                      value={settings.social.twitter}
                      onChange={(e) => updateSetting('social', 'twitter', e.target.value)}
                      placeholder="https://twitter.com/tu-usuario"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={settings.social.youtube}
                      onChange={(e) => updateSetting('social', 'youtube', e.target.value)}
                      placeholder="https://youtube.com/@tu-canal"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Analytics y Tracking</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={settings.analytics.googleAnalytics}
                      onChange={(e) => updateSetting('analytics', 'googleAnalytics', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Google Tag Manager ID
                    </label>
                    <input
                      type="text"
                      value={settings.analytics.gtmId}
                      onChange={(e) => updateSetting('analytics', 'gtmId', e.target.value)}
                      placeholder="GTM-XXXXXXX"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      value={settings.analytics.facebookPixel}
                      onChange={(e) => updateSetting('analytics', 'facebookPixel', e.target.value)}
                      placeholder="123456789012345"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEO */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Configuraci車n SEO</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Meta Description por Defecto
                    </label>
                    <textarea
                      rows={3}
                      value={settings.seo.defaultMetaDescription}
                      onChange={(e) => updateSetting('seo', 'defaultMetaDescription', e.target.value)}
                      placeholder="Descripci車n predeterminada para SEO"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.seo.sitemapEnabled}
                        onChange={(e) => updateSetting('seo', 'sitemapEnabled', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
                      />
                      <span className="text-gray-300">Sitemap habilitado</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.seo.robotsEnabled}
                        onChange={(e) => updateSetting('seo', 'robotsEnabled', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
                      />
                      <span className="text-gray-300">Robots.txt habilitado</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Configuraci車n de Email</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email de Contacto
                    </label>
                    <input
                      type="email"
                      value={settings.email.contactEmail}
                      onChange={(e) => updateSetting('email', 'contactEmail', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtpHost}
                      onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Puerto SMTP
                    </label>
                    <input
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Usuario SMTP
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtpUser}
                      onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contrase?a SMTP
                    </label>
                    <input
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mantenimiento */}
            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Modo Mantenimiento</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.maintenance.enabled}
                      onChange={(e) => updateSetting('maintenance', 'enabled', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
                    />
                    <span className="text-gray-300">Activar modo mantenimiento</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mensaje de Mantenimiento
                    </label>
                    <textarea
                      rows={3}
                      value={settings.maintenance.message}
                      onChange={(e) => updateSetting('maintenance', 'message', e.target.value)}
                      placeholder="Sitio en mantenimiento. Volvemos pronto."
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  {settings.maintenance.enabled && (
                    <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <span className="text-yellow-400 text-xl">??</span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-400">
                            Modo Mantenimiento Activo
                          </h3>
                          <div className="mt-2 text-sm text-yellow-300">
                            Tu sitio web est芍 en modo mantenimiento. Los visitantes ver芍n el mensaje configurado.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}