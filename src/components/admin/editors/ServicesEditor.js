// src/components/admin/editors/ServicesEditor.js
'use client'
import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function ServicesEditor({ data, onUpdate }) {
  const [services, setServices] = useState(data.services || [])

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    setServices(updatedServices)
    onUpdate('services', updatedServices)
  }

  const handleFeatureChange = (serviceIndex, featureIndex, value) => {
    const updatedServices = [...services]
    updatedServices[serviceIndex].features[featureIndex] = value
    setServices(updatedServices)
    onUpdate('services', updatedServices)
  }

  const addService = () => {
    const newService = {
      id: Date.now(),
      icon: '🔧',
      title: 'Nuevo Servicio',
      description: 'Descripción del servicio',
      features: ['Feature 1', 'Feature 2', 'Feature 3']
    }
    const updatedServices = [...services, newService]
    setServices(updatedServices)
    onUpdate('services', updatedServices)
  }

  const removeService = (index) => {
    const updatedServices = services.filter((_, i) => i !== index)
    setServices(updatedServices)
    onUpdate('services', updatedServices)
  }

  const addFeature = (serviceIndex) => {
    const updatedServices = [...services]
    updatedServices[serviceIndex].features.push('Nueva característica')
    setServices(updatedServices)
    onUpdate('services', updatedServices)
  }

  const removeFeature = (serviceIndex, featureIndex) => {
    const updatedServices = [...services]
    updatedServices[serviceIndex].features.splice(featureIndex, 1)
    setServices(updatedServices)
    onUpdate('services', updatedServices)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-white">Servicios</h3>
          <p className="text-gray-400">Gestiona los servicios que ofreces</p>
        </div>
        <button
          onClick={addService}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Agregar Servicio</span>
        </button>
      </div>

      <div className="space-y-6">
        {services.map((service, serviceIndex) => (
          <div key={service.id} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-white font-medium">Servicio {serviceIndex + 1}</h4>
              <button
                onClick={() => removeService(serviceIndex)}
                className="text-red-400 hover:text-red-300"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icono (Emoji)
                </label>
                <input
                  type="text"
                  value={service.icon}
                  onChange={(e) => handleServiceChange(serviceIndex, 'icon', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  placeholder="🔧"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => handleServiceChange(serviceIndex, 'title', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                rows={3}
                value={service.description}
                onChange={(e) => handleServiceChange(serviceIndex, 'description', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Características
                </label>
                <button
                  onClick={() => addFeature(serviceIndex)}
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  + Agregar
                </button>
              </div>
              <div className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(serviceIndex, featureIndex, e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white text-sm"
                    />
                    <button
                      onClick={() => removeFeature(serviceIndex, featureIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}