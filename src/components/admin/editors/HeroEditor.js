// src/components/admin/editors/HeroEditor.js
'use client'
import { useState } from 'react'

export default function HeroEditor({ data, onChange }) {
  const [hero, setHero] = useState(data || {
    title: "",
    subtitle: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    backgroundVideo: "",
    image: ""
  })

  const handleChange = (field, value) => {
    const updatedHero = { ...hero, [field]: value }
    setHero(updatedHero)
    onChange(updatedHero)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Hero Section
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            La primera impresión de tu sitio web
          </p>
        </div>
        <div className="text-2xl">🎯</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título Principal
            </label>
            <input
              type="text"
              value={hero.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtítulo
            </label>
            <input
              type="text"
              value={hero.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Tu especialidad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              rows={4}
              value={hero.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Describe lo que haces..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Texto del Botón
              </label>
              <input
                type="text"
                value={hero.ctaText}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Ver proyectos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enlace del Botón
              </label>
              <input
                type="text"
                value={hero.ctaLink}
                onChange={(e) => handleChange('ctaLink', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="/portfolio"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Imagen de Fondo (URL)
            </label>
            <input
              type="url"
              value={hero.image}
              onChange={(e) => handleChange('image', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video de Fondo (URL)
            </label>
            <input
              type="url"
              value={hero.backgroundVideo}
              onChange={(e) => handleChange('backgroundVideo', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="https://ejemplo.com/video.mp4"
            />
          </div>
        </div>

        {/* Vista Previa */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {hero.title || "Tu Nombre"}
            </h1>
            <h2 className="text-xl text-gray-300 mb-6">
              {hero.subtitle || "Tu Especialidad"}
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {hero.description || "Describe lo que haces y por qué eres especial..."}
            </p>
            <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all">
              {hero.ctaText || "Call to Action"}
            </button>
          </div>
          
          {/* Efectos de fondo */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-20 h-20 bg-cyan-400 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}