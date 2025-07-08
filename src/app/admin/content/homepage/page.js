// src/app/admin/content/homepage/page.js (AÑADIR DEBUG AL GUARDAR)
'use client'
import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import { homepageSchema } from '@/lib/pageData'
import HeroEditor from '@/components/admin/editors/HeroEditor'
import ServicesEditor from '@/components/admin/editors/ServicesEditor'
import TechStackEditor from '@/components/admin/editors/TechStackEditor'
import TestimonialsEditor from '@/components/admin/editors/TestimonialsEditor'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const tabs = [
  { name: 'Hero Section', component: HeroEditor },
  { name: 'Servicios', component: ServicesEditor },
  { name: 'Tech Stack', component: TechStackEditor },
  { name: 'Testimonios', component: TestimonialsEditor },
]

export default function HomepageEditor() {
  const [pageData, setPageData] = useState(homepageSchema)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      console.log('💾 Admin: Iniciando guardado...')
      console.log('💾 Admin: Datos a guardar:', pageData)
      console.log('💾 Admin: Selected services:', pageData.selectedServices)
      console.log('💾 Admin: Services config:', pageData.servicesConfig)
      
      const response = await fetch('/api/admin/pages/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData)
      })
      
      console.log('💾 Admin: Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Admin: Guardado exitoso:', result)
        setLastSaved(new Date())
      } else {
        const error = await response.text()
        console.error('❌ Admin: Error en response:', error)
      }
    } catch (error) {
      console.error('❌ Admin: Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updatePageData = (section, data) => {
    console.log('📝 Admin: Updating page data:', section, data)
    setPageData(prev => {
      const updated = {
        ...prev,
        [section]: data
      }
      console.log('📝 Admin: New page data:', updated)
      return updated
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Editor Homepage</h1>
          <p className="text-gray-400">Edita el contenido de tu página principal</p>
          {lastSaved && (
            <p className="text-sm text-green-400 mt-2">
              Guardado: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md">
            Vista Previa
          </button>
        </div>
      </div>

      {/* Debug actual */}
      <div className="mb-6 bg-gray-800 border border-gray-600 rounded-lg p-4 text-xs">
        <div className="text-cyan-400 font-bold mb-2">🔧 Debug Homepage Admin</div>
        <div className="text-gray-300 space-y-1">
          <div>Selected services: <span className="text-yellow-400">{pageData.selectedServices?.length || 0}</span></div>
          <div>Services config: <span className="text-purple-400">{pageData.servicesConfig ? 'Si' : 'No'}</span></div>
          <div>Tab actual: <span className="text-green-400">{tabs[selectedIndex].name}</span></div>
        </div>
        {pageData.selectedServices?.length > 0 && (
          <div className="mt-2 text-gray-500">
            Servicios: {pageData.selectedServices.map(s => s.title).join(', ')}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-800 p-1 mb-6">
          {tabs.map((tab, index) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {tabs.map((tab, index) => {
            const Component = tab.component
            return (
              <Tab.Panel key={index} className="rounded-xl bg-gray-800 p-6">
                <Component
                  data={pageData}
                  onUpdate={updatePageData}
                />
              </Tab.Panel>
            )
          })}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}