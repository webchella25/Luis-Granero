// src/app/admin/content/homepage/page.js
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
      const response = await fetch('/api/admin/pages/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData)
      })
      
      if (response.ok) {
        setLastSaved(new Date())
        // Show success notification
      }
    } catch (error) {
      console.error('Error saving:', error)
      // Show error notification
    } finally {
      setIsSaving(false)
    }
  }

  const updatePageData = (section, data) => {
    setPageData(prev => ({
      ...prev,
      [section]: data
    }))
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