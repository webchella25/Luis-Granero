// src/app/admin/homepage/page.js - EDITOR PRINCIPAL
'use client'
import { useState, useEffect } from 'react'
import HeroEditor from '@/components/admin/editors/HeroEditor'
import ServicesEditor from '@/components/admin/editors/ServicesEditor'
import AboutEditor from '@/components/admin/editors/AboutEditor'
import StatsEditor from '@/components/admin/editors/StatsEditor'
import TestimonialsEditor from '@/components/admin/editors/TestimonialsEditor'
import CTAEditor from '@/components/admin/editors/CTAEditor'

export default function HomepageEditor() {
  const [activeTab, setActiveTab] = useState('hero')
  const [homepageData, setHomepageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: '🎯' },
    { id: 'about', name: 'Sobre Mí', icon: '👨‍💻' },
    { id: 'services', name: 'Servicios', icon: '⚡' },
    { id: 'stats', name: 'Estadísticas', icon: '📊' },
    { id: 'testimonials', name: 'Testimonios', icon: '💬' },
    { id: 'cta', name: 'Call to Action', icon: '🚀' }
  ]

  useEffect(() => {
    loadHomepageData()
  }, [])

  const loadHomepageData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/homepage')
      
      if (response.ok) {
        const data = await response.json()
        setHomepageData(data.content || getDefaultHomepageData())
      } else {
        setHomepageData(getDefaultHomepageData())
      }
    } catch (error) {
      console.error('Error loading homepage data:', error)
      setHomepageData(getDefaultHomepageData())
    } finally {
      setLoading(false)
    }
  }

  const saveHomepageData = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(homepageData)
      })

      if (response.ok) {
        setLastSaved(new Date())
        alert('Homepage guardada correctamente')
      } else {
        alert('Error guardando la homepage')
      }
    } catch (error) {
      console.error('Error saving homepage:', error)
      alert('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const updateSection = (section, data) => {
    setHomepageData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  const getDefaultHomepageData = () => ({
    hero: {
      title: "Luis Granero",
      subtitle: "Desarrollador Full Stack",
      description: "Transformo ideas en aplicaciones web modernas y soluciones personalizadas. Especializado en React, Next.js y arquitecturas escalables.",
      ctaText: "Ver mis proyectos",
      ctaLink: "/portfolio",
      backgroundVideo: "/videos/coding-bg.mp4",
      image: "/images/luis-hero.jpg"
    },
    about: {
      title: "Sobre Mí",
      subtitle: "Desarrollador apasionado por crear soluciones web innovadoras",
      description: "Con más de 10 años de experiencia en desarrollo web, me especializo en crear aplicaciones modernas, escalables y de alto rendimiento.",
      highlights: [
        "10+ años de experiencia",
        "50+ proyectos completados",
        "Especialista en React/Next.js",
        "Enfoque en performance"
      ],
      image: "/images/about-luis.jpg"
    },
    stats: [
      { label: "Proyectos", value: "50+", icon: "🚀" },
      { label: "Años", value: "10+", icon: "📅" },
      { label: "Clientes", value: "35+", icon: "👥" },
      { label: "Tecnologías", value: "15+", icon: "⚡" }
    ],
    testimonials: [
      {
        id: 1,
        name: "María González",
        company: "TechStartup",
        role: "CEO",
        content: "Luis transformó completamente nuestro e-commerce. El resultado superó todas nuestras expectativas.",
        rating: 5,
        image: "/images/testimonial-1.jpg"
      }
    ],
    cta: {
      title: "¿Listo para llevar tu proyecto al siguiente nivel?",
      subtitle: "Trabajemos juntos para crear algo increíble",
      primaryButton: {
        text: "Iniciar Proyecto",
        link: "/contacto"
      },
      secondaryButton: {
        text: "Ver Portfolio",
        link: "/portfolio"
      }
    }
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editor de Homepage
          </h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editor de Homepage
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personaliza el contenido de tu página principal
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Guardado: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={saveHomepageData}
            disabled={saving}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'hero' && (
            <HeroEditor
              data={homepageData?.hero}
              onChange={(data) => updateSection('hero', data)}
            />
          )}

          {activeTab === 'about' && (
            <AboutEditor
              data={homepageData?.about}
              onChange={(data) => updateSection('about', data)}
            />
          )}

          {activeTab === 'services' && (
            <ServicesEditor
              data={homepageData?.services}
              onChange={(data) => updateSection('services', data)}
            />
          )}

          {activeTab === 'stats' && (
            <StatsEditor
              data={homepageData?.stats}
              onChange={(data) => updateSection('stats', data)}
            />
          )}

          {activeTab === 'testimonials' && (
            <TestimonialsEditor
              data={homepageData?.testimonials}
              onChange={(data) => updateSection('testimonials', data)}
            />
          )}

          {activeTab === 'cta' && (
            <CTAEditor
              data={homepageData?.cta}
              onChange={(data) => updateSection('cta', data)}
            />
          )}
        </div>
      </div>

      {/* Preview Button */}
      <div className="flex justify-center">
        
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <span className="mr-2">👁️</span>
          Vista Previa de la Homepage
        </a>
      </div>
    </div>
  )
}