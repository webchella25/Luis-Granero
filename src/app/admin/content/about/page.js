// src/app/admin/content/about/page.js
'use client'
import { useState, useEffect } from 'react'
import { PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function AboutEditor() {
  const [aboutData, setAboutData] = useState({
    hero: {
      title: "",
      subtitle: "",
      description: "",
      image: "",
      stats: []
    },
    story: {
      title: "",
      content: "",
      highlights: []
    },
    experience: [],
    skills: {
      technical: [],
      soft: [],
      tools: []
    },
    methodology: {
      title: "",
      description: "",
      steps: []
    },
    values: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [activeTab, setActiveTab] = useState('hero')

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: '🎯' },
    { id: 'story', label: 'Mi Historia', icon: '📖' },
    { id: 'experience', label: 'Experiencia', icon: '💼' },
    { id: 'skills', label: 'Habilidades', icon: '🛠️' },
    { id: 'methodology', label: 'Metodología', icon: '⚙️' },
    { id: 'values', label: 'Valores', icon: '💎' }
  ]

  useEffect(() => {
    loadAboutData()
  }, [])

  const loadAboutData = async () => {
    try {
      const response = await fetch('/api/admin/pages/about')
      if (response.ok) {
        const data = await response.json()
        if (data.content) {
          setAboutData(data.content)
        }
      }
    } catch (error) {
      console.error('Error loading about data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveAboutData = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/pages/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aboutData)
      })
      
      if (response.ok) {
        setLastSaved(new Date())
        console.log('About page saved successfully')
      }
    } catch (error) {
      console.error('Error saving about data:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (section, field, value) => {
    setAboutData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const updateArrayField = (section, index, field, value) => {
    setAboutData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addArrayItem = (section, newItem) => {
    setAboutData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }))
  }

  const removeArrayItem = (section, index) => {
    setAboutData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando datos sobre mí...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Editor - Sobre Mí</h1>
          <p className="text-gray-400">Gestiona el contenido de tu página personal</p>
          {lastSaved && (
            <p className="text-sm text-green-400 mt-2">
              Guardado: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={saveAboutData}
            disabled={isSaving}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
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
            
            {/* Hero Section */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Hero Section</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    value={aboutData.hero.title}
                    onChange={(e) => updateField('hero', 'title', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="Sobre Luis Granero"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={aboutData.hero.subtitle}
                    onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="Mi historia como desarrollador"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={aboutData.hero.description}
                    onChange={(e) => updateField('hero', 'description', e.target.value)}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="Descripción personal y profesional..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL de Imagen
                  </label>
                  <input
                    type="text"
                    value={aboutData.hero.image}
                    onChange={(e) => updateField('hero', 'image', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="/images/about/luis-granero.jpg"
                  />
                </div>
              </div>
            )}

            {/* Mi Historia */}
            {activeTab === 'story' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Mi Historia</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título de la Sección
                  </label>
                  <input
                    type="text"
                    value={aboutData.story.title}
                    onChange={(e) => updateField('story', 'title', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="Mi Trayectoria"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contenido de la Historia
                  </label>
                  <textarea
                    value={aboutData.story.content}
                    onChange={(e) => updateField('story', 'content', e.target.value)}
                    rows={8}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="Cuenta tu historia profesional..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Puntos Destacados
                  </label>
                  {aboutData.story.highlights?.map((highlight, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => {
                          const newHighlights = [...aboutData.story.highlights]
                          newHighlights[index] = e.target.value
                          updateField('story', 'highlights', newHighlights)
                        }}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                        placeholder="Punto destacado"
                      />
                      <button
                        onClick={() => {
                          const newHighlights = aboutData.story.highlights.filter((_, i) => i !== index)
                          updateField('story', 'highlights', newHighlights)
                        }}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newHighlights = [...(aboutData.story.highlights || []), ""]
                      updateField('story', 'highlights', newHighlights)
                    }}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    + Agregar punto destacado
                  </button>
                </div>
              </div>
            )}

            {/* Experiencia */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white">Experiencia Profesional</h3>
                  <button
                    onClick={() => addArrayItem('experience', {
                      company: "",
                      position: "",
                      period: "",
                      description: "",
                      technologies: [],
                      achievements: []
                    })}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Agregar Experiencia</span>
                  </button>
                </div>

                {aboutData.experience?.map((exp, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-white font-medium">Experiencia #{index + 1}</h4>
                      <button
                        onClick={() => removeArrayItem('experience', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateArrayField('experience', index, 'company', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                          placeholder="Nombre de la empresa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Posición
                        </label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateArrayField('experience', index, 'position', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                          placeholder="Desarrollador Full Stack"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Período
                      </label>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => updateArrayField('experience', index, 'period', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                        placeholder="2020 - Presente"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateArrayField('experience', index, 'description', e.target.value)}
                        rows={3}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                        placeholder="Descripción de responsabilidades y logros..."
                      />
                    </div>
                  </div>
                ))}

                {aboutData.experience?.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No hay experiencias agregadas. Haz clic en "Agregar Experiencia" para empezar.
                  </div>
                )}
              </div>
            )}

            {/* Habilidades */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Habilidades</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Habilidades Técnicas (separadas por coma)
                  </label>
                  <textarea
                    value={aboutData.skills.technical?.join(', ')}
                    onChange={(e) => updateField('skills', 'technical', e.target.value.split(', ').filter(s => s.trim()))}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="React, Next.js, TypeScript, Node.js..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Habilidades Blandas (separadas por coma)
                  </label>
                  <textarea
                    value={aboutData.skills.soft?.join(', ')}
                    onChange={(e) => updateField('skills', 'soft', e.target.value.split(', ').filter(s => s.trim()))}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="Comunicación, Trabajo en equipo, Resolución de problemas..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Herramientas (separadas por coma)
                  </label>
                  <textarea
                    value={aboutData.skills.tools?.join(', ')}
                    onChange={(e) => updateField('skills', 'tools', e.target.value.split(', ').filter(s => s.trim()))}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="VS Code, Git, Docker, Figma..."
                  />
                </div>
              </div>
            )}

            {/* Metodología */}
            {activeTab === 'methodology' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Mi Metodología</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={aboutData.methodology.title}
                    onChange={(e) => updateField('methodology', 'title', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="Cómo trabajo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={aboutData.methodology.description}
                    onChange={(e) => updateField('methodology', 'description', e.target.value)}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="Describe tu metodología de trabajo..."
                  />
                </div>
              </div>
            )}

            {/* Valores */}
            {activeTab === 'values' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white">Mis Valores</h3>
                  <button
                    onClick={() => addArrayItem('values', {
                      title: "",
                      description: "",
                      icon: ""
                    })}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Agregar Valor</span>
                  </button>
                </div>

                {aboutData.values?.map((value, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-white font-medium">Valor #{index + 1}</h4>
                      <button
                        onClick={() => removeArrayItem('values', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Icono (Emoji)
                        </label>
                        <input
                          type="text"
                          value={value.icon}
                          onChange={(e) => updateArrayField('values', index, 'icon', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                          placeholder="💎"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Título
                        </label>
                        <input
                          type="text"
                          value={value.title}
                          onChange={(e) => updateArrayField('values', index, 'title', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                          placeholder="Calidad"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={value.description}
                        onChange={(e) => updateArrayField('values', index, 'description', e.target.value)}
                        rows={2}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                        placeholder="Descripción del valor..."
                      />
                    </div>
                  </div>
                ))}

                {aboutData.values?.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No hay valores agregados. Haz clic en "Agregar Valor" para empezar.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}