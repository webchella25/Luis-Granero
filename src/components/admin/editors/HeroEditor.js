// src/components/admin/editors/HeroEditor.js
'use client'
import { useState } from 'react'

export default function HeroEditor({ data, onUpdate }) {
  const [hero, setHero] = useState(data.hero)

  const handleChange = (field, value) => {
    const updatedHero = { ...hero, [field]: value }
    setHero(updatedHero)
    onUpdate('hero', updatedHero)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Hero Section</h3>
        <p className="text-gray-400 mb-6">Edita el contenido principal de la página de inicio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título Principal
            </label>
            <input
              type="text"
              value={hero.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Tu título principal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subtítulo
            </label>
            <input
              type="text"
              value={hero.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Tu subtítulo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              rows={4}
              value={hero.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Describe lo que haces..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Texto del Botón
              </label>
              <input
                type="text"
                value={hero.ctaText}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enlace del Botón
              </label>
              <input
                type="text"
                value={hero.ctaLink}
                onChange={(e) => handleChange('ctaLink', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video de Fondo (URL)
            </label>
            <input
              type="text"
              value={hero.backgroundVideo}
              onChange={(e) => handleChange('backgroundVideo', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="/videos/hero-video.mp4"
            />
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-4">Vista Previa</h4>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">{hero.title}</h1>
            <h2 className="text-lg text-cyan-400">{hero.subtitle}</h2>
            <p className="text-gray-300 text-sm">{hero.description}</p>
            
            <div className="pt-4">
              <button className="bg-cyan-600 text-white px-4 py-2 rounded-md text-sm">
                {hero.ctaText}
              </button>
            </div>
            
            {hero.backgroundVideo && (
              <div className="mt-4 p-2 bg-gray-800 rounded text-xs text-gray-400">
                📹 Video: {hero.backgroundVideo}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}