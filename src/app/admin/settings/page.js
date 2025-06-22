// src/app/admin/settings/page.js
'use client'
import { useState, useEffect } from 'react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    site: {
      name: 'Luis Granero',
      tagline: 'Desarrollador Web Freelance',
      email: 'contacto@luisgranero.com',
      phone: '+34 600 000 000',
      address: 'Madrid, España'
    },
    social: {
      linkedin: 'https://linkedin.com/in/luisgranero',
      github: 'https://github.com/luisgranero',
      twitter: 'https://twitter.com/luisgranero'
    },
    analytics: {
      googleAnalytics: '',
      gtmId: '',
      facebookPixel: ''
    },
    seo: {
      defaultMetaDescription: 'Desarrollador web freelance especializado en React, Next.js y soluciones personalizadas',
      defaultKeywords: ['desarrollador web', 'freelance', 'React', 'Next.js', 'TypeScript'],
      sitemapEnabled: true,
      robotsEnabled: true
    },
    email: {
      contactEmail: 'contacto@luisgranero.com',
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: ''
    },
    maintenance: {
      enabled: false,
      message: 'Sitio en mantenimiento. Volvemos pronto.',
      allowedIPs: []
    }
  })

  const [activeTab, setActiveTab] = useState('site')
  const [isSaving, setIsSaving] = useState(false)

  const tabs = [
    { id: 'site', label: 'Sitio Web', icon: '🌐' },
    { id: 'social', label: 'Redes Sociales', icon: '📱' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'maintenance', label: 'Mantenimiento', icon: '🔧' }
  ]

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        // Show success notification
        console.log('Settings saved successfully')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
          <p className="text-gray-400">Administra la configuración global de tu sitio</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md"
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
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
            {/* Configuración del sitio */}
            {activeTab === 'site' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Información del Sitio</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre del Sitio
                    </label>
                    <input
                      type="text"
                      value={settings.site.name}
                      onChange={(e) => updateSetting('site', 'name', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={settings.site.phone}
                      onChange={(e) => updateSetting('site', 'phone', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={settings.site.address}
                      onChange={(e) => updateSetting('site', 'address', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="https://linkedin.com/in/tu-perfil"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="https://github.com/tu-usuario"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={settings.social.twitter}
                      onChange={(e) => updateSetting('social', 'twitter', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="https://twitter.com/tu-usuario"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="G-XXXXXXXXXX"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="GTM-XXXXXXX"
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="123456789012345"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modo Mantenimiento */}
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                  </div>

                  {settings.maintenance.enabled && (
                    <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <span className="text-yellow-400">⚠️</span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-400">
                            Modo Mantenimiento Activo
                          </h3>
                          <div className="mt-2 text-sm text-yellow-300">
                            Tu sitio web está en modo mantenimiento. Los visitantes verán el mensaje configurado.
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