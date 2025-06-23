// src/app/admin/content/contact/page.js
'use client'
import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ContactPageEditor() {
  const [contactData, setContactData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const tabs = [
    { name: 'Hero & Métodos', icon: '🎯' },
    { name: 'Calculadora', icon: '💻' },
    { name: 'Información', icon: '📞' },
    { name: 'FAQ', icon: '❓' }
  ]

  useEffect(() => {
    fetchContactData()
  }, [])

  const fetchContactData = async () => {
    try {
      const response = await fetch('/api/admin/contact-page')
      const data = await response.json()
      setContactData(data.contactPage)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveData = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/contact-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      })
      
      if (response.ok) {
        alert('Página de contacto guardada correctamente')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (section, field, value) => {
    setContactData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const updateArrayField = (section, index, field, value) => {
    setContactData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addArrayItem = (section, newItem) => {
    setContactData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), newItem]
    }))
  }

  const removeArrayItem = (section, index) => {
    setContactData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  if (loading || !contactData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando configuración de contacto...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración - Página de Contacto</h1>
          <p className="text-gray-400">Gestiona toda la información de contacto y calculadora</p>
        </div>
        <button
          onClick={saveData}
          disabled={saving}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Tabs */}
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-800 p-1 mb-6">
          {tabs.map((tab, index) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center space-x-2',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )
              }
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* Hero & Métodos de contacto */}
          <Tab.Panel className="rounded-xl bg-gray-800 p-6">
            <div className="space-y-8">
              {/* Hero */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Hero Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                    <input
                      type="text"
                      value={contactData.hero?.title || ''}
                      onChange={(e) => updateField('hero', 'title', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subtítulo</label>
                    <input
                      type="text"
                      value={contactData.hero?.subtitle || ''}
                      onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                    <textarea
                      rows={3}
                      value={contactData.hero?.description || ''}
                      onChange={(e) => updateField('hero', 'description', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Métodos de contacto */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Métodos de Contacto</h3>
                  <button
                    onClick={() => addArrayItem('contactMethods', {
                      icon: "📧",
                      title: "",
                      description: "",
                      action: "",
                      link: "",
                      highlight: false
                    })}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Agregar método</span>
                  </button>
                </div>

                {contactData.contactMethods?.map((method, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-white font-medium">Método #{index + 1}</h4>
                      <button
                        onClick={() => removeArrayItem('contactMethods', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Icono</label>
                        <input
                          type="text"
                          value={method.icon}
                          onChange={(e) => updateArrayField('contactMethods', index, 'icon', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                        <input
                          type="text"
                          value={method.title}
                          onChange={(e) => updateArrayField('contactMethods', index, 'title', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                        <input
                          type="text"
                          value={method.description}
                          onChange={(e) => updateArrayField('contactMethods', index, 'description', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Texto del botón</label>
                        <input
                          type="text"
                          value={method.action}
                          onChange={(e) => updateArrayField('contactMethods', index, 'action', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Enlace</label>
                        <input
                          type="text"
                          value={method.link}
                          onChange={(e) => updateArrayField('contactMethods', index, 'link', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={method.highlight}
                            onChange={(e) => updateArrayField('contactMethods', index, 'highlight', e.target.checked)}
                            className="rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="ml-2 text-sm text-gray-300">Destacar este método</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tab.Panel>

          {/* Calculadora */}
          <Tab.Panel className="rounded-xl bg-gray-800 p-6">
            <div className="space-y-6">
              <div>
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={contactData.calculator?.enabled || false}
                    onChange={(e) => updateField('calculator', 'enabled', e.target.checked)}
                    className="rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-lg font-medium text-white">Habilitar calculadora de presupuestos</span>
                </label>
              </div>

              {contactData.calculator?.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Título de la calculadora</label>
                    <input
                      type="text"
                      value={contactData.calculator?.title || ''}
                      onChange={(e) => updateField('calculator', 'title', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                  </div>

                  {/* Servicios de la calculadora */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-white">Servicios</h3>
                      <button
                        onClick={() => addArrayItem('calculator.services', {
                          name: '',
                          basePrice: 0,
                          priceRange: { min: 0, max: 0 },
                          options: []
                        })}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        + Agregar servicio
                      </button>
                    </div>

                    {contactData.calculator?.services?.map((service, index) => (
                      <div key={index} className="border border-gray-700 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                            <input
                              type="text"
                              value={service.name}
                              onChange={(e) => updateArrayField('calculator.services', index, 'name', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Precio base (€)</label>
                            <input
                              type="number"
                              value={service.basePrice}
                              onChange={(e) => updateArrayField('calculator.services', index, 'basePrice', parseInt(e.target.value) || 0)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => removeArrayItem('calculator.services', index)}
                              className="text-red-400 hover:text-red-300 mb-2"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Addons */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-white">Servicios Adicionales</h3>
                      <button
                        onClick={() => addArrayItem('calculator.addons', {
                          name: '',
                          price: 0,
                          description: '',
                          category: ''
                        })}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        + Agregar addon
                      </button>
                    </div>

                    {contactData.calculator?.addons?.map((addon, index) => (
                      <div key={index} className="border border-gray-700 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                            <input
                              type="text"
                              value={addon.name}
                              onChange={(e) => updateArrayField('calculator.addons', index, 'name', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Precio (€)</label>
                            <input
                              type="number"
                              value={addon.price}
                              onChange={(e) => updateArrayField('calculator.addons', index, 'price', parseInt(e.target.value) || 0)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                            <input
                              type="text"
                              value={addon.category}
                              onChange={(e) => updateArrayField('calculator.addons', index, 'category', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => removeArrayItem('calculator.addons', index)}
                              className="text-red-400 hover:text-red-300 mb-2"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                          <input
                            type="text"
                            value={addon.description}
                            onChange={(e) => updateArrayField('calculator.addons', index, 'description', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Tab.Panel>

          {/* Información de contacto */}
          <Tab.Panel className="rounded-xl bg-gray-800 p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white mb-4">Información de Contacto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={contactData.contactInfo?.email || ''}
                    onChange={(e) => updateField('contactInfo', 'email', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-